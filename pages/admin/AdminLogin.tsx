
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, Loader2, Smartphone } from 'lucide-react';
import { AuthService } from '../../services/AuthService';
import { useTelegram } from '../../hooks/useTelegram';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoChecking, setIsAutoChecking] = useState(true);

  // Sayfa yüklendiğinde otomatik Telegram ID kontrolü yap
  useEffect(() => {
    const checkTelegramAuth = async () => {
        if (user) {
            const success = await AuthService.loginWithTelegram();
            if (success) {
                navigate('/admin/dashboard');
            } else {
                setIsAutoChecking(false); // Admin değilse login formunu göster
            }
        } else {
            setIsAutoChecking(false);
        }
    };
    
    checkTelegramAuth();
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const success = await AuthService.login(username, password);
        if (success) {
            navigate('/admin/dashboard');
        } else {
            setError('Geçersiz kullanıcı adı veya şifre');
        }
    } catch (err) {
        setError('Bir hata oluştu.');
    } finally {
        setIsLoading(false);
    }
  };

  if (isAutoChecking) {
      return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p className="text-slate-400 text-sm animate-pulse">Telegram Kimliği Doğrulanıyor...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-500 mb-4 border border-blue-500/30">
                    <ShieldCheck size={32} />
                </div>
                <h1 className="text-2xl font-bold text-white">Yönetici Girişi</h1>
                <p className="text-slate-500 text-sm mt-1">BotlyHub Secure Panel</p>
            </div>

            {/* Telegram User Info (If detected but not admin) */}
            {user && (
                 <div className="mb-6 bg-slate-950/50 p-3 rounded-xl border border-red-900/30 flex items-center gap-3">
                     <div className="p-2 bg-slate-900 rounded-full"><Smartphone size={16} className="text-slate-500" /></div>
                     <div>
                         <p className="text-xs text-slate-400">Algılanan ID: <span className="text-slate-200 font-mono">{user.id}</span></p>
                         <p className="text-[10px] text-red-400">Bu hesap Admin yetkisine sahip değil.</p>
                     </div>
                 </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Kullanıcı Adı"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Şifre"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            disabled={isLoading}
                        />
                    </div>
                </div>
                
                {error && <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg"><p className="text-red-500 text-xs font-bold text-center">{error}</p></div>}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Giriş Yap'}
                </button>
            </form>
            
            <button onClick={() => navigate('/')} className="w-full text-slate-500 text-xs mt-6 hover:text-white transition-colors">
                ← Uygulamaya Dön
            </button>
        </div>
    </div>
  );
};

export default AdminLogin;
