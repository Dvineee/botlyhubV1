
import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Logger } from './services/Logger';

// Lazy Load Pages for Performance Optimization
const Home = lazy(() => import('./pages/Home'));
const UserList = lazy(() => import('./pages/UserList'));
const UserDetail = lazy(() => import('./pages/UserDetail'));
const Earnings = lazy(() => import('./pages/Earnings'));
const BotDetail = lazy(() => import('./pages/BotDetail'));
const Payment = lazy(() => import('./pages/Payment'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const MyBots = lazy(() => import('./pages/MyBots'));
const MyChannels = lazy(() => import('./pages/MyChannels'));
const Premium = lazy(() => import('./pages/Premium'));
const Notifications = lazy(() => import('./pages/Notifications'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// Loading Component
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
    <span className="text-xs font-medium">Yükleniyor...</span>
  </div>
);

// Telegram Wrapper Component
const TelegramWrapper = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Log Views
  useEffect(() => {
     Logger.incrementView();
     Logger.log('INFO', `Sayfa görüntülendi: ${location.pathname}`);
  }, [location.pathname]);

  useEffect(() => {
    // 1. Initialize Telegram WebApp Features
    const initTelegram = () => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        try {
            tg.expand();
            
            // Renk ayarları
            if (tg.setHeaderColor) tg.setHeaderColor('#020617');
            if (tg.setBackgroundColor) tg.setBackgroundColor('#020617');

            // Viewport ayarları
            const setViewport = () => {
                const vh = tg.viewportHeight || window.innerHeight;
                document.documentElement.style.setProperty('--tg-viewport-height', `${vh}px`);
            };
            
            setViewport();
            tg.onEvent('viewportChanged', setViewport);
            tg.ready();

            return () => {
                tg.offEvent('viewportChanged', setViewport);
            };
        } catch (e) {
            console.error("Telegram init error:", e);
        }
    };

    const cleanup = initTelegram();

    // Loader temizleme
    const timer = setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    }, 150);

    return () => {
        clearTimeout(timer);
        if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  // Back Button Logic
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.BackButton) return;

    // Admin sayfalarında geri butonunu farklı yönetebiliriz veya gizleyebiliriz
    const isRoot = location.pathname === '/';
    const isAdmin = location.pathname.startsWith('/admin');

    const handleBack = () => {
        if (isRoot) return;
        navigate(-1);
    };

    if (isRoot || isAdmin) {
        tg.BackButton.hide();
    } else {
        tg.BackButton.show();
        tg.BackButton.onClick(handleBack);
    }

    return () => {
        tg.BackButton.offClick(handleBack);
    };
  }, [location, navigate]);

  return (
      <div style={{ minHeight: 'var(--tg-viewport-height, 100vh)' }} className="bg-slate-950 flex flex-col">
          {children}
      </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <TelegramWrapper>
        <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col">
          <div className="max-w-md w-full mx-auto min-h-screen bg-slate-950 shadow-2xl relative flex-1 flex flex-col">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/users" element={<UserList />} />
                <Route path="/users/:id" element={<UserDetail />} />
                <Route path="/earnings" element={<Earnings />} />
                <Route path="/bot/:id" element={<BotDetail />} />
                <Route path="/payment/:id" element={<Payment />} />
                <Route path="/settings" element={<ProfileSettings />} />
                <Route path="/account-settings" element={<AccountSettings />} />
                <Route path="/my-bots" element={<MyBots />} />
                <Route path="/channels" element={<MyChannels />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/notifications" element={<Notifications />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </TelegramWrapper>
    </HashRouter>
  );
}
