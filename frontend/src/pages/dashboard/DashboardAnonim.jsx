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
        transition: 'all 0.18s ease',
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
    // Admin mendapat akses penuh ke semua fitur tanpa perlu premium
    const hasAccess = user?.is_premium || user?.is_admin;
    const [posts, setPosts] = useState([]);
    const [commentInputs, setCommentInputs] = useState({});
    const [expandedComments, setExpandedComments] = useState({});
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
    const [chatActivity, setChatActivity] = useState([]);
    const [activityStats, setActivityStats] = useState({ posts: 0, likes: 0, comments: 0 });
    // Admin modals
    const [adminConfirmModal, setAdminConfirmModal] = useState({ isOpen: false, title: '', message: '', icon: 'delete', color: 'red', onConfirm: null });
    const [adminBanModal, setAdminBanModal] = useState({ isOpen: false, userId: null, userName: '' });
    const [adminBanReason, setAdminBanReason] = useState('');
    const [adminActionLoading, setAdminActionLoading] = useState(false);

    /* ─── Hitung statistik milik user sendiri dari data posts ─── */
    const computeMyStats = (allPosts) => {
        if (!user) return;
        let myPosts = 0;
        let myLikes = 0;
        let myComments = 0;
        allPosts.forEach((post) => {
            const isMyPost = post.user?.id === user.id;
            if (isMyPost) {
                myPosts += 1;
                myLikes += post.likes_count ?? post.likes?.length ?? 0;
                myComments += Array.isArray(post.comments) ? post.comments.length : 0;
            }
        });
        setActivityStats({ posts: myPosts, likes: myLikes, comments: myComments });
    };

    /* ─── Helper: tanggal lokal sebagai string YYYY-MM-DD ─── */
    const localDateKey = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    /* ─── Hitung aktivitas harian dari data posts ─── */
    const computeDailyActivity = (allPosts) => {
        const now = new Date();
        const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

        /* Buat 7 bucket hari terakhir menggunakan tanggal LOKAL */
        const dayBuckets = Array.from({ length: 7 }, (_, offset) => {
            const date = new Date(now);
            date.setHours(0, 0, 0, 0);
            date.setDate(now.getDate() - (6 - offset));
            return { key: localDateKey(date), label: dayLabels[date.getDay()], value: 0 };
        });

        const countsByDate = dayBuckets.reduce((acc, day) => { acc[day.key] = 0; return acc; }, {});

        allPosts.forEach((post) => {
            if (!post.created_at) return;
            /* created_at dari Laravel biasanya "2026-04-23T09:00:00.000000Z" */
            const d = new Date(post.created_at);
            const dayKey = localDateKey(d); /* pakai waktu LOKAL agar sesuai timezone user */
            if (!Object.prototype.hasOwnProperty.call(countsByDate, dayKey)) return;
            countsByDate[dayKey] += 1;
            countsByDate[dayKey] += (post.likes_count ?? post.likes?.length ?? 0);
            countsByDate[dayKey] += (Array.isArray(post.comments) ? post.comments.length : 0);
        });

        setChatActivity(dayBuckets.map((day) => ({ ...day, value: countsByDate[day.key] || 0 })));
    };

    /* ─── Jalankan ulang setiap posts berubah (ini memastikan grafik selalu sync) ─── */
    useEffect(() => {
        if (posts.length >= 0) {
            computeDailyActivity(posts);
            computeMyStats(posts);
        }
    }, [posts]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchPosts();
        fetchPsychologistStatuses();
        /* ─── Auto-refresh setiap 10 detik ─── */
        const interval = setInterval(() => {
            fetchPosts();
        }, 10000);
        return () => clearInterval(interval);
    }, []);


    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts');
            const data = res.data;
            setPosts(data);
            computeMyStats(data);
            computeDailyActivity(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
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
        const targetPost = posts.find((post) => post.id === postId);
        if (!targetPost) return;

        const wasLiked = Boolean(targetPost.is_liked);
        const prevLikeCount = targetPost.likes_count ?? targetPost.likes?.length ?? 0;
        const nextLikeCount = Math.max(0, prevLikeCount + (wasLiked ? -1 : 1));

        // Optimistic UI: like berubah instan tanpa menunggu fetch ulang.
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? { ...post, is_liked: !wasLiked, likes_count: nextLikeCount }
                    : post
            )
        );

        setLikingPostId(postId);
        try {
            await api.post(`/posts/${postId}/like`);
        } catch (error) {
            // Rollback jika request gagal.
            setPosts((prev) =>
                prev.map((post) =>
                    post.id === postId
                        ? { ...post, is_liked: wasLiked, likes_count: prevLikeCount }
                        : post
                )
            );
            setStatusModal({ isOpen: true, type: 'error', message: error.response?.data?.message || 'Gagal menyukai post.' });
        } finally {
            setLikingPostId(null);
            fetchPosts();
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

    const toggleComments = (postId) => {
        setExpandedComments((prev) => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    /* ─── Admin Actions ─── */
    const handleAdminDeletePost = (postId) => {
        setAdminConfirmModal({
            isOpen: true,
            title: 'Hapus Postingan?',
            message: 'Postingan ini akan dihapus secara permanen. Tindakan tidak bisa dibatalkan.',
            icon: 'delete',
            color: 'red',
            onConfirm: async () => {
                setAdminActionLoading(true);
                try {
                    await api.delete(`/admin/post/${postId}`);
                    setAdminConfirmModal(m => ({ ...m, isOpen: false }));
                    setStatusModal({ isOpen: true, type: 'success', message: 'Postingan berhasil dihapus.' });
                    await fetchPosts();
                } catch (error) {
                    setStatusModal({ isOpen: true, type: 'error', message: error.response?.data?.message || 'Gagal menghapus postingan.' });
                } finally {
                    setAdminActionLoading(false);
                }
            }
        });
    };

    const handleAdminDeleteComment = (commentId) => {
        setAdminConfirmModal({
            isOpen: true,
            title: 'Hapus Komentar?',
            message: 'Komentar ini akan dihapus secara permanen.',
            icon: 'chat_remove',
            color: 'red',
            onConfirm: async () => {
                setAdminActionLoading(true);
                try {
                    await api.delete(`/admin/comment/${commentId}`);
                    setAdminConfirmModal(m => ({ ...m, isOpen: false }));
                    setStatusModal({ isOpen: true, type: 'success', message: 'Komentar berhasil dihapus.' });
                    await fetchPosts();
                } catch (error) {
                    setStatusModal({ isOpen: true, type: 'error', message: error.response?.data?.message || 'Gagal menghapus komentar.' });
                } finally {
                    setAdminActionLoading(false);
                }
            }
        });
    };

    const handleAdminBanUser = (userId, userName) => {
        setAdminBanReason('');
        setAdminBanModal({ isOpen: true, userId, userName });
    };

    const handleConfirmBan = async () => {
        if (!adminBanReason.trim()) return;
        setAdminActionLoading(true);
        try {
            await api.post(`/admin/user/${adminBanModal.userId}/suspend`, { action: 'suspend', reason: adminBanReason });
            setAdminBanModal({ isOpen: false, userId: null, userName: '' });
            setStatusModal({ isOpen: true, type: 'success', message: `User ${adminBanModal.userName || ''} berhasil di-ban.` });
            await fetchPosts();
        } catch (error) {
            setStatusModal({ isOpen: true, type: 'error', message: error.response?.data?.message || 'Gagal ban user.' });
        } finally {
            setAdminActionLoading(false);
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
        if (!hasAccess) { handleUpgradePremium(); return; }
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

    const highestChatActivity = Math.max(...chatActivity.map((item) => item.value), 1);

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
                                        {!hasAccess && (
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
                                        {!hasAccess && (
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
                                                <div className="psychologist-grid-list">
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
                                                                        {!hasAccess ? 'Premium Diperlukan'
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

                            {!hasAccess ? (
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
                                            {/* Author + Admin actions */}
                                            <div className="post-author" style={{ justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                                                {user?.is_admin && (
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button
                                                            title="Hapus Postingan"
                                                            onClick={() => handleAdminDeletePost(post.id)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', cursor: 'pointer', transition: 'all 0.2s' }}
                                                            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                                            onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                                                            Hapus Post
                                                        </button>
                                                        {post.user?.id && (
                                                            <button
                                                                title={`Ban ${post.user.name}`}
                                                                onClick={() => handleAdminBanUser(post.user.id, post.user.name)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', cursor: 'pointer', transition: 'all 0.2s' }}
                                                                onMouseEnter={e => e.currentTarget.style.background = '#ffedd5'}
                                                                onMouseLeave={e => e.currentTarget.style.background = '#fff7ed'}
                                                            >
                                                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>block</span>
                                                                Ban User
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
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
                                                    onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
                                                    onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
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
                                                <button
                                                    type="button"
                                                    style={{ ...S.commentCountChip, cursor: 'pointer' }}
                                                    onClick={() => toggleComments(post.id)}
                                                    aria-expanded={Boolean(expandedComments[post.id])}
                                                    aria-label={expandedComments[post.id] ? 'Sembunyikan komentar' : 'Tampilkan komentar'}
                                                    onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
                                                    onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                    </svg>
                                                    <span>{commentCount}</span>
                                                    <span style={{ fontWeight: 400, color: '#b0a0a8' }}>komentar</span>
                                                </button>
                                            </div>

                                            {/* ─── Comment bubbles ─── */}
                                            {expandedComments[post.id] && Array.isArray(post.comments) && post.comments.length > 0 && (
                                                <div style={S.commentList}>
                                                    {post.comments.map((comment) => (
                                                        <div key={comment.id} style={S.commentBubble}>
                                                            <div style={S.commentAvatar}>
                                                                {(comment.user?.name || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div style={{ ...S.commentContent, flex: 1 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                    <div style={S.commentName}>{comment.user?.name || 'User'}</div>
                                                                    {user?.is_admin && (
                                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                                            <button
                                                                                title="Hapus Komentar"
                                                                                onClick={() => handleAdminDeleteComment(comment.id)}
                                                                                style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '700', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', cursor: 'pointer' }}
                                                                            >
                                                                                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>delete</span>
                                                                                Hapus
                                                                            </button>
                                                                            {comment.user?.id && (
                                                                                <button
                                                                                    title={`Ban ${comment.user.name}`}
                                                                                    onClick={() => handleAdminBanUser(comment.user.id, comment.user.name)}
                                                                                    style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '700', background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', cursor: 'pointer' }}
                                                                                >
                                                                                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>block</span>
                                                                                    Ban
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <p style={S.commentText}>{comment.content}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* ─── Comment input ─── */}
                                            {expandedComments[post.id] && (
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
                                            )}
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

                            {/* ─── Grafik Batang Aktivitas (khusus anonim berbayar) ─── */}
                            {hasAccess && user?.role !== 'psikolog' && (
                                <div className="side-card activity-bar-card">
                                    <div className="activity-bar-header">
                                        <div className="activity-bar-title">
                                            <span className="activity-bar-crown">⭐</span>
                                            Aktivitas Saya
                                        </div>
                                        <span className="activity-bar-live-badge">
                                            <span className="activity-bar-live-dot" />
                                            Live
                                        </span>
                                    </div>
                                    <div className="activity-bar-chart">
                                        {[
                                            { key: 'posts',    label: 'Posting',   value: activityStats.posts,    color: 'linear-gradient(180deg, #c97db5 0%, #7a3d6b 100%)', icon: '📝' },
                                            { key: 'likes',    label: 'Like',      value: activityStats.likes,    color: 'linear-gradient(180deg, #f59fc5 0%, #d94f82 100%)', icon: '❤️' },
                                            { key: 'comments', label: 'Komentar',  value: activityStats.comments, color: 'linear-gradient(180deg, #90c7f5 0%, #3b82c4 100%)', icon: '💬' },
                                        ].map((bar) => {
                                            const maxVal = Math.max(activityStats.posts, activityStats.likes, activityStats.comments, 1);
                                            const heightPct = Math.max(bar.value > 0 ? 8 : 0, Math.round((bar.value / maxVal) * 100));
                                            return (
                                                <div key={bar.key} className="activity-bar-col">
                                                    <div className="activity-bar-value">{bar.value}</div>
                                                    <div className="activity-bar-track">
                                                        <div
                                                            className="activity-bar-fill"
                                                            style={{
                                                                height: `${heightPct}%`,
                                                                background: bar.color,
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="activity-bar-icon">{bar.icon}</div>
                                                    <div className="activity-bar-label">{bar.label}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="activity-bar-note">Update otomatis setiap aktivitas</p>
                                </div>
                            )}

                            <div className="side-card">
                                <div className="side-card-title">Grafik Aktivitas Harian</div>
                                <div className="activity-chart">
                                    {(() => {
                                        const highestVal = Math.max(...chatActivity.map((i) => i.value), 1);
                                        return chatActivity.map((item) => (
                                            <div key={item.key} className="activity-row">
                                                <div className="activity-row-head">
                                                    <span>{item.label}</span>
                                                    <strong>{item.value}</strong>
                                                </div>
                                                <div className="activity-track">
                                                    <div
                                                        className="activity-fill"
                                                        style={{ width: `${Math.max(item.value > 0 ? 10 : 0, Math.round((item.value / highestVal) * 100))}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
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

            {/* ─── Admin Confirm Modal (Hapus Post / Komentar) ─── */}
            {adminConfirmModal.isOpen && (
                <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => !adminActionLoading && setAdminConfirmModal(m => ({ ...m, isOpen: false }))} />
                    <div className="relative bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5 shadow-inner">
                            <span className="material-symbols-outlined text-4xl text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>{adminConfirmModal.icon}</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2 tracking-tight">{adminConfirmModal.title}</h3>
                        <p className="text-slate-500 mb-8 font-medium leading-relaxed text-sm">{adminConfirmModal.message}</p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setAdminConfirmModal(m => ({ ...m, isOpen: false }))}
                                disabled={adminActionLoading}
                                className="flex-1 py-3 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={adminConfirmModal.onConfirm}
                                disabled={adminActionLoading}
                                className="flex-1 py-3 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {adminActionLoading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Memproses...
                                    </>
                                ) : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Admin Ban Modal ─── */}
            {adminBanModal.isOpen && (
                <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => !adminActionLoading && setAdminBanModal({ isOpen: false, userId: null, userName: '' })} />
                    <div className="relative bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-4 shadow-inner">
                                <span className="material-symbols-outlined text-4xl text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>block</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Ban User</h3>
                            <p className="text-slate-500 mt-1 text-sm font-medium">Suspend akun <span className="font-bold text-orange-600">{adminBanModal.userName}</span>?</p>
                        </div>
                        <div className="mb-6">
                            <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Alasan Ban *</label>
                            <textarea
                                className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl p-4 text-slate-700 font-medium placeholder:text-stone-300 focus:border-orange-300 focus:bg-white outline-none transition-all resize-none h-28"
                                placeholder="Tuliskan alasan ban untuk user ini..."
                                value={adminBanReason}
                                onChange={(e) => setAdminBanReason(e.target.value)}
                                disabled={adminActionLoading}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setAdminBanModal({ isOpen: false, userId: null, userName: '' })}
                                disabled={adminActionLoading}
                                className="flex-1 py-3 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmBan}
                                disabled={adminActionLoading || !adminBanReason.trim()}
                                className="flex-1 py-3 rounded-2xl font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {adminActionLoading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">block</span>
                                        Ban User
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardAnonim;