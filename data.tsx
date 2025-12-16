
import { Layout, Briefcase, Gamepad2, Zap, Wallet, Music, Shield, Star, Crown, Gem } from 'lucide-react';
import { ExtendedBot, SubscriptionPlan, Notification } from './types';

// Updated labels to use Translation Keys defined in TranslationContext
export const categories = [
  { id: 'all', label: 'cat_all', icon: Layout },
  { id: 'productivity', label: 'cat_productivity', icon: Briefcase },
  { id: 'games', label: 'cat_games', icon: Gamepad2 },
  { id: 'utilities', label: 'cat_utilities', icon: Zap },
  { id: 'finance', label: 'cat_finance', icon: Wallet },
  { id: 'music', label: 'cat_music', icon: Music },
  { id: 'moderation', label: 'cat_moderation', icon: Shield },
];

export const mockBots: ExtendedBot[] = [
  { id: '1', name: 'Task Master', description: 'Görevleri yönetin', price: 29.99, icon: 'https://picsum.photos/seed/task/200', category: 'productivity', isNew: true, isPremium: true },
  { id: '2', name: 'GameBot Pro', description: 'Oyun sunucusu yönetimi', price: 0, icon: 'https://picsum.photos/seed/game/200', category: 'games' },
  { id: '3', name: 'CryptoAlert', description: 'Anlık fiyat takibi', price: 99.99, icon: 'https://picsum.photos/seed/crypto/200', category: 'utilities', isPremium: true },
  { id: '4', name: 'ModBot', description: 'Otomatik moderasyon', price: 49.50, icon: 'https://picsum.photos/seed/mod/200', category: 'moderation', isPremium: true },
  { id: '5', name: 'MusicFy', description: 'Yüksek kaliteli müzik', price: 19.99, icon: 'https://picsum.photos/seed/music/200', category: 'music' },
  { id: '6', name: 'NotionSync', description: 'Notion entegrasyonu', price: 35.00, icon: 'https://picsum.photos/seed/notion/200', category: 'productivity', isPremium: true },
  { id: '7', name: 'FocusFlow', description: 'Pomodoro zamanlayıcı', price: 0, icon: 'https://picsum.photos/seed/focus/200', category: 'productivity' },
  { id: '8', name: 'RPG Master', description: 'Rol yapma oyunu', price: 15.00, icon: 'https://picsum.photos/seed/rpg/200', category: 'games' },
  { id: '9', name: 'QuizKing', description: 'Bilgi yarışması botu', price: 0, icon: 'https://picsum.photos/seed/quiz/200', category: 'games' },
  { id: '10', name: 'StockBot', description: 'Borsa takibi', price: 120.00, icon: 'https://picsum.photos/seed/stock/200', category: 'finance', isPremium: true },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan_starter',
    name: 'Başlangıç',
    price: 0,
    billingPeriod: 'Aylık',
    description: 'Platformu keşfetmek isteyenler için.',
    color: 'slate',
    icon: Star,
    features: [
      '5 Kanala Kadar Bağlantı',
      'Standart Destek',
      '%20 Reklam Komisyonu',
      'Temel Botlara Erişim'
    ]
  },
  {
    id: 'plan_pro',
    name: 'Pro Üyelik',
    price: 149.90,
    billingPeriod: 'Aylık',
    description: 'Büyüyen topluluklar ve bot sahipleri için.',
    color: 'blue',
    icon: Zap,
    isPopular: true,
    features: [
      '20 Kanala Kadar Bağlantı',
      'Öncelikli Destek',
      '%10 Reklam Komisyonu',
      'Premium Botlara Erişim',
      'Detaylı İstatistikler'
    ]
  },
  {
    id: 'plan_elite',
    name: 'Elite Üyelik',
    price: 399.90,
    billingPeriod: 'Aylık',
    description: 'Maksimum kazanç ve sınırsız özellikler.',
    color: 'yellow',
    icon: Crown,
    features: [
      'Sınırsız Kanal Bağlantısı',
      '7/24 Canlı Destek',
      '%2 Reklam Komisyonu',
      'Tüm Botlar Ücretsiz',
      'Erken Erişim Özellikleri',
      'Onaylanmış Profil Rozeti'
    ]
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Ödeme Başarılı',
    message: 'Task Master botu için 29.99₺ ödemeniz başarıyla alındı.',
    date: new Date().toISOString(), // Today
    isRead: false
  },
  {
    id: '2',
    type: 'security',
    title: 'Yeni Cihaz Girişi',
    message: 'Hesabınıza yeni bir cihazdan (iPhone 13, İstanbul) giriş yapıldı.',
    date: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago (Today)
    isRead: false
  },
  {
    id: '3',
    type: 'bot',
    title: 'ModBot Güncellemesi',
    message: 'ModBot v2.1 yayında! Yeni spam filtresi özellikleri eklendi.',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    isRead: true
  },
  {
    id: '4',
    type: 'system',
    title: 'Bakım Çalışması',
    message: 'Sistemimiz bu gece 03:00 - 05:00 saatleri arasında bakıma alınacaktır.',
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    isRead: true
  },
  {
    id: '5',
    type: 'payment',
    title: 'Gelir Ödemesi',
    message: 'Haftalık bot gelirleriniz (450.50₺) cüzdanınıza aktarıldı.',
    date: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    isRead: true
  }
];
