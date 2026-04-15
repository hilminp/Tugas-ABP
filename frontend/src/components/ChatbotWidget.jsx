import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatbotWidget.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
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

    const messagesEndRef = useRef(null);

    /**
     * Mengirim request ke endpoint chatbot dan memastikan response sesuai format.
     */
    const requestChatbot = async (endpoint, method = 'GET', body) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        return response.json();
    };

    /**
     * Menambahkan pesan baru ke histori chat.
     */
    const appendMessage = (role, text) => {
        setMessages((currentMessages) => [...currentMessages, createMessage(role, text)]);
    };

    /**
     * Mengirim pilihan user ke backend lalu menampilkan balasan chatbot.
     */
    const handleOptionClick = async (selectedOption) => {
        if (loading) {
            return;
        }

        appendMessage(CHAT_ROLES.USER, selectedOption);
        setLoading(true);
        setError('');

        try {
            const data = await requestChatbot('/chat/next', 'POST', {
                option: selectedOption,
            });

            appendMessage(CHAT_ROLES.BOT, data.text);
            setOptions(Array.isArray(data.options) ? data.options : []);

            if (selectedOption.toLowerCase() === PAYMENT_OPTION) {
                setTimeout(() => {
                    navigate('/profile');
                }, 500);
            }
        } catch (requestError) {
            appendMessage(CHAT_ROLES.BOT, 'Maaf, jawabannya belum bisa dimuat. Coba pilih lagi ya.');
            setOptions([]);
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
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
                        <button
                            type="button"
                            className="chatbot-close"
                            onClick={() => setIsOpen(false)}
                            aria-label="Tutup chatbot"
                        >
                            x
                        </button>
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
                                {options.length > 0 ? (
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
                                ) : (
                                    <button
                                        type="button"
                                        className="chatbot-reset-button"
                                        onClick={handleReset}
                                        disabled={loading}
                                    >
                                        Mulai Lagi
                                    </button>
                                )}
                            </div>
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
