import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import AdminSidebar from '../../components/AdminSidebar';
import './Admin.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: me } = useAuth();

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
                alert('User suspended.');
                setUsers(users.map(u => u.id === id ? { ...u, is_suspended: true, suspended_reason: cleanReason } : u));
            } catch(e) {
                alert(e.response?.data?.message || 'Failed to suspend');
            }
        } else {
            try {
                await api.post(`/admin/user/${id}/suspend`, { action: 'unsuspend' });
                alert('User unsuspended.');
                setUsers(users.map(u => u.id === id ? { ...u, is_suspended: false, suspended_reason: null } : u));
            } catch(e) {
                alert(e.response?.data?.message || 'Failed to unsuspend');
            }
        }
    };

    if (loading) return <div style={{padding:'20px'}}>Loading...</div>;

    return (
        <div style={{display:'flex'}}>
            <AdminSidebar />
            <div className="admin-main" style={{flex: 1}}>
                <div className="admin-card">
                    <h1>Admin panel — All users</h1>
                    <p style={{color:'#666', fontSize:'13px', marginBottom:'16px'}}>Displaying all users from the database. Only accessible for admins.</p>
                    
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Verified</th>
                                <th>Created</th>
                                <th>Admin</th>
                                <th>Suspended</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>{u.name}</td>
                                    <td>{u.username || '-'}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        {u.is_admin ? (
                                            <span style={{color:'#E91E63', fontWeight:600}}>🛡️ Admin</span>
                                        ) : u.role === 'psikolog' ? (
                                            <span style={{color:'#3498DB'}}>👨‍⚕️ Psikolog</span>
                                        ) : u.role === 'anonim' ? (
                                            <span style={{color:'#95A5A6'}}>🙋 Anonim</span>
                                        ) : (
                                            <span style={{color:'#666'}}>-</span>
                                        )}
                                    </td>
                                    <td>
                                        {u.role === 'psikolog' ? (
                                            u.is_verified ? (
                                                <span style={{color:'#27AE60'}}>✓ Yes</span>
                                            ) : (
                                                <span style={{color:'#F39C12', fontWeight:600}}>⏳ Pending</span>
                                            )
                                        ) : (
                                            <span style={{color:'#95A5A6'}}>-</span>
                                        )}
                                    </td>
                                    <td>{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                                    <td>
                                        {u.is_admin ? (
                                            <span style={{color:'green', fontWeight:700}}>YES</span>
                                        ) : (
                                            <span style={{color:'#888'}}>no</span>
                                        )}
                                    </td>
                                    <td>
                                        {u.is_suspended ? (
                                            <>
                                                <div style={{color:'#b02a37', fontWeight:700}}>SUSPENDED</div>
                                                <div style={{color:'#666', fontSize:'13px'}}>{u.suspended_reason || 'no reason provided'}</div>
                                            </>
                                        ) : (
                                            <div style={{color:'#888'}}>active</div>
                                        )}
                                    </td>
                                    <td>
                                        {me?.is_admin && me.id !== u.id ? (
                                            u.is_suspended ? (
                                                <button className="admin-btn" style={{background:'#6c757d', color:'#fff', padding:'4px 8px', fontSize:'13px'}} onClick={() => handleSuspend(u.id, u.name, true)}>Unsuspend</button>
                                            ) : (
                                                <button className="admin-btn" style={{background:'#e74c3c', color:'#fff', padding:'4px 8px', fontSize:'13px'}} onClick={() => handleSuspend(u.id, u.name, false)}>Suspend</button>
                                            )
                                        ) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
