
import { encryptData, decryptData } from '../security';
import { CryptoTransaction } from '../types';

// Mock Words for demo purposes. In prod, use 'bip39'.
const MNEMONIC_WORDS = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident',
    'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
    'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford'
];

// Gerçek Admin Cüzdan Adresi
const ADMIN_WALLET_ADDRESS = "UQD8ulQVVbEf01COyBRuy1RZtqCewT-bfv7SoVblZiBVuo_i";

export class WalletService {
    
    static getAdminAddress() {
        return ADMIN_WALLET_ADDRESS;
    }

    // --- Key Management ---

    static generateMnemonic(): string {
        const words = [];
        for (let i = 0; i < 12; i++) {
            words.push(MNEMONIC_WORDS[Math.floor(Math.random() * MNEMONIC_WORDS.length)]);
        }
        return words.join(' ');
    }

    static async deriveWallets(mnemonic: string) {
        // Simulating address derivation based on the seed
        const seedHash = btoa(mnemonic).substring(0, 10);
        
        return {
            TON: `EQD${seedHash}xxxTONv4`,
            BSC: `0x${seedHash}7f...3e4d`,
            TRX: `T${seedHash}rx...Address`,
            SOL: `${seedHash}Solana...Key`
        };
    }

    // --- Storage ---

    static saveWallet(mnemonic: string) {
        const encrypted = encryptData(mnemonic);
        localStorage.setItem('secure_wallet_seed', encrypted);
        localStorage.setItem('wallet_created_at', new Date().toISOString());
    }

    static getWallet() {
        const encrypted = localStorage.getItem('secure_wallet_seed');
        if (!encrypted) return null;
        return decryptData(encrypted);
    }

    static clearWallet() {
        localStorage.removeItem('secure_wallet_seed');
        localStorage.removeItem('wallet_created_at');
    }

    // --- Transaction Handling ---

    static async sendTransaction(
        chain: 'TON' | 'BSC' | 'TRX' | 'SOL', 
        toAddress: string, 
        amount: number, 
        symbol: string
    ): Promise<CryptoTransaction> {
        
        if (!this.isValidAddress(chain, toAddress)) {
            throw new Error(`Geçersiz ${chain} adresi.`);
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

        const hash = `${chain}_TX_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        return {
            id: Math.random().toString(36).substr(2, 9),
            type: 'Withdrawal',
            amount: amount,
            symbol: symbol,
            chain: chain,
            toAddress: toAddress,
            date: new Date().toISOString(),
            status: 'Processing',
            hash: hash
        };
    }

    // --- TON Connect Transaction Payload Generator ---
    static createTonTransaction(amountTON: number) {
        // Amount must be in nanotons (1 TON = 1,000,000,000 nanotons)
        const nanoTons = Math.floor(amountTON * 1000000000).toString();
        
        return {
            validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
            messages: [
                {
                    address: ADMIN_WALLET_ADDRESS,
                    amount: nanoTons,
                    // payload: '' // Optional: Add comment/payload here if needed
                }
            ]
        };
    }

    // --- Internal Payment to App (Legacy Internal Wallet) ---
    static async payToAdmin(amount: number, currency: 'TON' | 'USDT'): Promise<{ success: boolean; hash?: string; error?: string }> {
        const wallet = this.getWallet();
        if (!wallet) {
            return { success: false, error: "Cüzdan bulunamadı. Lütfen önce 'Gelirler' sayfasından cüzdan oluşturun." };
        }

        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate signing

        const hash = `${currency}_PAY_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        return { success: true, hash };
    }


    static isValidAddress(chain: string, address: string): boolean {
        if (chain === 'BSC') return address.startsWith('0x') && address.length > 10;
        if (chain === 'TON') return address.length > 10;
        if (chain === 'TRX') return address.startsWith('T') && address.length > 10;
        if (chain === 'SOL') return address.length > 10;
        return true;
    }
}
