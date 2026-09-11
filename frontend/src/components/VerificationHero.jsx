import React, { useState } from 'react';

export default function VerificationHero({ onStart }) {
  const [isScanning, setIsScanning] = useState(false);

  const handleClick = () => {
    setIsScanning(true);
    setTimeout(() => {
      onStart();
    }, 800);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      position: 'relative'
    }}>
      <div className="hud-card" style={{ maxWidth: '640px', width: '100%', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          padding: '0.4rem 1.2rem',
          borderRadius: '20px',
          background: 'rgba(236, 72, 153, 0.15)',
          border: '1px solid var(--magenta-accent)',
          color: 'var(--magenta-accent)',
          fontSize: '0.9rem',
          letterSpacing: '2px',
          marginBottom: '1.5rem'
        }} className="mono-font">
          SECURITY PROTOCOL LEVEL 1
        </div>

        <h1 style={{ color: 'var(--cyan-primary)', fontSize: '2.8rem', marginBottom: '0.5rem' }}>
          ENTHIRAN 3.O
        </h1>
        <h2 style={{ color: 'var(--purple-accent)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          PROVE YOU ARE NOT HUMAN
        </h2>
        <p className="mono-font" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
          "Your biological status is currently suspicious."
        </p>

        <div>
          <button 
            className="cyber-btn" 
            onClick={handleClick}
            disabled={isScanning}
            style={{
              padding: '1.2rem 3rem',
              fontSize: '1.2rem',
              opacity: isScanning ? 0.7 : 1
            }}
          >
            {isScanning ? 'SCANNING BIOMETRICS...' : '[ START VERIFICATION ]'}
          </button>
        </div>
      </div>
    </div>
  );
}
