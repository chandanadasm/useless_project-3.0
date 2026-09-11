import React, { useState } from 'react';

export default function NotHumanCheckbox({ onProceed }) {
  const [isChecked, setIsChecked] = useState(false);
  const [showCopyStep1, setShowCopyStep1] = useState(false);
  const [showCopyStep2, setShowCopyStep2] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  const handleCheckboxChange = () => {
    if (isChecked) return;
    setIsChecked(true);

    // Sequence sarcastic system response
    setTimeout(() => {
      setShowCopyStep1(true);
    }, 400);

    setTimeout(() => {
      setShowCopyStep2(true);
    }, 1400);

    setTimeout(() => {
      setShowCTA(true);
    }, 2400);
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
      <div className="hud-card" style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--cyan-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>
          PROVE YOU ARE NOT HUMAN
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.05rem' }}>
          Please confirm that you are not a biological entity.
        </p>

        {/* Checkbox Interactive Container */}
        <div 
          onClick={handleCheckboxChange}
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: isChecked ? '1px solid var(--cyan-primary)' : '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '1.5rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.2rem',
            cursor: isChecked ? 'default' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isChecked ? '0 0 25px var(--cyan-glow)' : 'none',
            marginBottom: '2rem'
          }}
        >
          {/* Custom Checkbox Box */}
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            border: isChecked ? '2px solid var(--cyan-primary)' : '2px solid var(--text-muted)',
            background: isChecked ? 'var(--cyan-primary)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: isChecked ? 'scale(1.1)' : 'scale(1)',
            boxShadow: isChecked ? '0 0 15px var(--cyan-primary)' : 'none'
          }}>
            {isChecked && (
              <span style={{ color: '#000', fontWeight: 'bold', fontSize: '1.2rem' }}>✓</span>
            )}
          </div>

          <span className="heading-font" style={{
            fontSize: '1.2rem',
            color: isChecked ? 'var(--cyan-primary)' : 'var(--text-main)',
            letterSpacing: '1px'
          }}>
            I AM NOT A HUMAN
          </span>
        </div>

        {/* Sarcastic System Commentary */}
        <div style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
          {showCopyStep1 && (
            <p className="mono-font" style={{ color: 'var(--purple-accent)', fontSize: '1.1rem', letterSpacing: '1px' }}>
              "Interesting."
            </p>
          )}
          {showCopyStep2 && (
            <p className="mono-font" style={{ color: 'var(--cyan-primary)', fontSize: '1rem', fontStyle: 'italic' }}>
              "That was a surprisingly human way to interact with a checkbox."
            </p>
          )}
        </div>

        {/* Continue CTA */}
        {showCTA && (
          <div style={{ marginTop: '1.5rem' }}>
            <button className="cyber-btn" onClick={onProceed}>
              CONTINUE VERIFICATION
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
