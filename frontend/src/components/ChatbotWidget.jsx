import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatbotWidget.css';
import { api } from '../lib/api';

const PAYMENT_OPTION = 'lanjut ke pembayaran';

const CHAT_ROLES = {
    BOT: 'bot',
    USER: 'user',
};

const createMessage = (role, text) => ({
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    text,
});

const ChatbotWidget = ({ forceOpen = false, hideToggle = false }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(forceOpen);
    const [messages, setMessages] = useState([]);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [inputValue, setInputValue] = useState('');

    const messagesEndRef = useRef(null);

    /**
     * Mengirim request ke endpoint chatbot menggunakan axios instance.
     */
    const requestChatbot = async (endpoint, method = 'GET', body) => {
        try {
            const config = {
                method,
                url: endpoint,
                data: body,
            };
            const response = await api(config);
            return response.data;
        } catch (err) {
            console.error('Chatbot request error:', err);
            throw err;
        }
    };

    /**
     * Menambahkan pesan baru ke histori chat.
     */
    const appendMessage = (role, text) => {
        setMessages((currentMessages) => [...currentMessages, createMessage(role, text)]);
    };

    /**
     * Mengirim pesan (baik dari pilihan atau input teks) ke backend.
     */
    const sendMessageToBackend = async (messageText) => {
        if (!messageText.trim() || loading) {
            return;
        }

        appendMessage(CHAT_ROLES.USER, messageText);
        setLoading(true);
        setError('');
        setInputValue('');

        try {
            const data = await requestChatbot('/chat/next', 'POST', {
                message: messageText,
            });

            appendMessage(CHAT_ROLES.BOT, data.text);
            setOptions(Array.isArray(data.options) ? data.options : []);

            if (messageText.toLowerCase() === PAYMENT_OPTION) {
                setTimeout(() => {
                    navigate('/profile');
                }, 500);
            }
        } catch (requestError) {
            const errorMsg = requestError.response?.data?.error || 'Maaf, aku sedang tidak bisa membalas. Coba lagi ya.';
            appendMessage(CHAT_ROLES.BOT, errorMsg);
            setOptions([]);
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionClick = (selectedOption) => {
        sendMessageToBackend(selectedOption);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        sendMessageToBackend(inputValue);
    };

    /**
     * Me-reset chatbot ke kondisi awal melalui endpoint backend.
     */
    const handleReset = async () => {
        if (loading) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await requestChatbot('/chat/reset', 'POST');

            setMessages([createMessage(CHAT_ROLES.BOT, data.text)]);
            setOptions(Array.isArray(data.options) ? data.options : []);
        } catch (requestError) {
            setMessages([
                createMessage(CHAT_ROLES.BOT, 'Maaf, chatbot belum bisa di-reset sekarang. Coba lagi ya.'),
            ]);
            setOptions([]);
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        /**
         * Menjalankan flow awal chatbot saat komponen dimuat.
         */
        const initializeChat = async () => {
            setLoading(true);
            setError('');

            try {
                const data = await requestChatbot('/chat/start');

                setMessages([createMessage(CHAT_ROLES.BOT, data.text)]);
                setOptions(Array.isArray(data.options) ? data.options : []);
            } catch (requestError) {
                setMessages([
                    createMessage(CHAT_ROLES.BOT, 'Maaf, chatbot belum bisa dihubungkan sekarang. Coba lagi sebentar ya.'),
                ]);
                setOptions([]);
                setError(requestError.message);
            } finally {
                setLoading(false);
            }
        };

        initializeChat();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, options, loading]);

    useEffect(() => {
        setIsOpen(forceOpen);
    }, [forceOpen]);

    return (
        <div className="chatbot-widget">
            {(forceOpen || isOpen) && (
                <section className="chatbot-panel" aria-label="Chatbot pilihan emosi">
                    <div className="chatbot-header">
                        <div className="chatbot-title-group">
                            <h3>Curhatin 🤍</h3>
                            <p className="chatbot-eyebrow">Anonim & Aman</p>
                        </div>
                        <div className="chatbot-header-actions">
                            <button
                                type="button"
                                className="chatbot-header-btn"
                                onClick={handleReset}
                                aria-label="Mulai ulang chat"
                                title="Mulai ulang"
                                disabled={loading}
                            >
                                ↺
                            </button>
                            <button
                                type="button"
                                className="chatbot-header-btn"
                                onClick={() => setIsOpen(false)}
                                aria-label="Tutup chatbot"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="chatbot-body">
                        <div className="chatbot-messages" aria-live="polite" aria-label="Riwayat percakapan chatbot">
                            {messages.map((message) => {
                                const isBot = message.role === CHAT_ROLES.BOT;

                                return (
                                    <div
                                        key={message.id}
                                        className={`chatbot-message-row ${isBot ? 'bot' : 'user'}`}
                                    >
                                        <div className={`chatbot-bubble ${isBot ? 'bot' : 'user'}`}>
                                            {message.text}
                                        </div>
                                    </div>
                                );
                            })}

                            {loading && <p className="chatbot-status">Chatbot sedang mengetik...</p>}
                            {error && !loading && <p className="chatbot-status">Koneksi chatbot bermasalah.</p>}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chatbot-footer">
                            <div className="chatbot-options" aria-label="Pilihan chatbot">
                                {options.length > 0 && (
                                    options.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            className="chatbot-option-button"
                                            onClick={() => handleOptionClick(option)}
                                            disabled={loading}
                                        >
                                            {option}
                                        </button>
                                    ))
                                )}
                            </div>

                            <form className="chatbot-input-container" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    className="chatbot-input"
                                    placeholder="Ceritakan apa yang kamu rasakan..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    className="chatbot-send-button"
                                    disabled={loading || !inputValue.trim()}
                                    aria-label="Kirim pesan"
                                >
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            )}

            {!hideToggle && (
                <button
                    type="button"
                    className={`chatbot-toggle ${isOpen ? 'is-open' : ''}`}
                    onClick={() => setIsOpen((current) => !current)}
                    aria-label={isOpen ? 'Tutup chatbot' : 'Buka chatbot'}
                >
                    <span className="chatbot-toggle-mark" aria-hidden="true">
                        {isOpen ? (
                            <span className="chatbot-toggle-close">x</span>
                        ) : (
                            <svg viewBox="0 0 120 120" className="chatbot-logo-icon" role="img" aria-hidden="true">
                                <defs>
                                    <linearGradient id="chatbotBubbleMain" x1="18" y1="18" x2="92" y2="92" gradientUnits="userSpaceOnUse">
                                        <stop offset="0%" stopColor="#b65d7b" />
                                        <stop offset="100%" stopColor="#8b5360" />
                                    </linearGradient>
                                    <linearGradient id="chatbotBubbleShade" x1="46" y1="24" x2="96" y2="88" gradientUnits="userSpaceOnUse">
                                        <stop offset="0%" stopColor="#c89a9d" stopOpacity="0.92" />
                                        <stop offset="100%" stopColor="#9d7374" stopOpacity="0.92" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M61 16C33 16 14 35 14 61c0 13 5 24 14 33l-5 17 19-11c6 3 12 4 19 4 29 0 50-18 50-44S90 16 61 16Z"
                                    fill="url(#chatbotBubbleMain)"
                                />
                                <path
                                    d="M63 23c-18 0-31 13-31 29 0 10 4 19 12 25-2 11-9 20-16 28 14-6 23-10 29-12 2 0 4 1 6 1 25 0 44-15 44-36S88 23 63 23Z"
                                    fill="url(#chatbotBubbleShade)"
                                />
                                <path
                                    d="M60 72c-9-7-16-12-22-18-5-5-7-11-4-18 4-10 18-12 25-1 7-11 21-9 25 1 3 7 1 13-4 18-6 6-13 11-20 18Z"
                                    fill="#fffaf8"
                                />
                                <path
                                    d="M46 26c10-4 26-2 36 7"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.28)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />
                            </svg>
                        )}
                    </span>
                </button>
            )}
        </div>
    );
};

export default ChatbotWidget;
