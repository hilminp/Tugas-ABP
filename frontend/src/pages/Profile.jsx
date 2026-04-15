import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { api, STORAGE_BASE_URL } from '../lib/api';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    
    const [username, setUsername] = useState(user?.username || '');
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    
    const [loading, setLoading] = useState(false);
    const [isPaying, setIsPaying] = useState(false); // <--- Add isPaying state
    const [message, setMessage] = useState({ text: '', type: '' });
    
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

    const handleTestPayment = async () => {
        if (isPaying) return;
        setIsPaying(true);
        try {
            // Memanggil route backend yang baru saja dibuat
            const res = await api.post('/payment/token', { amount: 150000 });
            
            if (window.snap) {
                window.snap.pay(res.data.snap_token, {
                    onSuccess: function(result){ 
                        alert("Pembayaran sukses!"); 
                        console.log(result); 
                        setIsPaying(false);
                    },
                    onPending: function(result){ 
                        alert("Menunggu pembayaran!"); 
                        console.log(result); 
                        setIsPaying(false);
                    },
                    onError: function(result){ 
                        alert("Pembayaran gagal!"); 
                        console.log(result); 
                        setIsPaying(false);
                    },
                    onClose: function(){ 
                        alert('Anda menutup payment popup tanpa menyelesaikan pembayaran'); 
                        setIsPaying(false);
                    }
                });
            } else {
                setMessage({ text: 'Midtrans script belum ter-load sempurna!', type: 'error' });
                setIsPaying(false);
            }
        } catch (err) {
            setMessage({ text: "Gagal memanggil Midtrans: " + (err.response?.data?.message || err.message), type: 'error' });
            setIsPaying(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#FFF8EE' }}>
            <Sidebar />
            
            <div className="main-container" style={{ flex: 1, padding: '40px', fontFamily: "'Poppins', sans-serif" }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    
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
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                }}
                                onClick={() => fileInputRef.current.click()}
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
                            <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 600 }}>Username (@)</label>
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
                                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#F1F1F1', color: '#333', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Batal
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                style={{ flex: 2, padding: '12px', borderRadius: '8px', background: '#FF6FA3', color: '#FFF', border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
                            >
                                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>

                    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '40px 0 30px' }} />
                    
                    <div style={{ background: '#f8fbff', borderRadius: '12px', padding: '25px', border: '1px solid #e1ecf8' }}>
                        <h3 style={{ margin: '0 0 10px', color: '#1a4371', fontSize: '16px' }}>💳 Test Integrasi Midtrans</h3>
                        <p style={{ color: '#5b7c9f', fontSize: '13px', margin: '0 0 20px', lineHeight: '1.5' }}>
                            Simulasi pembayaran (Top-Up / Biaya Sesi) menggunakan Snap Midtrans. 
                            <strong>Pastikan tidak membayar menggunakan uang asli Anda sendiri secara tidak sengaja karena Anda memasukkan kunci Production!</strong>
                        </p>
                        <button 
                            onClick={handleTestPayment}
                            disabled={isPaying}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: isPaying ? '#8ca9a8' : '#356765', color: '#FFF', border: 'none', fontWeight: 600, cursor: isPaying ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            {isPaying ? (
                                <>Memproses Midtrans...</>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payments</span>
                                    Test Bayar Rp 150.000
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
