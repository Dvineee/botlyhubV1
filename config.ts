
// Bu dosya uygulamanın genel yapılandırma ayarlarını içerir.

export const CONFIG = {
    // Backend API Adresi (Sunucunuzun adresi)
    API_BASE_URL: 'http://localhost:5000/api',
    
    // Admin yetkisine sahip Telegram ID'leri (Frontend tarafında ön kontrol için)
    // Asıl yetkilendirme Backend tarafında yapılmalıdır.
    ADMIN_IDS: [8426134237],
    
    // Versiyon
    VERSION: '3.0.0-Live'
};

export const isUserAdmin = (telegramId?: number): boolean => {
    if (!telegramId) return false;
    return CONFIG.ADMIN_IDS.includes(telegramId);
};
