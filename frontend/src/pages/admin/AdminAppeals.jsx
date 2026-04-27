import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, STORAGE_BASE_URL } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Mail, ShieldCheck, CheckCircle, XCircle, Clock, Search, Filter, ChevronRight, User as UserIcon, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminAppeals = () => {
    const { logout, user: me } = useAuth();
    const navigate = useNavigate();
    const [appeals, setAppeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('pending'); // all, pending, approved, rejected
    const [selectedAppeal, setSelectedAppeal] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', message: '' });

    const fetchAppeals = async () => {
        try {
            const res = await api.get('/admin/appeals');
            setAppeals(res.data);
        } catch (err) {
            console.error("Failed to load appeals", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppeals();
    }, []);

    const handleAppealAction = async (appealId, action) => {
        setActionLoading(true);
        try {
            const res = await api.post(`/admin/appeals/${appealId}/handle`, { 
                action, 
                admin_notes: adminNotes 
            });
            setStatusModal({ isOpen: true, type: 'success', message: res.data.message });
            setSelectedAppeal(null);
            setAdminNotes('');
            await fetchAppeals();
        } catch (err) {
            setStatusModal({ isOpen: true, type: 'error', message: err.response?.data?.message || 'Gagal memproses banding.' });
        } finally {
            setActionLoading(false);
        }
    };

    const filteredAppeals = appeals.filter(a => {
        const matchesSearch = (a.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (a.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' ? true : a.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="geometric-bg text-on-surface h-screen w-full flex overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
                .geometric-bg { background-color: #ebfdfc; background-image: radial-gradient(#35676511 1px, transparent 1px); background-size: 32px 32px; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
            `}</style>
            
            {/* SideNavBar */}
            <aside className="h-screen w-64 docked left-0 flex flex-col h-full border-r border-teal-100/10 bg-teal-50 dark:bg-slate-950 font-plus-jakarta text-base shrink-0">
                <div className="px-6 py-8">
                    <h1 className="text-lg font-black text-teal-900 dark:text-teal-50">The Sanctuary</h1>
                    <p className="text-xs text-teal-700/60 dark:text-teal-300/40 uppercase tracking-widest mt-1">Admin Console</p>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <button onClick={() => navigate('/admin/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-teal-700/60 dark:text-teal-300/40 hover:bg-teal-100/40 dark:hover:bg-teal-800/20 transition-all rounded-lg group">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span>Dashboard</span>
                    </button>
                    <button onClick={() => navigate('/admin/users')} className="w-full flex items-center gap-3 px-4 py-3 text-teal-700/60 dark:text-teal-300/40 hover:bg-teal-100/40 dark:hover:bg-teal-800/20 transition-all rounded-lg">
                        <span className="material-symbols-outlined">groups</span>
                        <span>Kelola Pengguna</span>
                    </button>
                    <button onClick={() => navigate('/admin/verifications')} className="w-full flex items-center gap-3 px-4 py-3 text-teal-700/60 dark:text-teal-300/40 hover:bg-teal-100/40 dark:hover:bg-teal-800/20 transition-all rounded-lg">
                        <span className="material-symbols-outlined">verified_user</span>
                        <span>Verifikasi</span>
                    </button>
                    <div className="flex items-center gap-3 px-4 py-3 text-[#A46477] font-bold border-r-4 border-[#A46477] bg-teal-100/20 rounded-l-lg">
                        <span className="material-symbols-outlined">mail</span>
                        <span>Kotak Surat</span>
                    </div>
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
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="w-full docked top-0 flex justify-between items-center px-8 py-5 bg-teal-50/80 backdrop-blur-xl border-b border-teal-100/20 sticky z-20">
                    <div>
                        <h2 className="text-2xl font-black text-teal-900 tracking-tight">Kotak Surat Banding</h2>
                        <p className="text-sm text-teal-600/70 font-medium">Tinjau dan kelola permohonan banding dari akun yang disuspend.</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Cari nama atau email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-teal-100 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none w-64 transition-all"
                            />
                        </div>
                        
                        <div className="flex items-center bg-white border border-teal-100 rounded-2xl p-1 gap-1">
                            {['all', 'pending', 'approved', 'rejected'].map(status => (
                                <button 
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status ? 'bg-[#A46477] text-white shadow-md shadow-[#A46477]/20' : 'text-teal-600/50 hover:bg-teal-50'}`}
                                >
                                    {status === 'all' ? 'Semua' : status === 'approved' ? 'Disetujui' : status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full py-20">
                            <div className="w-12 h-12 border-4 border-teal-100 border-t-[#A46477] rounded-full animate-spin mb-4" />
                            <p className="text-teal-600 font-bold animate-pulse">Memuat permohonan banding...</p>
                        </div>
                    ) : filteredAppeals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 opacity-40">
                            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-xl border border-teal-50">
                                <Mail size={48} className="text-teal-200" />
                            </div>
                            <h3 className="text-xl font-black text-teal-900 mb-2">Tidak Ada Data</h3>
                            <p className="text-teal-600 font-medium">Belum ada permohonan banding yang sesuai dengan kriteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredAppeals.map((appeal) => (
                                    <motion.div 
                                        key={appeal.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className={`bg-white rounded-3xl p-6 shadow-sm border border-teal-50 hover:shadow-xl hover:shadow-teal-900/5 transition-all group ${appeal.status !== 'pending' ? 'opacity-70' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center border-2 border-white shadow-sm">
                                                    {appeal.user?.profile_image ? (
                                                        <img src={`${STORAGE_BASE_URL}/${appeal.user.profile_image}`} className="w-full h-full rounded-2xl object-cover" alt="" />
                                                    ) : (
                                                        <span className="text-teal-700 font-black text-lg">{(appeal.user?.name || 'U').charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 leading-tight">{appeal.user?.name}</h4>
                                                    <p className="text-xs text-slate-400 font-medium">{appeal.user?.email}</p>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${appeal.status === 'pending' ? 'bg-amber-50 text-amber-600' : appeal.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                {appeal.status === 'pending' ? 'Menunggu' : appeal.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100 min-h-[100px]">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MessageSquare size={14} className="text-teal-400" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alasan Banding</span>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed italic">"{appeal.reason}"</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2 text-[10px] text-slate-300 font-bold">
                                                <Clock size={12} />
                                                {new Date(appeal.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                            
                                            {appeal.status === 'pending' ? (
                                                <button 
                                                    onClick={() => setSelectedAppeal(appeal)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-[#A46477] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#A46477]/20 hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    Tinjau <ChevronRight size={14} />
                                                </button>
                                            ) : (
                                                <div className="text-[10px] font-black text-slate-400">DIPROSES</div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>

            {/* Appeal Detail Modal */}
            <AnimatePresence>
                {selectedAppeal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setSelectedAppeal(null)} 
                            className="absolute inset-0 bg-teal-900/40 backdrop-blur-md" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, y: 50, scale: 0.95 }} 
                            animate={{ opacity: 1, y: 0, scale: 1 }} 
                            exit={{ opacity: 0, y: 50, scale: 0.95 }} 
                            className="relative bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl shadow-teal-900/20"
                        >
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-3xl bg-teal-50 flex items-center justify-center border-4 border-white shadow-lg">
                                            <span className="text-teal-700 font-black text-2xl">{(selectedAppeal.user?.name || 'U').charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-teal-900 leading-tight">{selectedAppeal.user?.name}</h3>
                                            <p className="text-sm text-teal-600/60 font-medium">{selectedAppeal.user?.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedAppeal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                        <X size={24} className="text-slate-400" />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Alasan User Mengajukan Banding</label>
                                        <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 italic text-slate-600 text-sm leading-relaxed relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                                <MessageSquare size={48} />
                                            </div>
                                            "{selectedAppeal.reason}"
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Catatan Admin / Respon (Opsional)</label>
                                        <textarea 
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Tuliskan alasan persetujuan atau penolakan..."
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-slate-700 text-sm font-medium focus:border-teal-200 focus:bg-white outline-none transition-all resize-none h-32"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => handleAppealAction(selectedAppeal.id, 'reject')}
                                            disabled={actionLoading}
                                            className="py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-red-500 bg-red-50 hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={16} /> Tolak Banding
                                        </button>
                                        <button 
                                            onClick={() => handleAppealAction(selectedAppeal.id, 'approve')}
                                            disabled={actionLoading}
                                            className="py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={16} /> Setujui & Aktifkan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Status Modal */}
            <AnimatePresence>
                {statusModal.isOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStatusModal({ ...statusModal, isOpen: false })} className="absolute inset-0 bg-teal-900/60 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${statusModal.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                                {statusModal.type === 'success' ? <CheckCircle size={40} /> : <XCircle size={40} />}
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">{statusModal.type === 'success' ? 'Berhasil' : 'Gagal'}</h3>
                            <p className="text-slate-500 text-sm font-medium mb-8">{statusModal.message}</p>
                            <button 
                                onClick={() => setStatusModal({ ...statusModal, isOpen: false })}
                                className="w-full py-3 bg-[#A46477] text-white rounded-2xl font-bold active:scale-95 transition-transform"
                            >
                                Mengerti
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminAppeals;
