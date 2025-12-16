import React, { useEffect, useState } from 'react';
import { ChevronLeft, User, CreditCard, Bell, Globe, ChevronRight, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { subscriptionPlans } from '../data';
import { useTelegram } from '../hooks/useTelegram';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const [currentPlanName, setCurrentPlanName] = useState('Başlangıç');

  useEffect(() => {
      const planId = localStorage.getItem('userPlan');
      if (planId) {
          const plan = subscriptionPlans.find(p => p.id === planId);
          if (plan) setCurrentPlanName(plan.name);
      }
  }, []);

  // Kullanıcı adı veya isim yoksa varsayılan değerler
  const displayName = user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Misafir Kullanıcı';
  const displayUsername = user?.username ? `@${user.username}` : (user?.id ? `ID: ${user.id}` : '@misafir');
  
  // Profil fotoğrafı yoksa baş harflerden avatar oluşturma (Placeholder API)
  const avatarUrl = user?.photo_url 
    ? user.photo_url 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=334155&color=fff&size=200`;

  const MenuItem = ({ icon: Icon, label, value, hasArrow = true, onClick }: { icon: any, label: string, value?: string, hasArrow?: boolean, onClick?: () => void }) => (
    <div 
        onClick={onClick}
        className="flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer group first:rounded-t-2xl last:rounded-b-2xl border-b border-slate-800 last:border-0"
    >
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center transition-colors">
                <Icon size={20} className="text-white" />
            </div>
            <span className="font-medium text-sm text-white">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {value && <span className="text-slate-500 text-sm">{value}</span>}
            {hasArrow && <ChevronRight size={18} className="text-slate-600" />}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 pt-8 pb-24 bg-slate-950 transition-colors">
         <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-900 rounded-full text-white transition-colors">
                <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white">Profil Ayarları</h1>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm">
             <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-slate-800">
                 <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
             </div>
             <div>
                 <h2 className="font-bold text-lg text-white">{displayName}</h2>
                 <p className="text-slate-500 text-sm">{displayUsername}</p>
                 <div className="mt-2 inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs font-bold border border-blue-500/20">
                    <Crown size={12} />
                    <span>{currentPlanName}</span>
                 </div>
             </div>
        </div>

        <h3 className="text-sm font-bold text-slate-500 mb-3 px-2">Hesap</h3>
        <div className="mb-6 rounded-2xl border border-slate-800 shadow-sm">
            <MenuItem 
                icon={User} 
                label="Hesap Bilgileri" 
                onClick={() => navigate('/account-settings')}
            />
            <MenuItem 
                icon={CreditCard} 
                label="Abonelik Yönetimi" 
                value={currentPlanName} 
                onClick={() => navigate('/premium')}
            />
        </div>

        <h3 className="text-sm font-bold text-slate-500 mb-3 px-2">Uygulama Ayarları</h3>
        <div className="mb-6 rounded-2xl border border-slate-800 shadow-sm">
            <MenuItem 
                icon={Bell} 
                label="Bildirimler" 
                onClick={() => navigate('/notifications')}
            />
            <MenuItem icon={Globe} label="Dil Seçimi" value="Türkçe" />
        </div>
    </div>
  );
};

export default ProfileSettings;