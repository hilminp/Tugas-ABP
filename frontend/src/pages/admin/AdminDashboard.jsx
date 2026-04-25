import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, STORAGE_BASE_URL } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { getSpesialisasiLabel } from '../../lib/constants';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Bell, UserPlus, CreditCard, CheckCircle, Clock, ChevronRight, X } from 'lucide-react';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNotif, setShowNotif] = useState(false);
    const [txPage, setTxPage] = useState(0);
    const notifRef = useRef(null);
    const [readNotifIds, setReadNotifIds] = useState(() => {
        try {
            const saved = localStorage.getItem('admin_read_notifs');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    // Handle scroll from notification
    useEffect(() => {
        if (location.state?.scrollTo) {
            setTimeout(() => {
                document.getElementById(location.state.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
                // Clear state to avoid scrolling again on refresh
                window.history.replaceState({}, document.title);
            }, 500);
        }
    }, [location.state]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotif(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [dashRes, analyticsRes] = await Promise.all([
                    api.get('/admin/dashboard'),
                    api.get('/admin/analytics'),
                ]);
                setData(dashRes.data);
                setAnalytics(analyticsRes.data);
            } catch (err) {
                console.error("Failed to load admin dashboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const handleVerify = async (id) => {
        try {
            await api.post(`/admin/verify/${id}`);
            const res = await api.get('/admin/dashboard');
            setData(res.data);
        } catch (err) {
            alert('Failed to verify');
        }
    };

    const handleReject = async (id) => {
        if (!confirm('Tolak verifikasi?')) return;
        try {
            await api.post(`/admin/reject/${id}`);
            const res = await api.get('/admin/dashboard');
            setData(res.data);
        } catch (err) {
            alert('Failed to reject');
        }
    };

    // Early return removed to support skeleton UI

    return (
        <div className="geometric-bg text-on-surface h-screen w-full flex overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
                .bento-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; }
                .glass-card { background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
                .geometric-bg { background-color: #ebfdfc; background-image: radial-gradient(#35676511 1px, transparent 1px); background-size: 32px 32px; }
            `}</style>
            
            {/* SideNavBar */}
            <aside className="h-screen w-64 docked left-0 flex flex-col h-full border-r border-teal-100/10 bg-teal-50 dark:bg-slate-950 font-plus-jakarta text-base shrink-0">
                <div className="px-6 py-8">
                    <h1 className="text-lg font-black text-teal-900 dark:text-teal-50">The Sanctuary</h1>
                    <p className="text-xs text-teal-700/60 dark:text-teal-300/40 uppercase tracking-widest mt-1">Admin Console</p>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-[#A46477] font-bold border-r-4 border-[#A46477] bg-teal-100/20 active:translate-x-1 duration-150 rounded-l-lg">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 text-teal-700/60 dark:text-teal-300/40 hover:bg-teal-100/40 dark:hover:bg-teal-800/20 transition-all rounded-lg group">
                        <span className="material-symbols-outlined">groups</span>
                        <span>Kelola Pengguna</span>
                    </Link>
                    <Link to="/admin/verifications" className="flex items-center gap-3 px-4 py-3 text-teal-700/60 dark:text-teal-300/40 hover:bg-teal-100/40 dark:hover:bg-teal-800/20 transition-all rounded-lg">
                        <span className="material-symbols-outlined">verified_user</span>
                        <span>Verifikasi</span>
                    </Link>
                    <Link to="/admin/appeals" className="flex items-center gap-3 px-4 py-3 text-teal-700/60 dark:text-teal-300/40 hover:bg-teal-100/40 dark:hover:bg-teal-800/20 transition-all rounded-lg group">
                        <span className="material-symbols-outlined">mail</span>
                        <span>Kotak Surat Banding</span>
                    </Link>
                </nav>
                <div className="px-4 py-6 border-t border-teal-100/10">
                    <button onClick={() => navigate('/home')} className="w-full bg-[#A46477] text-white py-3 rounded-full font-bold text-sm mb-6 shadow-lg shadow-[#A46477]/20 active:scale-95 transition-transform">
                        Kembali ke Aplikasi
                    </button>
                    <div className="space-y-1">
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-teal-700/60 dark:text-teal-300/40 hover:bg-teal-100/40 transition-all rounded-lg text-sm">
                            <span className="material-symbols-outlined text-sm">logout</span>
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                {/* TopNavBar */}
                <header className="w-full docked top-0 flex justify-between items-center px-8 py-3 bg-teal-50/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-teal-100/20 sticky z-20">
                    <div className="flex items-center gap-3 flex-1">
                        <button 
                            onClick={() => document.getElementById('summary-section')?.scrollIntoView({behavior: 'smooth'})}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100/50 text-teal-700 hover:bg-teal-100 transition-all text-xs font-bold border border-teal-200/50 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-sm">grid_view</span>
                            Ringkasan
                        </button>
                        <button 
                            onClick={() => document.getElementById('activity-section')?.scrollIntoView({behavior: 'smooth'})}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100/50 text-teal-700 hover:bg-teal-100 transition-all text-xs font-bold border border-teal-200/50 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-sm">history</span>
                            Aktivitas
                        </button>
                        <button 
                            onClick={() => document.getElementById('analytics-section')?.scrollIntoView({behavior: 'smooth'})}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100/50 text-teal-700 hover:bg-teal-100 transition-all text-xs font-bold border border-teal-200/50 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-sm">analytics</span>
                            Analytics
                        </button>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Notification Bell */}
                        <div className="relative" ref={notifRef}>
                            <button 
                                onClick={() => setShowNotif(!showNotif)}
                                className={`relative p-2.5 rounded-full transition-all duration-300 ${showNotif ? 'bg-teal-100 text-teal-700 shadow-inner' : 'hover:bg-teal-100/50 text-teal-700/70 dark:text-teal-300/70'}`}
                            >
                                <Bell size={20} strokeWidth={2.5} />
                                {(() => {
                                    const unreadCount = [
                                        ...(data?.pendingPsikolog || []).map(p => `psikolog_${p.id}`),
                                        ...(data?.latestPremiumUsers || []).map(u => `premium_${u.id}`)
                                    ].filter(id => !readNotifIds.includes(id)).length;
                                    
                                    return unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white dark:border-slate-900 shadow-sm"></span>
                                        </span>
                                    );
                                })()}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotif && (
                                <div className="absolute right-0 mt-3 w-[360px] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-teal-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="px-6 py-5 border-b border-teal-50 dark:border-slate-700 bg-teal-50/30 dark:bg-slate-800/50 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-black text-sm text-teal-900 dark:text-teal-100 uppercase tracking-wider">Notifikasi</h3>
                                            <span className="bg-teal-100 text-teal-700 text-[10px] font-black px-2 py-0.5 rounded-full">Baru</span>
                                        </div>
                                        <button onClick={() => setShowNotif(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {(() => {
                                            const notifications = [
                                                ...(data?.pendingPsikolog || []).map(p => ({ ...p, type: 'psikolog', nid: `psikolog_${p.id}` })),
                                                ...(data?.latestPremiumUsers || []).map(u => ({ ...u, type: 'premium', nid: `premium_${u.id}` }))
                                            ]
                                            .filter(item => !readNotifIds.includes(item.nid))
                                            .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));

                                            if (notifications.length === 0) {
                                                return (
                                                    <div className="px-6 py-12 text-center">
                                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                            <Bell className="text-slate-300" size={24} />
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-400">Tidak ada notifikasi baru</p>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="divide-y divide-teal-50/50 dark:divide-slate-700/50">
                                                    {notifications.map((item, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            onClick={() => {
                                                                // Mark as read
                                                                const newRead = [...readNotifIds, item.nid];
                                                                setReadNotifIds(newRead);
                                                                localStorage.setItem('admin_read_notifs', JSON.stringify(newRead));

                                                                // Navigate
                                                                if (item.type === 'psikolog') {
                                                                    navigate('/admin/verifications');
                                                                } else {
                                                                    if (window.location.pathname !== '/admin/dashboard') {
                                                                        navigate('/admin/dashboard', { state: { scrollTo: 'analytics-section' } });
                                                                    } else {
                                                                        document.getElementById('analytics-section')?.scrollIntoView({ behavior: 'smooth' });
                                                                    }
                                                                }
                                                                setShowNotif(false);
                                                            }} 
                                                            className="px-6 py-4 hover:bg-teal-50/50 dark:hover:bg-slate-700/30 cursor-pointer transition-all flex gap-4 group"
                                                        >
                                                            <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center ${item.type === 'psikolog' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                                                {item.type === 'psikolog' ? <UserPlus size={18} /> : <CreditCard size={18} />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start mb-0.5">
                                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">
                                                                        {item.type === 'psikolog' ? 'Verifikasi' : 'Pembayaran'}
                                                                    </p>
                                                                    <span className="text-[9px] font-bold text-slate-300 flex items-center gap-1">
                                                                        <Clock size={8} /> 
                                                                        {new Date(item.updated_at || item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                                                                    {item.name}
                                                                </p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                                                    {item.type === 'psikolog' ? 'Baru saja mendaftar sebagai Psikolog.' : 'Upgrade ke akun Premium berhasil!'}
                                                                </p>
                                                            </div>
                                                            <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <ChevronRight size={14} className="text-teal-400" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    
                                    <div className="p-4 bg-teal-50/10 dark:bg-slate-800/50 border-t border-teal-50 dark:border-slate-700">
                                        <button 
                                            onClick={() => {navigate('/admin/verifications'); setShowNotif(false)}} 
                                            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-600/20 transition-all active:scale-[0.98]"
                                        >
                                            Lihat Semua Aktivitas
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 border-l border-teal-100/20 pl-6">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-teal-900 dark:text-teal-50">{user?.name || 'Admin Utama'}</p>
                            </div>
                            {user?.profile_image ? (
                                <img alt="Administrator Profile" className="w-10 h-10 rounded-full object-cover border-2 border-primary-container shadow-sm" src={`${STORAGE_BASE_URL}/${user.profile_image}`} />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-white border-2 border-teal-100 flex items-center justify-center text-teal-800 font-bold shadow-sm">
                                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Dashboard Body */}
                {loading || !data ? (
                    <div className="p-8 max-w-7xl mx-auto w-full animate-pulse transition-all">
                        {/* Greeting */}
                        <div className="h-10 bg-teal-100/50 rounded-lg w-1/3 mb-2"></div>
                        <div className="h-4 bg-teal-100/30 rounded w-1/4 mb-10"></div>
                        
                        {/* Bento Grid */}
                        <div className="bento-grid">
                            <div className="col-span-12 xl:col-span-8 h-64 bg-teal-100/30 rounded-[2rem]"></div>
                            <div className="col-span-12 xl:col-span-4 h-64 bg-teal-100/30 rounded-[2rem]"></div>
                            <div className="col-span-12 h-96 bg-teal-100/30 rounded-[2rem]"></div>
                        </div>
                    </div>
                ) : (
                <div className="p-8 w-full">
                    {/* Welcome Header */}
                    <div id="summary-section" className="mb-10 pt-4">
                        <h2 className="text-3xl font-bold tracking-tight text-on-background">Dashboard Ringkasan</h2>
                        <p className="text-on-surface-variant mt-1">Selamat datang kembali di Ethereal Sanctuary Admin Panel.</p>
                    </div>

                    {/* Bento Stats Grid */}
                    <div className="bento-grid mb-10">
                        <div className="col-span-12 md:col-span-6 lg:col-span-3 glass-card rounded-lg p-6 border border-white/40 shadow-sm flex flex-col justify-between group hover:bg-surface-container-low transition-colors duration-300">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <span className="material-symbols-outlined text-primary">groups</span>
                                </div>
                                <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-1 rounded-full">Total</span>
                            </div>
                            <div className="mt-8">
                                <p className="text-sm text-on-surface-variant font-medium">Total Pengguna</p>
                                <h3 className="text-4xl font-black text-on-background mt-1">{data.totalUsers}</h3>
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-6 lg:col-span-2 glass-card rounded-lg p-6 border border-white/40 shadow-sm flex flex-col justify-between group hover:bg-surface-container-low transition-colors duration-300">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-tertiary/10 rounded-lg">
                                    <span className="material-symbols-outlined text-tertiary">psychology</span>
                                </div>
                                <span className="text-xs font-bold text-tertiary bg-tertiary-container/30 px-2 py-1 rounded-full">Verifikasi</span>
                            </div>
                            <div className="mt-8">
                                <p className="text-sm text-on-surface-variant font-medium">Psikolog Terdaftar</p>
                                <h3 className="text-4xl font-black text-on-background mt-1">{data.totalPsikolog}</h3>
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-6 lg:col-span-3 glass-card rounded-lg p-6 border border-white/40 shadow-sm flex flex-col justify-between group hover:bg-surface-container-low transition-colors duration-300">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-secondary/10 rounded-lg">
                                    <span className="material-symbols-outlined text-secondary">person_off</span>
                                </div>
                                <span className="text-xs font-bold text-on-secondary-container bg-secondary-container px-2 py-1 rounded-full">Anonim</span>
                            </div>
                            <div className="mt-8">
                                <p className="text-sm text-on-surface-variant font-medium">Anonim & Premium</p>
                                <h3 className="text-4xl font-black text-on-background mt-1">{data.totalAnonim}</h3>
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-6 lg:col-span-2 glass-card rounded-lg p-6 border border-white/40 shadow-sm flex flex-col justify-between group hover:bg-surface-container-low transition-colors duration-300">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-error/10 rounded-lg">
                                    <span className="material-symbols-outlined text-error">verified_user</span>
                                </div>
                                <span className="text-xs font-bold text-error bg-error-container/30 px-2 py-1 rounded-full">Pending</span>
                            </div>
                            <div className="mt-8">
                                <p className="text-sm text-on-surface-variant font-medium">Menunggu Verifikasi</p>
                                <h3 className="text-4xl font-black text-on-background mt-1">{data.pendingCount}</h3>
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-6 lg:col-span-2 glass-card rounded-lg p-6 border border-white/40 shadow-sm flex flex-col justify-between group hover:bg-surface-container-low transition-colors duration-300 border-l-4 border-l-red-500/50">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-red-500/10 rounded-lg">
                                    <span className="material-symbols-outlined text-red-500">block</span>
                                </div>
                                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">Banned</span>
                            </div>
                            <div className="mt-8">
                                <p className="text-sm text-on-surface-variant font-medium">Ditangguhkan</p>
                                <h3 className="text-4xl font-black text-on-background mt-1">{data.totalSuspended || 0}</h3>
                            </div>
                        </div>

                        {/* Large Section: Recent Activity Table */}
                        <div id="activity-section" className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-lg p-8 shadow-sm scroll-mt-20">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h4 className="text-xl font-bold text-on-background leading-tight">Aktivitas Terbaru</h4>
                                    <p className="text-sm text-on-surface-variant">Data pengguna yang baru bergabung</p>
                                </div>
                                <Link to="/admin/users" className="text-primary font-bold text-sm hover:underline">Lihat Semua</Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-xs text-on-surface-variant font-bold border-b border-surface-container-low uppercase tracking-wider">
                                            <th className="pb-4">User</th>
                                            <th className="pb-4">Role</th>
                                            <th className="pb-4">Status</th>
                                            <th className="pb-4">Join Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {data.recentUsers?.map(u => (
                                            <tr key={u.id} className="border-b border-surface-container-low group hover:bg-surface-container/30 transition-colors">
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm" style={{backgroundColor: '#356765'}}>
                                                            {u.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-on-background line-clamp-1">{u.name}</p>
                                                            <p className="text-[10px] text-[#A46477] font-bold uppercase tracking-tight">
                                                                {u.role === 'psikolog' ? getSpesialisasiLabel(u.spesialisasi) : u.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-on-surface-variant capitalize">
                                                    {u.is_admin ? 'Administrator' : u.is_premium ? (
                                                        <span className="text-[#8b6508] font-bold">Premium</span>
                                                    ) : u.role}
                                                </td>
                                                <td className="py-4">
                                                    {u.is_suspended ? (
                                                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wide">Ditangguhkan</span>
                                                    ) : u.is_admin ? (
                                                        <span className="px-2 py-1 rounded-full bg-error-container text-on-error-container text-[10px] font-bold uppercase tracking-wide">Admin</span>
                                                    ) : u.role === 'psikolog' && u.is_rejected ? (
                                                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wide">Ditolak</span>
                                                    ) : u.role === 'psikolog' && !u.is_verified ? (
                                                        <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-wide">Pending</span>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold uppercase tracking-wide">Aktif</span>
                                                    )}
                                                </td>
                                                <td className="py-4 text-on-surface-variant">{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Medium Section: Aktivitas Keuangan Premium */}
                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 rounded-[2rem] p-8 shadow-sm flex-1 relative overflow-hidden group border border-amber-200/50">
                                {/* Decorative elements */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl group-hover:bg-amber-400/30 transition-all duration-700"></div>
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-400/20 rounded-full blur-3xl"></div>
                                
                                <div className="flex justify-between items-center mb-6 relative z-10">
                                    <h4 className="text-[19px] font-bold text-amber-900 dark:text-amber-100">Keuangan Premium</h4>
                                    <div className="w-10 h-10 rounded-full bg-amber-200/60 flex items-center justify-center text-amber-700 shadow-inner">
                                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>workspace_premium</span>
                                    </div>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    {/* Monthly Revenue */}
                                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl p-5 border border-amber-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                        <p className="text-[11px] text-amber-700/70 dark:text-amber-200/50 font-black uppercase tracking-widest mb-1">Estimasi Pendapatan</p>
                                        <h2 className="text-3xl font-black text-amber-600 dark:text-amber-500">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(data.premiumRevenue || 0)}
                                        </h2>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-100 dark:border-slate-700 text-center hover:-translate-y-1 transition-transform">
                                            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{data.totalPremiumUsers || 0}</p>
                                            <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mt-1">Berlangganan</p>
                                        </div>
                                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-100 dark:border-slate-700 text-center hover:-translate-y-1 transition-transform">
                                            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">100%</p>
                                            <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mt-1">Sukses Rate</p>
                                        </div>
                                    </div>

                                    {/* Latest Transactions */}
                                    <div className="pt-5 border-t border-amber-200/50 dark:border-slate-700/50 mt-2">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] font-black text-amber-800/60 dark:text-amber-200/50 uppercase tracking-widest">Transaksi Terakhir</p>
                                                {data.latestPremiumUsers?.length > 3 && (
                                                    <div className="flex items-center bg-amber-100/50 dark:bg-amber-900/20 rounded-full px-1 py-0.5 ml-1">
                                                        <button 
                                                            disabled={txPage === 0}
                                                            onClick={() => setTxPage(p => p - 1)}
                                                            className="p-0.5 hover:text-amber-600 dark:hover:text-amber-400 disabled:opacity-30 disabled:hover:text-inherit transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                                                        </button>
                                                        <div className="w-[1px] h-2 bg-amber-800/20 dark:bg-amber-200/20 mx-0.5"></div>
                                                        <button 
                                                            disabled={(txPage + 1) * 3 >= data.latestPremiumUsers.length}
                                                            onClick={() => setTxPage(p => p + 1)}
                                                            className="p-0.5 hover:text-amber-600 dark:hover:text-amber-400 disabled:opacity-30 disabled:hover:text-inherit transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            {data.totalPremiumUsers > 3 && (
                                                <Link to="/admin/users" className="text-amber-600 dark:text-amber-400 hover:translate-x-1 transition-transform inline-flex items-center gap-1 group/all" title="Lihat semua transaksi">
                                                    <span className="text-[9px] font-bold opacity-0 group-hover/all:opacity-100 transition-opacity">Kelola</span>
                                                    <span className="material-symbols-outlined text-sm font-bold">manage_accounts</span>
                                                </Link>
                                            )}
                                        </div>
                                        <div className="space-y-1 relative min-h-[120px]">
                                            {data.latestPremiumUsers && data.latestPremiumUsers.length > 0 ? (
                                                <div key={txPage} className="animate-in fade-in slide-in-from-right-2 duration-300">
                                                    {data.latestPremiumUsers.slice(txPage * 3, (txPage * 3) + 3).map(u => (
                                                    <div key={u.id} className="flex items-center justify-between group/tx hover:bg-white/40 dark:hover:bg-slate-800/40 p-2 -mx-2 rounded-lg transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                                                                <span className="material-symbols-outlined text-[16px]">payments</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{u.name} (anonim)</p>
                                                                <p className="text-[9px] text-slate-500 font-medium">Upgrade Baru (Rp 15.000)</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-black text-emerald-600">Lunas</span>
                                                    </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-[11px] text-slate-500 font-medium italic">Belum ada transaksi premium yang masuk.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Stats Card */}
                        <div className="col-span-12 bg-[#356765] rounded-lg p-10 flex flex-col md:flex-row items-center justify-between text-white relative overflow-hidden group">
                            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] group-hover:scale-110 transition-transform duration-700"></div>
                            <div className="z-10 text-center md:text-left mb-6 md:mb-0">
                                <h4 className="text-2xl font-black mb-2">Pantau Kesejahteraan Komunitas</h4>
                                <p className="text-teal-100/80 max-w-xl">Admin Panel ini memberikan kontrol penuh untuk memastikan Ethereal Sanctuary tetap menjadi ruang yang aman dan nyaman bagi setiap jiwa.</p>
                            </div>
                            <div className="z-10 flex gap-4">
                                <div className="text-center px-6 border-r border-teal-100/20">
                                    <p className="text-3xl font-black">100%</p>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-teal-100/60">Sistem Aktif</p>
                                </div>
                                <div className="text-center px-6">
                                    <p className="text-3xl font-black">{data.totalUsers}</p>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-teal-100/60">Total Member</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── Analytics Section ─── */}
                    {analytics && (
                    <div id="analytics-section" className="mt-10 scroll-mt-20">
                        {/* Section Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-on-background">Analytics Platform</h2>
                                <p className="text-on-surface-variant mt-1 text-sm">Data statistik 7 hari terakhir secara real-time.</p>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-black text-teal-600 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse inline-block"></span>
                                Live Data
                            </span>
                        </div>

                        {/* KPI Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'Total Postingan', value: analytics.totalPosts, icon: 'article', gradient: 'from-violet-500 to-purple-600', light: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
                                { label: 'Total Like', value: analytics.totalLikes, icon: 'favorite', gradient: 'from-rose-400 to-pink-600', light: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
                                { label: 'Total Komentar', value: analytics.totalComments, icon: 'chat_bubble', gradient: 'from-sky-400 to-blue-600', light: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' },
                                { label: 'Total Pendapatan', value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(data?.premiumRevenue || 0), icon: 'payments', gradient: 'from-amber-400 to-orange-500', light: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
                            ].map((kpi, i) => (
                                <div key={kpi.label} className={`relative overflow-hidden bg-white border ${kpi.border} rounded-2xl p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 group`}>
                                    <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${kpi.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                                        <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{kpi.icon}</span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                                    <p className={`text-2xl font-black ${kpi.text}`}>{kpi.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Charts — full-width area chart for user growth + revenue */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">

                            {/* User Growth Area Chart — wider */}
                            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h4 className="font-bold text-slate-800">Pertumbuhan Pengguna</h4>
                                        <p className="text-xs text-slate-400 font-medium mt-0.5">Pengguna baru per hari (7 hari terakhir)</p>
                                    </div>
                                    <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-teal-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>group_add</span>
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={analytics.userGrowth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 700 }}
                                            labelStyle={{ color: '#475569', marginBottom: '4px' }}
                                            formatter={(v) => [v, 'User Baru']}
                                        />
                                        <Area type="monotone" dataKey="users" stroke="#0d9488" strokeWidth={2.5} fill="url(#colorUsers)" dot={{ fill: '#0d9488', r: 4 }} activeDot={{ r: 6 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Revenue Area Chart */}
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h4 className="font-bold text-slate-800">Revenue Harian</h4>
                                        <p className="text-xs text-slate-400 font-medium mt-0.5">Estimasi premium (Rp)</p>
                                    </div>
                                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-amber-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={analytics.revenueGrowth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${v/1000}k` : v} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 700 }}
                                            formatter={(v) => [new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v), 'Revenue']}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2.5} fill="url(#colorRevenue)" dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 6 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Posts & Likes Bar Chart — full width */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h4 className="font-bold text-slate-800">Aktivitas Konten</h4>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">Postingan, Like, dan Komentar per hari (7 hari terakhir)</p>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-rose-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={analytics.contentGrowth} margin={{ top: 5, right: 20, left: -20, bottom: 0 }} barCategoryGap="35%" barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', fontSize: '12px', fontWeight: 700, padding: '10px 14px' }}
                                        cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 8 }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '16px' }} />
                                    <Bar dataKey="posts" name="Postingan" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="likes" name="Like" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="comments" name="Komentar" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    )}
                </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
