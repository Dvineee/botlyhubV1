
import React, { useState } from 'react';
import { ChevronLeft, Bell, ShieldCheck, Wallet, Info, CheckCheck, Trash2, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockNotifications } from '../data';
import { Notification } from '../types';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
  };

  const clearAll = () => {
    if (window.confirm("Tüm bildirimleri silmek istediğinize emin misiniz?")) {
        setNotifications([]);
    }
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleRead = (id: string) => {
      setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, isRead: !n.isRead } : n
      ));
  };

  // Helper to get icon by type
  const getIcon = (type: Notification['type']) => {
      switch (type) {
          case 'payment': return <Wallet className="text-emerald-400" size={20} />;
          case 'security': return <ShieldCheck className="text-red-400" size={20} />;
          case 'bot': return <Bot className="text-blue-400" size={20} />;
          case 'system': 
          default: return <Info className="text-slate-400" size={20} />;
      }
  };

  // Helper to format date
  const formatTime = (isoString: string) => {
      const date = new Date(isoString);
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  // Group notifications
  const groupedNotifications = notifications.reduce((acc, note) => {
      const date = new Date(note.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key = 'Daha Önce';
      if (date.toDateString() === today.toDateString()) {
          key = 'Bugün';
      } else if (date.toDateString() === yesterday.toDateString()) {
          key = 'Dün';
      }

      if (!acc[key]) acc[key] = [];
      acc[key].push(note);
      return acc;
  }, {} as Record<string, Notification[]>);

  // Sort groups order
  const groupOrder = ['Bugün', 'Dün', 'Daha Önce'];

  return (
    <div className="min-h-screen bg-slate-950 p-4 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/settings')} className="p-2 hover:bg-slate-900 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Bildirimler</h1>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={markAllAsRead} 
                className="p-2 hover:bg-slate-900 rounded-full text-blue-400 transition-colors"
                title="Tümünü Okundu İşaretle"
            >
                <CheckCheck size={20} />
            </button>
            <button 
                onClick={clearAll} 
                className="p-2 hover:bg-slate-900 rounded-full text-slate-500 hover:text-red-400 transition-colors"
                title="Tümünü Sil"
            >
                <Trash2 size={20} />
            </button>
        </div>
      </div>

      {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                  <Bell size={32} className="opacity-20" />
              </div>
              <p>Hiç bildiriminiz yok.</p>
          </div>
      ) : (
          <div className="space-y-6">
              {groupOrder.map(group => {
                  const groupItems = groupedNotifications[group];
                  if (!groupItems || groupItems.length === 0) return null;

                  return (
                      <div key={group}>
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">{group}</h3>
                          <div className="space-y-3">
                              {groupItems.map(note => (
                                  <div 
                                      key={note.id} 
                                      onClick={() => toggleRead(note.id)}
                                      className={`relative p-4 rounded-2xl border transition-all cursor-pointer group flex gap-4 ${
                                          note.isRead 
                                          ? 'bg-slate-950 border-slate-800/50 opacity-70 hover:opacity-100' 
                                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                      }`}
                                  >
                                      {/* Unread Indicator */}
                                      {!note.isRead && (
                                          <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                                      )}

                                      {/* Icon */}
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-800 ${
                                          note.isRead ? 'bg-slate-900' : 'bg-slate-800'
                                      }`}>
                                          {getIcon(note.type)}
                                      </div>

                                      {/* Content */}
                                      <div className="flex-1 min-w-0 pr-6">
                                          <div className="flex justify-between items-start mb-1">
                                              <h4 className={`text-sm font-semibold truncate ${note.isRead ? 'text-slate-400' : 'text-white'}`}>
                                                  {note.title}
                                              </h4>
                                              <span className="text-[10px] text-slate-600 whitespace-nowrap ml-2">
                                                  {formatTime(note.date)}
                                              </span>
                                          </div>
                                          <p className={`text-xs leading-relaxed ${note.isRead ? 'text-slate-600' : 'text-slate-400'}`}>
                                              {note.message}
                                          </p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  );
              })}
          </div>
      )}
    </div>
  );
};

export default Notifications;
