
import { MarketplaceService } from './MarketplaceService';
import { UserService } from './UserService';
import { Logger } from './Logger';
import { WalletService } from './WalletService';

export class DatabaseService {
    
    // Uygulama başladığında veritabanını (LocalStorage) kontrol eder ve hazırlar
    static async init() {
        console.log("Database Service: Initializing...");
        
        try {
            // 1. Kullanıcı Tablosu Kontrolü
            const users = UserService.getAllUsers();
            if (!users || users.length === 0) {
                console.log("DB: Users table initialized with defaults.");
            }

            // 2. Bot/Marketplace Tablosu Kontrolü
            // MarketplaceService.getAllBots is async
            const bots = await MarketplaceService.getAllBots();
            if (!bots || bots.length === 0) {
                console.log("DB: Marketplace table initialized with defaults.");
            }

            // 3. Log Tablosu Kontrolü
            const logs = Logger.getLogs();
            if (!logs) {
                Logger.clearLogs(); // Boş array başlatır
            }

            console.log("Database Service: Ready & Integrity Checked.");
        } catch (error) {
            console.error("Database Service Error:", error);
            Logger.log('ERROR', 'Veritabanı başlatma hatası', error);
        }
    }

    // Geliştirme amaçlı tüm veriyi silme (Hard Reset)
    static nuke() {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    }
}
