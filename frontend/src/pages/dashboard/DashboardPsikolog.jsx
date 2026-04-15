import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import '../Home.css';

const DashboardPsikolog = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [posts, setPosts] = useState([]);
    const [body, setBody] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts');
            setPosts(res.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/search?q=${searchQuery}`);
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!body.trim() && !image) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('body', body);
        if (image) {
            formData.append('image', image);
        }

        try {
            await api.post('/posts', formData);
            setBody('');
            setImage(null);
            fetchPosts(); // Refresh posts
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-layout">
            <Sidebar />
            <div className="main-container relative overflow-hidden">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-24 right-8 h-72 w-72 rounded-full bg-[#1e40af]/20 blur-3xl" />
                    <div className="absolute top-1/3 -left-16 h-64 w-64 rounded-full bg-[#3b82f6]/15 blur-3xl" />
                    <div className="absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-[#0ea5e9]/15 blur-3xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-[#e0f2fe]/30" />
                </div>
                <div className="relative z-10">
                <form className="search" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Cari keluhan atau curhatan pengguna..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                {user?.is_suspended && (
                    <div className="suspend-alert">
                        <strong>Akun Anda saat ini disuspend oleh admin.</strong>
                        <div className="suspend-reason">Alasan: {user.suspended_reason || 'Tidak ada keterangan'}</div>
                        <div className="suspend-help">Jika Anda merasa ini keliru silakan hubungi admin.</div>
                    </div>
                )}

                <div className="home-grid">
                    <section className="feed-section">
                        <div className="hero-card" style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
                            <div className="hero-content">
                                <h1>Dashboard Psikolog</h1>
                                <p>Selamat datang di ruang kerja Anda. Jadilah pendengar yang baik dan bantu mereka menemukan ketenangan.</p>
                                <Link className="hero-button" style={{ color: '#1e40af' }} to="/messages">Lihat Pesan Klien</Link>
                            </div>
                            <div className="hero-pattern" />
                        </div>

                        <div className="post-create mt-8">
                            <form onSubmit={handlePostSubmit}>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Bagikan tips atau artikel seputar kesehatan mental..."
                                    required
                                />
                                <div className="post-actions">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImage(e.target.files[0])}
                                    />
                                    <button type="submit" disabled={loading} style={{ background: '#1e40af' }}>
                                        {loading ? 'Memposting...' : 'Bagikan Edukasi'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="post-list">
                            {posts.map((post) => (
                                <div className="post" key={post.id}>
                                    <div className="post-author">
                                        {post.user?.profile_image ? (
                                            <img src={`http://localhost:8000/storage/${post.user.profile_image}`} alt={post.user.name} />
                                        ) : (
                                            <div className="post-fallback-avatar">
                                                {post.user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <strong>{post.user?.name}</strong>
                                            {post.user?.username && post.user?.username !== 'anonim' && <div className="post-username">@{post.user?.username}</div>}
                                        </div>
                                    </div>
                                    <p className="post-body">{post.body}</p>
                                    {post.image && (
                                        <img className="post-image" src={`http://localhost:8000/storage/${post.image}`} alt="Post attachment" />
                                    )}
                                </div>
                            ))}
                            {posts.length === 0 && (
                                <div className="empty-posts">
                                    Belum ada postingan dari pengguna.
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="right-section">
                        <div className="side-card">
                            <div className="side-card-title">Jadwal Anda</div>
                            <div className="session-item">
                                <div>
                                    <small>Mendatang</small>
                                    <strong>Konsultasi Anonim</strong>
                                    <span>Besok, 14:00</span>
                                </div>
                            </div>
                            <div className="session-item muted">
                                <div>
                                    <small>Selesai</small>
                                    <strong>Konsultasi Keluarga</strong>
                                    <span>3 hari lalu</span>
                                </div>
                            </div>
                            <Link to="/friend-requests" className="side-link">
                                Kelola Jadwal
                            </Link>
                        </div>
                    </aside>
                </div>

                <div className="floating-action">
                    <button
                        type="button"
                        onClick={() => document.querySelector('.post-create textarea')?.focus()}
                        aria-label="Buat postingan"
                        style={{ background: '#1e40af' }}
                    >
                        +
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
};

export default DashboardPsikolog;
