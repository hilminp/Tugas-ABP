import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import DashboardAnonim from './DashboardAnonim';
import DashboardPsikolog from './DashboardPsikolog';
import ChatbotWidget from '../../components/ChatbotWidget';

const HomeComponentSwitcher = () => {
    const { user } = useAuth();
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);

    // Default fallback to anonim if no role is found (or handle appropriately)
    return (
        <>
            {user?.role === 'psikolog' ? <DashboardPsikolog /> : <DashboardAnonim />}

            {isChatbotOpen && (
                <div className="home-chatbot-shell">
                    <ChatbotWidget forceOpen hideToggle onClose={() => setIsChatbotOpen(false)} />
                </div>
            )}

            <button
                type="button"
                className="home-chatbot-toggle"
                onClick={() => setIsChatbotOpen((current) => !current)}
                aria-label={isChatbotOpen ? 'Tutup chatbot' : 'Buka chatbot'}
                aria-pressed={isChatbotOpen}
            >
                <span aria-hidden="true">{isChatbotOpen ? '+' : '💬'}</span>
            </button>
        </>
    );
};

export default HomeComponentSwitcher;
