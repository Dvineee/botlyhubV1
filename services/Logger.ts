
import { SystemLog, AppStats } from '../types';

const LOG_KEY = 'admin_system_logs';
const STATS_KEY = 'admin_app_stats';

export class Logger {
    
    // --- Logging ---
    static log(type: SystemLog['type'], message: string, details?: any) {
        const logs: SystemLog[] = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
        
        const newLog: SystemLog = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            type,
            message,
            details
        };

        // Keep last 200 logs
        const updatedLogs = [newLog, ...logs].slice(0, 200);
        localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs));
    }

    static getLogs(): SystemLog[] {
        return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    }

    static clearLogs() {
        localStorage.removeItem(LOG_KEY);
    }

    // --- Stats ---
    static incrementView() {
        const stats = this.getStats();
        stats.totalViews += 1;
        this.saveStats(stats);
    }

    static incrementRevenue(amount: number) {
        const stats = this.getStats();
        stats.totalRevenue += amount;
        this.saveStats(stats);
    }

    static getStats(): AppStats {
        const defaultStats: AppStats = {
            totalViews: 0,
            totalUsers: 124, // Mock initial users
            totalRevenue: 0,
            activeBots: 0
        };
        return JSON.parse(localStorage.getItem(STATS_KEY) || JSON.stringify(defaultStats));
    }

    public static saveStats(stats: AppStats) {
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }
}
