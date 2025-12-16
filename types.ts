
export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: 'Admin' | 'User' | 'Moderator';
  status: 'Active' | 'Passive';
  badges: string[];
  joinDate: string;
  isRestricted?: boolean;
  canPublishAds?: boolean;
}

export interface Bot {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  category: string;
  isNew?: boolean;
  features?: string[];
}

export interface ExtendedBot extends Bot {
  isPremium?: boolean;
}

export interface UserBot extends Bot {
  isAdEnabled: boolean;
  isActive: boolean;
  expiryDate?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending';
  method: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface Channel {
  id: string;
  name: string;
  memberCount: number;
  icon: string;
  isAdEnabled: boolean; // Global switch for the channel
  connectedBotIds: string[];
  revenue: number;
  link?: string; // Added link for manual entry
}

// --- Admin & Logging Types ---

export interface SystemLog {
  id: string;
  timestamp: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'TRANSACTION' | 'USER_ACTION';
  message: string;
  details?: any;
}

export interface AppStats {
  totalViews: number;
  totalUsers: number;
  totalRevenue: number;
  activeBots: number;
}

// --- New Crypto & Wallet Types ---

export type ChainType = 'TON' | 'TRX' | 'BSC' | 'SOL';

export interface NetworkOption {
  id: string;
  name: string; // e.g. "Tron (TRC20)"
  protocol: string; // "TRC20"
  address: string;
  chainId?: number;
}

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  price: number; // Current market price in TRY/USD
  change24h: number; // Percentage
  color: string; // For placeholder icons
  networks: NetworkOption[];
}

export interface Wallet {
  chain: ChainType;
  address: string;
  balance: number;
  symbol: string;
  networkName: string;
  publicKey?: string;
  // Private key is never stored in plaintext in the state interface
}

export interface CryptoTransaction {
  id: string;
  type: 'Deposit' | 'Withdrawal' | 'BotEarnings';
  amount: number;
  symbol: string;
  chain: ChainType;
  toAddress?: string;
  date: string;
  status: 'Success' | 'Pending' | 'Failed' | 'Processing';
  hash: string;
}

export interface BotRevenue {
  botId: string;
  botName: string;
  icon: string;
  totalEarnings: number;
  dailyChange: number; // percentage
}

// --- Subscription Types ---
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'Aylık' | 'Yıllık';
  description: string;
  features: string[];
  color: string; // Tailwind class for border/bg accents
  icon: any; // Lucide icon
  isPopular?: boolean;
}

// --- Notification Types ---
export interface Notification {
  id: string;
  type: 'system' | 'payment' | 'security' | 'bot';
  title: string;
  message: string;
  date: string; // ISO string
  isRead: boolean;
}

// --- Telegram WebApp Types ---
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: any;
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isVersionAtLeast: (version: string) => boolean;
        
        // Methods
        ready: () => void;
        expand: () => void;
        close: () => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        showPopup: (params: any, callback?: (id: string) => void) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        onEvent: (eventType: string, eventHandler: Function) => void;
        offEvent: (eventType: string, eventHandler: Function) => void;
        
        // UI Elements
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive: boolean) => void;
          hideProgress: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          setText: (text: string) => void;
          setParams: (params: any) => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
      };
    };
  }
}
