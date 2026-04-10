import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import './Home.css';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/search?q=${searchQuery}`);
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div className="main-container" style={{flex: 1}}>
                <form className="search" onSubmit={handleSearch}>
                    <input 
                        type="text" 
                        placeholder="search user" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                {user?.is_suspended && (
                    <div style={{padding:'12px', borderRadius:'8px', background:'#ffecec', color:'#7a1414', marginBottom:'12px'}}>
                        <strong>Akun Anda saat ini disuspend oleh admin.</strong>
                        <div style={{marginTop:'6px'}}>Alasan: {user.suspended_reason || 'Tidak ada keterangan'}</div>
                        <div style={{marginTop:'8px', color:'#333', fontSize:'13px'}}>Jika Anda merasa ini keliru silakan hubungi admin.</div>
                    </div>
                )}

                <div className="feed">
                    <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'12px'}}>
                        <Link to="/friend-requests" style={{background:'#FF6FA3', color:'#fff', padding:'8px 12px', borderRadius:'8px', textDecoration:'none'}}>
                            Friend Requests
                        </Link>
                    </div>

                    {user?.role === 'anonim' && (
                        <div style={{background:'#FFF9E6', padding:'16px', borderRadius:'12px', border:'2px solid #FFD966', marginBottom:'16px'}}>
                            <strong style={{color:'#996515'}}>ℹ️ Informasi</strong>
                            <p style={{marginTop:'8px', color:'#666'}}>Sebagai pengguna anonim, Anda tidak dapat membuat posting. Anda dapat melihat posting dari pengguna lain dan mengirim pesan ke teman.</p>
                        </div>
                    )}

                    <div className="post">
                        <div className="post-author">AMANDA</div>
                        <div>Semangat semuanya!!!!! buat yang mau curhat boleh request ke aku yah jangan di pendem sendiri :&gt;</div>
                    </div>
                    <div className="post">
                        <div className="post-author">Melinda</div>
                        <div>Aku bisa loh jadi temen curhat kamu jangan malu malu, buat request ke aku yahhh</div>
                    </div>
                    <div className="post">
                        <div className="post-author">Melinda</div>
                        <div>Kamu ngerasa gelisah ?? Sini curhatin ke aku aja aku bakalan jadi temen curhat kamu yang bisa jadi pendengar yang baik loh</div>
                        <img src="https://img.freepik.com/free-photo/back-view-kid-walking-school-corridor_23-2149741162.jpg" alt="Curhat" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
