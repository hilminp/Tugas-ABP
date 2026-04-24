import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import Skeleton from '../components/ui/Skeleton';
import { PSYCHOLOGIST_CATEGORIES } from '../constants/psychologistCategories';
import './FriendRequests.css';

const FriendRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [statusModal, setStatusModal] = useState({ isOpen: false, type: '', title: '', message: '' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', message: '', action: null });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/friend-requests');
            setRequests(res.data.requests || []);
        } catch (err) {
            console.error("Failed to fetch requests", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        setConfirmModal({
            isOpen: true,
            type: 'success',
            message: 'Apakah Anda yakin ingin menerima Teman Curhat ini?',
            action: async () => {
                setActionLoadingId(id);
                try {
                    const res = await api.post(`/friend/${id}/accept`);
                    setStatusModal({ isOpen: true, type: 'success', title: 'Berhasil!', message: res.data?.message || 'Teman Curhat berhasil diterima.' });
                    fetchRequests();
                } catch (err) {
                    setStatusModal({ isOpen: true, type: 'error', title: 'Gagal', message: err.response?.data?.message || 'Gagal menerima Teman Curhat.' });
                } finally {
                    setActionLoadingId(null);
                }
            }
        });
    };

    const handleReject = async (id) => {
        setConfirmModal({
            isOpen: true,
            type: 'warning',
            message: 'Apakah Anda yakin ingin menolak permintaan Teman Curhat ini?',
            action: async () => {
                setActionLoadingId(id);
                try {
                    const res = await api.post(`/friend/${id}/reject`);
                    setStatusModal({ isOpen: true, type: 'info', title: 'Informasi', message: res.data?.message || 'Permintaan Teman Curhat ditolak.' });
                    fetchRequests();
                } catch (err) {
                    setStatusModal({ isOpen: true, type: 'error', title: 'Gagal', message: err.response?.data?.message || 'Gagal menolak Teman Curhat.' });
                } finally {
                    setActionLoadingId(null);
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
        return date.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="requests-page-wrapper min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#A46477] tracking-tight">Riwayat Permintaan</h1>
                        <p className="text-stone-500 mt-1">Kelola semua permintaan konsultasi dari Teman Curhat Anda.</p>
                    </div>
                    <Link to="/home" className="group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-stone-200 rounded-xl text-stone-600 font-bold text-sm hover:bg-white hover:text-[#A46477] hover:border-[#A46477]/30 hover:shadow-[0_8px_16px_rgba(164,100,119,0.1)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 shadow-sm">
                        <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:-translate-x-1">arrow_back</span>
                        Kembali
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                                <div className="flex justify-between items-center">
                                    <div className="w-1/2">
                                        <Skeleton width="60%" height="24px" className="mb-2" />
                                        <Skeleton width="40%" height="16px" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton width="100px" height="40px" radius="12px" />
                                        <Skeleton width="100px" height="40px" radius="12px" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-stone-200">
                        <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-4xl text-stone-300">history</span>
                        </div>
                        <h3 className="text-xl font-bold text-stone-800">Belum Ada Permintaan</h3>
                        <p className="text-stone-500 mt-2 max-w-sm mx-auto">
                            Daftar permintaan konsultasi Anda akan muncul di sini setelah ada Teman Curhat yang menghubungi Anda.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map(r => (
                            <div key={r.id} className="request-card group bg-white/90 backdrop-blur-xl border border-[rgba(255,182,193,0.6)] rounded-2xl p-6 shadow-[0_24px_48px_rgba(136,77,96,0.15)] hover:shadow-[0_30px_60px_rgba(136,77,96,0.2)] hover:-translate-y-1 transition-all duration-300">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-[#A46477]/10 flex items-center justify-center text-[#A46477] font-black text-xl border-2 border-[#A46477]/20">
                                            {r.requester?.name?.charAt(0).toUpperCase() || 'P'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg text-slate-800">{r.requester?.name}</h3>
                                                <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-bold rounded uppercase">Anonim</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                <div className="flex items-center gap-1.5 text-sm text-stone-500">
                                                    <span className="material-symbols-outlined text-lg text-[#A46477]">category</span>
                                                    <span>{getCategoryLabel(r.category)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-sm text-stone-500">
                                                    <span className="material-symbols-outlined text-lg text-[#A46477]">schedule</span>
                                                    <span>{formatRequestTime(r.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className={`mr-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider
                                            ${r.status === 'pending' ? 'bg-amber-100 text-amber-600'
                                            : r.status === 'accepted' ? 'bg-emerald-100 text-emerald-600'
                                            : 'bg-red-100 text-red-600'}`}>
                                            {r.status === 'pending' ? 'waiting' : r.status}
                                        </div>

                                        {r.status === 'pending' && (
                                            <>
                                                <button 
                                                    className="px-6 py-2.5 bg-[#22c55e] text-white rounded-xl font-bold text-sm hover:bg-[#16a34a] active:scale-95 transition-all shadow-lg shadow-[#22c55e]/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                                    onClick={() => handleAccept(r.user_id)}
                                                    disabled={actionLoadingId === r.user_id}
                                                >
                                                    {actionLoadingId === r.user_id ? (
                                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-sm">check</span>
                                                            Terima
                                                        </>
                                                    )}
                                                </button>
                                                <button 
                                                    className="px-6 py-2.5 bg-white text-stone-600 border border-stone-200 rounded-xl font-bold text-sm hover:bg-stone-50 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                                    onClick={() => handleReject(r.user_id)}
                                                    disabled={actionLoadingId === r.user_id}
                                                >
                                                    {actionLoadingId === r.user_id ? (
                                                        <span className="w-4 h-4 border-2 border-stone-200 border-t-stone-500 rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-sm">close</span>
                                                            Tolak
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
                        <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">{statusModal.title}</h3>
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
                                    boxShadow: `0 10px 15px -3px ${confirmModal.type === 'success' ? 'rgba(16,185,129,0.3)' : confirmModal.type === 'error' ? 'rgba(239,68,68,0.3)' : confirmModal.type === 'warning' ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'}`,
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

export default FriendRequests;
