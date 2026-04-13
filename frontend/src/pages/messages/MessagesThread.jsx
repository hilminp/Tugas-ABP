import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Skeleton from '../../components/ui/Skeleton';
import './MessagesThread.css';

const MessagesThread = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [friend, setFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [body, setBody] = useState('');
    const messagesEndRef = useRef(null);

    const fetchThread = async () => {
        try {
            const res = await api.get(`/messages/${id}`);
            setFriend(res.data.friend);
            setMessages(res.data.messages);
        } catch (err) {
            console.error("Failed to load thread", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThread();
        // Optional: add interval for polling or WebSocket
        const interval = setInterval(fetchThread, 5000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        const cleanBody = body.replace(/[\s\u00A0]+$/g, '').replace(/(\r?\n){3,}/g, '\n\n');
        if (!cleanBody) return;

        try {
            await api.post(`/messages/${id}`, { body: cleanBody });
            setBody('');
            fetchThread();
        } catch {
            alert("Failed to send message");
        }
    };

    const handleAutoResize = (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
    };

    if (loading) return (
        <div style={{fontFamily: "'Poppins', sans-serif", background: '#f1f5f9', minHeight: '100vh', padding: '20px', color: '#0f172a'}}>
            <div className="thread-box" style={{background: '#fff', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', height: '80vh'}}>
                <div className="thread-header" style={{borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '16px'}}>
                    <div>
                        <Skeleton width="150px" height="24px" style={{marginBottom: '8px'}} />
                        <Skeleton width="100px" height="12px" />
                    </div>
                </div>
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    <div style={{alignSelf: 'flex-start', width: '60%'}}>
                        <Skeleton height="60px" style={{borderRadius: '16px', borderTopLeftRadius: 0}} />
                    </div>
                    <div style={{alignSelf: 'flex-end', width: '50%'}}>
                        <Skeleton height="50px" style={{borderRadius: '16px', borderTopRightRadius: 0}} />
                    </div>
                    <div style={{alignSelf: 'flex-start', width: '70%'}}>
                        <Skeleton height="80px" style={{borderRadius: '16px', borderTopLeftRadius: 0}} />
                    </div>
                </div>
                <div style={{marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #eee', display: 'flex', gap: '12px'}}>
                    <Skeleton width="100%" height="48px" style={{borderRadius: '24px'}} />
                    <Skeleton width="80px" height="48px" style={{borderRadius: '24px'}} />
                </div>
            </div>
        </div>
    );

    if (!friend) return <div style={{padding:'20px'}}>User not found</div>;

    return (
        <div style={{fontFamily: "'Poppins', sans-serif", background: '#f1f5f9', minHeight: '100vh', padding: '20px', color: '#0f172a'}}>
            <div className="thread-box">
                <div className="thread-header">
                    <div>
                        <div className="thread-title">{friend.name} ({friend.username})</div>
                        <div style={{fontSize: '12px', color: '#475569'}}>Percakapan pribadi</div>
                    </div>
                    <Link className="thread-back" to="/messages">↩ Back</Link>
                </div>

                <div className="thread-chat-card">
                    <div className="thread-messages">
                        {messages.map(m => {
                            const isMe = m.sender_id === user?.id;
                            return (
                                <div className={`thread-row ${isMe ? 'me' : 'other'}`} key={m.id}>
                                    <div className={`thread-bubble ${isMe ? 'me' : 'other'}`}>
                                        {m.body.trim()}
                                        <div className="thread-meta" style={{textAlign: isMe ? 'right' : 'left'}}>
                                            {new Date(m.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="thread-form" onSubmit={handleSend}>
                        <textarea 
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            onInput={handleAutoResize}
                            rows="1" 
                            placeholder="Ketik pesan..."
                            required
                        ></textarea>
                        <button className="thread-btn" type="submit">Kirim</button>
                    </form>
                </div>

                <div style={{marginTop: '8px'}}>
                    <Link to="/messages" style={{color: '#F0679F', textDecoration: 'none'}}>⬅ Kembali ke daftar teman</Link>
                </div>
            </div>
        </div>
    );
};

export default MessagesThread;
