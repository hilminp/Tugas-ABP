import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api, STORAGE_BASE_URL } from '../lib/api';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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
            <div className="user-section" onClick={() => navigate('/profile')}>
                <div className="user-section-content">
                    <img 
                        id="sidebarUserPhoto" 
                        src={user?.profile_image ? `${STORAGE_BASE_URL}/${user.profile_image}` : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                        alt="User" 
                    />
                    <span>{user?.username || 'USER'}</span>
                </div>
            </div>
            
            <nav className="sidebar-nav">
                <Link to="/home"><span>🏠</span>&nbsp; Home</Link>
                <Link to="/messages"><span>💬</span>&nbsp; Masagge</Link>
                <Link to="#"><span>📝</span>&nbsp; Posting</Link>
                <Link to="#"><span>✉️</span>&nbsp; Email</Link>
                {user?.is_admin && <Link to="/admin/dashboard" style={{color: '#BE5985'}}><span>⚙️</span>&nbsp; Admin Dashboard</Link>}
            </nav>
            
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Sidebar;
