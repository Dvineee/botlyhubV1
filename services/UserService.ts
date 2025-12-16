
import { User } from '../types';

const STORAGE_KEY = 'app_users_v1';

// Başlangıç için Mock Kullanıcılar (Veritabanı boşsa bunlar yüklenir)
const INITIAL_USERS: User[] = [
    { id: '101', name: 'Ahmet Yılmaz', username: 'ahmety', avatar: 'https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=random', role: 'User', status: 'Active', badges: ['Premium'], joinDate: '2023-11-10', email: 'ahmet@example.com' },
    { id: '102', name: 'Ayşe Demir', username: 'aysed', avatar: 'https://ui-avatars.com/api/?name=Ayse+Demir&background=random', role: 'Moderator', status: 'Active', badges: ['Mod'], joinDate: '2023-10-05', email: 'ayse@example.com' },
    { id: '103', name: 'Mehmet Öztürk', username: 'mehmeto', avatar: 'https://ui-avatars.com/api/?name=Mehmet+Ozturk&background=random', role: 'User', status: 'Passive', badges: [], joinDate: '2023-12-01', email: 'mehmet@example.com' },
    { id: '104', name: 'Canan Can', username: 'cananc', avatar: 'https://ui-avatars.com/api/?name=Canan+Can&background=random', role: 'User', status: 'Active', badges: ['Reklamcı'], joinDate: '2024-01-15', email: 'canan@example.com' },
];

export class UserService {
    
    static getAllUsers(): User[] {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        // İlk yükleme
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
    }

    static getUserById(id: string): User | undefined {
        return this.getAllUsers().find(u => u.id === id);
    }

    static updateUser(id: string, updates: Partial<User>): User | null {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === id);
        
        if (index === -1) return null;

        const updatedUser = { ...users[index], ...updates };
        users[index] = updatedUser;
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return updatedUser;
    }

    static deleteUser(id: string): void {
        const users = this.getAllUsers();
        const filtered = users.filter(u => u.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }

    // İstatistikler için yardımcı metotlar
    static getUserStats() {
        const users = this.getAllUsers();
        return {
            total: users.length,
            active: users.filter(u => u.status === 'Active').length,
            premium: users.filter(u => u.badges.includes('Premium')).length,
            moderators: users.filter(u => u.role === 'Moderator' || u.role === 'Admin').length
        };
    }
}
