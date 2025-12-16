
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User } from 'lucide-react';
import { Logger } from '../../services/Logger';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        Logger.log('WARNING', 'Admin girişi yapıldı.');
        navigate('/admin/dashboard');
    } else {
        setError('Geçersiz kullanıcı adı veya şifre');
        Logger.log('WARNING', `Başarısız admin giriş denemesi: ${username}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-sm shadow-2xl">
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-500 mb-4">
                    <ShieldCheck size={32} />
                </div>
                <h1 className="text-2xl font-bold text-white">Yönetici Girişi</h1>
                <p className="text-slate-500 text-sm mt-1">BotlyHub V2 Dashboard</p>
            </div>

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
                        />
                    </div>
                </div>
                
                {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-900/20">
                    Giriş Yap
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
