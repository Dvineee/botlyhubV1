
import { mockBots } from '../data';
import { ExtendedBot } from '../types';

const STORAGE_KEY = 'marketplace_bots_v1';

export class MarketplaceService {
    
    // Tüm botları getir (LocalStorage yoksa mock veriyi yükle)
    static getAllBots(): ExtendedBot[] {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        // İlk açılışta mock veriyi kaydet
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockBots));
        return mockBots;
    }

    // Tek bir bot getir
    static getBotById(id: string): ExtendedBot | undefined {
        const bots = this.getAllBots();
        return bots.find(b => b.id === id);
    }

    // Yeni bot ekle
    static addBot(botData: Omit<ExtendedBot, 'id'>): ExtendedBot {
        const bots = this.getAllBots();
        
        const newBot: ExtendedBot = {
            id: Math.random().toString(36).substr(2, 9),
            ...botData,
            isNew: true // Yeni eklenenler "Yeni" etiketi alır
        };

        const updatedBots = [newBot, ...bots];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBots));
        return newBot;
    }

    // Bot sil
    static deleteBot(id: string): void {
        const bots = this.getAllBots();
        const updatedBots = bots.filter(b => b.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBots));
    }

    // Verileri sıfırla (Reset)
    static resetToDefaults() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockBots));
    }
}
