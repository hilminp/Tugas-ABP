import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';

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
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await api.post('/register/anonim', formData);
            navigate('/login', { state: { message: res.data.message } });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Registration failed.'
            );

            if (err.response?.data?.errors) {
                const msgs = Object.values(err.response.data.errors)
                    .flat()
                    .join('\n');
                setError(msgs);
            }
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'row'
        }}>

            {/* LEFT SIDE */}
            <div style={{
                flex: 1,
                background: '#211a1b',
                display: 'flex',
                alignItems: 'center',
                padding: '60px',
                color: 'white'
            }}>
                <div style={{ maxWidth: '500px' }}>
                    <div style={{
                        marginBottom: '20px',
                        fontSize: '12px',
                        letterSpacing: '2px',
                        opacity: 0.7
                    }}>
                        BERGABUNG SEBAGAI MITRA
                    </div>

                    <h1 style={{
                        fontSize: '40px',
                        fontWeight: '800',
                        lineHeight: '1.3'
                    }}>
                        Jadilah Cahaya di Balik <br />
                        <span style={{ color: '#A46477' }}>
                            Setiap Cerita.
                        </span>
                    </h1>

                    <p style={{
                        marginTop: '20px',
                        opacity: 0.6,
                        lineHeight: '1.6'
                    }}>
                        Misi kami adalah memberikan ruang aman bagi setiap jiwa untuk berbicara.
                        Sebagai Mitra, Anda adalah pilar penyembuhan.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                background: '#fff8f8'
            }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>

                    <h2 style={{
                        fontSize: '28px',
                        fontWeight: '800',
                        marginBottom: '5px'
                    }}>
                        Register Anonim
                    </h2>

                    <p style={{
                        fontSize: '14px',
                        color: '#666',
                        marginBottom: '20px'
                    }}>
                        Lengkapi data untuk mulai
                    </p>

                    {error && (
                        <div style={{
                            background: '#ffe5e5',
                            padding: '10px',
                            borderRadius: '8px',
                            marginBottom: '15px',
                            color: 'red',
                            fontSize: '13px'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* USERNAME */}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={labelStyle}>Username</label>
                            <input
                                style={inputStyle}
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* EMAIL */}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={labelStyle}>Email</label>
                            <input
                                style={inputStyle}
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* PASSWORD */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Password</label>
                                <input
                                    style={inputStyle}
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Konfirmasi</label>
                                <input
                                    style={inputStyle}
                                    type="password"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" style={buttonStyle}>
                            Daftar →
                        </button>

                    </form>

                    <div style={{ marginTop: '15px', fontSize: '14px' }}>
                        Sudah punya akun? <Link to="/login">Masuk</Link>
                    </div>

                    <Link to="/register" style={{
                        display: 'block',
                        marginTop: '10px',
                        fontSize: '14px'
                    }}>
                        ← Pilih Role Lain
                    </Link>

                </div>
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    outline: 'none'
};

const labelStyle = {
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '5px',
    display: 'block'
};

const buttonStyle = {
    width: '100%',
    padding: '12px',
    background: '#A46477',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer'
};

export default RegisterAnonim;