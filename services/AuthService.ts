
import { Logger } from './Logger';

const AUTH_KEY = 'admin_session_token';

export class AuthService {
    
    // Gerçek bir senaryoda bu API'ye gider.
    // Burada güvenli bir karşılaştırma simüle ediyoruz.
    static async login(username: string, password: string): Promise<boolean> {
        // Yapay gecikme (Network request simülasyonu)
        await new Promise(resolve => setTimeout(resolve, 800));

        if (username === 'admin' && password === 'admin123') { // Güçlü şifre simülasyonu
            const token = this.generateToken();
            sessionStorage.setItem(AUTH_KEY, token);
            Logger.log('INFO', `Admin oturum açtı: ${username}`);
            return true;
        }
        
        Logger.log('WARNING', `Hatalı giriş denemesi: ${username}`);
        return false;
    }

    static logout() {
        sessionStorage.removeItem(AUTH_KEY);
        Logger.log('INFO', 'Admin oturumu kapatıldı.');
    }

    static isAuthenticated(): boolean {
        const token = sessionStorage.getItem(AUTH_KEY);
        // Basit token varlık kontrolü (Gerçekte JWT doğrulaması yapılır)
        return !!token;
    }

    private static generateToken(): string {
        return Math.random().toString(36).substr(2) + Date.now().toString(36);
    }
}
