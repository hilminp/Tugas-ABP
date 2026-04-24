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
                <Link to="/home" className="nav-item">
                    <Home size={20} />
                    <span>Beranda</span>
                </Link>
                <Link to="/home" className="nav-item">
                    <Compass size={20} />
                    <span>Linimasa</span>
                </Link>
                <Link to="/messages" className="nav-item">
                    <MessageSquare size={20} />
                    <span>Pesan</span>
                </Link>
                <Link to="/friend-requests" className="nav-item">
                    <History size={20} />
                    <span>Riwayat</span>
                </Link>
                <Link to="/sessions" className="nav-item">
                    <Calendar size={20} />
                    <span>Jadwal</span>
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
