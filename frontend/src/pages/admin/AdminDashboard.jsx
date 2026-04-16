import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, STORAGE_BASE_URL } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { getSpesialisasiLabel } from '../../lib/constants';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNotif, setShowNotif] = useState(false);
    const [txPage, setTxPage] = useState(0);
    const notifRef = useRef(null);

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
                const res = await api.get('/admin/dashboard');
                setData(res.data);
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
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-teal-600/70 text-sm">search</span>
                            <input className="w-full bg-teal-100/50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-teal-600/50" placeholder="Cari data..." type="text" />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Notification Bell */}
                        <div className="relative" ref={notifRef}>
                            <button 
                                onClick={() => setShowNotif(!showNotif)}
                                className="relative p-2 rounded-full hover:bg-teal-100/50 text-teal-700 dark:text-teal-300 transition-colors"
                            >
                                <span className="material-symbols-outlined">notifications</span>
                                {data?.pendingCount > 0 && (
                                    <span className="absolute top-1 right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-teal-50 dark:border-slate-900"></span>
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotif && (
                                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-teal-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-3 border-b border-teal-50 dark:border-slate-700 bg-teal-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                        <h3 className="font-bold text-sm text-teal-900 dark:text-teal-100">Notifikasi</h3>
                                        {data?.pendingCount > 0 && (
                                            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{data.pendingCount} Baru</span>
                                        )}
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {!data || data.pendingCount === 0 || !data.pendingPsikolog ? (
                                            <div className="px-4 py-6 text-center text-sm text-slate-500">
                                                Tidak ada notifikasi baru
                                            </div>
                                        ) : (
                                            data.pendingPsikolog.slice(0, 5).map(p => (
                                                <div key={p.id} onClick={() => {navigate('/admin/verifications'); setShowNotif(false)}} className="px-4 py-3 border-b last:border-0 border-teal-50 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{p.name} <span className="font-normal text-slate-500">mendaftar sebagai Psikolog.</span></p>
                                                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold mt-1 uppercase">Menunggu Verifikasi</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {data?.pendingCount > 0 && (
                                        <div onClick={() => {navigate('/admin/verifications'); setShowNotif(false)}} className="px-4 py-2 bg-teal-50 dark:bg-slate-800 text-center text-xs font-bold text-teal-700 dark:text-teal-400 cursor-pointer hover:bg-teal-100 dark:hover:bg-slate-700 transition-colors">
                                            Lihat Semua Verifikasi
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 border-l border-teal-100/20 pl-6">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-teal-900 dark:text-teal-50">{user?.name || 'Admin Utama'}</p>
                                <p className="text-xs text-teal-700/80 dark:text-teal-200/60">Administrator</p>
                            </div>
                            <img alt="Administrator Profile" className="w-10 h-10 rounded-full object-cover border-2 border-primary-container shadow-sm" src={user?.profile_image ? `${STORAGE_BASE_URL}/${user.profile_image}` : "https://lh3.googleusercontent.com/aida-public/AB6AXuBm481M9tNd-xc5xbiKH6vBwwqPvECsmTBkvCgI5rCPIXYwst6G3CQRvLcybInnUcEpRcwg6rzK3ZDvMbk9oui86445Wilkp_iZLWEHc3cRPllF6klyfsTKO4xDngl3c-P94-0rtEcGNpcOxOtReGlNRLibuBOVnt93rgsi8epyI8mxPf8_v_VkeJhadFWtFTYojBYiOI-IREdst4dtsF8T6PRhP4Uccq16_vAOQiBC0OtqmwijX1DQonTPlvJLxTobFuX-J11qlGw"} />
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
                    <div className="mb-10">
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
                        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-lg p-8 shadow-sm">
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
                                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">@{u.username || u.name}</p>
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
                </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
