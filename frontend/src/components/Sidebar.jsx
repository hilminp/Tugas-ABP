import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api, STORAGE_BASE_URL } from '../lib/api';
import { 
    Home, 
    Compass, 
    MessageSquare, 
    History, 
    Calendar, 
    ShieldCheck, 
    LogOut,
    User
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const roleLabel = user?.role === 'psikolog' ? 'psikolog' : 'anonim';
    const [notifCount, setNotifCount] = React.useState(0);
    const [sessionNotifCount, setSessionNotifCount] = React.useState(0);

    React.useEffect(() => {
        if (user) {
            fetchNotifCount();
            fetchSessionNotifCount();
            const interval = setInterval(() => {
                fetchNotifCount();
                fetchSessionNotifCount();
            }, 30000); // Check every 30s
            
            const handleFriendSeen = () => setNotifCount(0);
            const handleSessionSeen = () => setSessionNotifCount(0);
            
            window.addEventListener('friendNotifSeen', handleFriendSeen);
            window.addEventListener('sessionNotifSeen', handleSessionSeen);
            
            return () => {
                clearInterval(interval);
                window.removeEventListener('friendNotifSeen', handleFriendSeen);
                window.removeEventListener('sessionNotifSeen', handleSessionSeen);
            };
        }
    }, [user]);

    const fetchNotifCount = async () => {
        try {
            const res = await api.get(`/friend-notifications?t=${new Date().getTime()}`);
            setNotifCount(res.data.count || 0);
        } catch (err) {
            console.error("Failed to fetch notif count", err);
        }
    };

    const fetchSessionNotifCount = async () => {
        try {
            const res = await api.get(`/session-notifications?t=${new Date().getTime()}`);
            setSessionNotifCount(res.data.count || 0);
        } catch (err) {
            console.error("Failed to fetch session notif count", err);
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/logout');
            logout();
            navigate('/login');
        } catch (err) {
            console.error("Logout failed", err);
            logout();
            navigate('/login');
        }
    };

    const handleHomeClick = (e) => {
        if (window.location.pathname === '/home') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
                window.location.reload();
            }, 300);
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-brand" onClick={() => navigate('/home')}>
                <div className="sidebar-brand-icon">
                    <span className="material-symbols-outlined">psychology</span>
                </div>
                <div className="sidebar-brand-text">
                    <strong>Curhatin</strong>
                    <span>Safe Space</span>
                </div>
            </div>

            <div className="user-section" onClick={() => navigate('/profile')}>
                <div className="avatar-wrapper">
                    <img
                        id="sidebarUserPhoto"
                        src={user?.profile_image ? `${STORAGE_BASE_URL}/${user.profile_image}` : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                        alt="User"
                    />
                    <div className="status-indicator"></div>
                </div>
                <div className="user-info">
                    <p className="user-name">{user?.name || 'User'}</p>
                    <span className="user-role">{roleLabel}</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <Link to="/home" className="nav-item" onClick={handleHomeClick}>
                    <Home size={20} />
                    <span>Beranda</span>
                </Link>
                <Link to="/messages" className="nav-item">
                    <MessageSquare size={20} />
                    <span>Pesan</span>
                </Link>
                <Link to="/friend-requests" className="nav-item">
                    <History size={20} />
                    <span>Riwayat</span>
                    {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
                </Link>
                <Link to="/sessions" className="nav-item">
                    <Calendar size={20} />
                    <span>Jadwal</span>
                    {sessionNotifCount > 0 && <span className="notif-badge">{sessionNotifCount}</span>}
                </Link>
                {user?.is_admin && (
                    <Link to="/admin/dashboard" className="nav-item admin-link">
                        <ShieldCheck size={20} />
                        <span>Admin Panel</span>
                    </Link>
                )}
            </nav>

            <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={18} />
                <span>Keluar</span>
            </button>
        </aside>
    );
};

export default Sidebar;
