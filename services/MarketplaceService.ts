
import { BackendService } from './BackendService';
import { ExtendedBot } from '../types';

export class MarketplaceService {
    
    // Tüm botları sunucudan getir
    static async getAllBots(): Promise<ExtendedBot[]> {
        try {
            return await BackendService.getBots();
        } catch (error) {
            console.error("MarketplaceService: Botlar çekilemedi", error);
            return [];
        }
    }

    // Tek bir bot getir
    static async getBotById(id: string): Promise<ExtendedBot | undefined> {
        try {
            return await BackendService.getBotById(id);
        } catch (error) {
            console.error(`MarketplaceService: Bot ${id} bulunamadı`, error);
            return undefined;
        }
    }

    // Yeni bot ekle
    static async addBot(botData: Partial<ExtendedBot>): Promise<ExtendedBot> {
        return await BackendService.createBot(botData);
    }

    // Bot Güncelle
    static async updateBot(id: string, updates: Partial<ExtendedBot>): Promise<ExtendedBot | null> {
        return await BackendService.updateBot(id, updates);
    }

    // Bot sil
    static async deleteBot(id: string): Promise<void> {
        return await BackendService.deleteBot(id);
    }
}
