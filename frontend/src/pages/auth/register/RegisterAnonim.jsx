import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import logoCurhatin from '../../../assets/logoCurhatin.png';
import '../login/Auth.css';

const RegisterAnonim = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        password_confirmation: ''
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await api.post('/register/anonim', formData);
            navigate('/login', { state: { message: res.data.message } });
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed.');
            if (err.response?.data?.errors) {
                const msgs = Object.values(err.response.data.errors).flat().join('\n');
                setError(msgs);
            }
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-left" style={{background: '#FDF9F0', flexDirection: 'column'}}>
                    <form className="login-form" onSubmit={handleSubmit} style={{maxHeight: '85vh', overflowY: 'auto'}}>
                        <div className="login-title">Register Anonim</div>
                        <div className="login-subtitle" style={{textAlign: 'center', marginBottom: '16px', color: '#666', fontSize: '13px'}}>Daftar sebagai pengguna anonim</div>
                        
                        {error && (
                            <div style={{ background: '#ffebee', padding: '12px', borderRadius: '8px', marginBottom: '12px', color: '#c62828', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                                {error}
                            </div>
                        )}
                        
                        <div className="login-label">Email</div>
                        <input className="login-input" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@contoh.com" required />
                        
                        <div className="login-label">Username</div>
                        <input className="login-input" type="text" name="username" value={formData.username} onChange={handleChange} placeholder="username" required />
                        
                        <div className="login-label">Password</div>
                        <input className="login-input" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="password" required />
                        
                        <div className="login-label">Konfirmasi Password</div>
                        <input className="login-input" type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} placeholder="konfirmasi password" required />
                        
                        <button type="submit" className="login-button" style={{background: '#FF0B55'}}>Daftar Anonim</button>
                        <Link to="/register" className="login-back">← Pilih Role Lain</Link>
                    </form>
                </div>
                <div className="login-right" style={{background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div className="login-logo-box">
                        <div className="login-logo-shape">
                            <img src={logoCurhatin} alt="Curhatin Logo" className="login-logo-image" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterAnonim;
