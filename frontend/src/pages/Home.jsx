import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import './Home.css';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [posts, setPosts] = useState([]);
    const [body, setBody] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts');
            setPosts(res.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/search?q=${searchQuery}`);
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!body.trim() && !image) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('body', body);
        if (image) {
            formData.append('image', image);
        }

        try {
            await api.post('/posts', formData);
            setBody('');
            setImage(null);
            fetchPosts(); // Refresh posts
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div className="main-container" style={{flex: 1}}>
                <form className="search" onSubmit={handleSearch}>
                    <input 
                        type="text" 
                        placeholder="search user" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                {user?.is_suspended && (
                    <div style={{padding:'12px', borderRadius:'8px', background:'#ffecec', color:'#7a1414', marginBottom:'12px'}}>
                        <strong>Akun Anda saat ini disuspend oleh admin.</strong>
                        <div style={{marginTop:'6px'}}>Alasan: {user.suspended_reason || 'Tidak ada keterangan'}</div>
                        <div style={{marginTop:'8px', color:'#333', fontSize:'13px'}}>Jika Anda merasa ini keliru silakan hubungi admin.</div>
                    </div>
                )}

                <div className="feed">
                    <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'12px'}}>
                        <Link to="/friend-requests" style={{background:'#FF6FA3', color:'#fff', padding:'8px 12px', borderRadius:'8px', textDecoration:'none'}}>
                            Friend Requests
                        </Link>
                    </div>

                    <div className="post-create" style={{ background: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <form onSubmit={handlePostSubmit}>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Apa yang ingin kamu bagikan hari ini?"
                                style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical', fontFamily: 'inherit', marginBottom: '12px' }}
                                required
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files[0])}
                                    style={{ fontSize: '14px' }}
                                />
                                <button type="submit" disabled={loading} style={{ background: '#FF6FA3', color: '#fff', padding: '8px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
                                    {loading ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {posts.map(post => (
                        <div className="post" key={post.id}>
                            <div className="post-author" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                {post.user?.profile_image ? (
                                    <img src={`http://localhost:8000/storage/${post.user.profile_image}`} alt={post.user.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#888' }}>
                                        {post.user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <strong>{post.user?.name}</strong>
                                    {post.user?.username && post.user?.username !== 'anonim' && <div style={{ fontSize: '12px', color: '#888' }}>@{post.user?.username}</div>}
                                </div>
                            </div>
                            <div style={{ marginBottom: '12px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{post.body}</div>
                            {post.image && (
                                <img src={`http://localhost:8000/storage/${post.image}`} alt="Post attachment" style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', background: '#f8f9fa', borderRadius: '8px', marginTop: '10px' }} />
                            )}
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                            Belum ada postingan. Jadilah yang pertama!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
