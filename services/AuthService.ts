
import { BackendService } from './BackendService';
import { Logger } from './Logger';

const AUTH_KEY = 'auth_token';

export class AuthService {
    
    // Telegram InitData'yı Backend'e gönderip doğrulama ve token alma
    static async loginWithTelegram(): Promise<boolean> {
        const initData = window.Telegram?.WebApp?.initData;

        if (!initData) {
            console.warn('Telegram initData bulunamadı (Browser ortamı olabilir).');
            return false;
        }

        try {
            // Gerçek Backend Doğrulaması
            const response = await BackendService.loginTelegram(initData);
            
            if (response.token) {
                sessionStorage.setItem(AUTH_KEY, response.token);
                // Kullanıcı bilgilerini de saklayabiliriz gerekirse
                return true;
            }
            return false;
        } catch (error) {
            console.error('Telegram Login Hatası:', error);
            return false;
        }
    }

    // Admin Şifreli Giriş (Backend üzerinden)
    static async login(username: string, password: string): Promise<boolean> {
        try {
            const response = await BackendService.loginAdmin(username, password);
            if (response.token) {
                sessionStorage.setItem(AUTH_KEY, response.token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Admin Login Hatası:', error);
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
