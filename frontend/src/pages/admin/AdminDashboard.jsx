import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import AdminSidebar from '../../components/AdminSidebar';
import './Admin.css';

const AdminDashboard = () => {
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

    if (loading) return <div style={{padding:'20px'}}>Loading...</div>;
    if (!data) return <div style={{padding:'20px'}}>Failed to load</div>;

    return (
        <div style={{display:'flex'}}>
            <AdminSidebar />
            <div className="admin-main" style={{flex: 1}}>
                <div className="admin-header">
                    <h1>Dashboard Admin</h1>
                    <div style={{fontSize: '14px', color: '#7F8C8D'}}>{new Date().toLocaleString('id-ID')}</div>
                </div>

                {data.pendingCount > 0 && (
                    <div className="admin-alert warning">
                        <strong>⚠️ Perhatian!</strong> Ada {data.pendingCount} psikolog menunggu verifikasi. 
                        <Link to="/admin/verifications" style={{color: '#856404', textDecoration: 'underline', fontWeight: 600, marginLeft: '8px'}}>Lihat sekarang</Link>
                    </div>
                )}

                <div className="admin-stats">
                    <div className="admin-stat-card">
                        <div className="icon">👥</div>
                        <div className="value">{data.totalUsers}</div>
                        <div className="label">Total User</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="icon">👨‍⚕️</div>
                        <div className="value">{data.totalPsikolog}</div>
                        <div className="label">Total Psikolog</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="icon">🙋</div>
                        <div className="value">{data.totalAnonim}</div>
                        <div className="label">Total Anonim</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="icon">⏳</div>
                        <div className="value">{data.pendingCount}</div>
                        <div className="label">Menunggu Verifikasi</div>
                    </div>
                </div>

                <div className="admin-card">
                    <h2>📋 Psikolog Terbaru Menunggu Verifikasi</h2>
                    {data.pendingPsikolog?.length === 0 ? (
                        <div style={{padding: '32px', textAlign: 'center', color: '#95A5A6'}}>
                            <div style={{fontSize: '48px', marginBottom: '12px'}}>✓</div>
                            <div>Tidak ada psikolog yang menunggu verifikasi</div>
                        </div>
                    ) : (
                        <>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Nama</th>
                                        <th>Email</th>
                                        <th>Username</th>
                                        <th>Tanggal Daftar</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.pendingPsikolog?.slice(0,5).map(u => (
                                        <tr key={u.id}>
                                            <td><strong>{u.name}</strong></td>
                                            <td>{u.email}</td>
                                            <td>{u.username}</td>
                                            <td>{new Date(u.created_at).toLocaleString('id-ID')}</td>
                                            <td><span className="admin-status pending">Menunggu</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {data.pendingCount > 5 && (
                                <div style={{marginTop: '16px', textAlign: 'center'}}>
                                    <Link to="/admin/verifications" className="admin-btn admin-btn-primary">Lihat Semua ({data.pendingCount})</Link>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="admin-card">
                    <h2>📊 Aktivitas Terakhir</h2>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Bergabung</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentUsers?.map(u => (
                                <tr key={u.id}>
                                    <td><strong>{u.name}</strong></td>
                                    <td>{u.email}</td>
                                    <td>
                                        {u.is_admin ? (
                                            <span style={{color:'#E91E63', fontWeight:600}}>🛡️ Admin</span>
                                        ) : u.role === 'psikolog' ? (
                                            <span style={{color:'#3498DB'}}>👨‍⚕️ Psikolog</span>
                                        ) : (
                                            <span style={{color:'#95A5A6'}}>🙋 Anonim</span>
                                        )}
                                    </td>
                                    <td>{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
