
import { BackendService } from './BackendService';
import { isUserAdmin } from '../config';

const AUTH_KEY = 'auth_token';

export class AuthService {
    
    // Telegram InitData'yı Backend'e gönderip doğrulama ve token alma
    static async loginWithTelegram(): Promise<boolean> {
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        const initData = window.Telegram?.WebApp?.initData;

        // 1. MASTER KEY KONTROLÜ (Backend Kapalıyken Erişim İçin)
        // Config dosyasında belirtilen Admin ID (8426134237) ise direkt giriş izni ver.
        if (tgUser && isUserAdmin(tgUser.id)) {
            console.log("👑 Master Admin Girişi Algılandı (Local Bypass):", tgUser.id);
            sessionStorage.setItem(AUTH_KEY, `master_admin_token_${tgUser.id}_${Date.now()}`);
            return true;
        }

        if (!initData) {
            console.warn('Telegram initData bulunamadı (Browser ortamı olabilir).');
            return false;
        }

        try {
            // 2. Gerçek Backend Doğrulaması
            const response = await BackendService.loginTelegram(initData);
            
            if (response.token) {
                sessionStorage.setItem(AUTH_KEY, response.token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Telegram Login Hatası:', error);
            return false;
        }
    }

    // Admin Şifreli Giriş
    static async login(username: string, password: string): Promise<boolean> {
        
        // 1. FALLBACK CREDENTIALS (Sunucu yoksa veya hata verirse acil giriş için)
        if (username === 'admin' && password === 'admin123') {
            console.log("⚠️ Fallback Admin Girişi Kullanıldı");
            sessionStorage.setItem(AUTH_KEY, 'manual_admin_fallback_token');
            return true;
        }

        try {
            // 2. Backend Üzerinden Giriş
            const response = await BackendService.loginAdmin(username, password);
            if (response.token) {
                sessionStorage.setItem(AUTH_KEY, response.token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Admin Login Hatası (Backend Erişilemedi):', error);
            // Backend hatası durumunda yukarıdaki fallback çalışmadıysa false döner
            // Ancak kullanıcı "admin/admin123" girdiyse zaten yukarıdaki if bloğunda yakalanır.
            return false;
        }
    }

    static logout() {
        sessionStorage.removeItem(AUTH_KEY);
    }

    static isAuthenticated(): boolean {
        return !!sessionStorage.getItem(AUTH_KEY);
    }
    
    static getToken(): string | null {
        return sessionStorage.getItem(AUTH_KEY);
    }
}
