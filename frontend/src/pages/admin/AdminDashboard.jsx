import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, STORAGE_BASE_URL } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { getSpesialisasiLabel } from '../../lib/constants';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

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
            <main className="flex-1 flex flex-col h-screen overflow-y-auto">
                {/* TopNavBar */}
                <header className="w-full docked top-0 flex justify-between items-center px-8 py-3 bg-teal-50/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-teal-100/20 sticky z-20">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-teal-600/70 text-sm">search</span>
                            <input className="w-full bg-teal-100/50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-teal-600/50" placeholder="Cari data..." type="text" />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 border-l border-teal-100/20 pl-6">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-teal-900">{user?.name || 'Admin Utama'}</p>
                                <p className="text-xs text-teal-600/70">Administrator</p>
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
                <div className="p-8 max-w-7xl mx-auto w-full">
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
                                <span className="text-xs font-bold text-tertiary bg-tertiary-container/30 px-2 py-1 rounded-full">Verf</span>
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
                                <span className="text-xs font-bold text-on-secondary-container bg-secondary-container px-2 py-1 rounded-full">Anon</span>
                            </div>
                            <div className="mt-8">
                                <p className="text-sm text-on-surface-variant font-medium">Pengguna Anonim</p>
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
                                                <td className="py-4 text-on-surface-variant capitalize">{u.role}</td>
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

                        {/* Medium Section: Psychologist Verification List */}
                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                            <div className="bg-[#cce8e6] rounded-[2rem] p-6 shadow-sm flex-1">
                                <div className="flex justify-between items-center mb-6 pl-2 pr-1">
                                    <h4 className="text-[19px] font-bold text-[#143837]">Verifikasi Psikolog</h4>
                                    {data.pendingCount > 0 && (
                                        <span className="bg-[#b91c1c] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">PENDING</span>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    {data.pendingPsikolog?.length === 0 ? (
                                        <div className="text-center py-6 text-on-surface-variant font-medium">Tidak ada antrian</div>
                                    ) : (
                                        data.pendingPsikolog?.slice(0,4).map(p => {
                                            // Format relative time optionally, but let's just use date simply
                                            const joinDate = new Date(p.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
                                            
                                            return (
                                                <div key={p.id} className="flex gap-4 p-5 rounded-[2rem] bg-white shadow-sm hover:shadow-md transition-shadow">
                                                    {p.profile_image ? (
                                                        <img src={`${STORAGE_BASE_URL}/${p.profile_image}`} alt={p.name} className="w-[60px] h-[60px] rounded-full object-cover border border-slate-100 flex-shrink-0" />
                                                    ) : (
                                                        <div className="w-[60px] h-[60px] rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xl border border-slate-200 flex-shrink-0">
                                                            {p.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start relative">
                                                            <div className="min-w-0 pr-10">
                                                                <p className="text-[15px] font-bold text-slate-800 line-clamp-1">{p.name}</p>
                                                                <p className="text-[9px] font-bold text-[#A46477] uppercase tracking-wider bg-[#ffd9e2]/30 px-1 inline-block rounded">{getSpesialisasiLabel(p.spesialisasi)}</p>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                                <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">{joinDate}</span>
                                                                <Link to="/admin/verifications" className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 hover:bg-teal-600 hover:text-white transition-all shadow-sm group/view mt-1" title="Lihat Detail Verifikasi">
                                                                    <span className="material-symbols-outlined text-xl">more_vert</span>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-3 mt-3">
                                                            <button 
                                                                onClick={() => handleVerify(p.id)} 
                                                                className="text-[12px] font-bold bg-[#356765] text-white px-5 py-1.5 rounded-full hover:bg-[#285b59] transition-colors"
                                                            >
                                                                Setujui
                                                            </button>
                                                            <button 
                                                                onClick={() => handleReject(p.id)} 
                                                                className="text-[12px] font-bold bg-[#fce5e5] text-[#b91c1c] px-6 py-1.5 rounded-full hover:bg-[#fecaca] transition-colors"
                                                            >
                                                                Tolak
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                {data.pendingCount > 4 && (
                                    <Link to="/admin/verifications">
                                        <button className="w-full mt-6 py-3 border-2 border-[#95b9b8] text-[#356765] text-sm font-bold rounded-full hover:bg-white transition-colors">
                                            Lihat {data.pendingCount - 4} Lainnya
                                        </button>
                                    </Link>
                                )}
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
