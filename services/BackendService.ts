
import { CONFIG } from '../config';
import { User, ExtendedBot, SystemLog } from '../types';
import { mockBots } from '../data';

// Database Schema Simulation
interface DatabaseSchema {
    users: User[];
    bots: ExtendedBot[];
    logs: SystemLog[];
    stats: any;
}

const DB_KEY = 'botly_production_db_v1';

export class BackendService {
    
    // --- Private Database Connection Helper ---
    private static async getDB(): Promise<DatabaseSchema> {
        // Network gecikmesi simülasyonu (Gerçek API hissi verir)
        await new Promise(resolve => setTimeout(resolve, CONFIG.API_LATENCY));

        const data = localStorage.getItem(DB_KEY);
        if (data) {
            return JSON.parse(data);
        }

        // Eğer DB yoksa initialize et (Seed Data)
        const initialDB: DatabaseSchema = {
            users: [],
            bots: mockBots.map(b => ({ ...b, status: 'active', screenshots: [] })),
            logs: [],
            stats: { totalViews: 0, totalRevenue: 0 }
        };
        localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
        return initialDB;
    }

    private static async saveDB(db: DatabaseSchema): Promise<void> {
        // Yazma işlemi gecikmesi
        await new Promise(resolve => setTimeout(resolve, 200)); 
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    }

    // --- USER API ENDPOINTS ---

    static async getUsers(): Promise<User[]> {
        const db = await this.getDB();
        return db.users;
    }

    static async getUserById(id: string): Promise<User | undefined> {
        const db = await this.getDB();
        return db.users.find(u => u.id === id);
    }

    // --- BOT API ENDPOINTS ---

    static async getBots(): Promise<ExtendedBot[]> {
        const db = await this.getDB();
        return db.bots;
    }

    static async createBot(bot: ExtendedBot): Promise<ExtendedBot> {
        const db = await this.getDB();
        db.bots.unshift(bot);
        await this.saveDB(db);
        return bot;
    }

    static async updateBot(id: string, updates: Partial<ExtendedBot>): Promise<ExtendedBot | null> {
        const db = await this.getDB();
        const index = db.bots.findIndex(b => b.id === id);
        if (index === -1) return null;
        
        db.bots[index] = { ...db.bots[index], ...updates };
        await this.saveDB(db);
        return db.bots[index];
    }

    static async deleteBot(id: string): Promise<boolean> {
        const db = await this.getDB();
        const initialLength = db.bots.length;
        db.bots = db.bots.filter(b => b.id !== id);
        
        if (db.bots.length !== initialLength) {
            await this.saveDB(db);
            return true;
        }
        return false;
    }

    // --- LOGGING API ---
    
    static async createLog(log: SystemLog): Promise<void> {
        const db = await this.getDB();
        db.logs.unshift(log);
        if (db.logs.length > 500) db.logs.pop(); // Rotate logs
        await this.saveDB(db);
    }

    static async getLogs(): Promise<SystemLog[]> {
        const db = await this.getDB();
        return db.logs;
    }
}
