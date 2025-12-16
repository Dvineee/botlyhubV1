
import { CONFIG } from '../config';
import { User, ExtendedBot, SystemLog } from '../types';

// Gerçek HTTP İstekleri için Yardımcı Metot
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    
    // Auth Token Ekleme
    const token = sessionStorage.getItem('auth_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    try {
        const response = await fetch(url, { ...options, headers });
        
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.message || `API Hatası: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Request Failed [${endpoint}]:`, error);
        throw error;
    }
}

export class BackendService {
    
    // --- AUTH API ---
    static async loginTelegram(initData: string): Promise<{ token: string, user: User }> {
        return request('/auth/telegram', {
            method: 'POST',
            body: JSON.stringify({ initData })
        });
    }

    static async loginAdmin(username: string, password: string): Promise<{ token: string, user: User }> {
        return request('/auth/admin-login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    // --- USER API ---
    static async getUsers(): Promise<User[]> {
        return request<User[]>('/users');
    }

    static async getUserById(id: string): Promise<User> {
        return request<User>(`/users/${id}`);
    }

    static async updateUser(id: string, data: Partial<User>): Promise<User> {
        return request<User>(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async deleteUser(id: string): Promise<void> {
        return request<void>(`/users/${id}`, { method: 'DELETE' });
    }

    // --- BOT API ---
    static async getBots(): Promise<ExtendedBot[]> {
        return request<ExtendedBot[]>('/bots');
    }

    static async getBotById(id: string): Promise<ExtendedBot> {
        return request<ExtendedBot>(`/bots/${id}`);
    }

    static async createBot(bot: Partial<ExtendedBot>): Promise<ExtendedBot> {
        return request<ExtendedBot>('/bots', {
            method: 'POST',
            body: JSON.stringify(bot)
        });
    }

    static async updateBot(id: string, updates: Partial<ExtendedBot>): Promise<ExtendedBot> {
        return request<ExtendedBot>(`/bots/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    static async deleteBot(id: string): Promise<void> {
        return request<void>(`/bots/${id}`, { method: 'DELETE' });
    }

    // --- LOGS & STATS API ---
    static async getLogs(): Promise<SystemLog[]> {
        return request<SystemLog[]>('/logs');
    }

    static async getStats(): Promise<any> {
        return request<any>('/stats/dashboard');
    }

    // --- HEALTH CHECK ---
    static async checkHealth(): Promise<boolean> {
        try {
            await fetch(`${CONFIG.API_BASE_URL}/health`);
            return true;
        } catch {
            return false;
        }
    }
}
