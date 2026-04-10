import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import './AdminSidebar.css';

const AdminSidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="admin-sidebar">
            <div className="admin-logo">
                <h2>🛡️ Admin Panel</h2>
                <div style={{fontSize: '12px', color: '#95A5A6', marginTop: '4px'}}>{user?.username}</div>
            </div>
            <nav className="admin-nav">
                <Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>
                    <span>📊 Dashboard</span>
                </Link>
                <Link to="/admin/verifications" className={isActive('/admin/verifications')}>
                    <span>✅ Verifikasi Psikolog</span>
                </Link>
                <Link to="/admin/users" className={isActive('/admin/users')}>
                    <span>👥 Kelola User</span>
                </Link>
                <Link to="/home">
                    <span>🏠 Ke Halaman Utama</span>
                </Link>
            </nav>
            <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default AdminSidebar;
