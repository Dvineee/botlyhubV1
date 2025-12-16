
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Copy, QrCode, ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon, BarChart3, Search, X, CheckCircle2, ChevronRight, ChevronDown, Shield, Eye, EyeOff, Key, Download, RefreshCw, AlertTriangle, LogOut, Settings, Trash2, Fingerprint, Zap, Lock, Send, History, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { CryptoAsset, BotRevenue, NetworkOption, CryptoTransaction } from '../types';
import { TonConnectButton, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { WalletService } from '../services/WalletService';
import { useTranslation } from '../TranslationContext';

// --- Mock Data for Initial State ---
const INITIAL_ASSETS: CryptoAsset[] = [
    {
        id: 'ton', symbol: 'TON', name: 'Toncoin', balance: 0, price: 185.20, change24h: 2.5, color: 'bg-blue-500',
        networks: [{ id: 'ton-main', name: 'The Open Network', protocol: 'TON', address: 'Loading...' }]
    },
    {
        id: 'usdt', symbol: 'USDT', name: 'Tether', balance: 0, price: 34.15, change24h: 0.1, color: 'bg-emerald-500',
        networks: [
            { id: 'trc20', name: 'Tron (TRC20)', protocol: 'TRC20', address: 'Loading...' },
            { id: 'bep20', name: 'BNB Smart Chain (BEP20)', protocol: 'BEP20', address: 'Loading...' }
        ]
    },
    {
        id: 'bnb', symbol: 'BNB', name: 'BNB', balance: 0, price: 19800.00, change24h: 1.5, color: 'bg-yellow-500',
        networks: [{ id: 'bsc-main', name: 'BNB Smart Chain', protocol: 'BEP20', address: 'Loading...' }]
    },
    {
        id: 'trx', symbol: 'TRX', name: 'Tron', balance: 0, price: 4.10, change24h: -1.2, color: 'bg-red-500',
        networks: [{ id: 'trx-main', name: 'Tron Network', protocol: 'TRC20', address: 'Loading...' }]
    },
    {
        id: 'sol', symbol: 'SOL', name: 'Solana', balance: 0, price: 4800.00, change24h: 5.2, color: 'bg-purple-500',
        networks: [{ id: 'sol-main', name: 'Solana', protocol: 'SOL', address: 'Loading...' }]
    },
];

const Earnings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tonWallet = useTonWallet();
  const userFriendlyAddress = useTonAddress();
  
  // --- Wallet State ---
  const [hasWallet, setHasWallet] = useState(false);
  const [setupStep, setSetupStep] = useState<'select' | 'create' | 'import'>('select');
  const [generatedSeed, setGeneratedSeed] = useState<string[]>([]);
  const [importInput, setImportInput] = useState('');
  const [showSeed, setShowSeed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- Dashboard Data State ---
  const [assets, setAssets] = useState<CryptoAsset[]>(INITIAL_ASSETS);
  const [recentTx, setRecentTx] = useState<CryptoTransaction[]>([]);
  
  // --- UI View States ---
  const [activeTab, setActiveTab] = useState<'wallet' | 'revenue'>('wallet');
  const [walletView, setWalletView] = useState<'main' | 'deposit_search' | 'deposit_details' | 'send_select' | 'send_form'>('main');
  
  // --- Selection States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkOption | null>(null);
  
  // --- Send Form States ---
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // --- Modals ---
  const [copied, setCopied] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSeedRevealModal, setShowSeedRevealModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [storedSeedPhrase, setStoredSeedPhrase] = useState<string | null>(null);

  // --- Initialization ---
  useEffect(() => {
    const seed = WalletService.getWallet();
    if (seed) {
        setHasWallet(true);
        setStoredSeedPhrase(seed);
        loadWalletData(seed);
    } else if (tonWallet) {
        setHasWallet(true);
    } else {
        setHasWallet(false);
    }
  }, [tonWallet]);

  const loadWalletData = async (seed: string) => {
      const addresses = await WalletService.deriveWallets(seed);
      
      // Update assets with derived addresses and mock balances
      setAssets(prev => prev.map(asset => {
          const newNetworks = asset.networks.map(net => {
              let addr = '...';
              if (net.protocol === 'TON') addr = addresses.TON;
              if (net.protocol === 'TRC20') addr = addresses.TRX;
              if (net.protocol === 'BEP20') addr = addresses.BSC;
              if (net.protocol === 'SOL') addr = addresses.SOL;
              return { ...net, address: addr };
          });
          
          // Simulating non-zero balance for demo after creation
          const mockBalance = Math.random() > 0.5 ? parseFloat((Math.random() * 100).toFixed(4)) : 0;
          
          return { ...asset, balance: mockBalance, networks: newNetworks };
      }));
  };

  // --- Wallet Setup Actions ---

  const generateNewWallet = () => {
      setIsLoading(true);
      setTimeout(() => {
          const mnemonic = WalletService.generateMnemonic();
          setGeneratedSeed(mnemonic.split(' '));
          setSetupStep('create');
          setIsLoading(false);
      }, 800);
  };

  const confirmCreateWallet = () => {
      const seedString = generatedSeed.join(' ');
      WalletService.saveWallet(seedString);
      setStoredSeedPhrase(seedString);
      setHasWallet(true);
      loadWalletData(seedString);
  };

  const handleImportWallet = () => {
      setIsLoading(true);
      setTimeout(() => {
          const seedString = importInput.trim();
          if (seedString.split(' ').length !== 12) {
              alert("Lütfen geçerli 12 kelimelik ifade girin.");
              setIsLoading(false);
              return;
          }
          WalletService.saveWallet(seedString);
          setStoredSeedPhrase(seedString);
          setHasWallet(true);
          loadWalletData(seedString);
          setIsLoading(false);
      }, 1000);
  };

  const handleLogout = () => {
      WalletService.clearWallet();
      setHasWallet(false);
      setSetupStep('select');
      setShowLogoutConfirm(false);
      setShowSettingsModal(false);
      setStoredSeedPhrase(null);
      setWalletView('main');
  };

  // --- Transaction Logic ---

  const handleSendTransaction = async () => {
      if(!selectedAsset || !selectedNetwork) return;
      
      setIsSending(true);
      try {
          const tx = await WalletService.sendTransaction(
              selectedNetwork.protocol as any, // 'TON' | 'BSC' ...
              sendAddress,
              parseFloat(sendAmount),
              selectedAsset.symbol
          );
          
          setRecentTx([tx, ...recentTx]);
          // Simulate asset deduction
          setAssets(prev => prev.map(a => a.id === selectedAsset.id ? { ...a, balance: a.balance - parseFloat(sendAmount) } : a));
          
          alert(`İşlem Gönderildi! Hash: ${tx.hash}`);
          setWalletView('main');
          setSendAmount('');
          setSendAddress('');
      } catch (error: any) {
          alert("İşlem Başarısız: " + error.message);
      } finally {
          setIsSending(false);
      }
  };

  // --- Helper Functions ---
  const totalBalance = assets.reduce((acc, asset) => acc + (asset.balance * asset.price), 0);
  
  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  // Filter Assets for Search
  const filteredAssets = assets.filter(asset => 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- RENDER SECTIONS ---

  // 1. Settings Modal
  const renderSettingsModal = () => (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={() => setShowSettingsModal(false)}></div>
          <div className="bg-slate-900 w-full max-w-md mx-auto rounded-t-3xl p-6 pointer-events-auto z-50 border-t border-slate-800 animate-in slide-in-from-bottom dark:bg-slate-900 dark:border-slate-800 bg-white border-slate-200">
              <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mb-6 opacity-20"></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Cüzdan Ayarları</h3>
              
              <div className="space-y-3">
                  {!tonWallet && (
                      <button onClick={() => { setShowSettingsModal(false); setShowSeedRevealModal(true); setShowSeed(false); }} className="w-full flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                          <Key size={20} className="text-blue-500" />
                          <span className="text-sm font-bold text-slate-900 dark:text-white">Gizli Kelimeleri Göster</span>
                      </button>
                  )}
                  <button onClick={() => { setShowSettingsModal(false); setShowLogoutConfirm(true); }} className="w-full flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                      <LogOut size={20} className="text-red-500" />
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">Cüzdanı Kaldır</span>
                  </button>
              </div>
          </div>
      </div>
  );

  // 2. Deposit Search View
  const renderDepositSearch = () => (
      <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-8">
          <div className="relative mb-4">
              <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Yatırmak istediğiniz coini arayın..."
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:border-blue-500 transition-colors"
                  autoFocus
              />
          </div>
          <div className="space-y-2 overflow-y-auto">
              {filteredAssets.map(asset => (
                  <div key={asset.id} onClick={() => { setSelectedAsset(asset); setSelectedNetwork(asset.networks[0]); setWalletView('deposit_details'); }} className="flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl cursor-pointer">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${asset.color}`}>{asset.symbol[0]}</div>
                      <div>
                          <p className="font-bold text-slate-900 dark:text-white">{asset.symbol}</p>
                          <p className="text-xs text-slate-500">{asset.name}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  // 3. Deposit Details View
  const renderDepositDetails = () => (
      <div className="flex flex-col items-center animate-in fade-in slide-in-from-right-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 ${selectedAsset?.color}`}>
              {selectedAsset?.symbol[0]}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{selectedAsset?.symbol} Yatır</h2>
          
          <div className="w-full mb-6">
              <label className="text-xs text-slate-500 font-bold ml-1 mb-2 block">Ağ (Network)</label>
              <select 
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-3 rounded-xl focus:border-blue-500 outline-none"
                value={selectedNetwork?.id}
                onChange={(e) => setSelectedNetwork(selectedAsset?.networks.find(n => n.id === e.target.value) || null)}
              >
                  {selectedAsset?.networks.map(net => <option key={net.id} value={net.id}>{net.name}</option>)}
              </select>
          </div>

          <div className="bg-white p-4 rounded-2xl mb-6 shadow-xl"><QrCode size={160} color="black" /></div>
          
          <div className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 font-mono mb-2">Cüzdan Adresi</p>
              <p className="text-sm text-slate-900 dark:text-white font-mono break-all px-4 select-all">{selectedNetwork?.address}</p>
              <button onClick={() => handleCopy(selectedNetwork?.address || '')} className="mt-4 w-full bg-slate-200 dark:bg-slate-800 py-2 rounded-lg text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                  {copied ? 'Kopyalandı!' : 'Adresi Kopyala'}
              </button>
          </div>
      </div>
  );

  // 4. Send Form View
  const renderSendForm = () => (
      <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8">
          <div className="flex items-center gap-3 mb-6 p-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${selectedAsset?.color}`}>{selectedAsset?.symbol[0]}</div>
              <div>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedAsset?.symbol} Gönder</p>
                  <p className="text-xs text-slate-500">Bakiye: {selectedAsset?.balance} {selectedAsset?.symbol}</p>
              </div>
          </div>

          <div className="space-y-4">
              <div>
                  <label className="text-xs text-slate-500 font-bold ml-1">Alıcı Adresi</label>
                  <input 
                    type="text" 
                    value={sendAddress}
                    onChange={(e) => setSendAddress(e.target.value)}
                    placeholder={`Adres girin (${selectedNetwork?.protocol})`}
                    className="w-full mt-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white font-mono text-sm focus:border-blue-500 outline-none"
                  />
              </div>
              <div>
                  <label className="text-xs text-slate-500 font-bold ml-1">Miktar</label>
                  <div className="relative">
                    <input 
                        type="number" 
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full mt-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white font-mono text-lg focus:border-blue-500 outline-none"
                    />
                    <button onClick={() => setSendAmount(selectedAsset?.balance.toString() || '0')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-500">MAX</button>
                  </div>
              </div>
          </div>

          <div className="mt-auto">
              <button 
                onClick={handleSendTransaction}
                disabled={isSending || !sendAmount || !sendAddress}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/30"
              >
                  {isSending ? <RefreshCw className="animate-spin" /> : <Send size={20} />}
                  Transferi Onayla
              </button>
          </div>
      </div>
  );

  // 5. Main Wallet Dashboard
  const renderWalletMain = () => (
      <div className="animate-in fade-in">
          {/* Hero Balance */}
          <div className="text-center py-6 relative">
              <button onClick={() => setShowSettingsModal(true)} className="absolute right-0 top-0 p-2 bg-slate-100 dark:bg-slate-800/50 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <Settings size={18} />
              </button>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Toplam Varlık</p>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mt-1">₺{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
              
              <div className="flex justify-center gap-6 mt-6">
                  <button onClick={() => { setSearchQuery(''); setWalletView('send_select'); }} className="flex flex-col items-center gap-2 group">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 text-white group-active:scale-95 transition-all">
                          <ArrowUpRight size={24} />
                      </div>
                      <span className="text-xs font-medium text-blue-500">Gönder</span>
                  </button>
                  <button onClick={() => { setSearchQuery(''); setWalletView('deposit_search'); }} className="flex flex-col items-center gap-2 group">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-700 dark:text-white group-active:scale-95 transition-all hover:border-slate-300 dark:hover:border-slate-600">
                          <ArrowDownLeft size={24} />
                      </div>
                      <span className="text-xs font-medium text-slate-500">Yatır</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 group">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-700 dark:text-white group-active:scale-95 transition-all hover:border-slate-300 dark:hover:border-slate-600">
                          <History size={24} />
                      </div>
                      <span className="text-xs font-medium text-slate-500">Geçmiş</span>
                  </button>
              </div>
          </div>

          {/* Assets List */}
          <div className="mt-4 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-200 px-1">Varlıklar</h3>
              {assets.map(asset => (
                  <div key={asset.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:border-slate-200 dark:hover:border-slate-700 transition-colors shadow-sm">
                      <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${asset.color}`}>
                              {asset.symbol[0]}
                          </div>
                          <div>
                              <div className="flex items-center gap-1">
                                  <h4 className="font-bold text-slate-900 dark:text-white">{asset.symbol}</h4>
                                  <span className={`text-[10px] font-bold ${asset.change24h >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                      {asset.change24h > 0 ? '+' : ''}{asset.change24h}%
                                  </span>
                              </div>
                              <p className="text-xs text-slate-500">₺{asset.price.toLocaleString()}</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className="font-bold text-slate-900 dark:text-white">{asset.balance.toFixed(4)} {asset.symbol}</p>
                          <p className="text-xs text-slate-500">₺{(asset.balance * asset.price).toFixed(2)}</p>
                      </div>
                  </div>
              ))}
          </div>

          {/* Recent Transactions */}
          {recentTx.length > 0 && (
              <div className="mt-8 space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-slate-200 px-1">Son İşlemler</h3>
                  {recentTx.map(tx => (
                      <div key={tx.id} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800/50">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
                                  {tx.type === 'Deposit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                              </div>
                              <div>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.type === 'Deposit' ? 'Yatırma' : 'Transfer'}</p>
                                  <p className="text-[10px] text-slate-500">{new Date(tx.date).toLocaleTimeString()}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <p className={`text-sm font-bold ${tx.type === 'Deposit' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                                  {tx.type === 'Deposit' ? '+' : '-'}{tx.amount} {tx.symbol}
                              </p>
                              <p className="text-[10px] text-yellow-500">{tx.status}</p>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
  );

  // --- Header & Back Logic ---
  let headerTitle = "Cüzdanım";
  let onBack = () => navigate('/');

  if (!hasWallet) {
      if (setupStep === 'create') { headerTitle = "Yeni Cüzdan"; onBack = () => setSetupStep('select'); }
      else if (setupStep === 'import') { headerTitle = "İçe Aktar"; onBack = () => setSetupStep('select'); }
      else { headerTitle = "Kurulum"; onBack = () => navigate('/'); }
  } else if (activeTab === 'wallet') {
      if (walletView === 'deposit_search') { headerTitle = "Coin Seç"; onBack = () => setWalletView('main'); }
      else if (walletView === 'deposit_details') { headerTitle = "Yatır"; onBack = () => setWalletView('deposit_search'); }
      else if (walletView === 'send_select') { headerTitle = "Gönderilecek Coin"; onBack = () => setWalletView('main'); }
      else if (walletView === 'send_form') { headerTitle = "Transfer"; onBack = () => setWalletView('send_select'); }
  } else {
      headerTitle = "Gelirler";
  }

  // Handle Send Select View (Reusing Deposit Search UI logic basically)
  if (walletView === 'send_select') {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pt-8 transition-colors">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"><ChevronLeft /></button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{headerTitle}</h1>
            </div>
            <div className="space-y-2">
                {assets.map(asset => (
                    <div key={asset.id} onClick={() => { setSelectedAsset(asset); setSelectedNetwork(asset.networks[0]); setWalletView('send_form'); }} className="flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl cursor-pointer">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${asset.color}`}>{asset.symbol[0]}</div>
                        <div>
                            <p className="font-bold text-slate-900 dark:text-white">{asset.symbol}</p>
                            <p className="text-xs text-slate-500">Bakiye: {asset.balance}</p>
                        </div>
                        <ChevronRight className="ml-auto text-slate-600" size={18} />
                    </div>
                ))}
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pt-8 pb-24 flex flex-col relative transition-colors">
        <div className="flex items-center gap-4 mb-6">
            <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"><ChevronLeft /></button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{headerTitle}</h1>
        </div>

        {!hasWallet ? (
            // Setup Flow
            <div className="flex-1 flex flex-col animate-in fade-in">
                {setupStep === 'select' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-8 shadow-2xl border border-slate-100 dark:border-slate-800">
                             <Shield size={48} className="text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Cüzdan Oluştur</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-12 max-w-[250px] mx-auto leading-relaxed">Kripto varlıklarınızı güvenle saklayın ve yönetin. Anahtarlarınız sadece sizde kalır.</p>
                        
                        <div className="w-full space-y-4 max-w-sm">
                            <div className="flex justify-center mb-6"><TonConnectButton /></div>
                            
                            <div className="relative flex items-center justify-center mb-6">
                                <div className="h-px bg-slate-200 dark:bg-slate-800 w-full"></div>
                                <span className="absolute bg-slate-50 dark:bg-slate-950 px-3 text-xs text-slate-500 dark:text-slate-600 uppercase font-bold tracking-wider">veya</span>
                            </div>

                            <button onClick={generateNewWallet} className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all py-4 rounded-xl text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20">
                                <Key size={20} /> Yeni Cüzdan Oluştur
                            </button>
                            <button onClick={() => setSetupStep('import')} className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all py-4 rounded-xl text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700">
                                <Download size={20} /> İçe Aktar
                            </button>
                        </div>
                    </div>
                )}
                {setupStep === 'create' && (
                    <div className="flex-1 flex flex-col">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3 mb-6">
                            <AlertTriangle className="text-yellow-500 flex-shrink-0" size={24} />
                            <p className="text-xs text-yellow-600 dark:text-yellow-500/90 leading-relaxed">
                                Bu 12 kelimeyi bir kağıda yazın ve güvenli bir yerde saklayın. Kaybederseniz cüzdanınıza bir daha erişemezsiniz.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl mb-6 relative group border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="absolute top-3 right-3 z-20">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleCopy(generatedSeed.join(' ')); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    {copied ? <><Check size={14} className="text-emerald-500" /><span className="text-emerald-500">Kopyalandı</span></> : <><Copy size={14} /><span>Kopyala</span></>}
                                </button>
                            </div>
                            <div className={`grid grid-cols-3 gap-3 ${!showSeed ? 'blur-md select-none opacity-50' : ''} transition-all duration-500`}>
                                {generatedSeed.map((w,i)=><div key={i} className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg text-xs text-center font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">{i+1}. {w}</div>)}
                            </div>
                            {!showSeed && (
                                <button onClick={()=>setShowSeed(true)} className="absolute inset-0 flex flex-col items-center justify-center z-10 text-slate-900 dark:text-white font-bold text-sm bg-slate-100/50 dark:bg-black/10 hover:bg-slate-200/50 dark:hover:bg-black/20 transition-colors rounded-2xl backdrop-blur-sm">
                                    <Eye size={32} className="mb-2 text-blue-500" />
                                    <span>Görmek için Dokun</span>
                                </button>
                            )}
                        </div>
                        <button onClick={confirmCreateWallet} className="mt-auto w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all py-4 rounded-xl text-white font-bold shadow-lg shadow-emerald-500/30">
                            Yazdım ve Sakladım
                        </button>
                    </div>
                )}
                {setupStep === 'import' && (
                    <div className="flex-1 flex flex-col">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">12 kelimelik kurtarma ifadenizi sırasıyla girin.</p>
                        <textarea 
                            value={importInput} 
                            onChange={e=>setImportInput(e.target.value)} 
                            className="w-full h-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white font-mono text-sm mb-6 focus:border-blue-500 outline-none resize-none placeholder-slate-400 dark:placeholder-slate-600" 
                            placeholder="abandon ability able about..."
                        ></textarea>
                        <button 
                            onClick={handleImportWallet} 
                            disabled={isLoading} 
                            className="mt-auto w-full bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-blue-500/30"
                        >
                            {isLoading ? <RefreshCw className="animate-spin"/> : 'Cüzdanı Yükle'}
                        </button>
                    </div>
                )}
            </div>
        ) : (
            // Dashboard
            <div className="flex-1 flex flex-col h-full animate-in fade-in">
                {walletView === 'main' && (
                    <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex mb-6 border border-slate-200 dark:border-slate-800 shrink-0">
                        <button onClick={()=>setActiveTab('wallet')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab==='wallet'?'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm':'text-slate-500 hover:text-slate-400 dark:hover:text-slate-300'}`}>Cüzdan</button>
                        <button onClick={()=>setActiveTab('revenue')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab==='revenue'?'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm':'text-slate-500 hover:text-slate-400 dark:hover:text-slate-300'}`}>Gelirler</button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {activeTab === 'revenue' ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                                <BarChart3 size={32} className="opacity-20" />
                            </div>
                            <p className="font-medium">Henüz gelir verisi yok.</p>
                            <p className="text-xs mt-2">Botlarınız çalıştıkça burada görünecek.</p>
                        </div>
                    ) : (
                        <>
                            {walletView === 'main' && renderWalletMain()}
                            {walletView === 'deposit_search' && renderDepositSearch()}
                            {walletView === 'deposit_details' && renderDepositDetails()}
                            {walletView === 'send_form' && renderSendForm()}
                        </>
                    )}
                </div>
            </div>
        )}

        {/* Modals */}
        {showSettingsModal && renderSettingsModal()}
        
        {showSeedRevealModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={()=>setShowSeedRevealModal(false)}>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl" onClick={e=>e.stopPropagation()}>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <Key size={18} className="text-blue-500" />
                        Gizli Kelimeler
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">Bu kelimeleri kimseyle paylaşmayın.</p>
                    <div className="bg-slate-100 dark:bg-black/50 p-4 rounded-xl font-mono text-sm text-slate-700 dark:text-slate-300 mb-6 select-all border border-slate-200 dark:border-slate-800/50 break-words">
                        {storedSeedPhrase}
                    </div>
                    <button onClick={()=>setShowSeedRevealModal(false)} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-white font-bold transition-colors">
                        Kapat
                    </button>
                </div>
            </div>
        )}
        
        {showLogoutConfirm && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-red-950/20 backdrop-blur-sm animate-in fade-in" onClick={()=>setShowLogoutConfirm(false)}>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-sm text-center border border-red-100 dark:border-red-900/50 shadow-2xl" onClick={e=>e.stopPropagation()}>
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">Cüzdanı Sil</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                        Yedeğiniz (Seed Phrase) yoksa, cüzdan silindikten sonra bakiyenize <b>asla</b> erişemezsiniz.
                    </p>
                    <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-500 py-3.5 rounded-xl text-white font-bold mb-3 shadow-lg shadow-red-500/20 transition-colors">
                        Evet, Cüzdanı Sil
                    </button>
                    <button onClick={()=>setShowLogoutConfirm(false)} className="w-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium py-2">
                        Vazgeç
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default Earnings;
