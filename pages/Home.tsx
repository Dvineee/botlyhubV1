
import React, { useState, useEffect } from 'react';
import { Search, Sparkles, TrendingUp, BarChart3, ChevronRight, LayoutGrid, Store, User, Bot as BotIcon, Megaphone, DollarSign, X, ShieldCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ExtendedBot } from '../types';
import { categories } from '../data';
import { useTranslation } from '../TranslationContext';
import { MarketplaceService } from '../services/MarketplaceService';
import { useTelegram } from '../hooks/useTelegram';
import { isUserAdmin } from '../config';

// Helper component for rendering a single bot card
const BotCard: React.FC<{ bot: ExtendedBot }> = ({ bot }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  return (
    <div 
        onClick={() => navigate(`/bot/${bot.id}`)}
        className="flex items-center py-3 px-2 cursor-pointer group relative hover:bg-slate-900/50 rounded-xl transition-colors"
    >
        {/* Left: Icon */}
        <div className="relative flex-shrink-0">
            <img src={bot.icon} alt={bot.name} className="w-20 h-20 rounded-xl object-cover bg-slate-900" />
        </div>

        {/* Middle: Info */}
        <div className="flex-1 ml-4 min-w-0 mr-2">
            <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg truncate text-slate-200">
                    {bot.name}
                </h3>
                {bot.isPremium && (
                    <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-500/20">
                        {t('premium')}
                    </span>
                )}
            </div>
            <p className="text-sm text-slate-500 truncate">{bot.description}</p>
        </div>

        {/* Right: Action */}
        <button className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold py-2 px-4 rounded-full min-w-[60px] transition-colors hover:border-slate-600 hover:text-white">
            {t('open')}
        </button>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useTelegram();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data State
  const [marketplaceBots, setMarketplaceBots] = useState<ExtendedBot[]>([]);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchCategory, setActiveSearchCategory] = useState('all');
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  useEffect(() => {
    // Load bots from Real Backend
    const fetchBots = async () => {
        setIsLoading(true);
        try {
            const allBots = await MarketplaceService.getAllBots();
            const activeBots = allBots.filter(b => (b.status || 'active') === 'active');
            setMarketplaceBots(activeBots);
        } catch (e) {
            console.error("Botlar yüklenirken hata:", e);
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchBots();
  }, []);

  // Search is active if text exists OR overlay is explicitly opened (e.g. by category click)
  const isSearchActive = searchQuery.trim().length > 0 || isOverlayOpen;

  // Split categories into two groups for the dashboard view
  const topCategories = categories.slice(0, 4);
  const bottomCategories = categories.slice(4, 7);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // Used for dashboard category buttons - Opens Overlay without Redirect
  const handleDashboardCategoryClick = (categoryId: string) => {
    navigate(`/search?category=${categoryId}`);
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (val.trim().length > 0) {
        setIsOverlayOpen(true);
    } else {
        // When text is fully cleared, return to dashboard view
        setIsOverlayOpen(false);
        setActiveSearchCategory('all');
    }
  };

  const clearSearch = () => {
      setSearchQuery('');
      setActiveSearchCategory('all');
      setIsOverlayOpen(false);
  };

  // Filter bots for search mode
  const filteredBots = marketplaceBots.filter(bot => {
      const matchesText = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          bot.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeSearchCategory === 'all' || bot.category === activeSearchCategory;

      return matchesText && matchesCategory;
  });

  // Helper to render dashboard category section
  const CategorySection = ({ title, categoryId }: { title: string, categoryId: string }) => {
    const bots = marketplaceBots.filter(b => b.category === categoryId).slice(0, 3);
    
    if (bots.length === 0) return null;

    return (
      <div className="mb-6">
         <div className="flex justify-between items-center mb-1 px-1">
            <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
            <button 
                onClick={() => handleDashboardCategoryClick(categoryId)}
                className="flex items-center gap-1 text-slate-500 hover:text-blue-400 transition-colors"
            >
                <span className="text-xs font-medium">{t('all')}</span>
                <ChevronRight size={16} />
            </button>
         </div>
         <div className="flex flex-col gap-2">
            {bots.map((bot) => (
                <BotCard key={bot.id} bot={bot} />
            ))}
         </div>
      </div>
    );
  };

  // --- Render Functions ---

  const renderDashboard = () => (
      <div className="animate-in fade-in duration-300">
        
        {/* Admin Shortcut (Visible ONLY if ID matches config) */}
        {isUserAdmin(user?.id) && (
            <div className="mb-4">
                <button 
                    onClick={() => navigate('/admin/login')}
                    className="w-full bg-slate-900 border border-blue-500/30 text-blue-400 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg hover:bg-slate-800 transition-colors"
                >
                    <ShieldCheck size={18} />
                    Yönetici Paneline Git
                </button>
            </div>
        )}

        {/* Feature Slider (Promo Cards) */}
        <div className="mb-6">
             <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 snap-x snap-mandatory">
                 {/* Card 1: Premium */}
                 <div className="min-w-[280px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between h-36 shadow-lg flex-shrink-0 snap-center">
                    <div className="z-10">
                      <h3 className="font-bold text-lg text-white">{t('get_premium')}</h3>
                      <p className="text-xs text-indigo-100 mt-1 max-w-[80%]">{t('get_premium_desc')}</p>
                    </div>
                    <button onClick={() => navigate('/premium')} className="z-10 bg-white text-indigo-600 text-xs font-bold py-2 px-4 rounded-lg self-start mt-2 hover:bg-indigo-50 transition-colors shadow-sm">
                      {t('view_packages')}
                    </button>
                    <div className="absolute -right-4 -bottom-4 opacity-20 text-white">
                      <Sparkles size={100} />
                    </div>
                 </div>

                 {/* Card 2: Earnings */}
                 <div className="min-w-[280px] bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between h-36 shadow-lg flex-shrink-0 snap-center">
                    <div className="z-10">
                      <h3 className="font-bold text-lg text-white">{t('earn_income')}</h3>
                      <p className="text-xs text-emerald-100 mt-1 max-w-[80%]">{t('earn_income_desc')}</p>
                    </div>
                    <button onClick={() => navigate('/earnings')} className="z-10 bg-white text-emerald-700 text-xs font-bold py-2 px-4 rounded-lg self-start mt-2 hover:bg-emerald-50 transition-colors shadow-sm">
                      {t('go_to_panel')}
                    </button>
                    <div className="absolute -right-4 -bottom-4 opacity-20 text-white">
                      <TrendingUp size={100} />
                    </div>
                 </div>

                 {/* Card 3: Analytics */}
                 <div className="min-w-[280px] bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between h-36 shadow-lg flex-shrink-0 snap-center">
                    <div className="z-10">
                      <h3 className="font-bold text-lg text-white">{t('stats')}</h3>
                      <p className="text-xs text-orange-100 mt-1 max-w-[80%]">{t('stats_desc')}</p>
                    </div>
                    <button className="z-10 bg-white text-orange-700 text-xs font-bold py-2 px-4 rounded-lg self-start mt-2 hover:bg-orange-50 transition-colors shadow-sm">
                      {t('see_details')}
                    </button>
                    <div className="absolute -right-4 -bottom-4 opacity-20 text-white">
                      <BarChart3 size={100} />
                    </div>
                 </div>
             </div>
        </div>

        {/* Categories - Top Row (4 Columns) */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          {topCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleDashboardCategoryClick(cat.id)}
              className="flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-xl transition-all border bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300 active:scale-95 shadow-sm"
            >
              <cat.icon size={20} />
              <span className="text-[10px] font-medium truncate w-full text-center">{t(cat.label)}</span>
            </button>
          ))}
        </div>

        {/* Categories - Bottom Row (3 Columns, Icon Left) */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          {bottomCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleDashboardCategoryClick(cat.id)}
              className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl transition-all border bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300 active:scale-95 shadow-sm"
            >
              <cat.icon size={18} />
              <span className="text-[10px] font-bold truncate">{t(cat.label)}</span>
            </button>
          ))}
        </div>

        {/* Recently Viewed */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-lg font-semibold text-white">{t('recently_viewed')}</h2>
            <span className="text-xs text-blue-500 cursor-pointer">{t('clear')}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
             {marketplaceBots.slice(0,6).map((bot) => (
               <div key={bot.id} onClick={() => navigate(`/bot/${bot.id}`)} className="min-w-[70px] flex flex-col items-center gap-2 cursor-pointer group">
                 <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 p-0.5 group-hover:border-slate-700 transition-colors shadow-sm">
                    <img src={bot.icon} alt={bot.name} className="w-full h-full rounded-xl object-cover" />
                 </div>
                 <span className="text-[10px] text-center font-medium truncate w-full text-slate-300 group-hover:text-white transition-colors">{bot.name}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Category Sections (Last 3 Added) */}
        <CategorySection title={t('sec_productivity')} categoryId="productivity" />
        <CategorySection title={t('sec_games')} categoryId="games" />
        <CategorySection title={t('sec_finance')} categoryId="finance" />
        
        {/* Generic Section */}
        <div className="mt-8 mb-4">
            <div className="flex justify-between items-center mb-1 px-1">
                <h2 className="text-lg font-semibold text-slate-200">{t('other_popular')}</h2>
                <button 
                    onClick={() => handleDashboardCategoryClick('all')}
                    className="flex items-center gap-1 text-slate-500 hover:text-blue-500 transition-colors"
                >
                    <span className="text-xs font-medium">{t('all')}</span>
                    <ChevronRight size={16} />
                </button>
            </div>
            <div className="flex flex-col gap-2">
                {marketplaceBots.filter(b => !['productivity', 'games', 'finance'].includes(b.category)).map((bot) => (
                    <BotCard key={bot.id} bot={bot} />
                ))}
            </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 mb-6 border-t border-slate-800/50 pt-6 flex justify-center items-center gap-6">
            <a href="#" className="text-xs font-medium text-slate-500 hover:text-blue-500 transition-colors">{t('channel')}</a>
            <a href="#" className="text-xs font-medium text-slate-500 hover:text-blue-500 transition-colors">{t('contact')}</a>
            <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors">{t('add_bot')}</a>
        </div>
      </div>
  );

  const renderSearchResults = () => (
      <div className="animate-in fade-in zoom-in-95 duration-200 min-h-[50vh]">
          {/* Categories Slider for Search (Same as Search Page) */}
          <div className="mb-6">
               <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    <button
                        onClick={() => setActiveSearchCategory('all')}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
                            activeSearchCategory === 'all'
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                    >
                        {t('cat_all')}
                    </button>
                   {categories.filter(c => c.id !== 'all').map((cat) => (
                       <button
                           key={cat.id}
                           onClick={() => setActiveSearchCategory(cat.id)}
                           className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition-colors flex items-center gap-2 ${
                               activeSearchCategory === cat.id
                               ? 'bg-blue-600 border-blue-600 text-white'
                               : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                           }`}
                   >
                           <cat.icon size={14} />
                           {t(cat.label)}
                       </button>
                   ))}
               </div>
          </div>

          <div className="mb-3 px-1">
            <h2 className="text-sm font-medium text-slate-400">
                {filteredBots.length} {t('results_found')}
            </h2>
          </div>

          <div className="flex flex-col gap-2">
              {filteredBots.length > 0 ? (
                  filteredBots.map(bot => <BotCard key={bot.id} bot={bot} />)
              ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <p>{t('no_results')}</p>
                  </div>
              )}
          </div>
      </div>
  );

  return (
    <div className="p-4 pt-8 min-h-screen relative" onClick={() => isMenuOpen && setIsMenuOpen(false)}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-50">
        <div className="flex items-center gap-2">
            <svg width="200" height="40" viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="hub_gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#6366f1" /> {/* Indigo */}
                        <stop offset="1" stopColor="#a855f7" /> {/* Purple */}
                    </linearGradient>
                </defs>
                <circle cx="8" cy="8" r="3" fill="url(#hub_gradient)" opacity="0.6" />
                <circle cx="32" cy="8" r="3" fill="url(#hub_gradient)" opacity="0.6" />
                <circle cx="8" cy="32" r="3" fill="url(#hub_gradient)" opacity="0.6" />
                <circle cx="32" cy="32" r="3" fill="url(#hub_gradient)" opacity="0.6" />
                <circle cx="20" cy="20" r="10" fill="url(#hub_gradient)" />
                <circle cx="20" cy="20" r="4" fill="white" />
                <text x="46" y="27" fontFamily="'Inter', sans-serif" fontWeight="700" fontSize="20" className="fill-white" letterSpacing="-0.5">BotlyHub V2</text>
            </svg>
        </div>

        <div className="flex items-center gap-3">
            {/* Earnings / Wallet Button */}
            <button 
                onClick={(e) => { e.stopPropagation(); navigate('/earnings'); }} 
                className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition text-emerald-400 border border-slate-700 shadow-sm"
            >
                <DollarSign className="w-5 h-5" />
            </button>

            {/* Menu Button */}
            <div className="relative">
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleMenu(); }} 
                    className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition group border border-slate-700 shadow-sm"
                >
                    <LayoutGrid className="text-white w-5 h-5 group-hover:text-blue-400 transition-colors" />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                        <button onClick={() => handleMenuClick('/')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors text-left border-b border-slate-800/50">
                            <Store size={18} className="text-blue-400" />
                            <span className="text-sm font-medium text-slate-200">{t('market')}</span>
                        </button>
                        <button onClick={() => handleMenuClick('/settings')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors text-left border-b border-slate-800/50">
                            <User size={18} className="text-purple-400" />
                            <span className="text-sm font-medium text-slate-200">{t('profile')}</span>
                        </button>
                        <button onClick={() => handleMenuClick('/my-bots')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors text-left border-b border-slate-800/50">
                            <BotIcon size={18} className="text-emerald-400" />
                            <span className="text-sm font-medium text-slate-200">{t('my_bots')}</span>
                        </button>
                        <button onClick={() => handleMenuClick('/channels')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors text-left">
                            <Megaphone size={18} className="text-orange-400" />
                            <span className="text-sm font-medium text-slate-200">{t('my_channels')}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-6 sticky top-2 z-40">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          value={searchQuery}
          placeholder={t('search_placeholder')}
          onChange={handleSearchInput}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-text shadow-lg shadow-slate-950/50 text-white"
        />
        {isSearchActive && (
            <button 
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white bg-slate-800 rounded-full p-0.5"
            >
                <X size={16} />
            </button>
        )}
      </div>

      {/* Conditional Rendering */}
      {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-xs text-slate-500 mt-2">Sunucuya bağlanılıyor...</p>
          </div>
      ) : isSearchActive ? renderSearchResults() : renderDashboard()}

    </div>
  );
};

export default Home;
