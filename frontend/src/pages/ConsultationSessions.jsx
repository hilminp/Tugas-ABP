import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import Skeleton from '../components/ui/Skeleton';
import './ConsultationSessions.css';

const ConsultationSessions = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPsychologist] = useState(user?.role === 'psikolog');
    
    // For Psychologist
    const [newSession, setNewSession] = useState({ session_date: '', session_time: '' });
    const [submitting, setSubmitting] = useState(false);
    
    // For User
    const [connectedPsychologists, setConnectedPsychologists] = useState([]);
    const [selectedPsychologist, setSelectedPsychologist] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);

    useEffect(() => {
        fetchSessions();
        if (!isPsychologist) {
            fetchConnectedPsychologists();
        }
    }, []);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const endpoint = isPsychologist ? '/consultation-sessions' : '/my-booked-sessions';
            const res = await api.get(endpoint);
            setSessions(res.data.sessions || []);
        } catch (err) {
            console.error("Failed to fetch sessions", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchConnectedPsychologists = async () => {
        try {
            const res = await api.get('/friend-statuses/psychologists');
            // This returns { statuses: { id: 'accepted' } }
            const psychRes = await api.get('/psychologists?limit=100');
            const acceptedIds = Object.keys(res.data.statuses).filter(id => res.data.statuses[id] === 'accepted');
            const connected = (psychRes.data.data || []).filter(p => acceptedIds.includes(p.id.toString()));
            setConnectedPsychologists(connected);
        } catch (err) {
            console.error("Failed to fetch connected psychologists", err);
        }
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/consultation-sessions', newSession);
            setNewSession({ session_date: '', session_time: '' });
            fetchSessions();
        } catch (err) {
            alert(err.response?.data?.message || "Gagal membuat sesi");
        } finally {
            setSubmitting(false);
        }
    };

    const handleApproveSession = async (id) => {
        try {
            await api.post(`/consultation-sessions/${id}/approve`);
            alert("Sesi berhasil disetujui!");
            fetchSessions();
        } catch (err) {
            alert(err.response?.data?.message || "Gagal menyetujui sesi");
        }
    };

    const handleStartSession = async (session) => {
        try {
            await api.post(`/consultation-sessions/${session.id}/start`);
            navigate(`/messages/${session.user_id}`);
        } catch (err) {
            alert(err.response?.data?.message || "Gagal memulai sesi");
        }
    };

    const handleEndSession = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin mengakhiri sesi ini? Chat akan langsung dikunci.")) return;
        try {
            await api.post(`/consultation-sessions/${id}/end`);
            alert("Sesi telah diakhiri.");
            fetchSessions();
        } catch (err) {
            alert(err.response?.data?.message || "Gagal mengakhiri sesi");
        }
    };

    const handleDeleteSession = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus/membatalkan sesi ini?")) return;
        try {
            await api.delete(`/consultation-sessions/${id}`);
            fetchSessions();
        } catch (err) {
            alert("Gagal menghapus sesi");
        }
    };

    const handleViewSlots = async (psychologist) => {
        setSelectedPsychologist(psychologist);
        try {
            const res = await api.get(`/consultation-sessions/psychologist/${psychologist.id}`);
            setAvailableSlots(res.data.sessions || []);
        } catch (err) {
            alert("Gagal mengambil jadwal");
        }
    };

    const handleBookSlot = async (id) => {
        try {
            await api.post(`/consultation-sessions/${id}/book`);
            alert("Berhasil memesan sesi!");
            setSelectedPsychologist(null);
            fetchSessions();
        } catch (err) {
            alert(err.response?.data?.message || "Gagal memesan sesi");
        }
    };

    const formatDateTime = (date, time) => {
        const d = new Date(`${date}T${time}`);
        return d.toLocaleString('id-ID', { 
            weekday: 'long',
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="sessions-page">
            <div className="sessions-header">
                <div>
                    <h1>{isPsychologist ? 'Kelola Sesi Konsultasi' : 'Jadwal Konsultasi'}</h1>
                    <p>{isPsychologist ? 'Atur jam ketersediaan Anda untuk pasien.' : 'Lihat dan pilih jadwal konsultasi Anda.'}</p>
                </div>
                <Link to="/home" className="back-link">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Kembali
                </Link>
            </div>

            <div className="sessions-container">
                {isPsychologist && (
                    <div className="create-session-card">
                        <h3>Tambah Sesi Baru</h3>
                        <form onSubmit={handleCreateSession}>
                            <div className="form-group">
                                <label>Tanggal</label>
                                <input 
                                    type="date" 
                                    value={newSession.session_date} 
                                    onChange={e => setNewSession({...newSession, session_date: e.target.value})}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="form-group">
                                <label>Jam</label>
                                <input 
                                    type="time" 
                                    value={newSession.session_time} 
                                    onChange={e => setNewSession({...newSession, session_time: e.target.value})}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={submitting}>
                                {submitting ? 'Menyimpan...' : 'Tambah Sesi'}
                            </button>
                        </form>
                    </div>
                )}

                {!isPsychologist && (
                    <div className="find-sessions-section">
                        <h3>Pesan Sesi Baru</h3>
                        <div className="connected-psychologists">
                            {connectedPsychologists.length === 0 ? (
                                <p className="empty-msg">Anda belum terhubung dengan psikolog manapun. Pastikan permintaan konsultasi Anda sudah diterima.</p>
                            ) : (
                                <div className="psychologist-list">
                                    {connectedPsychologists.map(p => (
                                        <div key={p.id} className="psychologist-item" onClick={() => handleViewSlots(p)}>
                                            <div className="p-avatar">{p.name.charAt(0)}</div>
                                            <div className="p-info">
                                                <h4>{p.name}</h4>
                                                <span>{p.spesialisasi || 'Psikolog'}</span>
                                            </div>
                                            <span className="material-symbols-outlined">event_available</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="my-sessions-section">
                    <h3>{isPsychologist ? 'Daftar Sesi' : 'Sesi Saya'}</h3>
                    {loading ? (
                        <div className="skeleton-list">
                            <Skeleton height="80px" count={3} />
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="empty-state">
                            <span className="material-symbols-outlined">calendar_today</span>
                            <p>Belum ada sesi yang terdaftar.</p>
                        </div>
                    ) : (
                        <div className="sessions-list">
                            {sessions.map(s => (
                                <div key={s.id} className={`session-card ${s.status}`}>
                                    <div className="session-main">
                                        <div className="session-icon">
                                            <span className="material-symbols-outlined">
                                                {s.status === 'booked' ? 'event_upcoming' : 'calendar_today'}
                                            </span>
                                        </div>
                                        <div className="session-details">
                                            <p className="session-time">{formatDateTime(s.session_date, s.session_time)}</p>
                                            <div className="session-status">
                                                {s.status === 'booked' ? (
                                                    <div className="booked-status">
                                                        <span>Dipesan oleh: <strong>{isPsychologist ? s.user?.name : s.psychologist?.name}</strong></span>
                                                        {isPsychologist && (
                                                            <div className="booked-actions">
                                                                <button className="chat-now-btn" onClick={() => handleStartSession(s)}>
                                                                    <span className="material-symbols-outlined">chat</span>
                                                                    Chat Sekarang
                                                                </button>
                                                                <button className="end-session-btn" onClick={() => handleEndSession(s.id)}>
                                                                    <span className="material-symbols-outlined">lock_clock</span>
                                                                    Akhiri Sesi
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : s.status === 'pending_approval' ? (
                                                    <div className="pending-status">
                                                        <span>Menunggu Persetujuan {isPsychologist ? `dari ${s.user?.name}` : ''}</span>
                                                        {isPsychologist && (
                                                            <button className="approve-btn" onClick={() => handleApproveSession(s.id)}>Setujui</button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="available-tag">Tersedia</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="cancel-btn" onClick={() => handleDeleteSession(s.id)}>
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Selecting Slot */}
            {selectedPsychologist && (
                <div className="modal-overlay" onClick={() => setSelectedPsychologist(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Jadwal {selectedPsychologist.name}</h3>
                            <button className="close-btn" onClick={() => setSelectedPsychologist(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {availableSlots.length === 0 ? (
                                <p className="empty-msg">Belum ada jadwal tersedia dari psikolog ini.</p>
                            ) : (
                                <div className="slots-grid">
                                    {availableSlots.map(slot => (
                                        <div key={slot.id} className="slot-item">
                                            <span>{formatDateTime(slot.session_date, slot.session_time)}</span>
                                            <button onClick={() => handleBookSlot(slot.id)}>Pesan</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsultationSessions;
