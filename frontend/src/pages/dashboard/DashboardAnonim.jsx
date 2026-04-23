import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { api, STORAGE_BASE_URL } from '../../lib/api';
import { PSYCHOLOGIST_CATEGORIES } from '../../constants/psychologistCategories';
import '../Home.css';

const CATEGORY_ICONS = {
    kesehatan_mental: 'psychology',
    kecemasan_stres: 'self_improvement',
    hubungan_percintaan: 'favorite',
    keluarga: 'groups',
    sosial_pertemanan: 'diversity_3',
};

/* ─── Inline styles untuk komponen like & komentar ─── */
const S = {
    feedbackBar: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 0 4px',
        borderTop: '1px solid #f3e6ec',
    },
    likeBtn: (liked) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: liked ? '#fff0f0' : 'transparent',
        border: liked ? '1px solid #f87171' : '1px solid #e8e0e4',
        borderRadius: '999px',
        padding: '5px 14px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        color: liked ? '#e53e3e' : '#8a7480',
        transition: 'all 0.18s ease',
    }),
    heartSvg: (liked) => ({
        width: '15px',
        height: '15px',
        fill: liked ? '#e53e3e' : 'none',
        stroke: liked ? '#e53e3e' : '#8a7480',
        strokeWidth: '2',
        transition: 'all 0.18s ease',
    }),
    commentCountChip: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '13px',
        color: '#8a7480',
        padding: '5px 12px',
        background: 'transparent',
        border: '1px solid #e8e0e4',
        borderRadius: '999px',
        cursor: 'default',
        userSelect: 'none',
    },
    commentList: {
        marginTop: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    commentBubble: {
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start',
    },
    commentAvatar: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #e8a0ba 0%, #9f6d89 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: '600',
        color: '#fff',
        flexShrink: 0,
        marginTop: '1px',
    },
    commentContent: {
        background: '#f8f0f4',
        borderRadius: '12px 12px 12px 3px',
        padding: '7px 12px',
        maxWidth: 'calc(100% - 40px)',
    },
    commentName: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#7a3d5c',
        marginBottom: '2px',
    },
    commentText: {
        fontSize: '13px',
        color: '#3d2535',
        lineHeight: '1.5',
        margin: 0,
    },
    commentInputWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '10px',
        background: '#fdf5f8',
        border: '1px solid #edd5e3',
        borderRadius: '999px',
        padding: '4px 4px 4px 14px',
        transition: 'border-color 0.2s',
    },
    commentInput: {
        flex: 1,
        background: 'none',
        border: 'none',
        outline: 'none',
        fontSize: '13px',
        color: '#3d2535',
        padding: '6px 0',
    },
    sendBtn: (submitting) => ({
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: submitting ? '#ccc' : 'linear-gradient(135deg, #db7391 0%, #9f4f72 100%)',
        border: 'none',
        cursor: submitting ? 'wait' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.18s ease',
    }),
};

const DashboardAnonim = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [posts, setPosts] = useState([]);
    const [commentInputs, setCommentInputs] = useState({});
    const [body, setBody] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [likingPostId, setLikingPostId] = useState(null);
    const [submittingCommentId, setSubmittingCommentId] = useState(null);
    const [isPaying, setIsPaying] = useState(false);
    const [statusModal, setStatusModal] = useState({ isOpen: false, type: '', message: '' });
    const [selectedCategory, setSelectedCategory] = useState('');
    const [psychologists, setPsychologists] = useState([]);
    const [psychologistTotal, setPsychologistTotal] = useState(0);
    const [psychologistLoading, setPsychologistLoading] = useState(false);
    const [loadingMorePsychologists, setLoadingMorePsychologists] = useState(false);
    const [psychologistError, setPsychologistError] = useState('');
    const [hasMorePsychologists, setHasMorePsychologists] = useState(false);
    const [hasSelectedCategory, setHasSelectedCategory] = useState(false);
    const [sendingRequestId, setSendingRequestId] = useState(null);
    const [requestedPsychologistIds, setRequestedPsychologistIds] = useState([]);
    const [psychologistStatuses, setPsychologistStatuses] = useState({});
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, psychologistId: null, psychologistName: '' });
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    useEffect(() => {
        fetchPosts();
        fetchPsychologistStatuses();
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
        if (image) formData.append('image', image);

        try {
            await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setBody('');
            setImage(null);
            await fetchPosts();
        } catch (error) {
            setStatusModal({ isOpen: true, type: 'error', message: error.response?.data?.message || 'Gagal membuat postingan.' });
        } finally {
            setLoading(false);
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

    const submitComment = async (postId) => {
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

    const handleUpgradePremium = async () => {
        if (isPaying) return;
        setIsPaying(true);
        try {
            const res = await api.post('/payment/token', { amount: 15000 });
            if (window.snap) {
                window.snap.pay(res.data.snap_token, {
                    onSuccess: async function (result) {
                        setStatusModal({ isOpen: true, type: 'success', message: 'Pembayaran sukses! Akun Anda kini Premium.' });
                        try {
                            const successRes = await api.post('/payment/success');
                            if (successRes.data.user) updateUser(successRes.data.user);
                        } catch (e) { console.error('Gagal update status premium', e); }
                        setIsPaying(false);
                    },
                    onPending: function () { setStatusModal({ isOpen: true, type: 'warning', message: 'Menunggu konfirmasi pembayaran.' }); setIsPaying(false); },
                    onError: function () { setStatusModal({ isOpen: true, type: 'error', message: 'Transaksi pembayaran Anda gagal diproses.' }); setIsPaying(false); },
                    onClose: function () { setStatusModal({ isOpen: true, type: 'info', message: 'Anda menutup jendela pembayaran tanpa menyelesaikan transaksi.' }); setIsPaying(false); },
                });
            } else {
                setStatusModal({ isOpen: true, type: 'error', message: 'Sistem pembayaran belum termuat sempurna. Coba lagi.' });
                setIsPaying(false);
            }
        } catch (err) {
            setStatusModal({ isOpen: true, type: 'error', message: 'Gagal memanggil sistem pembayaran: ' + (err.response?.data?.message || err.message) });
            setIsPaying(false);
        }
    };

    const fetchPsychologists = async (category = '', loadMore = false) => {
        const limit = 6;
        const nextOffset = loadMore ? psychologists.length : 0;
        if (loadMore) setLoadingMorePsychologists(true);
        else { setPsychologistLoading(true); setPsychologistError(''); }

        try {
            const res = await api.get('/psychologists', { params: { category: category || undefined, limit, offset: nextOffset } });
            console.log('Psychologists fetched:', res.data.data); // Debug
            const newData = Array.isArray(res.data?.data) ? res.data.data : [];
            setPsychologists((prev) => (loadMore ? [...prev, ...newData] : newData));
            setPsychologistTotal(Number(res.data?.total || 0));
            setHasMorePsychologists(Boolean(res.data?.has_more));
        } catch (error) {
            console.error('Error fetching psychologists:', error);
            if (!loadMore) { setPsychologistError('Gagal memuat data psikolog. Coba lagi.'); setPsychologists([]); setPsychologistTotal(0); setHasMorePsychologists(false); }
        } finally {
            setPsychologistLoading(false);
            setLoadingMorePsychologists(false);
        }
    };

    const fetchPsychologistStatuses = async () => {
        try {
            const res = await api.get('/friend-statuses/psychologists');
            const statuses = res.data?.statuses || {};
            setPsychologistStatuses(statuses);
            const pendingIds = Object.entries(statuses).filter(([, status]) => status === 'pending').map(([id]) => Number(id));
            setRequestedPsychologistIds(pendingIds);
        } catch (error) {
            console.error('Error fetching psychologist statuses:', error);
        }
    };

    const handleCategoryClick = (categoryValue) => {
        const nextCategory = selectedCategory === categoryValue ? '' : categoryValue;
        setSelectedCategory(nextCategory);
        setHasSelectedCategory(Boolean(nextCategory));
        fetchPsychologists(nextCategory, false);
    };

    const selectedCategoryLabel = selectedCategory
        ? PSYCHOLOGIST_CATEGORIES.find((c) => c.value === selectedCategory)?.label || selectedCategory
        : 'Semua Kategori';

    const handleAddPsychologist = async (psychologistId) => {
        if (!user?.is_premium) { handleUpgradePremium(); return; }
        if (sendingRequestId) return;
        setSendingRequestId(psychologistId);
        try {
            const res = await api.post(`/friend/${psychologistId}`, { category: selectedCategory });
            setStatusModal({ isOpen: true, type: 'success', message: res.data?.message || 'Permintaan konsultasi terkirim.' });
            setRequestedPsychologistIds((prev) => (prev.includes(psychologistId) ? prev : [...prev, psychologistId]));
            setPsychologistStatuses((prev) => ({ ...prev, [psychologistId]: 'pending' }));
        } catch (error) {
            setStatusModal({ isOpen: true, type: 'error', message: error.response?.data?.message || 'Gagal mengirim permintaan ke psikolog.' });
        } finally {
            setSendingRequestId(null);
        }
    };

    const handleOpenFeedback = (psychologist) => {
        setFeedbackModal({
            isOpen: true,
            psychologistId: psychologist.id,
            psychologistName: psychologist.name
        });
        setFeedbackRating(5);
        setFeedbackComment('');
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        setSubmittingFeedback(true);
        try {
            await api.post(`/psychologists/${feedbackModal.psychologistId}/reviews`, {
                rating: feedbackRating,
                comment: feedbackComment,
                is_anonymous: true
            });
            setFeedbackModal({ isOpen: false, psychologistId: null, psychologistName: '' });
            setStatusModal({ isOpen: true, type: 'success', message: 'Terima kasih atas feedback Anda!' });
            fetchPsychologists(selectedCategory, false);
        } catch (error) {
            setStatusModal({ isOpen: true, type: 'error', message: error.response?.data?.message || 'Gagal mengirim feedback.' });
        } finally {
            setSubmittingFeedback(false);
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
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                        <Link className="hero-button" to="/messages">Mulai Konsultasi</Link>
                                        {!user?.is_premium && (
                                            <button
                                                onClick={handleUpgradePremium}
                                                disabled={isPaying}
                                                style={{ padding: '12px 24px', borderRadius: '30px', background: isPaying ? '#ccc' : '#ffd700', color: '#8b6508', border: 'none', fontWeight: 'bold', cursor: isPaying ? 'wait' : 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                                className="hover:-translate-y-1 transition-transform"
                                            >
                                                {isPaying ? 'Memproses...' : '⭐ Upgrade Premium (Rp 15.000)'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="hero-pattern" />
                            </div>

                            <div className="psychologist-category-box">
                                <div className="popular-header">
                                    <div className="category-box-title">
                                        <h2>Kategori Psikolog</h2>
                                        <p>Pilih topik agar lebih cepat menemukan psikolog yang sesuai.</p>
                                    </div>
                                    <button type="button" onClick={() => handleCategoryClick('')}>Lihat Semua</button>
                                </div>
                                <div className="topic-grid">
                                    {PSYCHOLOGIST_CATEGORIES.map((category) => (
                                        <button
                                            key={category.value}
                                            className={`topic-item ${selectedCategory === category.value ? 'active' : ''}`}
                                            type="button"
                                            onClick={() => handleCategoryClick(category.value)}
                                        >
                                            <span className="material-symbols-outlined topic-icon">
                                                {CATEGORY_ICONS[category.value] || 'category'}
                                            </span>
                                            <span>{category.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {hasSelectedCategory && (
                                    <div className="psychologist-result-box">
                                        <div className="psychologist-result-header">
                                            <h3>{selectedCategoryLabel}</h3>
                                            <span>{psychologistTotal} psikolog tersedia</span>
                                        </div>
                                        {!user?.is_premium && (
                                            <div className="empty-psychologist-state" style={{ marginBottom: '10px' }}>
                                                Upgrade ke Premium untuk bisa menambahkan psikolog.
                                            </div>
                                        )}
                                        {psychologistLoading ? (
                                            <div className="empty-psychologist-state">Memuat psikolog...</div>
                                        ) : psychologistError ? (
                                            <div className="empty-psychologist-state">{psychologistError}</div>
                                        ) : psychologists.length === 0 ? (
                                            <div className="empty-psychologist-state">Belum ada psikolog pada kategori ini.</div>
                                        ) : (
                                            <>
                                                <div className="psychologist-list">
                                                    {psychologists.map((psychologist) => {
                                                        const status = psychologistStatuses[psychologist.id];
                                                        const isAccepted = status === 'accepted';
                                                        const isPending = status === 'pending' || requestedPsychologistIds.includes(psychologist.id);
                                                        const isRequestDisabled = sendingRequestId === psychologist.id || isPending || isAccepted;
                                                        return (
                                                            <article className="psychologist-card" key={psychologist.id}>
                                                                <div className="psychologist-card-top">
                                                                    {psychologist.profile_image ? (
                                                                        <img src={`${STORAGE_BASE_URL}/${psychologist.profile_image}`} alt={psychologist.name} />
                                                                    ) : (
                                                                        <div className="psychologist-avatar-fallback">
                                                                            {(psychologist.name || 'P').charAt(0).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <strong>{psychologist.name}</strong>
                                                                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#907b86' }}>Professional Counselor</p>
                                                                        <div className="flex items-center gap-1 mt-1">
                                                                            <div className="flex gap-0.5">
                                                                                {[1, 2, 3, 4, 5].map((s) => (
                                                                                    <span key={s} className="material-symbols-outlined text-[12px] text-amber-400" style={{ fontVariationSettings: s <= Math.round(psychologist.reviews_avg_rating || 0) ? "'FILL' 1" : "''" }}>star</span>
                                                                                ))}
                                                                            </div>
                                                                            <span className="text-[10px] font-bold text-stone-400">({psychologist.reviews_count || 0})</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="psychologist-specialty">
                                                                    {PSYCHOLOGIST_CATEGORIES.find((c) => c.value === psychologist.spesialisasi)?.label || 'Umum'}
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        className="psychologist-contact-btn flex-1"
                                                                        onClick={() => handleAddPsychologist(psychologist.id)}
                                                                        disabled={isRequestDisabled}
                                                                    >
                                                                        {!user?.is_premium ? 'Premium Diperlukan'
                                                                            : sendingRequestId === psychologist.id ? 'Mengirim...'
                                                                            : isAccepted ? 'Mulai Konsultasi'
                                                                            : isPending ? 'Permintaan Terkirim'
                                                                            : 'Konsultasi'}
                                                                    </button>
                                                                    {isAccepted && (
                                                                        <button
                                                                            type="button"
                                                                            className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center hover:bg-amber-100 transition-colors"
                                                                            onClick={() => handleOpenFeedback(psychologist)}
                                                                            title="Beri Rating"
                                                                        >
                                                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </article>
                                                        );
                                                    })}
                                                </div>
                                                {hasMorePsychologists && (
                                                    <button
                                                        type="button"
                                                        className="load-more-psychologist-btn"
                                                        onClick={() => fetchPsychologists(selectedCategory, true)}
                                                        disabled={loadingMorePsychologists}
                                                    >
                                                        {loadingMorePsychologists ? 'Menambahkan psikolog...' : 'Tambah Psikolog'}
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {!user?.is_premium ? (
                                <div className="post-create" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 20px', background: '#fff', border: '2px dashed #fbd8e1', borderRadius: '16px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#db7391', marginBottom: '10px' }}>lock</span>
                                    <h3 style={{ fontSize: '18px', margin: '0 0 10px', color: '#1a3635' }}>Fitur Ekslusif Premium</h3>
                                    <p style={{ margin: '0 0 20px', color: '#666', fontSize: '14px', maxWidth: '400px' }}>
                                        Anda harus menjadi pengguna Premium untuk mempublikasikan curhatan secara publik.
                                    </p>
                                    <button onClick={handleUpgradePremium} style={{ padding: '12px 24px', borderRadius: '30px', background: '#ffd700', color: '#8b6508', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                        ⭐ Upgrade Sekarang
                                    </button>
                                </div>
                            ) : (
                                <div className="post-create">
                                    <form onSubmit={handlePostSubmit}>
                                        <textarea
                                            value={body}
                                            onChange={(e) => setBody(e.target.value)}
                                            placeholder="Bagikan apa yang ada di pikiranmu secara anonim..."
                                            required
                                        />
                                        <div className="post-actions">
                                            <div className="file-input-wrapper">
                                                <label htmlFor="post-image-input" className="file-input-label">
                                                    <span className="material-symbols-outlined">add_photo_alternate</span>
                                                    <span>{image ? image.name : 'Tambahkan Foto'}</span>
                                                </label>
                                                <input 
                                                    id="post-image-input" 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={(e) => setImage(e.target.files[0])} 
                                                    className="hidden-file-input"
                                                />
                                            </div>
                                            <button type="submit" disabled={loading} className="submit-post-btn">
                                                {loading ? 'Memposting...' : 'Kirim Post'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* ─── POST LIST ─── */}
                            <div className="post-list">
                                {posts.map((post) => {
                                    const likeCount = post.likes_count ?? post.likes?.length ?? 0;
                                    const commentCount = Array.isArray(post.comments) ? post.comments.length : 0;
                                    const isLiked = Boolean(post.is_liked);

                                    return (
                                        <div className="post" key={post.id}>
                                            {/* Author */}
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
                                                    <div className="post-username">
                                                        ({post.user?.role === 'psikolog' ? 'psikolog' : 'anonim'})
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Body */}
                                            <p className="post-body">{post.body}</p>
                                            {post.image && (
                                                <img className="post-image" src={`${STORAGE_BASE_URL}/${post.image}`} alt="Post attachment" />
                                            )}

                                            {/* ─── Like & Comment count bar ─── */}
                                            <div style={S.feedbackBar}>
                                                {/* Like button */}
                                                <button
                                                    type="button"
                                                    style={S.likeBtn(isLiked)}
                                                    onClick={() => handleLike(post.id)}
                                                    disabled={likingPostId === post.id}
                                                    aria-label="Like post"
                                                    onMouseEnter={(e) => {
                                                        if (!isLiked) {
                                                            e.currentTarget.style.background = '#fff0f0';
                                                            e.currentTarget.style.borderColor = '#f87171';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isLiked) {
                                                            e.currentTarget.style.background = 'transparent';
                                                            e.currentTarget.style.borderColor = '#e8e0e4';
                                                        }
                                                    }}
                                                >
                                                    <svg viewBox="0 0 24 24" style={S.heartSvg(isLiked)} xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <span>{likeCount}</span>
                                                    <span style={{ color: isLiked ? '#e53e3e' : '#b0a0a8', fontWeight: 400 }}>suka</span>
                                                </button>

                                                {/* Comment count chip */}
                                                <div style={S.commentCountChip}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                    </svg>
                                                    <span>{commentCount}</span>
                                                    <span style={{ fontWeight: 400, color: '#b0a0a8' }}>komentar</span>
                                                </div>
                                            </div>

                                            {/* ─── Comment bubbles ─── */}
                                            {Array.isArray(post.comments) && post.comments.length > 0 && (
                                                <div style={S.commentList}>
                                                    {post.comments.map((comment) => (
                                                        <div key={comment.id} style={S.commentBubble}>
                                                            <div style={S.commentAvatar}>
                                                                {(comment.user?.name || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div style={S.commentContent}>
                                                                <div style={S.commentName}>
                                                                    {comment.user?.name || 'User'}
                                                                </div>
                                                                <p style={S.commentText}>{comment.content}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* ─── Comment input ─── */}
                                            <div style={S.commentInputWrap}
                                                onFocus={(e) => { e.currentTarget.style.borderColor = '#db7391'; }}
                                                onBlur={(e) => { e.currentTarget.style.borderColor = '#edd5e3'; }}
                                            >
                                                <input
                                                    type="text"
                                                    value={commentInputs[post.id] || ''}
                                                    onChange={(e) =>
                                                        setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') submitComment(post.id);
                                                    }}
                                                    placeholder="Tulis komentar..."
                                                    style={S.commentInput}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => submitComment(post.id)}
                                                    disabled={submittingCommentId === post.id}
                                                    style={S.sendBtn(submittingCommentId === post.id)}
                                                    aria-label="Kirim komentar"
                                                    onMouseEnter={(e) => { if (submittingCommentId !== post.id) e.currentTarget.style.opacity = '0.85'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="22" y1="2" x2="11" y2="13" />
                                                        <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" stroke="white" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {posts.length === 0 && (
                                    <div className="empty-posts">Belum ada postingan. Jadilah yang pertama!</div>
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
                                <Link to="/friend-requests" className="side-link">Lihat Semua Riwayat</Link>
                            </div>
                            <div className="quick-return-card">
                                <h3>Pesan Kembali Cepat</h3>
                                <p>Lanjutkan progresmu dengan konselor yang sama.</p>
                                <Link to="/messages" className="quick-return-button">Pesan Sekarang</Link>
                            </div>
                        </aside>
                    </div>


                </div>
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

            {feedbackModal.isOpen && (
                <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })} />
                    <div className="relative bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                                <span className="material-symbols-outlined text-4xl text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>grade</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Beri Rating</h3>
                            <p className="text-stone-500 mt-2 font-medium">Bagaimana pengalaman konsultasi Anda bersama <span className="text-[#A46477] font-bold">{feedbackModal.psychologistName}</span>?</p>
                        </div>

                        <form onSubmit={handleSubmitFeedback}>
                            <div className="flex justify-center gap-2 mb-8">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFeedbackRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <span 
                                            className={`material-symbols-outlined text-4xl transition-colors ${star <= feedbackRating ? 'text-amber-400' : 'text-stone-200'}`}
                                            style={{ fontVariationSettings: star <= feedbackRating ? "'FILL' 1" : "''" }}
                                        >
                                            star
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="mb-8">
                                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-3 px-1">Pesan Feedback (Anonim)</label>
                                <textarea
                                    className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl p-4 text-slate-700 font-medium placeholder:text-stone-300 focus:border-[#A46477]/30 focus:bg-white outline-none transition-all resize-none h-32"
                                    placeholder="Tuliskan kesan atau pesan Anda..."
                                    value={feedbackComment}
                                    onChange={(e) => setFeedbackComment(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                                    className="flex-1 py-4 rounded-2xl font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 transition-all active:scale-95"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingFeedback}
                                    className="flex-1 py-4 rounded-2xl font-bold text-white bg-[#A46477] shadow-lg shadow-[#A46477]/20 hover:bg-[#8a5263] transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                                >
                                    {submittingFeedback ? 'Mengirim...' : 'Kirim Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardAnonim;