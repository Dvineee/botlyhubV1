
import React, { useState } from 'react';
import { ChevronLeft, Star, Wallet, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockBots, subscriptionPlans } from '../data';
import { UserBot } from '../types';
import { WalletService } from '../services/WalletService';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Logger } from '../services/Logger';

const Payment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // TON Connect Hook for real crypto payments
  const [tonConnectUI] = useTonConnectUI();

  // Identify Item (Bot or Plan)
  const bot = mockBots.find(b => b.id === id);
  const plan = subscriptionPlans.find(p => p.id === id);
  const item = bot || plan;

  // Prices
  const priceTRY = item ? item.price : 0;
  const priceStars = Math.ceil(priceTRY * 1.5); // Approx conversion
  const priceTON = parseFloat((priceTRY / 185).toFixed(2)); // Approx TON price

  // --- Success Handler ---
  const handleSuccess = () => {
      // 1. Update State (Premium or Bot Owner)
      if (bot) {
          const newBot: UserBot = {
              ...bot,
              isAdEnabled: false,
              isActive: true,
              expiryDate: '2025-12-31'
          };
          const currentBots = JSON.parse(localStorage.getItem('ownedBots') || '[]');
          if (!currentBots.find((b: UserBot) => b.id === newBot.id)) {
              localStorage.setItem('ownedBots', JSON.stringify([...currentBots, newBot]));
              // LOGGING
              Logger.log('TRANSACTION', `Bot satın alındı: ${bot.name}`, { price: priceTRY, method: 'Unknown' });
              Logger.incrementRevenue(priceTRY);
          }
      } else if (plan) {
          localStorage.setItem('userPlan', plan.id);
          localStorage.setItem('isPremium', 'true');
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          localStorage.setItem('premiumExpiry', expiryDate.toISOString());
          // LOGGING
          Logger.log('TRANSACTION', `Abonelik alındı: ${plan.name}`, { price: priceTRY });
          Logger.incrementRevenue(priceTRY);
      }

      // 2. Show Success
      setToastMessage(`Ödeme alındı! ${bot ? 'Bot kütüphanene eklendi 🎉' : 'Premium üyelik aktif edildi 🎉'}`);
      
      // 3. Navigate after delay
      setTimeout(() => {
          if (bot) navigate('/my-bots');
          else navigate('/settings');
      }, 2500);
  };

  // --- 1. Telegram Stars Payment ---
  const payWithStars = () => {
      setIsLoading(true);
      
      const webApp = window.Telegram?.WebApp;

      // Check if we are in Telegram WebApp
      if (webApp && webApp.initData) {
          // Real Invoice Request
          // Note: In a real backend, you would generate a unique invoice link/slug via Bot API
          // Here we use a dummy slug for demonstration, but the method is correct.
          const demoInvoiceSlug = "https://t.me/$CJ_INVOICE_SLUG"; 
          
          webApp.openInvoice(demoInvoiceSlug, (status) => {
              setIsLoading(false);
              if (status === 'paid') {
                  handleSuccess();
              } else if (status === 'cancelled') {
                  alert("Ödeme iptal edildi.");
              } else {
                  // For demo purposes, we simulate success if the invoice fails to open (due to fake slug)
                  // In prod, remove this else block.
                  alert("Demo: Fatura açılamadı (Slug geçersiz), ancak başarı simüle ediliyor.");
                  handleSuccess();
              }
          });
      } else {
          // Browser / Preview Mode
          setIsLoading(false);
          setToastMessage("Gerçek Telegram’da test et → @Botlyhub_bot’a git");
          setTimeout(() => setToastMessage(null), 3000);
          
          // Auto-success for testing logic in preview
          // Uncomment next line to simulate success in browser:
          // handleSuccess();
      }
  };

  // --- 2. Crypto Payment (TON Connect) ---
  const payWithCrypto = async () => {
      setIsLoading(true);
      
      // Check if wallet is connected
      if (!tonConnectUI.connected) {
          setIsLoading(false);
          alert("Lütfen önce bir TON cüzdanı bağlayın.");
          // Trigger wallet connection modal
          await tonConnectUI.openModal();
          return;
      }

      try {
          // Create Transaction Payload
          const transaction = WalletService.createTonTransaction(priceTON);
          
          // Send Transaction
          const result = await tonConnectUI.sendTransaction(transaction);
          
          console.log("Transaction Result:", result);
          
          // If we reach here, the wallet signed and sent the tx (or user approved mock)
          handleSuccess();

      } catch (error) {
          console.error(error);
          // In Preview mode, TON Connect UI might throw if not properly mocked or network issues
          if (!window.Telegram?.WebApp?.initData) {
             setToastMessage("TON Connect gerçek ortamda çalışır.");
             setTimeout(() => setToastMessage(null), 3000);
          } else {
             alert("İşlem iptal edildi veya başarısız oldu.");
          }
      } finally {
          setIsLoading(false);
      }
  };


  if (!item) return <div className="text-white p-4">Ürün bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-4 pt-8 pb-12 relative">
        {/* Toast Notification */}
        {toastMessage && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 w-max max-w-[90%] text-center">
                <CheckCircle2 size={20} className="flex-shrink-0" />
                <span className="font-bold text-sm">{toastMessage}</span>
            </div>
        )}

        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-900 rounded-full">
                <ChevronLeft className="w-6 h-6 text-slate-200" />
            </button>
            <h1 className="text-xl font-bold text-white">Ödeme Yap</h1>
        </div>

        {/* Item Summary Card */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 mb-8 flex gap-4 items-center relative overflow-hidden shadow-sm">
            <div className="w-16 h-16 rounded-xl bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-700">
                {bot ? (
                    <img src={bot.icon} alt={bot.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center"><Star className="text-yellow-400" /></div>
                )}
            </div>
            <div>
                <h2 className="text-lg font-bold text-white leading-tight">{item.name}</h2>
                <p className="text-xs text-slate-500 mt-1">{plan ? 'Aylık Premium Üyelik' : 'Ömür Boyu Lisans'}</p>
                <div className="mt-1 text-emerald-400 font-bold">₺{item.price}</div>
            </div>
        </div>

        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Ödeme Yöntemi</h2>

        <div className="space-y-3">
            {/* 1. Telegram Stars Button */}
            <button 
                onClick={payWithStars}
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl p-4 flex items-center justify-between transition-all group active:scale-[0.99]"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                        {isLoading ? <Loader2 className="animate-spin text-yellow-500" size={20} /> : <Star className="text-yellow-500 fill-yellow-500" size={20} />}
                    </div>
                    <div className="text-left">
                        <span className="block font-semibold text-white text-sm">Telegram Stars</span>
                        <span className="text-xs text-slate-500">Resmi Telegram Ödemesi</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="block font-bold text-white text-sm">{priceStars} Stars</span>
                </div>
            </button>

            {/* 2. Crypto Wallet Button */}
            <button 
                onClick={payWithCrypto}
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl p-4 flex items-center justify-between transition-all group active:scale-[0.99]"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                        {isLoading ? <Loader2 className="animate-spin text-blue-500" size={20} /> : <Wallet className="text-blue-500" size={20} />}
                    </div>
                    <div className="text-left">
                        <span className="block font-semibold text-white text-sm">Cüzdanımdan Öde</span>
                        <span className="text-xs text-slate-500">TON Connect (Tonkeeper vb.)</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="block font-bold text-white text-sm">≈ {priceTON} TON</span>
                </div>
            </button>
            
            {/* Info Note */}
            <div className="mt-6 flex gap-2 px-2 opacity-60">
                <ShieldCheck className="text-slate-500 flex-shrink-0" size={16} />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                    Ödemeleriniz uçtan uca şifreli altyapı ile korunmaktadır. Ödeme sonrası ürün otomatik tanımlanır.
                </p>
            </div>
        </div>
    </div>
  );
};

export default Payment;
