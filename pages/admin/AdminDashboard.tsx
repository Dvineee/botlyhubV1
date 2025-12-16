
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Users, DollarSign, Activity, LogOut, Terminal, 
    Search, Trash2, Bot, Info, Plus, X, Save, Image as ImageIcon, 
    Edit, CheckCircle, Ban, ChevronRight, MoreVertical 
} from 'lucide-react';
import { Logger } from '../../services/Logger';
import { MarketplaceService } from '../../services/MarketplaceService';
import { SystemLog, AppStats, UserBot, Channel, ExtendedBot } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { categories } from '../../data';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AppStats | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'users' | 'bots'>('overview');
  
  // Data State
  const [totalOwnedBots, setTotalOwnedBots] = useState(0);
  const [totalChannels, setTotalChannels] = useState(0);
  
  // Bot Management State
  const [marketplaceBots, setMarketplaceBots] = useState<ExtendedBot[]>([]);
  const [showBotModal, setShowBotModal] = useState(false);
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  
  const [botForm, setBotForm] = useState({
      name: '',
      description: '',
      price: '',
      category: 'productivity',
      icon: '',
      isPremium: false,
      status: 'active' as 'active' | 'passive',
      screenshots: '' 
  });

  useEffect(() => {
    // Auth Check
    const isAuth = sessionStorage.getItem('isAdminAuthenticated');
    if (!isAuth) {
        navigate('/admin/login');
        return;
    }

    // Load Initial Data
    const s = Logger.getStats();
    setStats(s);
    setLogs(Logger.getLogs());
    setMarketplaceBots(MarketplaceService.getAllBots());

    const ownedBots: UserBot[] = JSON.parse(localStorage.getItem('ownedBots') || '[]');
    const channels: Channel[] = JSON.parse(localStorage.getItem('userChannels') || '[]');
    
    setTotalOwnedBots(ownedBots.length);
    setTotalChannels(channels.length);

  }, [navigate]);

  // Live Simulation
  useEffect(() => {
      if (!stats) return;
      const interval = setInterval(() => {
          if (Math.random() > 0.7) {
              setStats(prev => {
                  if (!prev) return null;
                  const newStats = { ...prev, totalViews: prev.totalViews + Math.floor(Math.random() * 3) + 1 };
                  Logger.saveStats(newStats); 
                  return newStats;
              });
          }
      }, 2000);
      return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
      sessionStorage.removeItem('isAdminAuthenticated');
      navigate('/admin/login');
  };

  const clearLogs = () => {
      Logger.clearLogs();
      setLogs([]);
  };

  // Bot Actions
  const openAddModal = () => {
      setEditingBotId(null);
      setBotForm({ name: '', description: '', price: '', category: 'productivity', icon: '', isPremium: false, status: 'active', screenshots: '' });
      setShowBotModal(true);
  };

  const openEditModal = (bot: ExtendedBot) => {
      setEditingBotId(bot.id);
      setBotForm({
          name: bot.name,
          description: bot.description,
          price: bot.price.toString(),
          category: bot.category,
          icon: bot.icon,
          isPremium: !!bot.isPremium,
          status: bot.status || 'active',
          screenshots: bot.screenshots ? bot.screenshots.join('\n') : ''
      });
      setShowBotModal(true);
  };

  const handleDeleteBot = (id: string) => {
      if(window.confirm('Bu botu silmek istediğinize emin misiniz?')) {
          MarketplaceService.deleteBot(id);
          setMarketplaceBots(MarketplaceService.getAllBots());
          Logger.log('USER_ACTION', `Bot silindi (ID: ${id})`);
      }
  };

  const handleToggleStatus = (bot: ExtendedBot) => {
      const newStatus = bot.status === 'active' ? 'passive' : 'active';
      MarketplaceService.updateBot(bot.id, { status: newStatus });
      setMarketplaceBots(MarketplaceService.getAllBots());
      Logger.log('USER_ACTION', `Bot durumu: ${newStatus}`);
  };

  const handleSaveBot = (e: React.FormEvent) => {
      e.preventDefault();
      const iconUrl = botForm.icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(botForm.name)}&background=random&size=200`;
      const screenshotList = botForm.screenshots.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);

      const botData = {
          name: botForm.name,
          description: botForm.description,
          price: parseFloat(botForm.price) || 0,
          category: botForm.category,
          icon: iconUrl,
          isPremium: botForm.isPremium,
          status: botForm.status,
          screenshots: screenshotList
      };

      if (editingBotId) {
          MarketplaceService.updateBot(editingBotId, botData);
          Logger.log('USER_ACTION', `Bot güncellendi: ${botForm.name}`);
      } else {
          MarketplaceService.addBot(botData);
          Logger.log('USER_ACTION', `Yeni bot eklendi: ${botForm.name}`);
      }

      setMarketplaceBots(MarketplaceService.getAllBots());
      setShowBotModal(false);
  };

  // Graph Data
  const getGraphData = () => {
     if (!stats) return [];
     const base = stats.totalViews;
     return [
        { name: 'Pzt', view: Math.floor(base * 0.85) },
        { name: 'Sal', view: Math.floor(base * 0.90) },
        { name: 'Çar', view: Math.floor(base * 0.88) },
        { name: 'Per', view: Math.floor(base * 0.95) },
        { name: 'Cum', view: Math.floor(base * 0.92) },
        { name: 'Cmt', view: Math.floor(base * 0.98) },
        { name: 'Paz', view: base },
     ];
  };

  if (!stats) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Yükleniyor...</div>;

  // --- Components ---

  const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${color.text}`}>
              <Icon size={64} />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-xl ${color.bg} ${color.text}`}>
                  <Icon size={24} />
              </div>
              {subValue && <span className="text-[10px] font-bold bg-slate-800 px-2 py-1 rounded-lg text-slate-400">{subValue}</span>}
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
      </div>
  );

  const NavItem = ({ id, icon: Icon, label }: any) => (
      <button 
          onClick={() => setActiveTab(id)} 
          className={`flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-4 md:py-3 rounded-xl transition-all ${
              activeTab === id 
              ? 'text-blue-500 md:bg-blue-600 md:text-white' 
              : 'text-slate-500 hover:text-slate-300 md:hover:bg-slate-800'
          }`}
      >
          <Icon size={24} className="mb-1 md:mb-0" />
          <span className="text-[10px] md:text-sm font-medium">{label}</span>
      </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-72 bg-slate-900 border-r border-slate-800 flex-col fixed h-full z-20">
            <div className="p-8 border-b border-slate-800/50">
                <h1 className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Botly Admin</h1>
                <p className="text-xs text-slate-500 mt-1">Yönetim Paneli v2.0</p>
            </div>
            <nav className="flex-1 p-6 space-y-2">
                <NavItem id="overview" icon={LayoutDashboard} label="Genel Bakış" />
                <NavItem id="bots" icon={Bot} label="Bot Yönetimi" />
                <NavItem id="users" icon={Users} label="Kullanıcılar" />
                <NavItem id="logs" icon={Terminal} label="Log Kayıtları" />
            </nav>
            <div className="p-6 border-t border-slate-800/50">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Güvenli Çıkış</span>
                </button>
            </div>
        </aside>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 z-50 pb-safe">
            <div className="grid grid-cols-4 p-2">
                <NavItem id="overview" icon={LayoutDashboard} label="Özet" />
                <NavItem id="bots" icon={Bot} label="Botlar" />
                <NavItem id="users" icon={Users} label="Kullanıcı" />
                <NavItem id="logs" icon={Terminal} label="Loglar" />
            </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-72 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto min-h-screen">
            
            {/* Header Mobile Only */}
            <div className="md:hidden flex justify-between items-center mb-6 pt-2">
                <div>
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                    <p className="text-xs text-slate-500">Hoşgeldin, Admin</p>
                </div>
                <button onClick={handleLogout} className="p-2 bg-slate-900 rounded-full border border-slate-800 text-slate-400">
                    <LogOut size={18} />
                </button>
            </div>

            {/* Content Switcher */}
            {activeTab === 'overview' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
                    {/* Warning Banner */}
                    <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 items-start">
                        <Info className="text-blue-400 flex-shrink-0" size={20} />
                        <div>
                            <h4 className="font-bold text-sm text-blue-200">Demo Modu Aktif</h4>
                            <p className="text-xs text-blue-300/70 mt-1">Görüntülenen veriler simülasyon amaçlıdır. Değişiklikler tarayıcı hafızasında saklanır.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard 
                            title="Görüntülenme" 
                            value={stats.totalViews} 
                            icon={Activity} 
                            color={{bg: 'bg-emerald-500/20', text: 'text-emerald-500'}} 
                            subValue="Canlı"
                        />
                        <StatCard 
                            title="Kullanıcılar" 
                            value={stats.totalUsers} 
                            icon={Users} 
                            color={{bg: 'bg-blue-500/20', text: 'text-blue-500'}} 
                        />
                        <StatCard 
                            title="Toplam Hasılat" 
                            value={`₺${stats.totalRevenue.toFixed(0)}`} 
                            icon={DollarSign} 
                            color={{bg: 'bg-yellow-500/20', text: 'text-yellow-500'}} 
                        />
                        <StatCard 
                            title="Satılan Bot" 
                            value={totalOwnedBots} 
                            icon={Bot} 
                            color={{bg: 'bg-purple-500/20', text: 'text-purple-500'}} 
                        />
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                        <h3 className="font-bold mb-6 flex items-center gap-2">
                            <Activity size={18} className="text-blue-500" />
                            Trafik Analizi
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={getGraphData()}>
                                    <defs>
                                        <linearGradient id="colorView" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px'}}
                                        itemStyle={{color: '#3b82f6'}}
                                    />
                                    <Area type="monotone" dataKey="view" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorView)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'bots' && (
                <div className="animate-in fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">Bot Yönetimi</h2>
                            <p className="text-xs text-slate-500 hidden md:block">Marketplace üzerindeki botları yönetin.</p>
                        </div>
                        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                            <Plus size={18} /> <span className="hidden md:inline">Yeni Bot Ekle</span><span className="md:hidden">Ekle</span>
                        </button>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900 border-b border-slate-800 text-xs text-slate-400 uppercase">
                                    <th className="p-4 font-semibold">Bot Bilgisi</th>
                                    <th className="p-4 font-semibold">Kategori</th>
                                    <th className="p-4 font-semibold">Fiyat</th>
                                    <th className="p-4 font-semibold">Durum</th>
                                    <th className="p-4 font-semibold text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-slate-300">
                                {marketplaceBots.map((bot) => (
                                    <tr key={bot.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 flex items-center gap-3">
                                            <img src={bot.icon} className="w-10 h-10 rounded-lg bg-slate-800 object-cover" />
                                            <div>
                                                <div className="font-bold text-white">{bot.name}</div>
                                                <div className="text-xs text-slate-500 truncate max-w-[150px]">{bot.description}</div>
                                            </div>
                                        </td>
                                        <td className="p-4"><span className="bg-slate-800 px-2 py-1 rounded text-xs capitalize">{bot.category}</span></td>
                                        <td className="p-4 font-mono font-bold">{bot.price === 0 ? <span className="text-emerald-400">Ücretsiz</span> : `₺${bot.price}`}</td>
                                        <td className="p-4">
                                             <button onClick={() => handleToggleStatus(bot)} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${bot.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                                                {bot.status === 'active' ? <CheckCircle size={12} /> : <Ban size={12} />}
                                                <span className="capitalize">{bot.status || 'active'}</span>
                                             </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEditModal(bot)} className="p-2 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 rounded-lg transition-colors"><Edit size={16} /></button>
                                                <button onClick={() => handleDeleteBot(bot.id)} className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                        {marketplaceBots.map((bot) => (
                            <div key={bot.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 items-start relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full -mr-4 -mt-4 pointer-events-none"></div>
                                <img src={bot.icon} className="w-16 h-16 rounded-xl bg-slate-800 object-cover flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-white truncate pr-6">{bot.name}</h3>
                                        <button onClick={(e) => { e.stopPropagation(); openEditModal(bot); }} className="p-1 text-slate-400"><Edit size={16} /></button>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mb-2">{bot.category}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-sm font-bold text-blue-400">{bot.price === 0 ? 'Ücretsiz' : `₺${bot.price}`}</span>
                                        <button onClick={() => handleToggleStatus(bot)} className={`text-[10px] font-bold px-2 py-1 rounded-full border ${bot.status === 'active' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                                            {bot.status === 'active' ? 'Aktif' : 'Pasif'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
                <div className="animate-in fade-in">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Loglar</h2>
                        <button onClick={clearLogs} className="text-xs text-red-400 hover:text-red-300">Temizle</button>
                    </div>
                    <div className="space-y-2">
                        {logs.map(log => (
                            <div key={log.id} className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl flex gap-3 items-start text-xs">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.type === 'ERROR' ? 'bg-red-500' : log.type === 'WARNING' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold text-slate-300">{log.type}</span>
                                        <span className="font-mono text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-slate-400">{log.message}</p>
                                </div>
                            </div>
                        ))}
                        {logs.length === 0 && <div className="text-center text-slate-600 py-10">Kayıt yok.</div>}
                    </div>
                </div>
            )}
            
            {/* Users Tab (Simplified) */}
             {activeTab === 'users' && (
                 <div className="animate-in fade-in">
                     <h2 className="text-xl font-bold mb-4">Kullanıcı Verileri</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                             <h3 className="font-bold mb-4 text-slate-400 text-sm uppercase">Satın Alınanlar</h3>
                             <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                 {JSON.parse(localStorage.getItem('ownedBots') || '[]').map((b: any, i: number) => (
                                     <div key={i} className="flex items-center gap-3 p-2 bg-slate-950/50 rounded-lg border border-slate-800/50">
                                         <img src={b.icon} className="w-8 h-8 rounded bg-slate-800" />
                                         <div>
                                             <p className="font-bold text-xs">{b.name}</p>
                                             <p className="text-[10px] text-slate-500">{new Date().toLocaleDateString()}</p>
                                         </div>
                                     </div>
                                 ))}
                                 {totalOwnedBots === 0 && <p className="text-xs text-slate-600">Veri yok.</p>}
                             </div>
                         </div>
                         <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                             <h3 className="font-bold mb-4 text-slate-400 text-sm uppercase">Bağlı Kanallar</h3>
                             <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                 {JSON.parse(localStorage.getItem('userChannels') || '[]').map((c: any, i: number) => (
                                     <div key={i} className="flex items-center gap-3 p-2 bg-slate-950/50 rounded-lg border border-slate-800/50">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">{c.name[0]}</div>
                                         <div>
                                             <p className="font-bold text-xs">{c.name}</p>
                                             <p className="text-[10px] text-slate-500">{c.memberCount} Üye</p>
                                         </div>
                                     </div>
                                 ))}
                                 {totalChannels === 0 && <p className="text-xs text-slate-600">Veri yok.</p>}
                             </div>
                         </div>
                     </div>
                 </div>
             )}

        </main>

        {/* Modal */}
        {showBotModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-800 p-6 relative shadow-2xl max-h-[85vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">{editingBotId ? 'Botu Düzenle' : 'Yeni Bot'}</h3>
                        <button onClick={() => setShowBotModal(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
                    </div>
                    <form onSubmit={handleSaveBot} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">Bot Adı</label>
                            <input type="text" required value={botForm.name} onChange={e => setBotForm({...botForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none" placeholder="Örn: Super Bot" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">Açıklama</label>
                            <textarea required value={botForm.description} onChange={e => setBotForm({...botForm, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none h-20 resize-none" placeholder="Açıklama..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">Fiyat (₺)</label>
                                <input type="number" min="0" step="0.01" value={botForm.price} onChange={e => setBotForm({...botForm, price: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">Kategori</label>
                                <select value={botForm.category} onChange={e => setBotForm({...botForm, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none">
                                    {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">Görseller (URL, Satır başı)</label>
                            <textarea value={botForm.screenshots} onChange={e => setBotForm({...botForm, screenshots: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none h-20 text-xs" placeholder="https://..." />
                        </div>
                         <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer" onClick={() => setBotForm({...botForm, isPremium: !botForm.isPremium})}>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${botForm.isPremium ? 'bg-blue-600 border-blue-600' : 'border-slate-600'}`}>
                                {botForm.isPremium && <X size={14} className="text-white" />}
                            </div>
                            <span className="text-sm font-bold text-slate-300">Premium Bot</span>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                            <Save size={18} /> Kaydet
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminDashboard;
