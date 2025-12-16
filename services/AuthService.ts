
import { Logger } from './Logger';
import { isUserAdmin } from '../config';

const AUTH_KEY = 'admin_session_token';

export class AuthService {
    
    // Telegram ID Kontrolü (SSO Login)
    static async loginWithTelegram(): Promise<boolean> {
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

        if (!tgUser) {
            Logger.log('WARNING', 'Telegram user datası bulunamadı.');
            return false;
        }

        console.log("Checking Admin Access for ID:", tgUser.id);

        if (isUserAdmin(tgUser.id)) {
            const token = this.generateToken();
            sessionStorage.setItem(AUTH_KEY, token);
            Logger.log('INFO', `Admin (Telegram ID) ile giriş yapıldı: ${tgUser.first_name} (${tgUser.id})`);
            return true;
        }

        Logger.log('WARNING', `Yetkisiz admin giriş denemesi: ID ${tgUser.id}`);
        return false;
    }

    // Klasik Şifreli Giriş (Yedek)
    static async login(username: string, password: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 800)); // Network simülasyonu

        if (username === 'admin' && password === 'admin123') {
            const token = this.generateToken();
            sessionStorage.setItem(AUTH_KEY, token);
            Logger.log('INFO', `Admin şifre ile giriş yaptı: ${username}`);
            return true;
        }
        
        Logger.log('WARNING', `Hatalı şifre denemesi: ${username}`);
        return false;
    }

    static logout() {
        sessionStorage.removeItem(AUTH_KEY);
        Logger.log('INFO', 'Admin oturumu kapatıldı.');
    }

    static isAuthenticated(): boolean {
        const token = sessionStorage.getItem(AUTH_KEY);
        return !!token;
    }

    private static generateToken(): string {
        return Math.random().toString(36).substr(2) + Date.now().toString(36);
    }
}
