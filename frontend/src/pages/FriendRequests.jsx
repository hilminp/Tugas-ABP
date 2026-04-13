import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import Skeleton from '../components/ui/Skeleton';
import './FriendRequests.css';

const FriendRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

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
        try {
            await api.post(`/friend/${id}/accept`);
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to accept request');
        }
    };

    const handleReject = async (id) => {
        try {
            await api.post(`/friend/${id}/reject`);
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to reject request');
        }
    };

    return (
        <div style={{fontFamily: "'Poppins', sans-serif", background: '#FFF8EE', minHeight: '100vh', padding: '20px'}}>
            <div className="box">
                <h2>Incoming Friend Requests</h2>
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div className="req" key={`skeleton-${i}`}>
                            <div style={{ width: '50%' }}>
                                <Skeleton width="60%" height="18px" style={{ marginBottom: '6px' }} />
                                <Skeleton width="40%" height="13px" />
                            </div>
                            <div className="actions">
                                <Skeleton type="button" width="70px" height="34px" />
                                <Skeleton type="button" width="70px" height="34px" />
                            </div>
                        </div>
                    ))
                ) : requests.length === 0 ? (
                    <div style={{ padding:'20px', color:'#666' }}>No requests</div>
                ) : (
                    requests.map(r => (
                        <div className="req" key={r.id}>
                            <div>
                                <div style={{fontWeight: 600}}>{r.requester?.name} ({r.requester?.username})</div>
                                <div style={{fontSize: '13px', color: '#777'}}>{r.requester?.email}</div>
                            </div>
                            <div className="actions">
                                <button className="btn" onClick={() => handleAccept(r.user_id)}>Accept</button>
                                <button className="btn" style={{background: '#ccc', color: '#222'}} onClick={() => handleReject(r.user_id)}>Reject</button>
                            </div>
                        </div>
                    ))
                )}
                
                <Link to="/home" style={{display: 'inline-block', marginTop: '20px'}}>Back to Home</Link>
            </div>
        </div>
    );
};

export default FriendRequests;
