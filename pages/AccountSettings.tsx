
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Mail, Phone, Save, Trash2, Smartphone, RefreshCw, ShieldCheck, BadgeCheck, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    telegramId: '',
    language: 'tr',
    email: '',
    phone: ''
  });

  // Telegram verilerini form'a yükle
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: `${user.first_name} ${user.last_name || ''}`.trim(),
        username: user.username || '',
        telegramId: user.id.toString(),
        language: user.language_code || 'tr',
      }));
    } else {
        // Fallback for browser testing
        setFormData(prev => ({
            ...prev,
            fullName: 'Misafir Kullanıcı',
            username: 'misafir',
            telegramId: '000000',
        }));
    }
  }, [user]);

  const avatarUrl = user?.photo_url 
    ? user.photo_url 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'User')}&background=3b82f6&color=fff&size=200`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsLoading(true);
    // Simulate API Call
    setTimeout(() => {
      setIsLoading(false);
      alert('İletişim tercihleri güncellendi.');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 pt-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/settings')} className="p-2 hover:bg-slate-900 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Hesap Bilgileri</h1>
      </div>

      {/* Telegram Identity Card */}
      <div className="bg-gradient-to-br from-blue-900/40 to-slate-900 rounded-2xl p-6 border border-blue-500/30 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
              <BadgeCheck size={100} className="text-white" />
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
              <div className="w-20 h-20 rounded-full p-1 bg-blue-500/20 border-2 border-blue-500 overflow-hidden bg-slate-800">
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {formData.fullName}
                      <BadgeCheck size={18} className="text-blue-400" />
                  </h2>
                  <p className="text-blue-200 text-sm font-medium">@{formData.username || 'username_yok'}</p>
                  <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                      <Smartphone size={10} /> Telegram ID: {formData.telegramId}
                  </p>
              </div>
          </div>
          
          <div className="mt-6 flex gap-2">
              <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                  <RefreshCw size={14} /> Bilgileri Senkronize Et
              </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 text-center">
              * Profil fotoğrafı ve isim Telegram hesabınızdan alınmaktadır.
          </p>
      </div>

      <h3 className="text-sm font-bold text-slate-400 mb-4 px-1 uppercase tracking-wider">İletişim Tercihleri</h3>

      {/* Optional Contact Fields */}
      <div className="space-y-4">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                  <Mail size={18} className="text-slate-500" />
                  <label className="text-xs font-bold text-slate-300">İletişim E-postası (Opsiyonel)</label>
              </div>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@eposta.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500 text-sm placeholder-slate-600 transition-colors"
              />
              <p className="text-[10px] text-slate-600 mt-2">Faturalar ve önemli bildirimler için kullanılır.</p>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                  <Phone size={18} className="text-slate-500" />
                  <label className="text-xs font-bold text-slate-300">İletişim Telefonu (Opsiyonel)</label>
              </div>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+90 5XX XXX XX XX"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500 text-sm placeholder-slate-600 transition-colors"
              />
          </div>
      </div>

      {/* Save Button */}
      <button 
        onClick={handleSave}
        disabled={isLoading}
        className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
            <>
                <Save size={20} />
                <span>Tercihleri Kaydet</span>
            </>
        )}
      </button>

      {/* Security Info */}
      <div className="mt-8 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex gap-3">
          <ShieldCheck className="text-emerald-500 flex-shrink-0" size={24} />
          <div>
              <h4 className="text-emerald-400 font-bold text-sm">Hesabınız Güvende</h4>
              <p className="text-[10px] text-emerald-500/70 mt-1 leading-relaxed">
                  Bu uygulama Telegram güvenli giriş (SSO) altyapısını kullanır. Şifreniz asla tarafımızca saklanmaz.
              </p>
          </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-12 pt-8 border-t border-slate-900 space-y-4">
          <button className="w-full py-3 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500/10 transition-colors text-sm font-bold flex items-center justify-center gap-2 opacity-60 hover:opacity-100">
              <Trash2 size={16} />
              <span>Uygulama Verilerini Temizle</span>
          </button>

          {/* Admin Shortcut */}
          <button 
              onClick={() => navigate('/admin/login')}
              className="w-full py-3 border border-slate-800 text-slate-500 rounded-xl hover:bg-slate-900 transition-colors text-sm font-bold flex items-center justify-center gap-2 hover:text-white"
          >
              <LayoutDashboard size={16} />
              <span>Yönetici Paneli (Demo)</span>
          </button>
      </div>
    </div>
  );
};

export default AccountSettings;
