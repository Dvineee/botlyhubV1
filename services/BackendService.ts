
import { CONFIG } from '../config';
import { User, ExtendedBot, SystemLog } from '../types';
import { mockBots } from '../data';

// Demo verileri (Backend çalışmazsa devreye girer)
const MOCK_STATS = {
    totalViews: 1250,
    totalUsers: 42,
    totalRevenue: 5490.50,
    activeBots: 8
};

const MOCK_LOGS: SystemLog[] = [
    { id: '1', timestamp: new Date().toISOString(), type: 'INFO', message: 'Sistem başlatıldı (Demo Modu)' },
    { id: '2', timestamp: new Date(Date.now() - 100000).toISOString(), type: 'WARNING', message: 'API Bağlantısı başarısız, demo veriler gösteriliyor.' }
];

const MOCK_USERS: User[] = [
    { id: '1', name: 'Demo Admin', username: 'admin', role: 'Admin', status: 'Active', badges: ['Admin'], joinDate: new Date().toISOString(), avatar: '' },
    { id: '2', name: 'Ahmet Yılmaz', username: 'ahmety', role: 'User', status: 'Active', badges: [], joinDate: new Date().toISOString(), avatar: '' }
];

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    
    // Auth Token
    const token = sessionStorage.getItem('auth_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    try {
        const response = await fetch(url, { ...options, headers });
        
        if (!response.ok) {
            // Eğer 404 veya 500 alırsak hata fırlat, catch bloğunda mock veriye düşecek
            throw new Error(`API Hatası: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.warn(`API Request Failed [${endpoint}]. Switching to Demo Data.`);
        
        // --- FALLBACK MOCK DATA ---
        // Bu blok, backend/veritabanı çalışmadığında arayüzün bozulmamasını sağlar.
        if (endpoint === '/stats/dashboard') return MOCK_STATS as unknown as T;
        if (endpoint === '/logs') return MOCK_LOGS as unknown as T;
        if (endpoint === '/users') return MOCK_USERS as unknown as T;
        if (endpoint === '/bots') return mockBots as unknown as T;
        
        // Auth fallback
        if (endpoint.includes('/auth/')) {
            return { token: 'demo_token', user: MOCK_USERS[0] } as unknown as T;
        }

        throw error;
    }
}

export class BackendService {
    
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

    static async getLogs(): Promise<SystemLog[]> {
        return request<SystemLog[]>('/logs');
    }

    static async getStats(): Promise<any> {
        return request<any>('/stats/dashboard');
    }

    static async checkHealth(): Promise<boolean> {
        try {
            await fetch(`${CONFIG.API_BASE_URL}/health`);
            return true;
        } catch {
            return false;
        }
    }
}
