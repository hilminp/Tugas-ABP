import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PaymentButton from '../components/PaymentButton';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { PSYCHOLOGIST_CATEGORIES } from '../constants/psychologistCategories';
import './Home.css';

const Home = () => {
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
                    <div className="absolute -top-24 right-8 h-72 w-72 rounded-full bg-[#c987a8]/20 blur-3xl" />
                    <div className="absolute top-1/3 -left-16 h-64 w-64 rounded-full bg-[#9f6d89]/15 blur-3xl" />
                    <div className="absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-[#7eb295]/15 blur-3xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-[#f5d7e4]/30" />
                </div>
                <div className="relative z-10">
                <form className="search" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Cari topik atau konselor..."
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
                        <div className="hero-card">
                            <div className="hero-content">
                                <h1>Bagaimana perasaanmu hari ini?</h1>
                                <p>Ruang aman untuk berbagi beban pikiran tanpa takut dihakimi. Mulai percakapan pertamamu secara anonim.</p>
                                <Link className="hero-button" to="/messages">Mulai Konsultasi</Link>
                            </div>
                            <div className="hero-pattern" />
                        </div>

                        <div className="popular-header">
                            <h2>Kategori Psikolog</h2>
                            <button type="button">Lihat Semua</button>
                        </div>
                        <div className="topic-grid">
                            {PSYCHOLOGIST_CATEGORIES.map((category) => (
                                <button key={category.value} className="topic-item" type="button">
                                    {category.label}
                                </button>
                            ))}
                        </div>

                        <div className="post-create">
                            <form onSubmit={handlePostSubmit}>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Bagikan apa yang ada di pikiranmu secara anonim..."
                                    required
                                />
                                <div className="post-actions">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImage(e.target.files[0])}
                                    />
                                    <button type="submit" disabled={loading}>
                                        {loading ? 'Memposting...' : 'Kirim Post'}
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
                                    Belum ada postingan. Jadilah yang pertama!
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="right-section">
                        <div className="side-card">
                            <div className="side-card-title">Sesi Terbaru</div>
                            <div className="session-item">
                                <div>
                                    <small>Mendatang</small>
                                    <strong>Dr. Sarah Wijaya</strong>
                                    <span>Besok, 14:00</span>
                                </div>
                            </div>
                            <div className="session-item muted">
                                <div>
                                    <small>Selesai</small>
                                    <strong>Bpk Andi Pratama</strong>
                                    <span>3 hari lalu</span>
                                </div>
                            </div>
                            <Link to="/friend-requests" className="side-link">
                                Lihat Semua Riwayat
                            </Link>
                        </div>

                        <div className="quick-return-card">
                            <h3>Pesan Kembali Cepat</h3>
                            <p>Lanjutkan progresmu dengan konselor yang sama.</p>
                            <Link to="/messages" className="quick-return-button">Pesan Sekarang</Link>
                        </div>

                        {/* Midtrans Payment Test */}
                        <div className="side-card" style={{ marginTop: '20px' }}>
                            <div className="side-card-title">Top Up Saldo (Test)</div>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                                Coba integrasi Midtrans Snap dengan isi saldo simulasi.
                            </p>
                            <PaymentButton amount={50000} />
                        </div>
                    </aside>
                </div>

                <div className="floating-action">
                    <button
                        type="button"
                        onClick={() => document.querySelector('.post-create textarea')?.focus()}
                        aria-label="Buat postingan"
                    >
                        +
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Home;
