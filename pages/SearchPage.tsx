
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mockBots, categories } from '../data';
import { useTranslation } from '../TranslationContext';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  // Initialize state from URL params
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  // Sync state if URL changes (e.g. back button)
  useEffect(() => {
      setQuery(searchParams.get('q') || '');
      setActiveCategory(searchParams.get('category') || 'all');
  }, [searchParams]);

  const handleSearchChange = (val: string) => {
    setQuery(val);
  };

  const handleCategorySelect = (catId: string) => {
      setActiveCategory(catId);
  };

  // Filter bots based on name/desc AND category
  const filteredBots = mockBots.filter(bot => {
    const matchesText = bot.name.toLowerCase().includes(query.toLowerCase()) || 
                        bot.description.toLowerCase().includes(query.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || bot.category === activeCategory;

    return matchesText && matchesCategory;
  });

  // Get localized label
  const currentCategoryRaw = categories.find(c => c.id === activeCategory)?.label || 'cat_all';
  const currentCategoryLabel = t(currentCategoryRaw);

  return (
    <div className="min-h-screen bg-slate-950 p-4 pt-8">
      {/* Header with Search Input */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-900 rounded-full text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
          />
          {query && (
            <button 
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
                <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Categories Slider */}
      <div className="mb-6">
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                <button
                    onClick={() => handleCategorySelect('all')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
                        activeCategory === 'all'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                >
                    {t('cat_all')}
                </button>
               {categories.filter(c => c.id !== 'all').map((cat) => (
                   <button
                       key={cat.id}
                       onClick={() => handleCategorySelect(cat.id)}
                       className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition-colors flex items-center gap-2 ${
                           activeCategory === cat.id
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

      {/* Results Count & Active Filter Label */}
      <div className="mb-4 px-1 flex justify-between items-center">
          <h2 className="text-sm font-medium text-slate-400">
              {filteredBots.length} {t('results_found')}
          </h2>
          {activeCategory !== 'all' && (
              <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                  {currentCategoryLabel}
              </span>
          )}
      </div>

      {/* Bot List */}
      <div className="flex flex-col gap-2">
        {filteredBots.length > 0 ? (
            filteredBots.map((bot) => (
                <div 
                    key={bot.id}
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
            ))
        ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Search size={48} className="mb-4 opacity-20" />
                <p>{t('no_results')}</p>
                {activeCategory !== 'all' && (
                    <button 
                        onClick={() => setActiveCategory('all')}
                        className="mt-4 text-blue-500 hover:text-blue-400 text-sm font-bold"
                    >
                        {t('search_all_cats')}
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
