import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
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

    if (loading) return <div style={{padding:'24px'}}>Loading...</div>;

    return (
        <div style={{fontFamily: "'Poppins', sans-serif", background: '#FFF8EE', minHeight: '100vh', padding: '24px', color: '#2a1f25'}}>
            <div className="msg-box">
                <div className="msg-header">
                    <div className="msg-title">Friends</div>
                    <Link className="msg-back" to="/home">↩ Back to Home</Link>
                </div>
                <div className="msg-list">
                    {friends.length === 0 && <div className="msg-empty">No friends yet</div>}
                    
                    {friends.map(f => (
                        <div className="msg-friend" key={f.id}>
                            <div>
                                <div className="msg-name">{f.name} ({f.username})</div>
                                <div className="msg-email">{f.email}</div>
                            </div>
                            <div>
                                <Link className="msg-btn" to={`/messages/${f.id}`}>✉️ Send Message</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MessagesIndex;
