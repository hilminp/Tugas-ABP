import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterRoleSelect.css';

/* -------------------------------------------------------
   Small reusable helpers
------------------------------------------------------- */

/** Render a Material Symbols Outlined icon */
const Icon = ({ name, className = '' }) => (
    <span className={`rrs-material-icon ${className}`} aria-hidden="true">
        {name}
    </span>
);

/** Feature list item */
const Feature = ({ icon, iconClass, children }) => (
    <li className="rrs-feature-item">
        <Icon name={icon} className={`rrs-feature-icon--${iconClass}`} />
        {children}
    </li>
);

/* -------------------------------------------------------
   Main component
------------------------------------------------------- */

const RegisterRoleSelect = () => {
    const navigate = useNavigate();

    return (
        <div className="rrs-page">

            {/* ── Decorative overlays (absolute inside .rrs-page) ── */}
            {/* Animated blobs handled by CSS ::before / ::after on .rrs-page */}
            <div className="rrs-streak"      aria-hidden="true" />
            <div className="rrs-grain-layer" aria-hidden="true" />

            {/* ── Main content (z-index: 2 so it sits above blobs) ── */}
            <main className="rrs-main" style={{ position: 'relative', zIndex: 2 }}>

                {/* Brand */}
                <div className="rrs-brand">
                    <h1 className="rrs-brand-title">Curhatin</h1>
                    <p className="rrs-brand-sub">Step into your digital sanctuary.</p>
                </div>

                {/* Registration path cards */}
                <div className="rrs-grid">

                    {/* ── Card: Anonim ── */}
                    <div className="rrs-card rrs-card--anonim">
                        <div className="rrs-card-header">
                            <div className="rrs-icon-box rrs-icon-box--primary">
                                <Icon name="masks" />
                            </div>
                            <h2 className="rrs-card-title">Anonim</h2>
                            <p className="rrs-card-desc">
                                Seek peace and clarity without judgment. Share your heart in a
                                space built for absolute privacy and empathy.
                            </p>
                        </div>

                        <div className="rrs-card-footer">
                            <ul className="rrs-feature-list">
                                <Feature icon="check_circle" iconClass="primary">
                                    No real name required
                                </Feature>
                                <Feature icon="check_circle" iconClass="primary">
                                    Encrypted personal diaries
                                </Feature>
                            </ul>

                            <button
                                className="rrs-btn rrs-btn--primary"
                                onClick={() => navigate('/register/anonim')}
                                type="button"
                            >
                                Start Your Journey
                                <Icon name="arrow_forward" />
                            </button>
                        </div>
                    </div>

                    {/* ── Card: Psikolog ── */}
                    <div className="rrs-card rrs-card--psikolog">
                        <div className="rrs-card-header">
                            <div className="rrs-icon-box rrs-icon-box--tertiary">
                                <Icon name="psychology" />
                            </div>
                            <h2 className="rrs-card-title">Psikolog</h2>
                            <p className="rrs-card-desc">
                                Join our circle of professionals. Guide others through their fog
                                with your expertise and compassionate voice.
                            </p>
                        </div>

                        <div className="rrs-card-footer">
                            <ul className="rrs-feature-list">
                                <Feature icon="verified" iconClass="tertiary">
                                    Verified professional badge
                                </Feature>
                                <Feature icon="verified" iconClass="tertiary">
                                    Secure consultation portal
                                </Feature>
                            </ul>

                            <button
                                className="rrs-btn rrs-btn--tertiary"
                                onClick={() => navigate('/register/psikolog')}
                                type="button"
                            >
                                Apply to Guide
                                <Icon name="assignment_ind" />
                            </button>
                        </div>
                    </div>

                </div>{/* /grid */}

                {/* Secondary navigation */}
                <div className="rrs-secondary-nav">
                    <p className="rrs-signin-text">
                        Already part of the sanctuary?
                        <Link to="/login" className="rrs-signin-link">Sign in here</Link>
                    </p>

                    <nav className="rrs-footer-links" aria-label="Footer links">
                        <a href="#">Safe Spaces</a>
                        <span className="rrs-dot" aria-hidden="true" />
                        <a href="#">Our Philosophy</a>
                        <span className="rrs-dot" aria-hidden="true" />
                        <a href="#">Privacy</a>
                    </nav>
                </div>

            </main>

            {/* Footer */}
            <footer className="rrs-footer" style={{ position: 'relative', zIndex: 2 }}>
                <p>© 2024 The Sanctuary • Intentional Design</p>
            </footer>

        </div>
    );
};

export default RegisterRoleSelect;
