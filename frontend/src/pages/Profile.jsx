import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { api, STORAGE_BASE_URL } from '../lib/api';

const welcomeBackgroundStyle = {
    minHeight: '100vh',
    display: 'flex',
    position: 'relative',
    backgroundImage: `
        radial-gradient(circle at 10% 20%, #faece9 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, #cca2a7 0%, transparent 60%),
        radial-gradient(circle at 50% 50%, #eed4d4 0%, #dcaab2 100%)
    `
};

const welcomePatternOverlayStyle = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage: `
        repeating-radial-gradient(
            circle at 100% 50%,
            transparent 0,
            transparent 40px,
            rgba(255, 255, 255, 0.1) 40px,
            rgba(255, 255, 255, 0.1) 41px
        ),
        repeating-radial-gradient(
            circle at 100% 50%,
            transparent 0,
            transparent 80px,
            rgba(255, 255, 255, 0.05) 80px,
            rgba(255, 255, 255, 0.05) 81px
        )
    `
};

const Profile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    
    const [username, setUsername] = useState(user?.username || '');
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isCardPressed, setIsCardPressed] = useState(false);
    const [isAvatarPressed, setIsAvatarPressed] = useState(false);
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setUsername(user.username);
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setMessage({ text: 'Ukuran gambar maksimal 2MB', type: 'error' });
                return;
            }
            setProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        const formData = new FormData();
        formData.append('username', username);
        if (profileImage) {
            formData.append('profile_image', profileImage);
        }

        try {
            const res = await api.post('/profile/update', formData);
            
            setMessage({ text: res.data.message || 'Profil berhasil diupdate!', type: 'success' });
            
            if (res.data.user) {
                updateUser(res.data.user);
            }
        } catch (err) {
            setMessage({ 
                text: err.response?.data?.message || err.response?.data?.error || 'Gagal mengupdate profil.', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={welcomeBackgroundStyle}>
            <div aria-hidden="true" style={welcomePatternOverlayStyle} />
            <Sidebar />
            
            <div className="main-container" style={{ flex: 1, padding: '40px', fontFamily: "'Poppins', sans-serif", background: 'transparent', position: 'relative', zIndex: 1 }}>
                <div
                    style={{
                        maxWidth: '600px',
                        margin: '0 auto',
                        background: '#fff',
                        borderRadius: '16px',
                        padding: '40px',
                        boxShadow: isCardPressed ? '0 8px 24px rgba(136, 77, 96, 0.18)' : '0 4px 20px rgba(0,0,0,0.05)',
                        transform: isCardPressed ? 'scale(0.995)' : 'scale(1)',
                        transition: 'transform 160ms ease, box-shadow 200ms ease'
                    }}
                    onMouseDown={() => setIsCardPressed(true)}
                    onMouseUp={() => setIsCardPressed(false)}
                    onMouseLeave={() => setIsCardPressed(false)}
                    onTouchStart={() => setIsCardPressed(true)}
                    onTouchEnd={() => setIsCardPressed(false)}
                >
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', marginRight: '15px' }}>
                            ← 
                        </button>
                        <h2 style={{ margin: 0, color: '#333' }}>Edit Profil</h2>
                    </div>

                    {message.text && (
                        <div style={{ 
                            padding: '12px 16px', 
                            borderRadius: '8px', 
                            marginBottom: '20px', 
                            background: message.type === 'success' ? '#E8F5E9' : '#FFEAEE',
                            color: message.type === 'success' ? '#2E7D32' : '#C62828'
                        }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                            <div 
                                style={{ 
                                    width: '120px', 
                                    height: '120px', 
                                    borderRadius: '50%', 
                                    background: '#EEE', 
                                    overflow: 'hidden',
                                    marginBottom: '15px',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    border: '4px solid #FFF',
                                    boxShadow: isAvatarPressed ? '0 10px 26px rgba(136, 77, 96, 0.28)' : '0 4px 10px rgba(0,0,0,0.1)',
                                    transform: isAvatarPressed ? 'scale(0.96)' : 'scale(1)',
                                    transition: 'transform 140ms ease, box-shadow 200ms ease'
                                }}
                                onClick={() => fileInputRef.current.click()}
                                onMouseDown={() => setIsAvatarPressed(true)}
                                onMouseUp={() => setIsAvatarPressed(false)}
                                onMouseLeave={() => setIsAvatarPressed(false)}
                                onTouchStart={() => setIsAvatarPressed(true)}
                                onTouchEnd={() => setIsAvatarPressed(false)}
                            >
                                <img 
                                    src={previewImage || (user?.profile_image ? `${STORAGE_BASE_URL}/${user.profile_image}` : 'https://cdn-icons-png.flaticon.com/512/149/149071.png')} 
                                    alt="Profile" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#FFF', textAlign: 'center', fontSize: '12px', padding: '4px 0' }}>
                                    Ubah
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImageChange} 
                                accept="image/*" 
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 600 }}>Nama Lengkap (Sesuai KTP)</label>
                            <input 
                                type="text" 
                                value={user?.name || ''} 
                                disabled
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: '#f9f9f9', color: '#999', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                            <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>Nama asli tidak dapat diubah sendiri demi keamanan. Hubungi admin apabila ada koreksi.</small>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 600 }}>Username</label>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username unik (tanpa spasi)"
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button 
                                type="button" 
                                onClick={() => navigate('/home')}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '14px',
                                    background: '#F1F1F1',
                                    color: '#333',
                                    border: 'none',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'transform 160ms ease, box-shadow 200ms ease, background-color 200ms ease',
                                    boxShadow: '0 6px 16px rgba(0,0,0,0.06)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.background = '#ececec';
                                    e.currentTarget.style.boxShadow = '0 10px 22px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.background = '#F1F1F1';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                                }}
                                onMouseDown={(e) => {
                                    e.currentTarget.style.transform = 'scale(0.97)';
                                }}
                                onMouseUp={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                            >
                                Batal
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                style={{
                                    flex: 2,
                                    padding: '12px',
                                    borderRadius: '14px',
                                    background: loading ? '#f2a2bf' : '#FF6FA3',
                                    color: '#FFF',
                                    border: 'none',
                                    fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'transform 160ms ease, box-shadow 220ms ease, background-color 200ms ease',
                                    boxShadow: loading ? 'none' : '0 10px 24px rgba(255, 111, 163, 0.35)'
                                }}
                                onMouseEnter={(e) => {
                                    if (loading) return;
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.background = '#f95f98';
                                    e.currentTarget.style.boxShadow = '0 14px 28px rgba(255, 111, 163, 0.42)';
                                }}
                                onMouseLeave={(e) => {
                                    if (loading) return;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.background = '#FF6FA3';
                                    e.currentTarget.style.boxShadow = '0 10px 24px rgba(255, 111, 163, 0.35)';
                                }}
                                onMouseDown={(e) => {
                                    if (loading) return;
                                    e.currentTarget.style.transform = 'scale(0.97)';
                                }}
                                onMouseUp={(e) => {
                                    if (loading) return;
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                            >
                                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default Profile;
