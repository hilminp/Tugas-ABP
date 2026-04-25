import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, STORAGE_BASE_URL } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import Skeleton from '../../components/ui/Skeleton';

const MessagesContainer = () => {
    const { id: friendId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // List state
    const [friends, setFriends] = useState([]);
    const [friendsLoading, setFriendsLoading] = useState(true);
    
    // Thread state
    const [messages, setMessages] = useState([]);
    const [activeFriend, setActiveFriend] = useState(null);
    const [threadLoading, setThreadLoading] = useState(false);
    const [messageBody, setMessageBody] = useState('');
    const [isLocked, setIsLocked] = useState(false);
    const [lockMessage, setLockMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Fetch friend list
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await api.get('/messages');
                setFriends(res.data.friends || []);
            } catch (err) {
                console.error("Failed to load friends", err);
            } finally {
                setFriendsLoading(false);
            }
        };
        fetchFriends();
    }, []);

    // Fetch thread when friendId changes
    useEffect(() => {
        if (!friendId) {
            setActiveFriend(null);
            setMessages([]);
            return;
        }

        const fetchThread = async () => {
            setThreadLoading(true);
            try {
                const res = await api.get(`/messages/${friendId}`);
                setActiveFriend(res.data.friend);
                setMessages(res.data.messages);
                setIsLocked(res.data.is_locked);
                setLockMessage(res.data.lock_message);
            } catch (err) {
                console.error("Failed to load thread", err);
            } finally {
                setThreadLoading(false);
            }
        };

        fetchThread();
        const interval = setInterval(fetchThread, 5000);
        return () => clearInterval(interval);
    }, [friendId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        const body = messageBody.trim();
        if (!body || !friendId) return;

        try {
            await api.post(`/messages/${friendId}`, { body });
            setMessageBody('');
            // Optimistic update or wait for next poll
            const res = await api.get(`/messages/${friendId}`);
            setMessages(res.data.messages);
        } catch (err) {
            console.error("Failed to send message", err);
            alert(err.response?.data?.message || "Gagal mengirim pesan. Pastikan sesi sudah dimulai.");
        }
    };

    const handleAutoResize = (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    };

    return (
        <div className="bg-background text-on-background font-body aurora-bg min-h-screen flex overflow-hidden">
            {/* Sidebar Navigation & Friend List */}
            <aside className="hidden md:flex flex-col h-screen w-85 sticky left-0 top-0 overflow-y-auto bg-white/30 backdrop-blur-md border-r border-white/50 z-40 animate-in fade-in slide-in-from-left duration-700 ease-in-out shadow-[4px_0_24px_rgba(164,100,119,0.05)]">
                <div className="p-8 pb-6">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-xl font-black text-primary font-headline tracking-tighter hover:scale-105 transition-transform cursor-default">The Sanctuary</h1>
                        <button className="p-2.5 text-primary bg-primary/5 rounded-2xl hover:bg-primary/10 transition-all active:scale-90">
                            <span className="material-symbols-outlined text-sm">edit_square</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-4 p-5 bg-primary/5 rounded-[2rem] transition-all hover:bg-primary/10 group cursor-default border border-primary/5">
                        <div className="relative shrink-0">
                            {user?.profile_image ? (
                                <img 
                                    alt="User profile" 
                                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-md transition-all group-hover:ring-primary/20" 
                                    src={`${STORAGE_BASE_URL}/${user.profile_image}`} 
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-white ring-2 ring-white shadow-md flex items-center justify-center text-primary font-black text-sm">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-surface-container-lowest rounded-full shadow-sm"></div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-on-surface font-black font-headline leading-tight truncate">{user?.name}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                <p className="text-[9px] text-primary/60 uppercase tracking-[0.2em] font-black">Private Sanctuary</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-2">
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-all text-sm group-focus-within:scale-110">search</span>
                        <input 
                            type="text" 
                            placeholder="Cari percakapan..." 
                            className="w-full pl-11 pr-4 py-4 bg-white/40 border border-white/60 rounded-2xl text-sm focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/10 transition-all placeholder:text-primary/20 shadow-inner"
                        />
                    </div>
                </div>

                <div className="px-8 mt-8 mb-3">
                    <p className="text-[10px] text-primary/50 font-black uppercase tracking-[0.25em]">Percakapan Aktif</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 custom-scrollbar overflow-y-auto pb-8">
                    {friendsLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="px-4 py-4 flex gap-4 animate-pulse opacity-50">
                                <div className="w-10 h-10 bg-surface-container-high rounded-xl"></div>
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-3 bg-surface-container-high rounded-full w-3/4"></div>
                                    <div className="h-2 bg-surface-container-high rounded-full w-1/2"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        friends.map((f, i) => (
                            <button 
                                key={f.id}
                                onClick={() => navigate(`/messages/${f.id}`)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-500 group relative animate-in fade-in slide-in-from-left delay-[${i * 50}ms] ${friendId == f.id ? 'bg-white shadow-xl shadow-primary/5 scale-[1.01] translate-x-1.5 ring-1 ring-primary/5' : 'hover:bg-white/40 hover:translate-x-1'}`}
                            >
                                {friendId == f.id && <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-full shadow-[2px_0_10px_rgba(136,77,96,0.2)]"></div>}
                                <div className="relative shrink-0">
                                    {f.profile_image ? (
                                        <img 
                                            src={`${STORAGE_BASE_URL}/${f.profile_image}`} 
                                            className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-500 ring-2 ring-white" 
                                            alt={f.name} 
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm ring-2 ring-white flex items-center justify-center text-primary font-bold text-sm">
                                            {f.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                                </div>
                                <div className="flex-1 text-left overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <p className={`font-headline font-bold truncate text-sm transition-colors duration-300 ${friendId == f.id ? 'text-primary' : 'text-on-surface'}`}>{f.name}</p>
                                        <span className={`text-[8px] font-bold uppercase tracking-tighter ${friendId == f.id ? 'text-primary/60' : 'text-primary/30'}`}>10:45 AM</span>
                                    </div>
                                    <p className={`text-[11px] truncate mt-0.5 font-medium transition-colors ${friendId == f.id ? 'text-primary/40' : 'text-on-surface-variant/40'}`}>Bagikan ceritamu...</p>
                                </div>
                                {friendId != f.id && <div className="w-1.5 h-1.5 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100"></div>}
                            </button>
                        ))
                    )}
                </nav>

                <div className="p-6">
                    <button 
                        onClick={() => navigate('/home')}
                        className="w-full py-3.5 bg-white/40 border border-white/60 shadow-[0_4px_12px_rgba(136,77,96,0.05)] text-on-surface/70 hover:text-primary rounded-full font-black text-[10px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all hover:bg-white hover:shadow-[0_8px_20px_rgba(136,77,96,0.1)] hover:-translate-y-0.5 active:scale-95 group"
                    >
                        <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        Kembali Beranda
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen relative bg-transparent animate-in fade-in duration-1000">
                {!friendId ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in zoom-in fade-in duration-700">
                        <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mb-10 relative">
                            <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20"></div>
                            <div className="absolute inset-4 bg-primary/5 rounded-full animate-pulse opacity-40"></div>
                            <span className="material-symbols-outlined text-6xl text-primary/20 relative" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                        </div>
                        <h2 className="text-4xl font-black text-on-surface font-headline mb-4 tracking-tight">Ruang Amanmu</h2>
                        <p className="text-on-surface-variant/60 max-w-sm leading-relaxed font-medium text-lg">
                            Pilih teman dari daftar di samping untuk memulai percakapan yang penuh makna.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Top App Bar */}
                        <header className="sticky top-0 w-full z-50 flex justify-between items-center px-12 py-6 bg-white/30 backdrop-blur-md border-b border-white/50 shadow-[0_4px_24px_rgba(164,100,119,0.05)] animate-in slide-in-from-top duration-500">
                            <div className="flex items-center gap-6">
                                <div className="relative group cursor-pointer">
                                    {activeFriend?.profile_image ? (
                                        <img 
                                            alt={activeFriend?.name} 
                                            className="w-10 h-10 rounded-xl object-cover ring-4 ring-white shadow-xl transition-all group-hover:scale-105" 
                                            src={`${STORAGE_BASE_URL}/${activeFriend.profile_image}`} 
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl bg-white ring-4 ring-white shadow-xl flex items-center justify-center text-primary font-black text-lg">
                                            {activeFriend?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full shadow-md animate-pulse"></div>
                                </div>
                                <div>
                                    <p className="font-headline font-black text-on-surface text-xl leading-none tracking-tighter hover:text-primary transition-colors cursor-default">{activeFriend?.name || "Memuat..."}</p>
                                    <div className="flex items-center gap-2.5 mt-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-black opacity-50">Sedang Online</p>
                                    </div>
                                </div>
                            </div>
                            {/* Action buttons removed */}
                        </header>

                        {/* Chat Feed */}
                        <section className="flex-1 overflow-y-auto pt-10 pb-40 px-12 custom-scrollbar scroll-smooth">
                            <div className="max-w-4xl mx-auto space-y-10">
                                <div className="flex justify-center mb-12">
                                    <span className="px-6 py-2 bg-white/40 backdrop-blur-md text-on-surface-variant text-[10px] font-black rounded-full uppercase tracking-[0.3em] shadow-sm border border-white/60">Percakapan Hari Ini</span>
                                </div>

                                {threadLoading && messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary shadow-lg"></div>
                                        <p className="text-xs text-primary/40 font-black uppercase tracking-widest">Menyelaraskan Cerita...</p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center p-20 opacity-30 italic text-sm font-medium animate-pulse">
                                        Belum ada pesan. Sapa temanmu untuk memulai kebaikan.
                                    </div>
                                ) : (
                                    messages.map((m, idx) => {
                                        const isMe = m.sender_id === user?.id;
                                        return (
                                            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-3 w-full animate-in fade-in slide-in-from-bottom-4 duration-500`} style={{ animationDelay: `${idx * 30}ms` }}>
                                                <div className={`max-w-[85%] md:max-w-[65%] p-6 rounded-3xl shadow-sm relative group transition-all hover:shadow-md ${
                                                    isMe 
                                                    ? 'bg-gradient-to-br from-primary to-primary-dim text-on-primary rounded-tr-none shadow-primary/20 hover:scale-[1.01]' 
                                                    : 'bg-white/80 backdrop-blur-sm rounded-tl-none border border-white/60 text-on-surface hover:bg-white'
                                                }`}>
                                                    <p className="text-[15px] leading-relaxed font-medium">
                                                        {m.body}
                                                    </p>
                                                </div>
                                                <div className={`flex items-center gap-2 px-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                    <span className="text-[9px] text-on-surface-variant/40 font-black uppercase tracking-tighter">
                                                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isMe && <span className="material-symbols-outlined text-[14px] text-primary/40" style={{ fontVariationSettings: "'FILL' 1" }}>done_all</span>}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </section>

                        {/* Message Input Area (Floating) */}
                        <footer className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[85%] max-w-4xl z-50 animate-in slide-in-from-bottom duration-700">
                            {isLocked ? (
                                <div className="bg-amber-50/90 backdrop-blur-3xl rounded-[2rem] p-6 flex items-center justify-center gap-4 shadow-xl border border-amber-200/50">
                                    <span className="material-symbols-outlined text-amber-600 animate-pulse">lock</span>
                                    <p className="text-amber-800 font-bold text-sm">{lockMessage}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSend} className="bg-white/80 backdrop-blur-3xl rounded-[2rem] p-2 pr-3 flex items-center gap-4 shadow-[0_20px_50px_rgba(136,77,96,0.15)] border border-white/60">
                                    <button type="button" className="ml-4 text-primary/40 hover:text-primary transition-all active:scale-90">
                                        <span className="material-symbols-outlined font-black">add_circle</span>
                                    </button>
                                    <div className="flex-1">
                                        <textarea 
                                            value={messageBody}
                                            onChange={(e) => setMessageBody(e.target.value)}
                                            onInput={handleAutoResize}
                                            className="w-full bg-transparent border-none focus:ring-0 text-on-surface py-4 resize-none max-h-32 font-body text-[15px] font-medium placeholder:text-on-surface-variant/30 placeholder:italic" 
                                            placeholder="Tulis pesan dengan sepenuh hati..." 
                                            rows="1"
                                        ></textarea>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button type="button" className="text-primary/40 hover:text-primary transition-all active:scale-90">
                                            <span className="material-symbols-outlined font-black">sentiment_very_satisfied</span>
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={!messageBody.trim()}
                                            className="w-12 h-12 bg-gradient-to-br from-[#fdb2c7] to-[#955170] text-white rounded-2xl flex items-center justify-center shadow-[0_10px_20px_rgba(149,81,112,0.3)] active:scale-95 disabled:opacity-30 disabled:shadow-none transition-all group"
                                        >
                                            <span className="material-symbols-outlined transition-transform relative z-10 text-xl group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                                        </button>
                                    </div>
                                </form>
                            )}
                        </footer>
                    </>
                )}
            </main>
        </div>
    );
};

export default MessagesContainer;
