
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingBag, TrendingUp, Bot, Send, Activity, Trash2, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserBot, Channel } from '../types';

const MyBots = () => {
  const navigate = useNavigate();
  const [bots, setBots] = useState<UserBot[]>([]);
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);
  
  // Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [botToDelete, setBotToDelete] = useState<UserBot | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);

  useEffect(() => {
    const ownedBots = JSON.parse(localStorage.getItem('ownedBots') || '[]');
    setBots(ownedBots);
  }, []);

  const toggleAdRevenue = (botId: string) => {
      const updatedBots = bots.map(bot => 
        bot.id === botId ? { ...bot, isAdEnabled: !bot.isAdEnabled } : bot
      );
      setBots(updatedBots);
      localStorage.setItem('ownedBots', JSON.stringify(updatedBots));
  };

  const toggleActiveStatus = (botId: string) => {
    const updatedBots = bots.map(bot => 
        bot.id === botId ? { ...bot, isActive: !bot.isActive } : bot
    );
    setBots(updatedBots);
    localStorage.setItem('ownedBots', JSON.stringify(updatedBots));
  };

  // --- Remove Logic ---
  
  const checkBotUsage = (botId: string) => {
      const channels: Channel[] = JSON.parse(localStorage.getItem('userChannels') || '[]');
      const usedInChannels = channels.filter(ch => ch.connectedBotIds.includes(botId));
      
      if (usedInChannels.length > 0) {
          const names = usedInChannels.map(c => c.name).join(', ');
          return `Hâlen şu kanallarda kullanımda: ${names}`;
      }
      return null;
  };

  const handleDeleteClick = (bot: UserBot) => {
      setBotToDelete(bot);
      const usageWarning = checkBotUsage(bot.id);
      setDeleteWarning(usageWarning);
      setShowDeleteModal(true);
  };

  const confirmDelete = () => {
      if (!botToDelete) return;

      // 1. Remove from bots list
      const updatedBots = bots.filter(b => b.id !== botToDelete.id);
      setBots(updatedBots);
      localStorage.setItem('ownedBots', JSON.stringify(updatedBots));

      // 2. Remove from channels connected lists
      const channels: Channel[] = JSON.parse(localStorage.getItem('userChannels') || '[]');
      const updatedChannels = channels.map(ch => ({
          ...ch,
          connectedBotIds: ch.connectedBotIds.filter(id => id !== botToDelete.id)
      }));
      localStorage.setItem('userChannels', JSON.stringify(updatedChannels));

      // 3. Cleanup
      setShowDeleteModal(false);
      setBotToDelete(null);
      setOpenSettingsId(null);
      
      // Optional: Toast
      alert("Bot başarıyla kaldırıldı.");
  };

  return (
    <div 
        className="min-h-screen bg-slate-950 p-4 pt-8"
        onClick={() => setOpenSettingsId(null)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <button onClick={(e) => { e.stopPropagation(); navigate('/'); }} className="p-2 hover:bg-slate-900 rounded-full transition-colors group">
                <ChevronLeft className="w-6 h-6 text-slate-400 group-hover:text-white" />
            </button>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Botlarım</h1>
        </div>
        <button 
            onClick={(e) => { e.stopPropagation(); navigate('/'); }}
            className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-900/30 flex items-center gap-2 px-4 active:scale-95"
        >
            <ShoppingBag size={18} className="text-white" />
            <span className="text-xs font-bold text-white">Yeni Bot Bul</span>
        </button>
      </div>

      {/* Bot List */}
      <div className="space-y-4">
        {bots.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-slate-900/30 rounded-3xl border border-slate-800/50 border-dashed">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <Bot size={40} className="opacity-40" />
                </div>
                <p className="font-medium text-slate-300">Henüz bir botunuz yok.</p>
                <p className="text-xs text-slate-600 mt-2 text-center max-w-[200px]">Marketten bot ekleyerek kazanmaya başlayın.</p>
                <button onClick={(e) => { e.stopPropagation(); navigate('/'); }} className="mt-6 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors border border-slate-700">Market'e Git</button>
            </div>
        ) : (
            bots.map((bot) => (
                <div key={bot.id} className="group relative bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden h-[140px] transition-all hover:border-slate-700">
                    
                    {/* Main Card Content */}
                    <div className="p-2 flex items-center h-full pr-14 relative z-10">
                         <div className="relative flex-shrink-0">
                             <img src={bot.icon} alt={bot.name} className="w-24 h-24 rounded-2xl object-cover bg-slate-800 border border-slate-700" />
                         </div>

                         <div className="ml-4 flex-1 min-w-0 flex flex-col justify-center h-full py-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 
                                        onClick={(e) => { e.stopPropagation(); navigate(`/bot/${bot.id}`); }}
                                        className="font-bold text-lg text-white truncate cursor-pointer hover:text-blue-400 transition-colors"
                                    >
                                        {bot.name}
                                    </h3>
                                </div>
                                
                                {/* Status Indicator */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`w-2 h-2 rounded-full ${bot.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-500'}`}></div>
                                    <span className={`text-xs font-medium ${bot.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {bot.isActive ? 'Sistem Aktif' : 'Devre Dışı'}
                                    </span>
                                </div>

                                <button 
                                    onClick={(e) => { e.stopPropagation(); alert("Telegram yönlendirmesi simüle ediliyor..."); }}
                                    className="inline-flex items-center gap-2 self-start px-3 py-2 bg-slate-800 hover:bg-slate-750 rounded-lg text-blue-400 text-xs font-bold border border-slate-700/50 hover:border-slate-600 transition-colors"
                                >
                                    <Send size={12} />
                                    <span>Telegram'a Ekle</span>
                                </button>
                         </div>
                    </div>

                    {/* Right Settings Trigger Strip */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); setOpenSettingsId(bot.id); }}
                        className="absolute right-0 top-0 bottom-0 w-8 bg-slate-800 hover:bg-slate-750 border-l border-slate-700 flex flex-col items-center justify-center transition-all cursor-pointer z-20 group/btn"
                    >
                        <span className="text-[10px] font-bold text-slate-500 group-hover/btn:text-slate-300 -rotate-90 whitespace-nowrap tracking-wide">AYARLAR</span>
                    </button>

                    {/* Drawer */}
                    <div 
                        className={`absolute inset-0 z-30 transition-transform duration-300 ease-out flex items-center justify-center p-2 ${
                            openSettingsId === bot.id ? 'translate-x-0' : 'translate-x-full'
                        }`}
                    >
                        {/* Backdrop */}
                         <div className="absolute inset-0 bg-slate-900/95"></div>

                         {/* Drawer Content - 2x2 Grid */}
                         <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-2 relative z-40 content-center justify-center">
                                {/* Ad Revenue Card */}
                                <div 
                                    onClick={(e) => { e.stopPropagation(); toggleAdRevenue(bot.id); }}
                                    className={`cursor-pointer rounded-xl px-2 h-full max-h-[60px] flex items-center gap-2 border transition-all active:scale-95 ${
                                        bot.isAdEnabled 
                                        ? 'bg-emerald-500/10 border-emerald-500/50' 
                                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                                    }`}
                                >
                                    <TrendingUp size={20} className={bot.isAdEnabled ? 'text-emerald-400' : 'text-slate-500'} />
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className={`text-xs font-bold truncate ${bot.isAdEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>Gelir Modu</span>
                                        <span className="text-[10px] text-slate-600">{bot.isAdEnabled ? 'Açık' : 'Kapalı'}</span>
                                    </div>
                                </div>

                                {/* Status Card */}
                                <div 
                                    onClick={(e) => { e.stopPropagation(); toggleActiveStatus(bot.id); }}
                                    className={`cursor-pointer rounded-xl px-2 h-full max-h-[60px] flex items-center gap-2 border transition-all active:scale-95 ${
                                        bot.isActive 
                                        ? 'bg-blue-500/10 border-blue-500/50' 
                                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                                    }`}
                                >
                                    <Activity size={20} className={bot.isActive ? 'text-blue-400' : 'text-slate-500'} />
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className={`text-xs font-bold truncate ${bot.isActive ? 'text-blue-400' : 'text-slate-400'}`}>Bot Durumu</span>
                                        <span className="text-[10px] text-slate-600">{bot.isActive ? 'Aktif' : 'Pasif'}</span>
                                    </div>
                                </div>
                                
                                {/* 3rd Slot: Placeholder / Empty */}
                                <div className="hidden"></div>

                                {/* 4th Slot: Remove Button (Red) */}
                                <div 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(bot); }}
                                    className="cursor-pointer rounded-xl px-2 h-full max-h-[60px] flex items-center justify-center gap-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all active:scale-95 col-start-2 row-start-2"
                                >
                                    <Trash2 size={18} className="text-red-500" />
                                    <span className="text-xs font-bold text-red-500">Kaldır</span>
                                </div>
                         </div>
                    </div>
                </div>
            ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && botToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 animate-in fade-in" onClick={() => setShowDeleteModal(false)}>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm text-center shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                  
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                      <AlertTriangle size={32} className="text-red-500" />
                  </div>
                  
                  <h3 className="font-bold text-white text-lg mb-2">Botu Kaldır</h3>
                  
                  {deleteWarning ? (
                      <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl mb-6">
                          <p className="text-orange-400 text-xs leading-relaxed font-medium">
                              {deleteWarning}
                          </p>
                          <p className="text-slate-400 text-[10px] mt-2">
                              Kaldırırsanız bu kanallarda çalışmayı durduracak.
                          </p>
                      </div>
                  ) : (
                      <p className="text-slate-400 text-sm mb-6">
                          Bu botu kütüphanenizden kaldırmak istediğinize emin misiniz?
                      </p>
                  )}

                  <div className="flex gap-3">
                      <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl text-slate-400 font-bold text-sm hover:bg-slate-800 transition-colors">
                          Vazgeç
                      </button>
                      <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors shadow-lg shadow-red-900/20">
                          Evet, Kaldır
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default MyBots;
