import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api, STORAGE_BASE_URL } from '../lib/api';
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
        <div className="sidebar">
            <div className="sidebar-brand" onClick={() => navigate('/home')}>
                <div className="sidebar-brand-icon">A</div>
                <div className="sidebar-brand-text">
                    <strong>Anonim</strong>
                    <span>Safe Space</span>
                </div>
            </div>

            <div className="user-section" onClick={() => navigate('/profile')}>
                <img
                    id="sidebarUserPhoto"
                    src={user?.profile_image ? `${STORAGE_BASE_URL}/${user.profile_image}` : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                    alt="User"
                />
                <span>({roleLabel})</span>
            </div>

            <nav className="sidebar-nav">
                <Link to="/home"><span>🏠</span>Beranda</Link>
                <Link to="/home"><span>📈</span>Linimasa</Link>
                <Link to="/messages"><span>💬</span>Pesan</Link>
                <Link to="/friend-requests"><span>🕒</span>Riwayat</Link>
                <Link to="/sessions"><span>📅</span>Jadwal</Link>
                {user?.is_admin && <Link to="/admin/dashboard"><span>⚙️</span>Admin Dashboard</Link>}
            </nav>

            <button className="logout-btn" onClick={handleLogout}>Keluar</button>
        </div>
    );
};

export default Sidebar;
