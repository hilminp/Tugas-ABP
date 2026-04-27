import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [hiddenPostIds, setHiddenPostIds] = useState(() => {
        try {
            const saved = localStorage.getItem('hidden_posts');
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Error parsing hidden_posts", e);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('hidden_posts', JSON.stringify(hiddenPostIds));
    }, [hiddenPostIds]);

    const handleHidePost = (postId) => {
        setHiddenPostIds(prev => [...prev, postId]);
    };

    const handlePermanentDeletePost = async (postId) => {
        if (!confirm('Hapus postingan ini secara permanen? Tindakan ini tidak bisa dibatalkan.')) return;
        try {
            await api.delete(`/admin/post/${postId}/permanent`);
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menghapus postingan secara permanen.');
        }
    };
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
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);

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
        fetchSessions();
        /* ─── Auto-refresh setiap 10 detik ─── */
        const interval = setInterval(() => {
            fetchPosts();
            fetchSessions();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchSessions = async () => {
        try {
            const endpoint = user?.role === 'psikolog' ? '/consultation-sessions' : '/my-booked-sessions';
            const res = await api.get(endpoint);
            setSessions(res.data.sessions || []);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setSessionsLoading(false);
        }
    };


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
            const res = await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const newPost = res.data.post;
            
            // Tambahkan komentar kosong jika tidak ada agar tidak error saat rendering
            if (!newPost.comments) newPost.comments = [];
            
            setBody('');
            setImage(null);
            
            // Update state secara lokal agar instan muncul di feed
            setPosts((prev) => [newPost, ...prev]);
            
            // Tetap panggil fetchPosts di background untuk memastikan data tersinkronasi (opsional)
            // await fetchPosts(); 
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
            const res = await api.post(`/posts/${postId}/comment`, { content });
            const newComment = res.data.comment;
            
            setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
            
            // Update state secara lokal agar komentar muncul instan
            setPosts((prev) => prev.map(post => {
                if (post.id === postId) {
                    const updatedComments = Array.isArray(post.comments) ? [newComment, ...post.comments] : [newComment];
                    return { ...post, comments: updatedComments };
                }
                return post;
            }));
            
            // Optional: fetchPosts() di background jika ingin benar-benar sinkron
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
        let reason = '';
        setAdminConfirmModal({
            isOpen: true,
            title: 'Moderasi Postingan',
            message: 'Masukkan alasan penghapusan postingan ini. User akan melihat alasan ini di feed mereka.',
            icon: 'gavel',
            color: 'red',
            showInput: true,
            onInputChange: (val) => { reason = val; },
            onConfirm: async () => {
                setAdminActionLoading(true);
                try {
                    await api.post(`/admin/post/${postId}/delete`, { _method: 'DELETE', reason });
                    setAdminConfirmModal(m => ({ ...m, isOpen: false }));
                    setStatusModal({ isOpen: true, type: 'success', message: 'Postingan berhasil dimoderasi.' });
                    await fetchPosts();
                } catch (error) {
                    setStatusModal({ isOpen: true, type: 'error', message: error.response?.data?.message || 'Gagal moderasi postingan.' });
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
                                        <p>Pilih psikolog dengan keahlian yang sesuai dengan kebutuhanmu.</p>
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
                                                        const isRejected = status === 'rejected';
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
                                                                            : isRejected ? 'Ajukan Ulang'
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
                                <div className="post-create-card group">
                                    <div className="flex gap-4 p-5">
                                        <div className="shrink-0">
                                            {user?.profile_image ? (
                                                <img src={`${STORAGE_BASE_URL}/${user.profile_image}`} alt={user.name} className="w-11 h-11 rounded-2xl object-cover shadow-sm" />
                                            ) : (
                                                <div className="w-11 h-11 rounded-2xl bg-[#f0dde7] text-[#81556a] font-black flex items-center justify-center shadow-sm">
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <form onSubmit={handlePostSubmit} className="flex-1">
                                            <textarea
                                                value={body}
                                                onChange={(e) => {
                                                    setBody(e.target.value);
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = e.target.scrollHeight + 'px';
                                                }}
                                                placeholder="Apa yang Anda pikirkan hari ini? Bagikan secara anonim..."
                                                className="w-full bg-transparent border-none focus:ring-0 text-slate-700 text-base font-medium placeholder:text-slate-300 resize-none min-h-[50px] transition-all py-2"
                                                required
                                            />
                                            
                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 transition-all group-focus-within:border-slate-100">
                                                <div className="flex gap-2">
                                                    <div className="file-input-wrapper">
                                                        <label htmlFor="post-image-input" className="post-action-btn hover:bg-teal-50 hover:text-teal-600">
                                                            <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                                                            <span className="text-xs font-bold uppercase tracking-wider">{image ? 'Foto Terpilih' : 'Tambahkan Foto'}</span>
                                                        </label>
                                                        <input 
                                                            id="post-image-input" 
                                                            type="file" 
                                                            accept="image/*" 
                                                            onChange={(e) => setImage(e.target.files[0])} 
                                                            className="hidden"
                                                        />
                                                    </div>
                                                </div>
                                                <button 
                                                    type="submit" 
                                                    disabled={loading || !body.trim()} 
                                                    className="px-6 py-2.5 bg-[#A46477] text-white rounded-xl font-black text-xs uppercase tracking-[0.15em] shadow-lg shadow-[#A46477]/20 hover:bg-[#8a5263] hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:translate-y-0 transition-all flex items-center gap-2"
                                                >
                                                    {loading ? 'Mengirim...' : (
                                                        <>
                                                            <span>Posting</span>
                                                            <span className="material-symbols-outlined text-sm">send</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                    {image && (
                                        <div className="px-5 pb-5">
                                            <div className="relative inline-block group/img">
                                                <img src={URL.createObjectURL(image)} alt="Preview" className="max-h-32 rounded-xl shadow-md" />
                                                <button 
                                                    onClick={() => setImage(null)} 
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                >
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ─── POST LIST ─── */}
                            <div className="post-list">
                                <AnimatePresence mode="popLayout">
                                    {posts.filter(p => !hiddenPostIds.includes(p.id)).map((post, index) => {
                                        const likeCount = post.likes_count ?? post.likes?.length ?? 0;
                                        const commentCount = Array.isArray(post.comments) ? post.comments.length : 0;
                                        const isLiked = Boolean(post.is_liked);
                                        const isModerated = Boolean(post.is_deleted_by_admin);

                                        return (
                                            <motion.div 
                                                key={post.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                                className={`post-card-premium ${isModerated ? 'moderated-notice-card' : ''}`}
                                            >
                                                {/* Author + Admin actions */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            {post.user?.profile_image ? (
                                                                <img src={`${STORAGE_BASE_URL}/${post.user.profile_image}`} alt={post.user.name} className="w-10 h-10 rounded-2xl object-cover ring-2 ring-white shadow-sm" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-2xl bg-[#f0dde7] text-[#81556a] font-black flex items-center justify-center ring-2 ring-white shadow-sm">
                                                                    {post.user?.name?.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800 text-sm leading-tight">{post.user?.name}</h4>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${post.user?.role === 'psikolog' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                                                    {post.user?.role === 'psikolog' ? 'Psikolog' : 'Anonim'}
                                                                </span>
                                                                <span className="text-[10px] text-slate-300">•</span>
                                                                <span className="text-[10px] text-slate-400 font-medium">{new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {user?.is_admin && !isModerated && (
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleAdminDeletePost(post.id)}
                                                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Moderasi Post"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">gavel</span>
                                                            </button>
                                                            {post.user?.id && (
                                                                <button
                                                                    onClick={() => handleAdminBanUser(post.user.id, post.user.name)}
                                                                    className="p-1.5 text-orange-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                                                    title="Ban User"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">block</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                    {isModerated && (
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleHidePost(post.id)}
                                                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                                                title="Sembunyikan dari Feed Saya"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">visibility_off</span>
                                                            </button>
                                                            {(user?.is_admin || user?.id === post.user?.id) && (
                                                                <button
                                                                    onClick={() => handlePermanentDeletePost(post.id)}
                                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                    title="Hapus Permanen"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">delete_forever</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Body */}
                                                <p className={`text-slate-700 text-[15px] leading-relaxed mb-4 whitespace-pre-wrap ${isModerated ? 'moderated-body-text' : ''}`}>
                                                    {post.body}
                                                </p>
                                                
                                                {post.image && !isModerated && (
                                                    <div className="rounded-2xl overflow-hidden mb-4 border border-slate-100 bg-slate-50">
                                                        <img className="w-full max-h-[450px] object-contain" src={`${STORAGE_BASE_URL}/${post.image}`} alt="Post attachment" />
                                                    </div>
                                                )}

                                                {/* Interaction Bar */}
                                                <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                                                    {!isModerated && (
                                                        <>
                                                            <button
                                                                onClick={() => handleLike(post.id)}
                                                                disabled={likingPostId === post.id}
                                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95 ${isLiked ? 'bg-red-50 text-red-500 font-bold' : 'hover:bg-slate-50 text-slate-500 font-medium'}`}
                                                            >
                                                                <span className={`material-symbols-outlined text-[20px] ${isLiked ? 'fill-1' : ''}`} style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "''" }}>
                                                                    favorite
                                                                </span>
                                                                <span className="text-xs">{likeCount}</span>
                                                            </button>

                                                            <button
                                                                onClick={() => toggleComments(post.id)}
                                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95 ${expandedComments[post.id] ? 'bg-indigo-50 text-indigo-600 font-bold' : 'hover:bg-slate-50 text-slate-500 font-medium'}`}
                                                            >
                                                                <span className="material-symbols-outlined text-[20px]">
                                                                    chat_bubble
                                                                </span>
                                                                <span className="text-xs">{commentCount}</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Comments Section */}
                                                <AnimatePresence>
                                                    {expandedComments[post.id] && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="mt-4 pt-4 border-t border-slate-50 space-y-4">
                                                                {Array.isArray(post.comments) && post.comments.map((comment) => (
                                                                    <div key={comment.id} className="flex gap-3">
                                                                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                                                                            {(comment.user?.name || 'U').charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <div className="bg-slate-50 rounded-2xl p-3 flex-1">
                                                                            <div className="flex justify-between items-start mb-1">
                                                                                <span className="text-xs font-bold text-slate-800">{comment.user?.name || 'User'}</span>
                                                                                {user?.is_admin && (
                                                                                    <button onClick={() => handleAdminDeleteComment(comment.id)} className="text-red-400 hover:text-red-600">
                                                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                            <p className="text-xs text-slate-600 leading-relaxed">{comment.content}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}

                                                                {/* Comment Input */}
                                                                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-1 pl-4">
                                                                    <input
                                                                        type="text"
                                                                        value={commentInputs[post.id] || ''}
                                                                        onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                                                        onKeyDown={(e) => { if (e.key === 'Enter') submitComment(post.id); }}
                                                                        placeholder="Tulis komentar..."
                                                                        className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-medium text-slate-700 placeholder:text-slate-300"
                                                                    />
                                                                    <button
                                                                        onClick={() => submitComment(post.id)}
                                                                        disabled={submittingCommentId === post.id}
                                                                        className="w-8 h-8 bg-[#A46477] text-white rounded-xl flex items-center justify-center shadow-md active:scale-90 disabled:opacity-30"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">send</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </section>

                        <aside className="right-section">
                            <div className="side-card">
                                <div className="side-card-title">Sesi Terbaru</div>
                                {sessionsLoading ? (
                                    <div className="text-xs text-stone-400 p-4 text-center">Memuat sesi...</div>
                                ) : sessions.length === 0 ? (
                                    <div className="text-xs text-stone-400 p-4 text-center">Belum ada sesi terjadwal.</div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        {sessions.slice(0, 3).map((session) => (
                                            <div key={session.id} className={`session-item ${session.status === 'completed' || session.status === 'cancelled' ? 'muted' : ''}`}>
                                                <span className="material-symbols-outlined text-[20px] opacity-70">event_upcoming</span>
                                                <div>
                                                    <small className="capitalize">{session.status === 'booked' ? 'Mendatang' : session.status.replace('_', ' ')}</small>
                                                    <strong>{user?.role === 'psikolog' ? session.user?.name : session.psychologist?.name}</strong>
                                                    <span>{new Date(session.session_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {session.session_time.substring(0, 5)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Link to="/sessions" className="side-link">
                                    Lihat Jadwal Lengkap
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </Link>
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
                        <p className="text-slate-500 mb-6 font-medium leading-relaxed text-sm">{adminConfirmModal.message}</p>
                        
                        {adminConfirmModal.showInput && (
                            <div className="w-full mb-6">
                                <textarea
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-slate-700 text-sm font-medium placeholder:text-slate-300 focus:border-red-200 focus:bg-white outline-none transition-all resize-none h-24"
                                    placeholder="Masukkan alasan penghapusan..."
                                    onChange={(e) => adminConfirmModal.onInputChange(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )}

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
                                ) : (adminConfirmModal.showInput ? 'Ya, Moderasi' : 'Ya, Hapus')}
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