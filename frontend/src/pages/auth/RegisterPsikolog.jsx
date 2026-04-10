import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import logoCurhatin from '../../assets/logoCurhatin.png';
import './Auth.css';

const RegisterPsikolog = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        password_confirmation: ''
    });
    const [strFile, setStrFile] = useState(null);
    const [ijazahFile, setIjazahFile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleFileChange = (e) => {
        if (e.target.name === 'str_file') setStrFile(e.target.files[0]);
        if (e.target.name === 'ijazah_file') setIjazahFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            const data = new FormData();
            data.append('email', formData.email);
            data.append('username', formData.username);
            data.append('password', formData.password);
            data.append('password_confirmation', formData.password_confirmation);
            if (strFile) data.append('str_file', strFile);
            if (ijazahFile) data.append('ijazah_file', ijazahFile);

            const res = await api.post('/register/psikolog', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            navigate('/login', { state: { message: res.data.message } });
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed.');
            if (err.response?.data?.errors) {
                const msgs = Object.values(err.response.data.errors).flat().join('\n');
                setError(msgs);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-left" style={{background: '#FDF9F0', flexDirection: 'column'}}>
                    <form className="login-form" onSubmit={handleSubmit} style={{maxHeight: '85vh', overflowY: 'auto'}}>
                        <div className="login-title">Register Psikolog</div>
                        <div className="login-subtitle" style={{textAlign: 'center', marginBottom: '16px', color: '#666', fontSize: '13px'}}>Daftar sebagai psikolog profesional</div>
                        
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
                        
                        <div className="login-label">STR Psikolog (PDF/JPG/PNG)</div>
                        <input className="file-input" type="file" name="str_file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} required />
                        
                        <div className="login-label">Ijazah (PDF/JPG/PNG)</div>
                        <input className="file-input" type="file" name="ijazah_file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} required />
                        
                        <button type="submit" className="login-button" style={{background: '#FF0B55'}} disabled={loading}>
                            {loading ? 'Mengunggah...' : 'Daftar Psikolog'}
                        </button>
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

export default RegisterPsikolog;
