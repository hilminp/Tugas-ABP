import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import './FriendRequests.css'; // Reusing some CSS

const SearchResults = () => {
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const query = queryParams.get('q') || '';
    
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
                setResults(res.data.results || []);
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query]);

    const handleAddFriend = async (id) => {
        try {
            const res = await api.post(`/friend/${id}`);
            alert(res.data.message || 'Friend request sent!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send request');
        }
    };

    const handleSuspend = async (id, isSuspended) => {
        if (!isSuspended) {
            const reason = window.prompt('Masukkan alasan penangguhan untuk user ini (required):');
            if (reason === null) return;
            const cleanReason = reason.trim();
            if (!cleanReason) {
                alert('Alasan wajib diisi untuk menangguhkan akun.');
                return;
            }
            try {
                await api.post(`/admin/user/${id}/suspend`, { action: 'suspend', reason: cleanReason });
                alert('User suspended.');
                // Refetch
                navigate(0);
            } catch(e) {
                alert(e.response?.data?.message || 'Failed to suspend');
            }
        } else {
            try {
                await api.post(`/admin/user/${id}/suspend`, { action: 'unsuspend' });
                alert('User unsuspended.');
                navigate(0);
            } catch(e) {
                alert(e.response?.data?.message || 'Failed to unsuspend');
            }
        }
    };

    if (loading) return <div style={{padding:'20px'}}>Loading...</div>;

    const adminViewing = false; // Add state if we are simulating viewing as user, ignored for now

    return (
        <div style={{fontFamily: "'Poppins', sans-serif", background: '#FFF8EE', minHeight: '100vh', padding: '20px'}}>
            <div className="box">
                <h2>Hasil pencarian untuk "{query}"</h2>
                <div style={{color: '#666', marginBottom: '12px'}}>{results.length} hasil ditemukan</div>

                {results.length === 0 ? (
                    <div style={{background: '#F8F9FA', padding: '24px', borderRadius: '10px', textAlign: 'center', color: '#666', margin: '20px 0'}}>
                        <div style={{fontSize: '48px', marginBottom: '12px'}}>🔍</div>
                        <div style={{fontSize: '16px', fontWeight: 600}}>Tidak ada hasil yang ditemukan</div>
                        <div style={{fontSize: '13px', marginTop: '8px'}}>
                            Tidak ada user yang cocok dengan pencarian "{query}".<br/>
                            <em>(Catatan: Akun admin tidak ditampilkan dalam hasil pencarian)</em>
                        </div>
                    </div>
                ) : (
                    results.map(u => (
                        <div className="req" key={u.id}>
                            <div>
                                <div style={{fontWeight: 600}}>{u.name} ({u.username})</div>
                                <div style={{fontSize: '13px', color: '#777'}}>{u.email}</div>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                {!adminViewing && (
                                    <button 
                                        className="btn" 
                                        onClick={() => handleAddFriend(u.id)}
                                        disabled={u.is_suspended}
                                        style={{ opacity: u.is_suspended ? 0.5 : 1 }}
                                    >
                                        Add Friend
                                    </button>
                                )}

                                {u.is_suspended && (
                                    <div style={{fontSize: '13px', color: '#b02a37', marginLeft: '10px'}}>
                                        Suspended: {u.suspended_reason || 'no reason provided'}
                                    </div>
                                )}

                                {user?.is_admin && user.id !== u.id && (
                                    <>
                                        {!u.is_suspended ? (
                                            <button className="btn" style={{background: '#c62828'}} onClick={() => handleSuspend(u.id, false)}>Suspend</button>
                                        ) : (
                                            <button className="btn" style={{background: '#6c757d'}} onClick={() => handleSuspend(u.id, true)}>Unsuspend</button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
                
                <div style={{marginTop: '20px'}}>
                    <Link to="/home" style={{color: '#FF6FA3', textDecoration: 'none', fontWeight: 600}}>← Kembali ke Home</Link>
                </div>
            </div>
        </div>
    );
};

export default SearchResults;
