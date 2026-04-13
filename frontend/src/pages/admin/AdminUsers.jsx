import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api, STORAGE_BASE_URL } from '../../lib/api';
import { getSpesialisasiLabel } from '../../lib/constants';

const AdminUsers = () => {
    const { user: me, logout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/admin/users');
                setUsers(res.data.users || []);
            } catch (err) {
                console.error("Failed to fetch users", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleSuspend = async (id, name, isSuspended) => {
        if (!isSuspended) {
            const reason = window.prompt(`Masukkan alasan penangguhan untuk user ${name} (required):`);
            if (reason === null) return;
            const cleanReason = reason.trim();
            if (!cleanReason) {
                alert('Alasan wajib diisi untuk menangguhkan akun.');
                return;
            }
            try {
                await api.post(`/admin/user/${id}/suspend`, { action: 'suspend', reason: cleanReason });
                setUsers(users.map(u => u.id === id ? { ...u, is_suspended: true, suspended_reason: cleanReason } : u));
            } catch(e) {
                alert(e.response?.data?.message || 'Failed to suspend');
            }
        } else {
            try {
                await api.post(`/admin/user/${id}/suspend`, { action: 'unsuspend' });
                setUsers(users.map(u => u.id === id ? { ...u, is_suspended: false, suspended_reason: null } : u));
            } catch(e) {
                alert(e.response?.data?.message || 'Failed to unsuspend');
            }
        }
    };

    const handleToggleAdmin = async (id) => {
        if (!confirm('Ubah status admin untuk user ini?')) return;
        try {
            await api.post(`/admin/user/${id}/toggle-admin`);
            setUsers(users.map(u => u.id === id ? { ...u, is_admin: !u.is_admin } : u));
        } catch(e) {
            alert(e.response?.data?.message || 'Failed to toggle admin');
        }
    };

    // Skeleton handler handles loading state below

    // Filter users dynamically
    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Derived statistics
    const totalActive = users.filter(u => !u.is_suspended && !u.is_admin && u.role !== 'psikolog').length;
    const totalPsikolog = users.filter(u => u.role === 'psikolog').length;
    const totalSuspended = users.filter(u => u.is_suspended).length;

    return (
        <div className="bg-background text-on-background selection:bg-primary-container h-screen w-full flex overflow-hidden font-plus-jakarta" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
                .font-plus-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
            `}</style>
            
            {/* SideNavBar */}
            <aside className="flex flex-col h-screen w-64 border-r border-teal-100/10 bg-teal-50 dark:bg-slate-900 z-50 shrink-0 sticky top-0 py-6 px-4">
                <div className="mb-10 px-4">
                    <h1 className="text-xl font-bold text-teal-900 dark:text-teal-50">The Sanctuary</h1>
                    <p className="text-xs text-teal-700/60 font-medium">Admin Console</p>
                </div>
                <nav className="flex-1 space-y-2">
                    <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-teal-700/70 dark:text-slate-400 hover:bg-teal-100 dark:hover:bg-slate-800 transition-colors duration-200 rounded-full">
                        <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
                        <span className="font-plus-jakarta text-sm font-medium">Dashboard</span>
                    </Link>
                    <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 text-teal-900 dark:text-teal-100 font-semibold bg-teal-200/50 dark:bg-teal-900/30 rounded-full">
                        <span className="material-symbols-outlined" data-icon="group">group</span>
                        <span className="font-plus-jakarta text-sm font-medium">Kelola Pengguna</span>
                    </Link>
                    <Link to="/admin/verifications" className="flex items-center gap-3 px-4 py-3 text-teal-700/70 dark:text-slate-400 hover:bg-teal-100 dark:hover:bg-slate-800 transition-colors duration-200 rounded-full">
                        <span className="material-symbols-outlined" data-icon="verified_user">verified_user</span>
                        <span className="font-plus-jakarta text-sm font-medium">Verifikasi</span>
                    </Link>
                </nav>
                <div className="mt-auto space-y-2 border-t border-teal-100 dark:border-slate-800 pt-6">
                    <button onClick={() => navigate('/home')} className="w-full bg-[#A46477] text-white py-3 rounded-full font-bold text-sm mb-4 shadow-lg shadow-[#A46477]/20 active:scale-95 transition-transform">
                        Kembali ke Aplikasi
                    </button>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-teal-700/70 dark:text-slate-400 hover:bg-teal-100 dark:hover:bg-slate-800 transition-colors duration-200 rounded-full">
                        <span className="material-symbols-outlined" data-icon="logout">logout</span>
                        <span className="font-plus-jakarta text-sm font-medium">Keluar</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-10 h-screen relative overflow-y-auto">
                {/* Organic Background Shapes */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed-dim/10 rounded-full blur-3xl -z-10"></div>
                <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-tertiary-container/10 rounded-full blur-3xl -z-10"></div>
                
                {/* Top Navigation Bar */}
                <header className="sticky top-0 z-40 flex justify-between items-center -mx-10 px-10 pb-8 pt-2 bg-background/80 backdrop-blur-xl">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-3 flex items-center text-teal-600/50">
                                <span className="material-symbols-outlined text-xl" data-icon="search">search</span>
                            </span>
                            <input 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-teal-50/50 border border-teal-100/50 focus:border-teal-300 rounded-full py-2.5 pl-10 pr-4 w-72 text-sm focus:ring-2 focus:ring-teal-500/20 placeholder:text-teal-600/40" 
                                placeholder="Cari data pengguna (nama, email)..." 
                                type="text"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 ml-4">
                            <div className="text-right">
                                <p className="text-sm font-bold text-teal-900">{me?.name || 'Admin'}</p>
                                <p className="text-[10px] text-teal-600 uppercase tracking-widest">Administrator</p>
                            </div>
                            <img alt="Administrator Avatar" className="w-10 h-10 rounded-full border-2 border-primary-container object-cover" src={me?.profile_image ? `${STORAGE_BASE_URL}/${me.profile_image}` : "https://lh3.googleusercontent.com/aida-public/AB6AXuCAviLUwwa4BUjMc5XWOz6n6tszkTPOAmRjBf29KoW44KKBq4UlndvQDAUVpohqW35gJMKMi2NUEbZnbx56tkOqV8-aaBQdFvde_wa2rd2tEUdfluqOZJ-YA332kUEdQllyKX_xXGEdYjQ6Ll0CyP4hc8O6zkDl6L20aByFzIM9Pvr7HDl5K8r-EFVGleSVwiJIpnHe-uyL2Zi-xYKes96y_yL9Z2SGMROGqXwWFm_wTwpfecKOiTKqLNfObq4jBw8AJkWJ-rORsL4"} />
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="p-10 max-w-7xl mx-auto w-full animate-pulse transition-all">
                        <div className="mb-12">
                            <div className="h-10 bg-teal-100/50 rounded-lg w-1/4 mb-4"></div>
                            <div className="h-4 bg-teal-100/30 rounded w-2/3"></div>
                        </div>
                        <div className="bg-teal-50/50 rounded-lg p-8 shadow-sm h-96 border border-teal-100/10"></div>
                        <div className="grid grid-cols-3 gap-6 mt-12">
                            <div className="h-32 bg-teal-100/30 rounded-lg"></div>
                            <div className="h-32 bg-teal-100/30 rounded-lg"></div>
                            <div className="h-32 bg-teal-100/30 rounded-lg"></div>
                        </div>
                    </div>
                ) : (
                <>
                {/* Header Section */}
                <div className="mb-12 flex justify-between items-end">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-3">Kelola Pengguna</h2>
                        <p className="text-on-surface-variant text-lg opacity-80 font-medium leading-relaxed">Daftar semua pengguna yang terdaftar di platform Curhatin. Kelola akses, status verifikasi, dan peran untuk menjaga keamanan ekosistem.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="bg-surface-container-highest text-on-surface px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-surface-dim transition-all">
                            <span className="material-symbols-outlined" data-icon="filter_list">filter_list</span>
                            Filter
                        </button>
                    </div>
                </div>

                {/* Bento Grid User Table */}
                <div className="bg-surface-container-low/60 backdrop-blur-md rounded-lg p-8 shadow-sm border border-outline-variant/10">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-left text-on-surface-variant border-b border-outline-variant/20">
                                    <th className="pb-6 pt-2 px-4 font-bold text-xs uppercase tracking-[0.1em]">ID</th>
                                    <th className="pb-6 pt-2 px-4 font-bold text-xs uppercase tracking-[0.1em]">Pengguna</th>
                                    <th className="pb-6 pt-2 px-4 font-bold text-xs uppercase tracking-[0.1em]">Email</th>
                                    <th className="pb-6 pt-2 px-4 font-bold text-xs uppercase tracking-[0.1em]">Peran</th>
                                    <th className="pb-6 pt-2 px-4 font-bold text-xs uppercase tracking-[0.1em]">Status</th>
                                    <th className="pb-6 pt-2 px-4 font-bold text-xs uppercase tracking-[0.1em]">Terdaftar</th>
                                    <th className="pb-6 pt-2 px-4 font-bold text-xs uppercase tracking-[0.1em] text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/5">
                                {filteredUsers.map(u => (
                                    <tr key={u.id} className={`group transition-colors ${u.is_suspended ? 'bg-error-container/5 hover:bg-error-container/10' : 'hover:bg-white/40'}`}>
                                        <td className={`py-4 px-4 text-sm font-mono ${u.is_suspended ? 'text-error' : 'text-teal-800'}`}>
                                            #USR-{u.id.toString().padStart(4, '0')}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-4">
                                                {u.profile_image ? (
                                                    <img src={`${STORAGE_BASE_URL}/${u.profile_image}`} alt={u.name} className={`w-10 h-10 rounded-full object-cover shadow-sm ${u.is_suspended ? 'grayscale' : ''}`} />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-secondary-container flex flex-shrink-0 items-center justify-center text-on-secondary-container font-bold shadow-sm">
                                                        <span className="material-symbols-outlined" data-icon="person">person</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className={`font-bold ${u.is_suspended ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>{u.name}</p>
                                                    <p className="text-xs text-on-surface-variant italic">@{u.username || 'anonim'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`py-4 px-4 text-sm font-medium ${u.is_suspended ? 'text-on-surface-variant/60' : 'text-on-surface-variant'}`}>
                                            {u.email}
                                        </td>
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            {u.is_admin ? (
                                                <span className="bg-tertiary text-on-tertiary px-3 py-1 rounded-full text-xs font-bold">Admin</span>
                                            ) : u.role === 'psikolog' ? (
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold border border-primary-container">Psikolog</span>
                                                    <span className="text-[9px] font-bold text-[#A46477] uppercase px-1">{getSpesialisasiLabel(u.spesialisasi)}</span>
                                                </div>
                                            ) : (
                                                <span className={`bg-surface-container-highest text-on-surface px-3 py-1 rounded-full text-xs font-bold border border-outline-variant/30 ${u.is_suspended ? 'opacity-50' : ''}`}>Anonim</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            {u.is_suspended ? (
                                                <div className="flex items-start gap-1.5 text-error flex-col">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-sm" data-icon="warning" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
                                                        <span className="text-xs font-bold uppercase tracking-wider">Ditangguhkan</span>
                                                    </div>
                                                    <span className="text-[10px] text-error/70 line-clamp-1 max-w-[150px] leading-tight" title={u.suspended_reason}>{u.suspended_reason || 'Banned'}</span>
                                                </div>
                                            ) : u.is_admin ? (
                                                <div className="flex items-center gap-1.5 text-primary">
                                                    <span className="material-symbols-outlined text-sm" data-icon="verified" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                                                    <span className="text-xs font-bold uppercase tracking-wider">Super Admin</span>
                                                </div>
                                            ) : u.role === 'psikolog' ? (
                                                u.is_rejected ? (
                                                    <div className="flex items-start gap-1.5 text-red-600 flex-col">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>cancel</span>
                                                            <span className="text-xs font-bold uppercase tracking-wider">Ditolak</span>
                                                        </div>
                                                        {u.rejected_reason && (
                                                            <span className="text-[10px] text-red-400 line-clamp-1 max-w-[150px] leading-tight" title={u.rejected_reason}>{u.rejected_reason}</span>
                                                        )}
                                                    </div>
                                                ) : u.is_verified ? (
                                                    <div className="flex items-center gap-1.5 text-primary">
                                                        <span className="material-symbols-outlined text-sm" data-icon="task_alt" style={{fontVariationSettings: "'FILL' 1"}}>task_alt</span>
                                                        <span className="text-xs font-bold uppercase tracking-wider">Terverifikasi</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-yellow-600">
                                                        <span className="material-symbols-outlined text-sm" data-icon="pending">pending</span>
                                                        <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-on-surface-variant/40">
                                                    <span className="material-symbols-outlined text-sm" data-icon="check_circle">check_circle</span>
                                                    <span className="text-xs font-bold uppercase tracking-wider">Dasar</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-sm text-on-surface-variant/70 whitespace-nowrap">
                                            {new Date(u.created_at).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                                {me?.is_admin && me.id !== u.id && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleToggleAdmin(u.id)}
                                                            className={`p-2 rounded-full transition-colors ${u.is_admin ? 'hover:bg-error/10 hover:text-error' : 'hover:bg-primary-container hover:text-primary'}`} 
                                                            title={u.is_admin ? "Demote from Admin" : "Promote to Admin"}
                                                        >
                                                            <span className="material-symbols-outlined text-lg" data-icon="admin_panel_settings">admin_panel_settings</span>
                                                        </button>
                                                        {u.is_suspended ? (
                                                            <button onClick={() => handleSuspend(u.id, u.name, true)} className="p-2 hover:bg-primary/10 hover:text-primary rounded-full transition-colors" title="Buka Penangguhan">
                                                                <span className="material-symbols-outlined text-lg" data-icon="lock_open">lock_open</span>
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => handleSuspend(u.id, u.name, false)} className="p-2 hover:bg-error/10 hover:text-error rounded-full transition-colors" title="Tangguhkan Akun">
                                                                <span className="material-symbols-outlined text-lg" data-icon="block">block</span>
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="py-10 text-center text-on-surface-variant font-medium">
                                            Tidak ada data pengguna yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination/Footer */}
                    <div className="mt-8 pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                        <p className="text-sm text-on-surface-variant font-medium">Menampilkan {filteredUsers.length} dari {users.length} pengguna</p>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface">
                                <span className="material-symbols-outlined text-sm" data-icon="chevron_left">chevron_left</span>
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-on-primary font-bold">1</button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface">
                                <span className="material-symbols-outlined text-sm" data-icon="chevron_right">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* System Stats Bar */}
                <div className="grid grid-cols-3 gap-6 mt-12">
                    <div className="bg-primary/5 p-6 rounded-lg border border-primary/10 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Total Pengguna Anonim</p>
                            <p className="text-2xl font-extrabold text-on-surface">{totalActive}</p>
                        </div>
                        <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined" data-icon="group">group</span>
                        </div>
                    </div>
                    <div className="bg-tertiary/5 p-6 rounded-lg border border-tertiary/10 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-tertiary mb-1">Total Psikolog</p>
                            <p className="text-2xl font-extrabold text-on-surface">{totalPsikolog}</p>
                        </div>
                        <div className="w-12 h-12 bg-tertiary-container rounded-full flex items-center justify-center text-tertiary">
                            <span className="material-symbols-outlined" data-icon="psychology">psychology</span>
                        </div>
                    </div>
                    <div className="bg-error/5 p-6 rounded-lg border border-error/10 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-error mb-1">Akun Ditangguhkan</p>
                            <p className="text-2xl font-extrabold text-on-surface">{totalSuspended}</p>
                        </div>
                        <div className="w-12 h-12 bg-error-container/20 rounded-full flex items-center justify-center text-error">
                            <span className="material-symbols-outlined" data-icon="block">block</span>
                        </div>
                    </div>
                </div>
                </>
                )}
            </main>
        </div>
    );
};

export default AdminUsers;
