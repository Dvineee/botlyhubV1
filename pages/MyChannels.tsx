
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Megaphone, Users, Info, X, Link as LinkIcon, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Channel, UserBot } from '../types';
import { Logger } from '../services/Logger';

const MyChannels = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [bots, setBots] = useState<UserBot[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [channelLink, setChannelLink] = useState('');
  const [channelName, setChannelName] = useState('');

  useEffect(() => {
    const ownedBots = JSON.parse(localStorage.getItem('ownedBots') || '[]');
    const userChannels = JSON.parse(localStorage.getItem('userChannels') || '[]');
    setBots(ownedBots);
    setChannels(userChannels);
  }, []);

  const handleAddChannel = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!channelLink.includes('t.me/')) {
          alert("Lütfen geçerli bir Telegram linki girin (t.me/kanaladi).");
          return;
      }
      
      // Strict check removed, allowing adding channel even if no bot is selected initially
      // but warning shown if no bots owned.
      
      const newChannel: Channel = {
          id: Math.random().toString(36).substr(2, 9),
          name: channelName || channelLink.split('t.me/')[1],
          memberCount: 0, // Will be updated by bot later in real scenario
          icon: `https://ui-avatars.com/api/?name=${encodeURIComponent(channelName)}&background=1e293b&color=fff`,
          isAdEnabled: true,
          connectedBotIds: bots.length > 0 ? [bots[0].id] : [],
          revenue: 0,
          link: channelLink
      };

      const updatedChannels = [...channels, newChannel];
      setChannels(updatedChannels);
      localStorage.setItem('userChannels', JSON.stringify(updatedChannels));
      
      // Log Action
      Logger.log('USER_ACTION', `Yeni kanal eklendi: ${newChannel.name}`);
      
      setChannelLink('');
      setChannelName('');
      setShowAddModal(false);
  };

  const toggleChannelAdGlobal = (channelId: string) => {
      const updatedChannels = channels.map(ch => 
          ch.id === channelId ? { ...ch, isAdEnabled: !ch.isAdEnabled } : ch
      );
      setChannels(updatedChannels);
      localStorage.setItem('userChannels', JSON.stringify(updatedChannels));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 pt-8 pb-20 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-900 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6 text-slate-200" />
            </button>
            <h1 className="text-xl font-bold text-white">Kanallarım</h1>
        </div>
        <button 
            onClick={() => setShowInfo(true)}
            className="p-2 hover:bg-slate-800 rounded-full text-blue-400 transition-colors"
        >
            <Info size={22} />
        </button>
      </div>

      {/* Info Modal */}
      {showInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowInfo(false)}></div>
              <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-800 p-6 relative z-10 animate-in zoom-in-95">
                  <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Megaphone size={20} className="text-blue-500" />
                      Nasıl Çalışır?
                  </h3>
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                      1. Botunuzu kanalınıza <span className="text-white font-bold">Yönetici</span> olarak ekleyin.<br/>
                      2. Kanal linkini buraya ekleyin.<br/>
                      3. Sistem otomatik olarak doğrulama yapacaktır.
                  </p>
                  <button onClick={() => setShowInfo(false)} className="w-full mt-4 bg-slate-800 text-white py-3 rounded-xl font-bold text-sm">Anlaşıldı</button>
              </div>
          </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
              <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-800 p-6 relative z-10 animate-in zoom-in-95 shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-4">Kanal Ekle</h3>
                  <form onSubmit={handleAddChannel}>
                      <div className="space-y-4 mb-6">
                        <div>
                            <label className="text-xs font-bold text-slate-400 block mb-1">Kanal Adı</label>
                            <input 
                                type="text"
                                required
                                value={channelName}
                                onChange={e => setChannelName(e.target.value)}
                                placeholder="Örn: Haber Kanalım"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 block mb-1">Kanal Linki</label>
                            <input 
                                type="text"
                                required
                                value={channelLink}
                                onChange={e => setChannelLink(e.target.value)}
                                placeholder="https://t.me/kanaladi"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-800 text-slate-400 py-3 rounded-xl font-bold text-sm">İptal</button>
                        <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-500">Ekle</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Channel List */}
      <div className="space-y-4">
        {channels.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800/50 border-dashed">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Megaphone size={32} className="opacity-40" />
                </div>
                <p className="font-medium text-slate-300">Henüz bağlı bir kanalınız yok.</p>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="mt-6 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/30 flex items-center gap-2"
                >
                    <Plus size={16} />
                    Manuel Ekle
                </button>
            </div>
        ) : (
            <>
                <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-xs font-bold text-slate-500">{channels.length} Kanal Bağlı</span>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                        <Plus size={14} /> 
                        Yeni Ekle
                    </button>
                </div>
                {channels.map((channel) => {
                    const channelBots = bots.filter(b => channel.connectedBotIds.includes(b.id));

                    return (
                        <div key={channel.id} className="bg-slate-900 rounded-2xl p-4 border border-slate-800 relative overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <img src={channel.icon} alt={channel.name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-800 bg-slate-800" />
                                    <div>
                                        <h3 className="font-bold text-lg text-white max-w-[150px] truncate">{channel.name}</h3>
                                        {channel.link && <p className="text-[10px] text-blue-400 truncate max-w-[150px]">{channel.link}</p>}
                                        <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                                            <Users size={12} />
                                            <span>{channel.memberCount > 0 ? channel.memberCount : 'Doğrulanıyor...'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Top. Gelir</p>
                                    <p className="text-lg font-bold text-emerald-400">₺{channel.revenue}</p>
                                </div>
                            </div>

                            <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50 flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${channel.isAdEnabled ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-800 text-slate-500'}`}>
                                        <Megaphone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-200">Reklam İzni</p>
                                    </div>
                                </div>
                                <div 
                                    onClick={() => toggleChannelAdGlobal(channel.id)}
                                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors flex-shrink-0 ${channel.isAdEnabled ? 'bg-orange-600' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${channel.isAdEnabled ? 'left-6' : 'left-1'}`}></div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Bağlı Botlar</p>
                                <div className="space-y-2">
                                    {channelBots.map(bot => (
                                        <div 
                                            key={bot.id} 
                                            onClick={() => navigate(`/bot/${bot.id}`)}
                                            className="flex items-center justify-between p-2 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img src={bot.icon} className="w-8 h-8 rounded-lg opacity-80" alt={bot.name} />
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400">{bot.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 bg-slate-800 text-slate-400 text-[9px] font-bold px-2 py-1 rounded">
                                                <span>{bot.isAdEnabled ? 'Aktif' : 'Pasif'}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {channelBots.length === 0 && (
                                        <div className="text-center py-2 border border-dashed border-slate-800 rounded-lg">
                                            <p className="text-[10px] text-slate-500">Bu kanal için atanmış bot yok.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </>
        )}
      </div>
    </div>
  );
};

export default MyChannels;
