
// Bu dosya uygulamanın genel yapılandırma ayarlarını içerir.

export const CONFIG = {
    // Vercel üzerinde '/api' relative path kullanılır.
    // Localhost'ta geliştirme yaparken 'http://localhost:5000/api' kullanılır.
    API_BASE_URL: import.meta.env.PROD ? '/api' : 'http://localhost:5000/api',
    
    // Admin yetkisine sahip Telegram ID'leri
    ADMIN_IDS: [8426134237],
    
    // Versiyon
    VERSION: '3.1.0-Vercel'
};

export const isUserAdmin = (telegramId?: number): boolean => {
    if (!telegramId) return false;
    return CONFIG.ADMIN_IDS.includes(telegramId);
};
