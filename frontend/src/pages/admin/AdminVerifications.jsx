import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, STORAGE_BASE_URL } from '../../lib/api';
import AdminSidebar from '../../components/AdminSidebar';
import './Admin.css';

const AdminVerifications = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchVerifications = async () => {
        try {
            const res = await api.get('/admin/verifications');
            setData(res.data);
        } catch (err) {
            console.error("Failed to load verifications", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVerifications();
    }, []);

    const handleVerify = async (id, name) => {
        if (!window.confirm(`Verifikasi psikolog ${name}?`)) return;
        try {
            await api.post(`/admin/verify/${id}`);
            alert('Berhasil diverifikasi');
            fetchVerifications();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal memverifikasi');
        }
    };

    const handleReject = async (id, name) => {
        if (!window.confirm(`Tolak verifikasi dan hapus akun ${name}?`)) return;
        try {
            await api.post(`/admin/reject/${id}`);
            alert('Berhasil ditolak');
            fetchVerifications();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menolak');
        }
    };

    if (loading) return <div style={{padding:'20px'}}>Loading...</div>;
    if (!data) return <div style={{padding:'20px'}}>Failed to load</div>;

    return (
        <div style={{display:'flex'}}>
            <AdminSidebar />
            <div className="admin-main" style={{flex: 1}}>
                <div className="admin-header">
                    <h1>Verifikasi Psikolog</h1>
                    <Link to="/admin/dashboard" className="admin-btn admin-btn-primary">← Kembali ke Dashboard</Link>
                </div>

                <div className="admin-card">
                    <h2 style={{marginBottom: '16px'}}>📋 Daftar Psikolog Menunggu Verifikasi</h2>
                    
                    {data.pendingPsikolog?.length === 0 ? (
                        <div style={{padding: '48px', textAlign: 'center', color: '#95A5A6'}}>
                            <div style={{fontSize: '64px', marginBottom: '16px'}}>✓</div>
                            <h3>Tidak Ada Verifikasi Pending</h3>
                            <p style={{marginTop: '8px'}}>Semua psikolog sudah diverifikasi</p>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Email</th>
                                    <th>Username</th>
                                    <th>Tanggal Daftar</th>
                                    <th>Dokumen</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.pendingPsikolog?.map(u => (
                                    <tr key={u.id}>
                                        <td><strong>{u.name}</strong></td>
                                        <td>{u.email}</td>
                                        <td>{u.username}</td>
                                        <td>{new Date(u.created_at).toLocaleString('id-ID')}</td>
                                        <td>
                                            {u.str_file && (
                                                <a href={`${STORAGE_BASE_URL}/${u.str_file}`} target="_blank" rel="noreferrer" className="admin-btn admin-btn-primary" style={{fontSize: '12px', padding: '6px 12px'}}>📄 STR</a>
                                            )}
                                            {u.ijazah_file && (
                                                <a href={`${STORAGE_BASE_URL}/${u.ijazah_file}`} target="_blank" rel="noreferrer" className="admin-btn admin-btn-primary" style={{fontSize: '12px', padding: '6px 12px'}}>📄 Ijazah</a>
                                            )}
                                        </td>
                                        <td>
                                            <button className="admin-btn" style={{background:'#27AE60', color:'#fff'}} onClick={() => handleVerify(u.id, u.name)}>✓ Verifikasi</button>
                                            <button className="admin-btn" style={{background:'#E74C3C', color:'#fff'}} onClick={() => handleReject(u.id, u.name)}>✗ Tolak</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {data.verifiedPsikolog?.length > 0 && (
                    <div className="admin-card" style={{marginTop: '24px'}}>
                        <h2 style={{marginBottom: '16px'}}>✅ Psikolog Terverifikasi</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Email</th>
                                    <th>Username</th>
                                    <th>Tanggal Verifikasi</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.verifiedPsikolog.map(u => (
                                    <tr key={u.id}>
                                        <td><strong>{u.name}</strong></td>
                                        <td>{u.email}</td>
                                        <td>{u.username}</td>
                                        <td>{new Date(u.updated_at).toLocaleString('id-ID')}</td>
                                        <td><span className="admin-status verified">✓ Terverifikasi</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminVerifications;
