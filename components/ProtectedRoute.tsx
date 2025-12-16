
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthService } from '../services/AuthService';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const location = useLocation();
    const isAuth = AuthService.isAuthenticated();

    if (!isAuth) {
        // Oturum yoksa Login sayfasına at, geldiği sayfayı state olarak taşı
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
