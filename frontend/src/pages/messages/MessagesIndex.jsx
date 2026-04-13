import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import Skeleton from '../../components/ui/Skeleton';
import './MessagesIndex.css';

const MessagesIndex = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await api.get('/messages');
                setFriends(res.data.friends || []);
            } catch (err) {
                console.error("Failed to load friends", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFriends();
    }, []);

    return (
        <div style={{fontFamily: "'Poppins', sans-serif", background: '#FFF8EE', minHeight: '100vh', padding: '24px', color: '#2a1f25'}}>
            <div className="msg-box">
                <div className="msg-header">
                    <div className="msg-title">Friends</div>
                    <Link className="msg-back" to="/home">↩ Back to Home</Link>
                </div>
                <div className="msg-list">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, idx) => (
                            <div className="msg-friend" key={`skeleton-${idx}`}>
                                <div style={{ width: '50%' }}>
                                    <Skeleton width="60%" height="18px" style={{ marginBottom: '6px' }} />
                                    <Skeleton width="40%" height="13px" />
                                </div>
                                <div>
                                    <Skeleton type="button" width="140px" height="40px" style={{ borderRadius: '12px' }} />
                                </div>
                            </div>
                        ))
                    ) : friends.length === 0 ? (
                        <div className="msg-empty">No friends yet</div>
                    ) : (
                        friends.map(f => (
                            <div className="msg-friend" key={f.id}>
                            <div>
                                <div className="msg-name">{f.name} ({f.username})</div>
                                <div className="msg-email">{f.email}</div>
                            </div>
                            <div>
                                <Link className="msg-btn" to={`/messages/${f.id}`}>✉️ Send Message</Link>
                            </div>
                        </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesIndex;
