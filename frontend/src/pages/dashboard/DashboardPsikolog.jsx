import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api, STORAGE_BASE_URL } from '../../lib/api';
import '../Home.css';

const DashboardPsikolog = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [commentInputs, setCommentInputs] = useState({});
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [likingPostId, setLikingPostId] = useState(null);
    const [requestActionLoadingId, setRequestActionLoadingId] = useState(null);
    const [submittingCommentId, setSubmittingCommentId] = useState(null);
    const [statusModal, setStatusModal] = useState({ isOpen: false, type: '', message: '' });

    const psychologistName = user?.name || user?.username || 'Psikolog';
    const psychologistSpecialty = user?.spesialisasi || 'Spesialis Klinis';
    const profileImageUrl = user?.profile_image
        ? `${STORAGE_BASE_URL}/${user.profile_image}`
        : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

    useEffect(() => {
        fetchPosts();
        fetchIncomingRequests();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts');
            setPosts(res.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const fetchIncomingRequests = async () => {
        try {
            const res = await api.get('/friend-requests');
            setIncomingRequests(res.data?.requests || []);
        } catch (error) {
            console.error('Error fetching incoming requests:', error);
        }
    };

    const handleLike = async (postId) => {
        if (likingPostId === postId) return;

        setLikingPostId(postId);
        try {
            await api.post(`/posts/${postId}/like`);
            await fetchPosts();
        } catch (error) {
            setStatusModal({ isOpen: true, type: 'error', message: error.response?.data?.message || 'Gagal menyukai post.' });
        } finally {
            setLikingPostId(null);
        }
    };

    const submitComment = async (e, postId) => {
        e.preventDefault();

        const content = commentInputs[postId]?.trim();
        if (!content || submittingCommentId === postId) return;

        setSubmittingCommentId(postId);
        try {
            await api.post(`/posts/${postId}/comment`, { content });
            setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
            await fetchPosts();
        } catch (error) {
            setStatusModal({ isOpen: true, type: 'error', message: error.response?.data?.message || 'Gagal menambahkan komentar.' });
        } finally {
            setSubmittingCommentId(null);
        }
    };

    const handleAcceptRequest = async (requesterId) => {
        setRequestActionLoadingId(requesterId);
        try {
            const res = await api.post(`/friend/${requesterId}/accept`);
            setStatusModal({ isOpen: true, type: 'success', message: res.data?.message || 'Pasien berhasil diterima.' });
            fetchIncomingRequests();
        } catch (error) {
            setStatusModal({ isOpen: true, type: 'error', message: error.response?.data?.message || 'Gagal menerima pasien.' });
        } finally {
            setRequestActionLoadingId(null);
        }
    };

    const handleRejectRequest = async (requesterId) => {
        setRequestActionLoadingId(requesterId);
        try {
            const res = await api.post(`/friend/${requesterId}/reject`);
            setStatusModal({ isOpen: true, type: 'info', message: res.data?.message || 'Permintaan pasien ditolak.' });
            fetchIncomingRequests();
        } catch (error) {
            setStatusModal({ isOpen: true, type: 'error', message: error.response?.data?.message || 'Gagal menolak pasien.' });
        } finally {
            setRequestActionLoadingId(null);
        }
    };

    const formatPostMeta = (post) => {
        const topic = post.topic || post.category || 'Kesehatan Mental';
        const createdAt = post.created_at ? new Date(post.created_at) : null;
        const now = new Date();
        let timeLabel = 'baru saja';

        if (createdAt && !Number.isNaN(createdAt.getTime())) {
            const diffHours = Math.max(1, Math.floor((now - createdAt) / (1000 * 60 * 60)));
            timeLabel = `${diffHours} jam yang lalu`;
        }

        return `${timeLabel} • ${topic}`;
    };

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            logout();
            navigate('/login');
        }
    };

    return (
        <div className="bg-gradient-to-br from-[#fff9fc] via-[#ffeaf3] to-[#ffd6e8] text-on-background min-h-screen flex">
            <aside className="hidden md:flex flex-col h-screen w-64 border-r border-stone-200 bg-stone-50 py-6 px-4 sticky top-0">
                <div className="mb-10 px-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">psychology</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-[#A46477]">Curhatin</h1>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-stone-500">Panel Psikolog</p>
                    </div>
                </div>
                <nav className="flex-1 space-y-2">
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#A46477] bg-[#A46477]/10 font-bold border-r-4 border-[#A46477] transition-all" to="/home">
                        <span className="material-symbols-outlined">home</span>
                        <span className="font-['Plus_Jakarta_Sans'] font-medium">Beranda</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors active:scale-95 duration-150" to="/messages">
                        <span className="material-symbols-outlined">chat_bubble</span>
                        <span className="font-['Plus_Jakarta_Sans'] font-medium">Antrean Chat</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors active:scale-95 duration-150" to="/friend-requests">
                        <span className="material-symbols-outlined">history</span>
                        <span className="font-['Plus_Jakarta_Sans'] font-medium">Riwayat</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors active:scale-95 duration-150" to="/profile">
                        <span className="material-symbols-outlined">person</span>
                        <span className="font-['Plus_Jakarta_Sans'] font-medium">Profil</span>
                    </Link>
                </nav>
                <div className="mt-auto">
                    <button className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                        Mulai Sesi Baru
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full mt-3 py-3 bg-white text-[#A46477] border border-[#e7c6d1] rounded-xl font-semibold hover:bg-[#fff3f7] transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Keluar
                    </button>
                    <div className="mt-6 flex items-center gap-3 px-2">
                        <img
                            alt="Psychologist Profile Avatar"
                            className="w-10 h-10 rounded-full object-cover border-2 border-primary-container"
                            src={profileImageUrl}
                        />
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">{psychologistName}</p>
                            <p className="text-xs text-stone-500">{psychologistSpecialty}</p>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 w-full flex justify-between items-center px-6 h-16 bg-white/80 backdrop-blur-md border-b border-stone-200 shadow-sm z-40">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-[#A46477] font-headline">Beranda</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-stone-600 hover:text-[#A46477] transition-all active:opacity-80" type="button">
                                <span className="material-symbols-outlined">notifications</span>
                                {incomingRequests.length > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#ef4444] text-white text-[10px] font-bold inline-flex items-center justify-center">
                                        {incomingRequests.length}
                                    </span>
                                )}
                            </button>
                            <div className="h-8 w-[1px] bg-stone-200 mx-2" />
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-stone-700 hidden sm:block">{psychologistName}</span>
                                <img alt="Psychologist Avatar" className="w-8 h-8 rounded-full object-cover" src={profileImageUrl} />
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8 space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-on-surface">Linimasa</h3>
                                <div className="flex gap-2">
                                    <button className="px-4 py-1.5 text-xs font-bold bg-primary text-white rounded-full" type="button">Terbaru</button>
                                    <button className="px-4 py-1.5 text-xs font-medium text-stone-500 hover:bg-stone-100 rounded-full transition-colors" type="button">Populer</button>
                                </div>
                            </div>

                            {posts.map((post) => (
                                <article key={post.id} className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm hover:border-primary-container/50 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_outline</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-on-surface">{post.user?.name || 'Anonim'}</p>
                                                <p className="text-xs text-stone-500">{formatPostMeta(post)}</p>
                                            </div>
                                        </div>
                                        <button className="text-stone-400 hover:text-primary" type="button">
                                            <span className="material-symbols-outlined">more_horiz</span>
                                        </button>
                                    </div>
                                    <p className="text-on-surface-variant leading-relaxed mb-4">{post.body}</p>
                                    {post.image && (
                                        <img className="w-full h-64 object-cover rounded-lg mb-4" src={`${STORAGE_BASE_URL}/${post.image}`} alt="Post attachment" />
                                    )}
                                    <div className="post-feedback-bar border-t border-stone-100">
                                        <button
                                            className={`post-like-icon ${Boolean(post.is_liked) ? 'liked' : ''}`}
                                            type="button"
                                            onClick={() => handleLike(post.id)}
                                            disabled={likingPostId === post.id}
                                            aria-label="Like post"
                                        >
                                            <span aria-hidden="true">&#9829;</span>
                                        </button>
                                        <p className="post-like-count">
                                            {post.likes_count ?? post.likes?.length ?? 0} suka
                                        </p>
                                        {Array.isArray(post.comments) && post.comments.length > 0 && (
                                            <div className="post-comment-list">
                                                {post.comments.map((comment) => (
                                                    <p key={comment.id} className="post-comment-row">
                                                        <strong>{comment.user?.name || 'User'}</strong>
                                                        : {comment.content}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <form className="post-comment-inline" onSubmit={(e) => submitComment(e, post.id)}>
                                        <input
                                            type="text"
                                            value={commentInputs[post.id] || ''}
                                            onChange={(e) =>
                                                setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                                            }
                                            placeholder="Tulis komentar..."
                                        />
                                        <button
                                            type="submit"
                                            disabled={submittingCommentId === post.id}
                                        >
                                            {submittingCommentId === post.id ? 'Mengirim...' : 'Kirim'}
                                        </button>
                                    </form>
                                </article>
                            ))}

                            {posts.length === 0 ? (
                                <div className="bg-white border border-stone-200 rounded-xl p-8 text-center text-stone-500">
                                    Belum ada linimasa pengguna saat ini.
                                </div>
                            ) : null}
                        </div>

                        <aside className="lg:col-span-4 space-y-6">
                            <section className="bg-white border border-[#edd8e3] rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-[#7a4d62] uppercase tracking-wider">Permintaan Pasien</h3>
                                    <span className="text-xs text-[#a77990]">{incomingRequests.length} menunggu</span>
                                </div>
                                {incomingRequests.length === 0 ? (
                                    <p className="text-sm text-stone-500">Belum ada permintaan pasien baru.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {incomingRequests.slice(0, 4).map((request) => (
                                            <div key={request.id} className="border border-[#f0dde7] rounded-xl p-3">
                                                <p className="text-sm font-semibold text-[#3f2f38]">
                                                    {request.requester?.name || 'Pasien Anonim'}
                                                </p>
                                                <p className="text-xs text-stone-500 mb-3">
                                                    (anonim)
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAcceptRequest(request.user_id)}
                                                        disabled={requestActionLoadingId === request.user_id}
                                                        className="flex-1 py-2 rounded-lg text-xs font-bold bg-[#22c55e] text-white hover:opacity-90 disabled:opacity-70"
                                                    >
                                                        Terima
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRejectRequest(request.user_id)}
                                                        disabled={requestActionLoadingId === request.user_id}
                                                        className="flex-1 py-2 rounded-lg text-xs font-bold bg-stone-200 text-stone-700 hover:bg-stone-300 disabled:opacity-70"
                                                    >
                                                        Tolak
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <Link to="/friend-requests" className="inline-flex text-sm font-semibold text-[#7a4d62] hover:underline">
                                            Lihat semua permintaan
                                        </Link>
                                    </div>
                                )}
                            </section>

                            <section className="bg-[#A46477] text-white rounded-2xl p-6 shadow-xl shadow-primary/20">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-2xl">forum</span>
                                        <h3 className="text-lg font-bold">Antrean Chat</h3>
                                    </div>
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">LANGSUNG</span>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4 border border-white/10 mb-4">
                                    <p className="text-sm text-white/80 mb-1">Sesi Menunggu</p>
                                    <p className="text-4xl font-black">12</p>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                        <span>Rata-rata tunggu: 5 menit</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                            <span className="text-sm font-medium">Budi Santoso</span>
                                        </div>
                                        <button type="button" className="text-xs font-bold underline">Mulai</button>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 opacity-80">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                                            <span className="text-sm font-medium">Linda W.</span>
                                        </div>
                                        <span className="text-[10px]">2m lalu</span>
                                    </div>
                                </div>
                                <button className="w-full mt-6 py-3 bg-white text-[#A46477] rounded-xl font-bold hover:bg-stone-100 transition-colors active:scale-95">
                                    Buka Panel Konsultasi
                                </button>
                            </section>

                            <section className="bg-[#e9f5f1] border border-[#c4e4d9] rounded-2xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-[#4a7c6b] uppercase tracking-widest mb-4">Statistik Hari Ini</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/60 rounded-xl border border-white/40">
                                        <p className="text-xs text-[#5a8d7c] mb-1">Selesai</p>
                                        <p className="text-xl font-bold text-[#204a3c]">18</p>
                                    </div>
                                    <div className="p-4 bg-white/60 rounded-xl border border-white/40">
                                        <p className="text-xs text-[#5a8d7c] mb-1">Rating</p>
                                        <div className="flex items-center gap-1">
                                            <p className="text-xl font-bold text-[#204a3c]">4.9</p>
                                            <span className="material-symbols-outlined text-yellow-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-[#f2f0f9] border border-[#dad6eb] rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-[#4a457c]">Janji Terjadwal</h3>
                                    <button type="button" className="text-[#6359c1] text-xs font-bold">Lihat Semua</button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-4 items-start">
                                        <div className="flex flex-col items-center justify-center bg-[#6359c1]/10 text-[#6359c1] w-12 h-12 rounded-lg border border-[#6359c1]/20">
                                            <span className="text-xs font-bold">14</span>
                                            <span className="text-[10px] uppercase">Okt</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#2a2651] leading-none">Konsultasi Depresi</p>
                                            <p className="text-xs text-[#6b6699] mt-1">15:00 - 16:00 • Video Call</p>
                                            <p className="text-xs font-medium text-[#4a457c] mt-0.5">Andi Wijaya</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="flex flex-col items-center justify-center bg-white/60 text-[#6b6699] w-12 h-12 rounded-lg border border-stone-200">
                                            <span className="text-xs font-bold">15</span>
                                            <span className="text-[10px] uppercase">Okt</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#2a2651] leading-none">Terapi Kecemasan</p>
                                            <p className="text-xs text-[#6b6699] mt-1">10:00 - 11:00 • Chat</p>
                                            <p className="text-xs font-medium text-[#4a457c] mt-0.5">Siska Putri</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>
                </main>
            </div>

            {statusModal.isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setStatusModal({ isOpen: false, type: '', message: '' })} />
                    <div className="relative bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col items-center text-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner
                            ${statusModal.type === 'success' ? 'bg-emerald-100 text-emerald-600'
                            : statusModal.type === 'error' ? 'bg-red-100 text-red-600'
                            : statusModal.type === 'warning' ? 'bg-amber-100 text-amber-600'
                            : 'bg-blue-100 text-blue-600'}`}>
                            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {statusModal.type === 'success' ? 'check_circle'
                                    : statusModal.type === 'error' ? 'cancel'
                                    : statusModal.type === 'warning' ? 'pending_actions'
                                    : 'info'}
                            </span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                            {statusModal.type === 'success' ? 'Berhasil!'
                                : statusModal.type === 'error' ? 'Gagal'
                                : statusModal.type === 'warning' ? 'Menunggu'
                                : 'Informasi'}
                        </h3>
                        <p className="text-slate-500 mb-8 font-medium leading-relaxed">{statusModal.message}</p>
                        <button
                            onClick={() => setStatusModal({ isOpen: false, type: '', message: '' })}
                            className="w-full py-3.5 rounded-full font-bold text-white shadow-lg transition-all hover:-translate-y-1 active:scale-95"
                            style={{
                                backgroundColor: statusModal.type === 'success' ? '#10b981' : statusModal.type === 'error' ? '#ef4444' : statusModal.type === 'warning' ? '#f59e0b' : '#3b82f6',
                                boxShadow: `0 10px 15px -3px ${statusModal.type === 'success' ? 'rgba(16,185,129,0.3)' : statusModal.type === 'error' ? 'rgba(239,68,68,0.3)' : statusModal.type === 'warning' ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'}`,
                            }}
                        >
                            Mengerti
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPsikolog;
