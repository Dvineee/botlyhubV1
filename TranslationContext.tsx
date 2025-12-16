
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Çeviri Sözlüğü
const translations = {
  tr: {
    // Navigation & Header
    "market": "Market",
    "profile": "Profil",
    "my_bots": "Botlarım",
    "my_channels": "Kanallarım",
    "search_placeholder": "Botları ara...",
    "results_found": "sonuç bulundu",
    "no_results": "Sonuç bulunamadı.",
    "search_all_cats": "Tüm Kategorilerde Ara",
    
    // Promo Cards
    "get_premium": "Premium Ol",
    "get_premium_desc": "Tüm özelliklere sınırsız erişim sağla ve rozet kazan.",
    "view_packages": "Paketleri İncele",
    "earn_income": "Gelir Kazan",
    "earn_income_desc": "Botlarınızdan reklam geliri elde etmeye başlayın.",
    "go_to_panel": "Panele Git",
    "stats": "İstatistikler",
    "stats_desc": "Kullanıcı etkileşimlerini ve bot performansını izle.",
    "see_details": "Detayları Gör",

    // Sections
    "recently_viewed": "Son Bakılanlar",
    "clear": "Temizle",
    "other_popular": "Diğer Popüler Botlar",
    "all": "Tümü",
    
    // Categories
    "cat_all": "Hepsi",
    "cat_productivity": "Üretkenlik",
    "cat_games": "Oyun",
    "cat_utilities": "Araçlar",
    "cat_finance": "Finans",
    "cat_music": "Müzik",
    "cat_moderation": "Moderasyon",

    // Section Titles
    "sec_productivity": "Üretkenlik Botları",
    "sec_games": "Eğlence ve Oyun",
    "sec_finance": "Finans Araçları",

    // Footer
    "channel": "Kanalımız",
    "contact": "İletişim",
    "add_bot": "Botunu Ekle",
    
    // Bot Card
    "open": "Aç",
    "premium": "Premium"
  },
  en: {
    // Navigation & Header
    "market": "Market",
    "profile": "Profile",
    "my_bots": "My Bots",
    "my_channels": "My Channels",
    "search_placeholder": "Search for bots...",
    "results_found": "results found",
    "no_results": "No results found.",
    "search_all_cats": "Search in All Categories",

    // Promo Cards
    "get_premium": "Get Premium",
    "get_premium_desc": "Get unlimited access to all features and earn a badge.",
    "view_packages": "View Packages",
    "earn_income": "Earn Income",
    "earn_income_desc": "Start earning ad revenue from your bots.",
    "go_to_panel": "Go to Dashboard",
    "stats": "Analytics",
    "stats_desc": "Track user interactions and bot performance.",
    "see_details": "See Details",

    // Sections
    "recently_viewed": "Recently Viewed",
    "clear": "Clear",
    "other_popular": "Other Popular Bots",
    "all": "All",

    // Categories
    "cat_all": "All",
    "cat_productivity": "Productivity",
    "cat_games": "Games",
    "cat_utilities": "Utilities",
    "cat_finance": "Finance",
    "cat_music": "Music",
    "cat_moderation": "Moderation",

    // Section Titles
    "sec_productivity": "Productivity Bots",
    "sec_games": "Fun & Games",
    "sec_finance": "Finance Tools",

    // Footer
    "channel": "Our Channel",
    "contact": "Contact",
    "add_bot": "Add Your Bot",

    // Bot Card
    "open": "Open",
    "premium": "Premium"
  }
};

type Language = 'tr' | 'en';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children?: ReactNode;
}

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
  const [language, setLanguage] = useState<Language>('tr');

  useEffect(() => {
    // FIX: Removed fetch to ipapi.co to solve CORS/429 errors and Black Screen issues.
    // We use Telegram's native data which is instant and reliable.
    const initializeLanguage = () => {
      // 1. Check Telegram User Data (Best method)
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      if (tgUser && tgUser.language_code) {
        // If language code starts with 'en', switch to English
        if (tgUser.language_code.toLowerCase().startsWith('en')) {
          setLanguage('en');
          return;
        }
      }

      // 2. Fallback to Browser Language
      if (navigator.language && navigator.language.toLowerCase().startsWith('en')) {
         setLanguage('en');
      }
    };

    initializeLanguage();
  }, []);

  const t = (key: string) => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
