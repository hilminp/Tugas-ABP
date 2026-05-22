import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import AppLoadingScreen from '../../components/AppLoadingScreen';
import { XCircle, ArrowLeft } from 'lucide-react';
import './GoogleCallback.css';

// Cache to prevent duplicate requests in React StrictMode
const callbackPromiseCache = {};

const GoogleCallback = () => {
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');

        if (!code) {
            setError('Kode otorisasi Google tidak ditemukan.');
            return;
        }

        let isMounted = true;

        if (!callbackPromiseCache[code]) {
            callbackPromiseCache[code] = api.get(`/auth/google/callback?code=${code}`);
        }

        callbackPromiseCache[code]
            .then((res) => {
                if (!isMounted) return;
                login(res.data.user, res.data.access_token);
                if (res.data.user.is_admin) {
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    navigate('/home', { replace: true });
                }
            })
            .catch((err) => {
                if (!isMounted) return;
                const errMsg = err.response?.data?.message || 'Gagal memproses autentikasi Google.';
                const errDetail = err.response?.data?.error ? ` Detail: ${err.response.data.error}` : '';
                setError(errMsg + errDetail);
            });

        return () => {
            isMounted = false;
        };
    }, [location, login, navigate]);

    if (error) {
        return (
            <div className="google-callback-error-page">
                <div className="organic-blob blob-one" />
                <div className="organic-blob blob-two" />
                <div className="error-card">
                    <div className="error-icon-container">
                        <XCircle size={48} className="error-icon" />
                    </div>
                    <h2>Autentikasi Gagal</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/login')} className="back-login-btn">
                        <ArrowLeft size={16} />
                        Kembali ke Halaman Login
                    </button>
                </div>
            </div>
        );
    }

    return <AppLoadingScreen progress={90} />;
};

export default GoogleCallback;
