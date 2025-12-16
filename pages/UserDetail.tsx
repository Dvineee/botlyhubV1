
import React, { useState } from 'react';
import { ChevronLeft, Bell, Bot, BarChart2, ShieldAlert, Ban, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const UserDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock initial state
  const [restrictions, setRestrictions] = useState({
    restrictPlatform: false,
    restrictAds: true,
    modBot: true,
    analysisBot: false
  });

  const toggle = (key: keyof typeof restrictions) => {
    setRestrictions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 bg-slate-950 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Kullanıcı Detayları</h1>
        <button className="p-2 hover:bg-slate-800 rounded-full">
            <X className="w-6 h-6 text-slate-500" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center mt-4 mb-8">
        <div className="relative">
             <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-cyan-400">
                <img 
                    src={`https://picsum.photos/seed/${id || 'user'}/300`} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover border-4 border-slate-950" 
                />
             </div>
        </div>
        <h2 className="text-xl font-bold mt-3">Cem Yılmaz</h2>
        <p className="text-slate-400 text-sm">@cemyilmaz</p>
        <p className="text-slate-500 text-xs mt-1">ID: 12345678 | Üyelik: 24.05.2023</p>
      </div>

      {/* Main Settings Section */}
      <div className="px-4 space-y-6 pb-8">
        
        {/* Admin Controls */}
        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                        <Ban size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">Kullanıcıyı Kısıtla</h3>
                        <p className="text-xs text-slate-500">Platform genelindeki erişimini kısıtlar.</p>
                    </div>
                </div>
                <div 
                    onClick={() => toggle('restrictPlatform')}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${restrictions.restrictPlatform ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${restrictions.restrictPlatform ? 'left-6' : 'left-1'}`}></div>
                </div>
            </div>

            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">Reklam Yayınını Kısıtla</h3>
                        <p className="text-xs text-slate-500">Reklam yayınlama yetkisini kaldırır.</p>
                    </div>
                </div>
                <div 
                    onClick={() => toggle('restrictAds')}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${restrictions.restrictAds ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${restrictions.restrictAds ? 'left-6' : 'left-1'}`}></div>
                </div>
            </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2">
            <Bell size={18} />
            <span>Kullanıcıya Bildirim Gönder</span>
        </button>

        {/* Tab Switcher */}
        <div className="bg-slate-900 p-1 rounded-xl flex border border-slate-800">
            <button className="flex-1 py-2 text-sm font-medium bg-slate-800 rounded-lg text-white shadow-sm">Kullandığı Botlar</button>
            <button className="flex-1 py-2 text-sm font-medium text-slate-400 hover:text-slate-200">Kanallar</button>
        </div>

        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Bot Listesi</h3>

        {/* Bot List with Toggles */}
        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">Moderasyon Botu</h3>
                        <p className="text-xs text-slate-500">@modbot</p>
                    </div>
                </div>
                <div 
                    onClick={() => toggle('modBot')}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${restrictions.modBot ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${restrictions.modBot ? 'left-6' : 'left-1'}`}></div>
                </div>
            </div>

            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                        <BarChart2 size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">Analiz Botu</h3>
                        <p className="text-xs text-slate-500">@analysisbot</p>
                    </div>
                </div>
                <div 
                    onClick={() => toggle('analysisBot')}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${restrictions.analysisBot ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${restrictions.analysisBot ? 'left-6' : 'left-1'}`}></div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default UserDetail;
