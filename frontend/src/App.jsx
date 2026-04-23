import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { api } from './lib/api';
import AppLoadingScreen from './components/AppLoadingScreen';

// Pages
import Welcome from './pages/welcome/Welcome';
import Login from './pages/auth/login/Login';
import RegisterRoleSelect from './pages/auth/register/RegisterRoleSelect';
import RegisterAnonim from './pages/auth/register/RegisterAnonim';
import RegisterPsikolog from './pages/auth/register/RegisterPsikolog';
import HomeComponentSwitcher from './pages/dashboard/HomeComponentSwitcher';
import Profile from './pages/Profile';
import FriendRequests from './pages/FriendRequests';
import SearchResults from './pages/SearchResults';
import MessagesContainer from './pages/messages/MessagesContainer';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVerifications from './pages/admin/AdminVerifications';
import ConsultationSessions from './pages/ConsultationSessions';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <AppLoadingScreen progress={80} />;
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !user.is_admin) {
        return <Navigate to="/home" replace />;
    }

    return children;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterRoleSelect />} />
            <Route path="/register/anonim" element={<RegisterAnonim />} />
            <Route path="/register/psikolog" element={<RegisterPsikolog />} />

            {/* Protected User Routes */}
            <Route path="/home" element={<ProtectedRoute><HomeComponentSwitcher /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
            <Route path="/friend-requests" element={<ProtectedRoute><FriendRequests /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><MessagesContainer /></ProtectedRoute>} />
            <Route path="/messages/:id" element={<ProtectedRoute><MessagesContainer /></ProtectedRoute>} />
            <Route path="/sessions" element={<ProtectedRoute><ConsultationSessions /></ProtectedRoute>} />

            {/* Protected Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/verifications" element={<ProtectedRoute adminOnly><AdminVerifications /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    const [bootLoading, setBootLoading] = useState(true);
    const [bootProgress, setBootProgress] = useState(20);

    useEffect(() => {
        let mounted = true;

        const bootstrap = async () => {
            setBootProgress(35);
            const minDelay = new Promise((resolve) => setTimeout(resolve, 900));

            try {
                await Promise.all([
                    api.get('/status'),
                    minDelay,
                ]);
                if (mounted) setBootProgress(100);
            } catch {
                if (mounted) setBootProgress(75);
            } finally {
                if (mounted) {
                    setTimeout(() => setBootLoading(false), 250);
                }
            }
        };

        bootstrap();
        return () => {
            mounted = false;
        };
    }, []);

    if (bootLoading) {
        return <AppLoadingScreen progress={bootProgress} />;
    }

    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;