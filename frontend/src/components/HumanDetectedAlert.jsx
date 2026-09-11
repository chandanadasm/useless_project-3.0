import React from 'react';

export default function HumanDetectedAlert({ onProceedToCaptcha }) {
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
      <div className="hud-card red-alert" style={{ maxWidth: '640px', width: '100%', textAlign: 'center' }}>
        <div style={{
          fontSize: '3.5rem',
          color: 'var(--red-alert)',
          marginBottom: '0.5rem'
        }}>
          ⚠
        </div>

        <h1 style={{ color: 'var(--red-alert)', fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '3px' }}>
          HUMAN DETECTED
        </h1>

        {/* Telemetry Breakdown */}
        <div className="mono-font" style={{
          background: 'rgba(255, 0, 85, 0.1)',
          border: '1px solid var(--red-alert)',
          borderRadius: '8px',
          padding: '1.2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-around'
        }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>HUMAN BEHAVIOR</div>
            <div style={{ color: 'var(--red-alert)', fontSize: '1.8rem', fontWeight: 'bold' }}>100%</div>
          </div>
          <div style={{ borderRight: '1px solid rgba(255, 0, 85, 0.3)' }} />
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>ROBOT BEHAVIOR</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '1.8rem', fontWeight: 'bold' }}>0%</div>
          </div>
        </div>

        {/* Sarcastic System Copy */}
        <div className="mono-font" style={{ fontSize: '1.1rem', color: '#f8fafc', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          <p style={{ color: 'var(--red-alert)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            "HUMAN BEHAVIOR CONFIRMED."
          </p>
          <p>"You behaved exactly like a human."</p>
          <p>"That is unfortunately a security violation."</p>
          <p style={{ color: 'var(--red-alert)', fontWeight: 'bold', marginTop: '0.5rem', letterSpacing: '2px' }}>
            ACCESS DENIED.
          </p>
        </div>

        {/* Interstitial CTA */}
        <div style={{ borderTop: '1px solid rgba(255, 0, 85, 0.3)', paddingTop: '1.8rem' }}>
          <p className="mono-font" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.2rem' }}>
            "Since you are clearly human, we have prepared another unnecessary test."
          </p>
          <button className="cyber-btn red-btn" onClick={onProceedToCaptcha}>
            [ NEXT CAPTCHA VERIFICATION ]
          </button>
        </div>
      </div>
    </div>
  );
}
