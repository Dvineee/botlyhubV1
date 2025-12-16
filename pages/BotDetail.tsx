
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Share2, Bookmark, Send, ImageOff, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserBot, ExtendedBot } from '../types';
import { useTelegram } from '../hooks/useTelegram';
import { MarketplaceService } from '../services/MarketplaceService';

const BotDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { haptic, openLink, notification } = useTelegram();
  const [isOwned, setIsOwned] = useState(false);
  const [bot, setBot] = useState<ExtendedBot | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch bot data asynchronously
  useEffect(() => {
    const fetchBotData = async () => {
        setIsLoading(true);
        if (id) {
            try {
                const fetchedBot = await MarketplaceService.getBotById(id);
                setBot(fetchedBot);

                // Check ownership (Currently relying on local copy of owned items, ideally should be from backend too)
                // For simplicity in migration, we keep checking local storage for ownership or fetch user profile
                const ownedBots = JSON.parse(localStorage.getItem('ownedBots') || '[]');
                const owned = ownedBots.find((b: UserBot) => b.id === id);
                if (owned) setIsOwned(true);
            } catch (error) {
                console.error("Bot detail fetch error:", error);
            }
        }
        setIsLoading(false);
    };

    fetchBotData();
  }, [id]);

  if (isLoading) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
      );
  }

  if (!bot) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500">
            <p>Bot bulunamadı veya silinmiş.</p>
            <button onClick={() => navigate('/')} className="mt-4 text-blue-500 underline">Geri Dön</button>
        </div>
      );
  }

  const handleAction = () => {
      // Trigger Haptic Feedback
      haptic('medium');

      if (isOwned) {
          // Construct a dummy username based on name (remove spaces)
          const botUsername = bot.name.replace(/\s+/g, '') + "_bot";
          const url = `https://t.me/${botUsername}`;

          // Use custom hook to open native link
          openLink(url);
          return;
      }

      if (bot.price === 0) {
          // Free bot logic: Add directly to library
          // TODO: This should be an API call to "purchase" the free bot
          const newBot: UserBot = {
              ...bot,
              isAdEnabled: false,
              isActive: true,
              expiryDate: undefined
          };
          
          const currentBots = JSON.parse(localStorage.getItem('ownedBots') || '[]');
          localStorage.setItem('ownedBots', JSON.stringify([...currentBots, newBot]));
          
          setIsOwned(true);
          
          // Success Feedback
          notification('success');
          
          // Show quick native popup if available
          if(window.Telegram?.WebApp?.showPopup) {
              window.Telegram.WebApp.showPopup({
                  title: 'Başarılı!',
                  message: 'Bot kütüphanenize eklendi.',
                  buttons: [{type: 'ok'}]
              });
          }
      } else {
          // Paid bot logic: Go to payment
          navigate(`/payment/${id}`);
      }
  };

  // Screenshots Logic
  const hasScreenshots = bot.screenshots && bot.screenshots.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      {/* Header - Sticky */}
      <div className="p-4 flex items-center justify-between sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/50">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-200" />
        </button>
        <h1 className="text-lg font-bold text-white max-w-[200px] truncate">{bot.name}</h1>
        <button 
            onClick={() => { haptic('light'); }}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
        >
            <Share2 className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      <div className="px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Hero Section */}
          <div className="flex flex-col items-center mt-6 mb-8">
              <div className="w-32 h-32 rounded-3xl bg-slate-800 flex items-center justify-center border-4 border-slate-800 shadow-2xl relative overflow-hidden group">
                   <img src={bot.icon} alt={bot.name} className="w-full h-full object-cover rounded-3xl opacity-100 group-hover:scale-110 transition-transform duration-500" />
              </div>
              
              <h2 className="text-2xl font-bold mt-5 text-center text-white">{bot.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-wide">
                      {bot.category}
                  </span>
                  {bot.isPremium && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wide">
                          Premium
                      </span>
                  )}
              </div>
              <p className="text-center text-slate-400 mt-4 leading-relaxed max-w-sm text-sm">
                  {bot.description}
              </p>
          </div>

          {/* Horizontal Ad Banner */}
          <div className="mt-6 p-0.5 border border-blue-900/30 rounded-xl shadow-sm bg-slate-900/30">
             <div className="bg-slate-900/80 rounded-[10px] p-3 flex items-center justify-between h-full gap-3">
                   <div className="w-10 h-10 bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden">
                     <img src="https://picsum.photos/seed/ad/100" className="w-full h-full object-cover opacity-80" alt="Ad Logo" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-200 truncate">Sponsor: UltraBot</h4>
                      <p className="text-xs text-slate-500 leading-tight mt-0.5 truncate">Sunucunu en iyi araçlarla yönet.</p>
                   </div>
                   <button className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition-colors flex-shrink-0 border border-slate-700">
                       İncele
                   </button>
             </div>
          </div>

          {/* Screenshots Section */}
          <div className="mt-8">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 pl-1">Önizleme</h3>
               {hasScreenshots ? (
                   <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6 pb-2 snap-x">
                       {bot.screenshots!.map((src, i) => (
                           <div key={i} className="min-w-[160px] aspect-[9/16] bg-slate-800 rounded-xl border border-slate-700 overflow-hidden relative shadow-md snap-center">
                                <img src={src} alt={`Screenshot ${i+1}`} className="w-full h-full object-cover" />
                           </div>
                       ))}
                   </div>
               ) : (
                   <div className="w-full aspect-[16/9] bg-slate-900 rounded-xl border border-slate-800 border-dashed flex flex-col items-center justify-center text-slate-600">
                       <ImageOff size={24} className="mb-2 opacity-50" />
                       <span className="text-xs">Görsel eklenmemiş</span>
                   </div>
               )}
          </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 p-4 pb-8 z-50 safe-area-bottom">
          <div className="max-w-md mx-auto flex gap-3">
              <button 
                 className={`flex-1 transition-all text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 ${
                     isOwned 
                     ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30' 
                     : (bot.price === 0 ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30 active:scale-[0.98]')
                 }`}
                 onClick={handleAction}
              >
                  {isOwned ? (
                      <>
                        <Send size={18} />
                        <span>Botu Başlat</span>
                      </>
                  ) : (
                      <>
                        {bot.price === 0 ? 'Hemen Ekle - Ücretsiz' : `Satın Al - ₺${bot.price}`}
                      </>
                  )}
              </button>
              <button 
                onClick={() => haptic('light')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-3.5 rounded-xl border border-slate-700 transition-colors"
              >
                  <Bookmark className="w-6 h-6" />
              </button>
          </div>
      </div>
    </div>
  );
};

export default BotDetail;
