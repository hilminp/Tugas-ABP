import React from 'react';
import logoCurhatin from '../assets/logoCurhatin.png';
import './AppLoadingScreen.css';

const AppLoadingScreen = ({ progress = 65 }) => {
  const safeProgress = Math.max(10, Math.min(100, progress));

  return (
    <div className="loading-page">
      <div className="loading-bg-layer">
        <div className="loading-gradient-base" />
        <div className="loading-blob loading-blob-one" />
        <div className="loading-blob loading-blob-two" />
        <div className="loading-blob loading-blob-three" />
        <div className="loading-grain" />
      </div>

      <main className="loading-main">
        <div className="loading-logo-wrap breathing-logo">
          <div className="loading-logo-glow" />
          <div className="loading-logo-shell">
            <img src={logoCurhatin} alt="Curhatin Logo" />
          </div>
        </div>

        <h1>Curhatin</h1>

        <div className="loading-progress-wrap">
          <div className="loading-progress-bar">
            <div className="loading-progress-fill" style={{ width: `${safeProgress}%` }}>
              <div className="progress-shimmer" />
            </div>
          </div>

          <div className="loading-copy">
            <p>Preparing your sanctuary...</p>
            <small>Taking a moment just for you</small>
          </div>
        </div>
      </main>

    </div>
  );
};

export default AppLoadingScreen;
