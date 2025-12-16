
// Bu dosya uygulamanın genel yapılandırma ayarlarını içerir.
// Gerçek bir backend bağlantısı kurulduğunda API_URL buraya girilir.

export const CONFIG = {
    // Admin yetkisine sahip Telegram ID'leri
    ADMIN_IDS: [8426134237],
    
    // Simüle edilmiş API Gecikmesi (ms cinsinden - Gerçekçilik için)
    API_LATENCY: 600,
    
    // Versiyon
    VERSION: '2.1.0-Stable'
};

export const isUserAdmin = (telegramId?: number): boolean => {
    if (!telegramId) return false;
    return CONFIG.ADMIN_IDS.includes(telegramId);
};
