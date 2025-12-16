
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Users, DollarSign, Activity, LogOut, Terminal, 
    Search, Trash2, Bot, Info, Plus, X, Save, Image as ImageIcon, 
    Edit, CheckCircle, Ban, ChevronRight, MoreVertical, Download, 
    PieChart, AlertTriangle, ShieldAlert, Mail 
} from 'lucide-react';
import { Logger } from '../../services/Logger';
import { MarketplaceService } from '../../services/MarketplaceService';
import { UserService } from '../../services/UserService';
import { SystemLog, AppStats, UserBot, Channel, ExtendedBot, User } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';
import { categories } from '../../data';

// --- Constants ---
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 Minutes
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259FF', '#F24E1E'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // --- Global State ---
  const [stats, setStats] = useState<AppStats | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'users' | 'bots'>('overview');
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  // --- Data State ---
  const [marketplaceBots, setMarketplaceBots] = useState<ExtendedBot[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [realRevenue, setRealRevenue] = useState(0);
  const [soldBotCount, setSoldBotCount] = useState(0);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  // --- UI State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [showBotModal, setShowBotModal] = useState(false);
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  
  // --- Forms ---
  const [botForm, setBotForm] = useState({
      name: '', description: '', price: '', category: 'productivity', icon: '', isPremium: false, status: 'active' as 'active' | 'passive', screenshots: '' 
  });

  // --- Security: Auto Logout ---
  useEffect(() => {
      const checkInactivity = () => {
          if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
              handleLogout();
          }
      };
      
      const updateActivity = () => setLastActivity(Date.now());
      
      window.addEventListener('mousemove', updateActivity);
      window.addEventListener('keydown', updateActivity);
      const timer = setInterval(checkInactivity, 10000); // Check every 10s

      return () => {
          window.removeEventListener('mousemove', updateActivity);
          window.removeEventListener('keydown', updateActivity);
          clearInterval(timer);
      };
  }, [lastActivity]);

  // --- Initialization ---
  useEffect(() => {
    const isAuth = sessionStorage.getItem('isAdminAuthenticated');
    if (!isAuth) {
        navigate('/admin/login');
        return;
    }

    refreshData();
  }, [navigate]);

  const refreshData = () => {
      // 1. Logs & Stats
      setStats(Logger.getStats());
      setLogs(Logger.getLogs());

      // 2. Marketplace Bots
      const bots = MarketplaceService.getAllBots();
      setMarketplaceBots(bots);

      // 3. Users
      setAdminUsers(UserService.getAllUsers());

      // 4. Calculate Real Revenue & Sales (From Owned Bots Storage)
      const ownedBots: UserBot[] = JSON.parse(localStorage.getItem('ownedBots') || '[]');
      const channels: Channel[] = JSON.parse(localStorage.getItem('userChannels') || '[]');
      
      const revenue = ownedBots.reduce((acc, bot) => acc + (bot.price || 0), 0);
      const totalSubscriptionsRevenue = 149.90 * 12; // Mock subs calculation for demo

      setSoldBotCount(ownedBots.length);
      setRealRevenue(revenue + totalSubscriptionsRevenue);

      // 5. Category Chart Data
      const catCount = bots.reduce((acc, bot) => {
          acc[bot.category] = (acc[bot.category] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);
      
      const chartData = Object.keys(catCount).map(key => ({
          name: categories.find(c => c.id === key)?.label || key,
          value: catCount[key]
      }));
      setCategoryData(chartData);
  };

  const handleLogout = () => {
      sessionStorage.removeItem('isAdminAuthenticated');
      navigate('/admin/login');
  };

  const clearLogs = () => {
      Logger.clearLogs();
      setLogs([]);
  };

  const handleExportCSV = (data: any[], filename: string) => {
      const csvContent = "data:text/csv;charset=utf-8," 
          + data.map(e => Object.values(e).join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // --- Bot Management ---
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

      refreshData();
      setShowBotModal(false);
  };

  const handleDeleteBot = (id: string) => {
      if(window.confirm('Bu botu silmek istediğinize emin misiniz?')) {
          MarketplaceService.deleteBot(id);
          refreshData();
          Logger.log('USER_ACTION', `Bot silindi (ID: ${id})`);
      }
  };

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


  // --- User Management ---
  const handleToggleUserStatus = (user: User) => {
      const newStatus = user.status === 'Active' ? 'Passive' : 'Active';
      UserService.updateUser(user.id, { status: newStatus });
      refreshData();
      Logger.log('USER_ACTION', `Kullanıcı durumu değiştirildi: ${user.username} -> ${newStatus}`);
  };

  const handleDeleteUser = (id: string) => {
      if(window.confirm('Kullanıcıyı silmek veri kaybına yol açabilir. Emin misiniz?')) {
          UserService.deleteUser(id);
          refreshData();
          Logger.log('WARNING', `Kullanıcı silindi ID: ${id}`);
      }
  };

  // --- Filtering ---
  const filteredBots = marketplaceBots.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredUsers = adminUsers.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // --- Graph Data ---
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

  // --- Sub-Components ---
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
                <p className="text-xs text-slate-500 mt-1">Yönetim Paneli v2.1 Pro</p>
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

        {/* Main Content */}
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

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
                    <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-xl flex gap-3 items-center justify-between">
                         <div className="flex gap-3 items-center">
                            <ShieldAlert className="text-emerald-400 flex-shrink-0" size={20} />
                            <div>
                                <h4 className="font-bold text-sm text-emerald-200">Sistem Güvenli</h4>
                                <p className="text-xs text-emerald-300/70">Tüm servisler aktif. Otomatik yedekleme: 12:00 AM</p>
                            </div>
                         </div>
                         <div className="text-right hidden sm:block">
                             <p className="text-xs text-slate-400">Sunucu Zamanı</p>
                             <p className="text-sm font-mono text-white">{new Date().toLocaleTimeString()}</p>
                         </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard 
                            title="Toplam Görüntülenme" 
                            value={stats.totalViews} 
                            icon={Activity} 
                            color={{bg: 'bg-blue-500/20', text: 'text-blue-500'}} 
                        />
                         <StatCard 
                            title="Aktif Kullanıcı" 
                            value={adminUsers.length} 
                            icon={Users} 
                            color={{bg: 'bg-purple-500/20', text: 'text-purple-500'}} 
                        />
                         <StatCard 
                            title="Gerçek Hasılat" 
                            value={`₺${realRevenue.toFixed(2)}`} 
                            icon={DollarSign} 
                            color={{bg: 'bg-emerald-500/20', text: 'text-emerald-500'}} 
                        />
                         <StatCard 
                            title="Satılan Bot" 
                            value={soldBotCount} 
                            icon={Bot} 
                            color={{bg: 'bg-orange-500/20', text: 'text-orange-500'}} 
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                            <h3 className="font-bold mb-6">Trafik Analizi</h3>
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
                                        <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px'}} itemStyle={{color: '#3b82f6'}} />
                                        <Area type="monotone" dataKey="view" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorView)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center">
                            <h3 className="font-bold mb-4 w-full text-left">Kategori Dağılımı</h3>
                            <div className="h-[200px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold">{marketplaceBots.length}</span>
                                </div>
                            </div>
                            <div className="w-full mt-4 space-y-2">
                                {categoryData.slice(0,3).map((entry, index) => (
                                    <div key={index} className="flex justify-between text-xs">
                                        <span className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index]}}></div>
                                            {entry.name}
                                        </span>
                                        <span className="font-bold">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* BOTS TAB */}
            {activeTab === 'bots' && (
                 <div className="animate-in fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">Bot Yönetimi</h2>
                            <p className="text-xs text-slate-500">Marketplace envanteri ve düzenleme.</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:flex-initial">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Bot ara..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm focus:border-blue-500 outline-none"
                                />
                            </div>
                            <button onClick={openAddModal} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap">
                                <Plus size={18} /> <span className="hidden sm:inline">Yeni Bot</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900 border-b border-slate-800 text-xs text-slate-400 uppercase">
                                    <th className="p-4 font-semibold">Bot</th>
                                    <th className="p-4 font-semibold">Kategori</th>
                                    <th className="p-4 font-semibold">Fiyat</th>
                                    <th className="p-4 font-semibold">Durum</th>
                                    <th className="p-4 font-semibold text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-slate-300">
                                {filteredBots.map((bot) => (
                                    <tr key={bot.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                        <td className="p-4 flex items-center gap-3">
                                            <img src={bot.icon} className="w-10 h-10 rounded-lg bg-slate-800 object-cover" />
                                            <div>
                                                <div className="font-bold text-white">{bot.name}</div>
                                                <div className="text-xs text-slate-500">{bot.description.substring(0,30)}...</div>
                                            </div>
                                        </td>
                                        <td className="p-4"><span className="bg-slate-800 px-2 py-1 rounded text-xs capitalize">{bot.category}</span></td>
                                        <td className="p-4 font-mono font-bold text-white">₺{bot.price}</td>
                                        <td className="p-4">
                                             <button onClick={() => {}} className={`px-2 py-1 rounded text-xs font-bold ${bot.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                                                {bot.status || 'Active'}
                                             </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEditModal(bot)} className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg"><Edit size={16} /></button>
                                                <button onClick={() => handleDeleteBot(bot.id)} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="md:hidden space-y-3">
                        {filteredBots.map(bot => (
                            <div key={bot.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex gap-4">
                                <img src={bot.icon} className="w-16 h-16 rounded-lg bg-slate-800 object-cover" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-white">{bot.name}</h3>
                                        <button onClick={() => openEditModal(bot)}><Edit size={16} className="text-slate-400" /></button>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-2">{bot.category}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="font-bold text-blue-400">₺{bot.price}</span>
                                        <span className={`text-[10px] px-2 py-1 rounded ${bot.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {bot.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            )}

            {/* USERS TAB (NEW) */}
            {activeTab === 'users' && (
                <div className="animate-in fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">Kullanıcı Yönetimi</h2>
                            <p className="text-xs text-slate-500">Toplam {adminUsers.length} kayıtlı kullanıcı.</p>
                        </div>
                        <button onClick={() => handleExportCSV(adminUsers, 'users.csv')} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors">
                            <Download size={14} /> CSV İndir
                        </button>
                    </div>

                    <div className="mb-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Kullanıcı adı, isim veya e-posta ara..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-9 pr-4 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900 border-b border-slate-800 text-xs text-slate-400 uppercase">
                                    <th className="p-4 font-semibold">Kullanıcı</th>
                                    <th className="p-4 font-semibold">Rol</th>
                                    <th className="p-4 font-semibold">Durum</th>
                                    <th className="p-4 font-semibold">Kayıt Tarihi</th>
                                    <th className="p-4 font-semibold text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-slate-300">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                        <td className="p-4 flex items-center gap-3">
                                            <img src={user.avatar} className="w-8 h-8 rounded-full bg-slate-800" />
                                            <div>
                                                <div className="font-bold text-white">{user.name}</div>
                                                <div className="text-xs text-slate-500">@{user.username}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'Admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => handleToggleUserStatus(user)}
                                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-colors ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-red-500/10 hover:text-red-400' : 'bg-red-500/10 text-red-400 hover:bg-emerald-500/10 hover:text-emerald-400'}`}
                                            >
                                                {user.status === 'Active' ? <CheckCircle size={12} /> : <Ban size={12} />}
                                                {user.status === 'Active' ? 'Aktif' : 'Banlı'}
                                            </button>
                                        </td>
                                        <td className="p-4 font-mono text-xs">{user.joinDate}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => {}} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500" title="Mesaj At"><Mail size={16} /></button>
                                                <button onClick={() => handleDeleteUser(user.id)} className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg" title="Sil"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>
            )}

            {/* LOGS TAB */}
            {activeTab === 'logs' && (
                <div className="animate-in fade-in">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Sistem Logları</h2>
                        <div className="flex gap-2">
                            <button onClick={() => handleExportCSV(logs, 'logs.csv')} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors">
                                <Download size={14} /> İndir
                            </button>
                            <button onClick={clearLogs} className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors">
                                <Trash2 size={14} /> Temizle
                            </button>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden max-h-[600px] overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800">
                                <tr className="text-xs text-slate-400 uppercase">
                                    <th className="p-4">Zaman</th>
                                    <th className="p-4">Tip</th>
                                    <th className="p-4">Mesaj</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-slate-300 font-mono">
                                {logs.map(log => (
                                    <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                                        <td className="p-4 text-slate-500 text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                                log.type === 'ERROR' ? 'bg-red-500/10 text-red-400' :
                                                log.type === 'WARNING' ? 'bg-yellow-500/10 text-yellow-400' :
                                                'bg-blue-500/10 text-blue-400'
                                            }`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="p-4">{log.message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {logs.length === 0 && <div className="p-8 text-center text-slate-500">Henüz log kaydı yok.</div>}
                    </div>
                </div>
            )}
        </main>

        {/* Modal: Add/Edit Bot */}
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
                            <label className="text-xs font-bold text-slate-500 block mb-1">Durum</label>
                            <select value={botForm.status} onChange={e => setBotForm({...botForm, status: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none">
                                <option value="active">Aktif (Yayında)</option>
                                <option value="passive">Pasif (Gizli)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">İkon URL (Opsiyonel)</label>
                            <input type="text" value={botForm.icon} onChange={e => setBotForm({...botForm, icon: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none text-xs" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">Görseller (URL, Her satıra bir tane)</label>
                            <textarea value={botForm.screenshots} onChange={e => setBotForm({...botForm, screenshots: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none h-20 text-xs" />
                        </div>
                         <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer" onClick={() => setBotForm({...botForm, isPremium: !botForm.isPremium})}>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${botForm.isPremium ? 'bg-blue-600 border-blue-600' : 'border-slate-600'}`}>
                                {botForm.isPremium && <X size={14} className="text-white" />}
                            </div>
                            <span className="text-sm font-bold text-slate-300">Premium Bot Olarak İşaretle</span>
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
