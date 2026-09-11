import React from 'react';

export default function ProtectedSite({ onReset }) {
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
      <div className="hud-card" style={{
        maxWidth: '780px',
        width: '100%',
        textAlign: 'center',
        borderColor: 'var(--green-success)',
        boxShadow: '0 0 40px var(--green-glow)'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          🤖
        </div>

        <h1 style={{ color: 'var(--green-success)', fontSize: '2.5rem', marginBottom: '1.5rem', letterSpacing: '3px' }}>
          ACCESS GRANTED
        </h1>

        <div className="mono-font" style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid var(--green-success)',
          borderRadius: '8px',
          padding: '2rem',
          color: '#ffffff',
          fontSize: '1.25rem',
          lineHeight: '1.8',
          letterSpacing: '1px',
          marginBottom: '2.5rem'
        }}>
          "CONGRATULATIONS. YOU ARE A ROBOT. YOU MAY NOW ENTER THE INTERNET. USELESS BY PURPOSE. ENGINEERED BY CHOICE."
        </div>

        <div>
          <button className="cyber-btn" onClick={onReset} style={{ borderColor: 'var(--green-success)' }}>
            RESTART SYSTEM
          </button>
        </div>
      </div>
    </div>
  );
}
