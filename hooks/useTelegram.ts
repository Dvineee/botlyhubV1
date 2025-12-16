import { useEffect, useState } from 'react';

const tg = window.Telegram?.WebApp;

export function useTelegram() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (tg) {
            tg.ready();
            setIsReady(true);
        }
    }, []);

    const onClose = () => {
        tg?.close();
    };

    const onToggleButton = () => {
        if (tg?.MainButton.isVisible) {
            tg.MainButton.hide();
        } else {
            tg?.MainButton.show();
        }
    };

    // Titreşim (Haptic Feedback) tetikleyici
    const haptic = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.impactOccurred(style);
        }
    };

    // Başarılı/Hata titreşimi
    const notification = (type: 'error' | 'success' | 'warning') => {
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred(type);
        }
    };

    // Link açma (Native)
    const openLink = (url: string) => {
        if (url.startsWith('https://t.me') || url.startsWith('tg://')) {
            tg?.openTelegramLink(url);
        } else {
            tg?.openLink(url);
        }
    };

    return {
        tg,
        user: tg?.initDataUnsafe?.user,
        queryId: tg?.initDataUnsafe?.query_id,
        platform: tg?.platform,
        isExpanded: tg?.isExpanded,
        themeParams: tg?.themeParams,
        onClose,
        onToggleButton,
        haptic,
        notification,
        openLink,
        isReady
    };
}