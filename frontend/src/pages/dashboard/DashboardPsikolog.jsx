import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { api, STORAGE_BASE_URL } from '../../lib/api';
import { PSYCHOLOGIST_CATEGORIES } from '../../constants/psychologistCategories';
import '../../components/Sidebar.css';
import '../Home.css';

const DashboardPsikolog = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [commentInputs, setCommentInputs] = useState({});
    const [expandedComments, setExpandedComments] = useState({});
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [likingPostId, setLikingPostId] = useState(null);
    const [requestActionLoadingId, setRequestActionLoadingId] = useState(null);
    const [submittingCommentId, setSubmittingCommentId] = useState(null);
    const [paidAnonymousActivityData, setPaidAnonymousActivityData] = useState([]);
    const [isActivityLoading, setIsActivityLoading] = useState(false);
    const [statusModal, setStatusModal] = useState({ isOpen: false, type: '', message: '', title: '', onConfirm: null });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', message: '', action: null, targetId: null });
    const [reviewsData, setReviewsData] = useState({ reviews: [], average_rating: 0, total_reviews: 0 });
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);
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

    const [notifCount, setNotifCount] = useState(0);
    const [sessionNotifCount, setSessionNotifCount] = useState(0);

    useEffect(() => {
        localStorage.setItem('hidden_posts', JSON.stringify(hiddenPostIds));
    }, [hiddenPostIds]);

    const handleHidePost = (postId) => {
        setHiddenPostIds(prev => [...prev, postId]);
    };

    const handlePermanentDeletePost = (postId) => {
        setConfirmModal({
            isOpen: true,
            type: 'warning',
            message: 'Hapus postingan ini secara permanen? Tindakan ini tidak bisa dibatalkan.',
            action: async () => {
                try {
                    await api.delete(`/admin/post/${postId}/permanent`);
                    setPosts(prev => prev.filter(p => p.id !== postId));
                    setStatusModal({ 
                        isOpen: true, 
                        type: 'success', 
                        title: 'Terhapus!', 
                        message: 'Postingan telah dihapus secara permanen.' 
                    });
                } catch (err) {
                    setStatusModal({ 
                        isOpen: true, 
                        type: 'error', 
                        message: err.response?.data?.message || 'Gagal menghapus postingan secara permanen.' 
                    });
                }
            }
        });
    };

    const psychologistName = user?.name || user?.username || 'Psikolog';
    const psychologistSpecialty = user?.spesialisasi || 'Spesialis Klinis';
    const profileImageUrl = user?.profile_image
        ? `${STORAGE_BASE_URL}/${user.profile_image}`
        : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

    useEffect(() => {
        fetchPosts();
        fetchIncomingRequests();
        fetchReviews();
        fetchPaidAnonymousActivity();
        fetchSessions();

        // Polling notifications
        const fetchNotif = async () => {
            try {
                const res = await api.get(`/friend-notifications?t=${new Date().getTime()}`);
                setNotifCount(res.data.count || 0);
            } catch (e) {}
        };
        const fetchSessionNotif = async () => {
            try {
                const res = await api.get(`/session-notifications?t=${new Date().getTime()}`);
                setSessionNotifCount(res.data.count || 0);
            } catch (e) {}
        };

        fetchNotif();
        fetchSessionNotif();

        const interval = setInterval(() => {
            fetchNotif();
            fetchSessionNotif();
        }, 30000);

        const handleFriendSeen = () => setNotifCount(0);
        const handleSessionSeen = () => setSessionNotifCount(0);
        window.addEventListener('friendNotifSeen', handleFriendSeen);
        window.addEventListener('sessionNotifSeen', handleSessionSeen);

        return () => {
            clearInterval(interval);
            window.removeEventListener('friendNotifSeen', handleFriendSeen);
            window.removeEventListener('sessionNotifSeen', handleSessionSeen);
        };
    }, []);

    const fetchSessions = async () => {
        setSessionsLoading(true);
        try {
            const res = await api.get('/consultation-sessions');
            setSessions(res.data.sessions || []);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setSessionsLoading(false);
        }
    };

    const fetchReviews = async () => {
        setReviewsLoading(true);
        try {
            const res = await api.get('/reviews');
            setReviewsData(res.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

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
            const allRequests = res.data?.requests || [];
            // Di Dashboard, kita hanya ingin menampilkan yang masih pending
            const pendingRequests = allRequests.filter(r => r.status === 'pending');
            setIncomingRequests(pendingRequests);
        } catch (error) {
            console.error('Error fetching incoming requests:', error);
        }
    };

    const fetchPaidAnonymousActivity = async () => {
        setIsActivityLoading(true);
        try {
            const friendsRes = await api.get('/messages');
            const allFriends = friendsRes.data?.friends || [];
            const paidAnonymousFriends = allFriends.filter(
                (friend) => friend?.role === 'anonim' && Boolean(friend?.is_premium)
            );

            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

            const activityRows = await Promise.all(
                paidAnonymousFriends.map(async (friend, index) => {
                    try {
                        const threadRes = await api.get(`/messages/${friend.id}`);
                        const messages = Array.isArray(threadRes.data?.messages) ? threadRes.data.messages : [];
                        const weeklyMessages = messages.filter((message) => {
                            const createdAt = new Date(message.created_at);
                            if (Number.isNaN(createdAt.getTime())) return false;
                            return createdAt >= sevenDaysAgo;
                        });

                        return {
                            id: friend.id || `anon-paid-${index}`,
                            label: friend.name || `Anonim #${String(index + 1).padStart(2, '0')}`,
                            plan: 'Berbayar',
                            value: weeklyMessages.length,
                        };
                    } catch (threadError) {
                        console.error(`Error fetching thread for user ${friend.id}:`, threadError);
                        return null;
                    }
                })
            );

            const cleanedRows = activityRows
                .filter(Boolean)
                .sort((a, b) => b.value - a.value)
                .slice(0, 6);

            setPaidAnonymousActivityData(cleanedRows);
        } catch (error) {
            console.error('Error fetching paid anonymous activity:', error);
            setPaidAnonymousActivityData([]);
        } finally {
            setIsActivityLoading(false);
        }
    };

    const handleLike = async (postId) => {
        if (likingPostId === postId) return;
        const targetPost = posts.find((post) => post.id === postId);
        if (!targetPost) return;

        const wasLiked = Boolean(targetPost.is_liked);
        const prevLikeCount = targetPost.likes_count ?? targetPost.likes?.length ?? 0;
        const nextLikeCount = Math.max(0, prevLikeCount + (wasLiked ? -1 : 1));

        // Optimistic UI agar klik like terasa instan.
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

    const submitComment = async (e, postId) => {
        e.preventDefault();

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

    const handleAcceptRequest = async (requesterId) => {
        setConfirmModal({
            isOpen: true,
            type: 'success',
            message: 'Apakah Anda yakin ingin menerima Teman Curhat ini?',
            action: async () => {
                setRequestActionLoadingId(requesterId);
                try {
                    const res = await api.post(`/friend/${requesterId}/accept`);
                    setStatusModal({ isOpen: true, type: 'success', title: 'Berhasil!', message: res.data?.message || 'Teman Curhat berhasil diterima.' });
                    fetchIncomingRequests();
                } catch (error) {
                    setStatusModal({ isOpen: true, type: 'error', title: 'Gagal', message: error.response?.data?.message || 'Gagal menerima Teman Curhat.' });
                } finally {
                    setRequestActionLoadingId(null);
                }
            }
        });
    };

    const handleRejectRequest = async (requesterId) => {
        setConfirmModal({
            isOpen: true,
            type: 'warning',
            message: 'Apakah Anda yakin ingin menolak permintaan Teman Curhat ini?',
            action: async () => {
                setRequestActionLoadingId(requesterId);
                try {
                    const res = await api.post(`/friend/${requesterId}/reject`);
                    setStatusModal({ isOpen: true, type: 'info', title: 'Informasi', message: res.data?.message || 'Permintaan Teman Curhat ditolak.' });
                    fetchIncomingRequests();
                } catch (error) {
                    setStatusModal({ isOpen: true, type: 'error', title: 'Gagal', message: error.response?.data?.message || 'Gagal menolak Teman Curhat.' });
                } finally {
                    setRequestActionLoadingId(null);
                }
            }
        });
    };

    const getCategoryLabel = (cat) => {
        return PSYCHOLOGIST_CATEGORIES.find(c => c.value === cat)?.label || cat || 'Umum';
    };

    const formatRequestTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins}m lalu`;
        if (diffHours < 24) return `${diffHours}j lalu`;
        if (diffDays < 7) return `${diffDays}h lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
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

    const handleHomeClick = (e) => {
        if (window.location.pathname === '/home') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
                window.location.reload();
            }, 300);
        }
    };

    const highestActivityValue = Math.max(...paidAnonymousActivityData.map((item) => item.value), 1);

    return (
        <div className="bg-gradient-to-br from-[#fff9fc] via-[#ffeaf3] to-[#ffd6e8] text-on-background min-h-screen flex">
            <aside className="hidden md:flex flex-col h-screen w-64 border-r border-stone-200 bg-stone-50 py-6 px-4 sticky top-0">
                <div className="sidebar-brand" onClick={() => navigate('/home')}>
                    <div className="sidebar-brand-icon">
                        <span className="material-symbols-outlined">psychology</span>
                    </div>
                    <div className="sidebar-brand-text">
                        <strong>Curhatin</strong>
                        <span>Safe Space</span>
                    </div>
                </div>
                <nav className="flex-1 space-y-2">
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#A46477] bg-[#A46477]/10 font-bold border-r-4 border-[#A46477] transition-all" to="/home" onClick={handleHomeClick}>
                        <span className="material-symbols-outlined">home</span>
                        <span className="font-['Plus_Jakarta_Sans'] font-medium">Beranda</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors active:scale-95 duration-150" to="/messages">
                        <span className="material-symbols-outlined">chat_bubble</span>
                        <span className="font-['Plus_Jakarta_Sans'] font-medium">Pesan</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors active:scale-95 duration-150" to="/friend-requests">
                        <span className="material-symbols-outlined">history</span>
                        <span className="font-['Plus_Jakarta_Sans'] font-medium">Riwayat</span>
                        {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
                    </Link>
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors active:scale-95 duration-150" to="/sessions">
                        <span className="material-symbols-outlined">calendar_today</span>
                        <span className="font-['Plus_Jakarta_Sans'] font-medium">Jadwal Sesi</span>
                        {sessionNotifCount > 0 && <span className="notif-badge">{sessionNotifCount}</span>}
                    </Link>
                    <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors active:scale-95 duration-150" to="/profile">
                        <span className="material-symbols-outlined">person</span>
                        <span className="font-['Plus_Jakarta_Sans'] font-medium">Profil</span>
                    </Link>
                </nav>
                <div className="mt-auto">

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full mt-3 py-3 bg-white text-[#A46477] border border-[#e7c6d1] rounded-xl font-semibold hover:bg-[#fff3f7] transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Keluar
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 w-full flex justify-between items-center px-6 h-16 bg-white/80 backdrop-blur-md border-b border-stone-200 shadow-sm z-40">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-[#A46477] font-headline">Beranda</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
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
                            </div>                            <div className="post-list">
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
                                                className="post-card-premium"
                                            >
                                                {/* Author */}
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
                                                <p className={`text-slate-700 text-[15px] leading-relaxed mb-4 whitespace-pre-wrap ${isModerated ? 'moderated-body-text' : ''}`}>{post.body}</p>
                                                
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
                                                                            </div>
                                                                            <p className="text-xs text-slate-600 leading-relaxed">{comment.content}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}

                                                                {/* Comment Input */}
                                                                <form className="flex items-center gap-3 bg-slate-50 rounded-2xl p-1 pl-4" onSubmit={(e) => submitComment(e, post.id)}>
                                                                    <input
                                                                        type="text"
                                                                        value={commentInputs[post.id] || ''}
                                                                        onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                                                        placeholder="Tulis komentar..."
                                                                        className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-medium text-slate-700 placeholder:text-slate-300"
                                                                    />
                                                                    <button
                                                                        type="submit"
                                                                        disabled={submittingCommentId === post.id}
                                                                        className="w-8 h-8 bg-[#A46477] text-white rounded-xl flex items-center justify-center shadow-md active:scale-90 disabled:opacity-30"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">send</span>
                                                                    </button>
                                                                </form>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {posts.length === 0 ? (
                                <div className="bg-white border border-stone-200 rounded-xl p-8 text-center text-stone-500">
                                    Belum ada linimasa pengguna saat ini.
                                </div>
                            ) : null}
                        </div>

                        <aside className="lg:col-span-4 space-y-6">
                            <section className="bg-white border border-[#edd8e3] rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-[#7a4d62] uppercase tracking-wider">Permintaan Teman Curhat</h3>
                                    <span className="text-xs text-[#a77990]">{incomingRequests.length} menunggu</span>
                                </div>
                                {incomingRequests.length === 0 ? (
                                    <p className="text-sm text-stone-500">Belum ada permintaan Teman Curhat baru.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {incomingRequests.slice(0, 3).map((request) => (
                                            <div key={request.id} className="relative overflow-hidden bg-gradient-to-r from-white to-[#fffcfd] border border-[#f0dde7] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-[#A46477]/10 flex items-center justify-center text-[#A46477] font-bold border border-[#A46477]/20">
                                                            {request.requester?.name?.charAt(0).toUpperCase() || 'P'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-[#3f2f38]">
                                                                {request.requester?.name || 'Anonim'}
                                                                <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded uppercase tracking-tighter">Anonim</span>
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="material-symbols-outlined text-[14px] text-[#A46477]">label</span>
                                                                <p className="text-[11px] font-medium text-[#7a4d62]">
                                                                    {getCategoryLabel(request.category)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-stone-400 uppercase">{formatRequestTime(request.created_at)}</p>
                                                        <div className={`mt-1 inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider
                                                            ${request.status === 'pending' ? 'bg-amber-100 text-amber-600'
                                                            : request.status === 'accepted' ? 'bg-emerald-100 text-emerald-600'
                                                            : 'bg-red-100 text-red-600'}`}>
                                                            {request.status === 'pending' ? 'waiting' : request.status}
                                                        </div>
                                                    </div>
                                                </div>

                                                {request.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAcceptRequest(request.user_id)}
                                                            disabled={requestActionLoadingId === request.user_id}
                                                            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#22c55e] text-white hover:bg-[#16a34a] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-[#22c55e]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                                                        >
                                                            {requestActionLoadingId === request.user_id ? (
                                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                                                    Terima
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRejectRequest(request.user_id)}
                                                            disabled={requestActionLoadingId === request.user_id}
                                                            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 hover:border-red-300 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-red-100/50 disabled:opacity-70 disabled:cursor-not-allowed"
                                                        >
                                                            {requestActionLoadingId === request.user_id ? (
                                                                <span className="w-4 h-4 border-2 border-stone-200 border-t-stone-500 rounded-full animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <span className="material-symbols-outlined text-sm">cancel</span>
                                                                    Tolak
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {incomingRequests.length > 3 && (
                                            <Link to="/friend-requests" className="flex items-center justify-center gap-2 py-3 w-full text-sm font-bold text-[#A46477] bg-[#A46477]/5 rounded-xl hover:bg-[#A46477]/10 transition-colors">
                                                <span>Lihat semua permintaan</span>
                                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </section>


                             <section className="bg-white border border-[#edd8e3] rounded-3xl p-6 shadow-sm overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-black text-[#A46477] uppercase tracking-widest">Rating & Review</h3>
                                        <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                            <span className="text-sm font-black text-amber-700">{reviewsData.average_rating}</span>
                                            <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#A46477] to-[#8a5263] rounded-2xl text-white shadow-lg shadow-primary/20 w-24">
                                            <span className="text-3xl font-black">{reviewsData.average_rating}</span>
                                            <span className="text-[10px] font-bold uppercase opacity-80">Rata-rata</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-slate-800">{reviewsData.total_reviews}</p>
                                            <p className="text-xs font-medium text-stone-500 uppercase tracking-tighter">Total Feedback Anonim</p>
                                            <div className="flex gap-0.5 mt-1">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <span key={s} className="material-symbols-outlined text-[14px] text-amber-400" style={{ fontVariationSettings: s <= Math.round(reviewsData.average_rating) ? "'FILL' 1" : "''" }}>star</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                                        {reviewsLoading ? (
                                            [1, 2].map(i => (
                                                <div key={i} className="animate-pulse flex gap-3">
                                                    <div className="w-8 h-8 bg-stone-100 rounded-full" />
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-2 bg-stone-100 rounded w-1/4" />
                                                        <div className="h-2 bg-stone-100 rounded w-full" />
                                                    </div>
                                                </div>
                                            ))
                                        ) : reviewsData.reviews.length === 0 ? (
                                            <div className="py-8 text-center">
                                                <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <span className="material-symbols-outlined text-stone-300">rate_review</span>
                                                </div>
                                                <p className="text-xs font-medium text-stone-400">Belum ada review dari Teman Curhat.</p>
                                            </div>
                                        ) : (
                                            reviewsData.reviews.map((review) => (
                                                <div key={review.id} className="group bg-[#fff9fb] border border-[#f5ebf0] rounded-2xl p-4 transition-all hover:border-primary/20 hover:shadow-sm">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                                                {review.is_anonymous ? 'A' : (review.patient?.name?.charAt(0) || 'U')}
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-700">
                                                                {review.is_anonymous ? 'Anonim' : (review.patient?.name || 'User')}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <span key={s} className="material-symbols-outlined text-[10px] text-amber-400" style={{ fontVariationSettings: s <= review.rating ? "'FILL' 1" : "''" }}>star</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] text-stone-600 leading-relaxed italic italic-quote">
                                                        "{review.comment || 'Tidak ada komentar.'}"
                                                    </p>
                                                    <p className="text-[9px] text-stone-400 mt-2 text-right">
                                                        {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white border border-[#e8d6ff] rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-sm font-bold text-[#5a3c7d] uppercase tracking-widest">Akun Anonim Berbayar</h3>
                                    <span className="text-xs px-2 py-1 rounded-full bg-[#f5edff] text-[#7b57ad] font-semibold">7 Hari Terakhir</span>
                                </div>
                                {isActivityLoading ? (
                                    <p className="text-sm text-[#7c629f]">Memuat data aktivitas chat...</p>
                                ) : paidAnonymousActivityData.length === 0 ? (
                                    <p className="text-sm text-[#7c629f]">Belum ada akun anonim berbayar dengan aktivitas chat.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {paidAnonymousActivityData.map((item) => (
                                            <div key={item.id}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <p className="text-sm font-semibold text-[#3f2a59]">{item.label}</p>
                                                    <p className="text-[11px] font-medium text-[#8b6bb5]">{item.plan}</p>
                                                </div>
                                                <div className="w-full h-2.5 rounded-full bg-[#f0e6ff] overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-[#9d7ad5] to-[#7a4fb6]"
                                                        style={{ width: `${Math.max(8, Math.round((item.value / highestActivityValue) * 100))}%` }}
                                                    />
                                                </div>
                                                <p className="text-[11px] text-[#7c629f] mt-1">{item.value} pesan</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="bg-[#f2f0f9] border border-[#dad6eb] rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-[#4a457c]">Janji Terjadwal</h3>
                                    <Link to="/sessions" className="text-[#6359c1] text-xs font-bold">Lihat Semua</Link>
                                </div>
                                <div className="space-y-4">
                                    {sessionsLoading ? (
                                        <p className="text-xs text-stone-400">Memuat jadwal...</p>
                                    ) : sessions.filter(s => s.status === 'booked' || s.status === 'pending_approval').length === 0 ? (
                                        <p className="text-xs text-stone-400">Tidak ada janji terjadwal.</p>
                                    ) : (
                                        sessions.filter(s => s.status === 'booked' || s.status === 'pending_approval').slice(0, 3).map(session => (
                                            <div key={session.id} className="flex gap-4 items-start">
                                                <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg border ${session.status === 'pending_approval' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-[#6359c1]/10 text-[#6359c1] border-[#6359c1]/20'}`}>
                                                    <span className="text-xs font-bold">{new Date(session.session_date).getDate()}</span>
                                                    <span className="text-[10px] uppercase">{new Date(session.session_date).toLocaleString('id-ID', { month: 'short' })}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-[#2a2651] leading-none">Konsultasi {session.user?.name || 'Teman Curhat'}</p>
                                                    <p className="text-xs text-[#6b6699] mt-1">{session.session_time.substring(0, 5)} • {session.status === 'pending_approval' ? 'MENUNGGU' : 'TERJADWAL'}</p>
                                                    {session.status === 'pending_approval' && (
                                                        <Link to="/sessions" className="text-[10px] font-black text-amber-600 underline mt-1 block">KONFIRMASI SEKARANG</Link>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </aside>
                    </div>
                </main>
            </div>

            {statusModal.isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setStatusModal({ ...statusModal, isOpen: false })} />
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
                            {statusModal.title || (statusModal.type === 'success' ? 'Berhasil!'
                                : statusModal.type === 'error' ? 'Gagal'
                                : statusModal.type === 'warning' ? 'Menunggu'
                                : 'Informasi')}
                        </h3>
                        <p className="text-slate-500 mb-8 font-medium leading-relaxed">{statusModal.message}</p>
                        <button
                            onClick={() => setStatusModal({ ...statusModal, isOpen: false })}
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

            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} />
                    <div className="relative bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col items-center text-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner
                            ${confirmModal.type === 'success' ? 'bg-emerald-100 text-emerald-600'
                            : confirmModal.type === 'warning' ? 'bg-amber-100 text-amber-600'
                            : 'bg-blue-100 text-blue-600'}`}>
                            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {confirmModal.type === 'success' ? 'verified_user'
                                : confirmModal.type === 'warning' ? 'help_outline'
                                : 'info'}
                            </span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Konfirmasi</h3>
                        <p className="text-slate-500 mb-8 font-medium leading-relaxed">{confirmModal.message}</p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                className="flex-1 py-3.5 rounded-full font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => {
                                    confirmModal.action();
                                    setConfirmModal({ ...confirmModal, isOpen: false });
                                }}
                                className="flex-1 py-3.5 rounded-full font-bold text-white shadow-lg transition-all hover:-translate-y-1 active:scale-95"
                                style={{
                                    backgroundColor: confirmModal.type === 'success' ? '#10b981' : confirmModal.type === 'warning' ? '#f59e0b' : '#3b82f6',
                                    boxShadow: `0 10px 15px -3px ${confirmModal.type === 'success' ? 'rgba(16,185,129,0.3)' : confirmModal.type === 'warning' ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'}`,
                                }}
                            >
                                Ya, Lanjutkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPsikolog;
