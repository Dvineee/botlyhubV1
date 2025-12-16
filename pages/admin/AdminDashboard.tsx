
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, DollarSign, Activity, LogOut, Terminal, Search, Trash2, Bot, Info } from 'lucide-react';
import { Logger } from '../../services/Logger';
import { SystemLog, AppStats, UserBot, Channel } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AppStats | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'users'>('overview');
  
  // Data State
  const [totalOwnedBots, setTotalOwnedBots] = useState(0);
  const [totalChannels, setTotalChannels] = useState(0);

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

    // Calculate dynamic stats from localStorage
    const ownedBots: UserBot[] = JSON.parse(localStorage.getItem('ownedBots') || '[]');
    const channels: Channel[] = JSON.parse(localStorage.getItem('userChannels') || '[]');
    
    setTotalOwnedBots(ownedBots.length);
    setTotalChannels(channels.length);

  }, [navigate]);

  // --- Live Simulation Effect ---
  // Dashboard açıkken gerçek zamanlı veri akışı simülasyonu yapar
  useEffect(() => {
      if (!stats) return;

      const interval = setInterval(() => {
          // %30 ihtimalle yeni görüntülenme ekle
          if (Math.random() > 0.7) {
              setStats(prev => {
                  if (!prev) return null;
                  const newStats = { 
                      ...prev, 
                      totalViews: prev.totalViews + Math.floor(Math.random() * 3) + 1 
                  };
                  Logger.saveStats(newStats); // Veriyi kaydet
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

  // Mock Graph Data based on views (Dynamic)
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

  if (!stats) return <div className="p-8 text-white">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-10 hidden md:flex">
            <div className="p-6 border-b border-slate-800">
                <h1 className="font-bold text-xl tracking-tight">BotlyHub Admin</h1>
                <p className="text-xs text-slate-500">v2.1.0 Stable</p>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                    <LayoutDashboard size={20} />
                    <span className="font-medium text-sm">Genel Bakış</span>
                </button>
                <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                    <Users size={20} />
                    <span className="font-medium text-sm">Kullanıcı Verileri</span>
                </button>
                <button onClick={() => setActiveTab('logs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'logs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                    <Terminal size={20} />
                    <span className="font-medium text-sm">Sistem Logları</span>
                </button>
            </nav>
            <div className="p-4 border-t border-slate-800">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Çıkış Yap</span>
                </button>
            </div>
        </div>

        {/* Mobile Header (visible only on small screens) */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 border-b border-slate-800 p-4 z-20 flex justify-between items-center">
             <span className="font-bold">Admin Panel</span>
             <button onClick={handleLogout}><LogOut size={20} /></button>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-64 p-8 pt-20 md:pt-8 overflow-y-auto">
            
            {activeTab === 'overview' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2 mb-6 bg-blue-900/20 border border-blue-900/50 p-3 rounded-lg">
                        <Info className="text-blue-400" size={20} />
                        <p className="text-sm text-blue-200">
                            <strong>Demo Modu:</strong> Şu anda görüntülenen veriler simülasyon amaçlıdır ve tarayıcınızda (Local Storage) saklanmaktadır.
                        </p>
                    </div>

                    <h2 className="text-2xl font-bold mb-6">Genel Durum</h2>
                    
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Activity size={64} /></div>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="p-3 bg-blue-500/20 text-blue-500 rounded-xl"><Activity size={24} /></div>
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded animate-pulse">CANLI</span>
                            </div>
                            <p className="text-slate-500 text-sm">Toplam Görüntülenme</p>
                            <h3 className="text-3xl font-bold mt-1 tabular-nums">{stats.totalViews}</h3>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                             <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-500/20 text-purple-500 rounded-xl"><Users size={24} /></div>
                            </div>
                            <p className="text-slate-500 text-sm">Kayıtlı Kullanıcı</p>
                            <h3 className="text-3xl font-bold mt-1">{stats.totalUsers}</h3>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                             <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-500/20 text-emerald-500 rounded-xl"><DollarSign size={24} /></div>
                            </div>
                            <p className="text-slate-500 text-sm">Toplam Hasılat</p>
                            <h3 className="text-3xl font-bold mt-1 tabular-nums">₺{stats.totalRevenue.toFixed(2)}</h3>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                             <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-orange-500/20 text-orange-500 rounded-xl"><Bot size={24} /></div>
                            </div>
                            <p className="text-slate-500 text-sm">Satılan Botlar</p>
                            <h3 className="text-3xl font-bold mt-1">{totalOwnedBots}</h3>
                        </div>
                    </div>

                    {/* Charts Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                            <h3 className="font-bold mb-6">Trafik Analizi (Son 7 Gün)</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={getGraphData()}>
                                        <defs>
                                            <linearGradient id="colorView" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                                        <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                                        <Tooltip 
                                            contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff'}}
                                            itemStyle={{color: '#3b82f6'}}
                                        />
                                        <Area type="monotone" dataKey="view" stroke="#3b82f6" fillOpacity={1} fill="url(#colorView)" animationDuration={1000} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                            <h3 className="font-bold mb-4">Hızlı İstatistikler</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                                    <span className="text-sm text-slate-400">Bağlı Kanallar</span>
                                    <span className="font-bold">{totalChannels}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                                    <span className="text-sm text-slate-400">Aktif Abonelikler</span>
                                    <span className="font-bold">12</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                                    <span className="text-sm text-slate-400">Bekleyen Ödemeler</span>
                                    <span className="font-bold text-orange-400">3</span>
                                </div>
                                <div className="mt-8 pt-4 border-t border-slate-800">
                                    <p className="text-xs text-slate-500 mb-2">Sunucu Durumu</p>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="w-[98%] h-full bg-emerald-500 rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-[10px] text-emerald-500">Online</span>
                                        <span className="text-[10px] text-slate-500">99.9% Uptime</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="animate-in fade-in">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Sistem Logları</h2>
                        <button onClick={clearLogs} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors">
                            <Trash2 size={16} /> Temizle
                        </button>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-950 border-b border-slate-800 text-xs text-slate-400 uppercase">
                                        <th className="p-4 font-semibold">Tarih</th>
                                        <th className="p-4 font-semibold">Tip</th>
                                        <th className="p-4 font-semibold">Mesaj</th>
                                        <th className="p-4 font-semibold">Detay</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-slate-300">
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-500">Log kaydı bulunamadı.</td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4 font-mono text-xs text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                                <td className="p-4">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                                        log.type === 'ERROR' ? 'bg-red-500/10 text-red-400' :
                                                        log.type === 'WARNING' ? 'bg-yellow-500/10 text-yellow-400' :
                                                        log.type === 'TRANSACTION' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        'bg-blue-500/10 text-blue-400'
                                                    }`}>
                                                        {log.type}
                                                    </span>
                                                </td>
                                                <td className="p-4">{log.message}</td>
                                                <td className="p-4 text-xs font-mono text-slate-500 max-w-xs truncate">{JSON.stringify(log.details) || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                 <div className="animate-in fade-in">
                    <h2 className="text-2xl font-bold mb-6">Kullanıcı Verileri (Local Storage)</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Bot size={20} className="text-blue-500" />
                                Satın Alınan Botlar ({totalOwnedBots})
                            </h3>
                             {totalOwnedBots === 0 ? (
                                <p className="text-slate-500 text-sm">Henüz bot satışı yok.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {JSON.parse(localStorage.getItem('ownedBots') || '[]').map((b: any, i: number) => (
                                        <li key={i} className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                                            <img src={b.icon} className="w-8 h-8 rounded bg-slate-800" />
                                            <div>
                                                <p className="font-bold text-sm">{b.name}</p>
                                                <p className="text-xs text-slate-500">{b.category}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <LayoutDashboard size={20} className="text-purple-500" />
                                Bağlı Kanallar ({totalChannels})
                            </h3>
                             {totalChannels === 0 ? (
                                <p className="text-slate-500 text-sm">Henüz kanal bağlantısı yok.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {JSON.parse(localStorage.getItem('userChannels') || '[]').map((c: any, i: number) => (
                                        <li key={i} className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">{c.name[0]}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">{c.name}</p>
                                                <p className="text-xs text-slate-500">{c.memberCount} Üye</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};

export default AdminDashboard;
