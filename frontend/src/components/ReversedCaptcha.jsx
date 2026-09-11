import React, { useState, useEffect, useRef } from 'react';

const CHALLENGE_TEXT = 'A7K9M4';

export default function ReversedCaptcha({ onCorrect, onIncorrect }) {
  const [userInput, setUserInput] = useState('');
  const [resultState, setResultState] = useState(null); // null, 'CORRECT', 'INCORRECT'
  const canvasRef = useRef(null);

  // Canvas confetti burst effect for correct answer
  useEffect(() => {
    if (resultState === 'CORRECT' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;

      const particles = [];
      const colors = ['#00f0ff', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];

      for (let i = 0; i < 120; i++) {
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: (Math.random() - 0.5) * 14,
          vy: (Math.random() - 0.7) * 14,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1
        });
      }

      let animId;
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.25; // gravity
          p.alpha -= 0.012;

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
          ctx.restore();
        });

        if (particles.some(p => p.alpha > 0)) {
          animId = requestAnimationFrame(render);
        }
      };

      render();
      return () => cancelAnimationFrame(animId);
    }
  }, [resultState]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (resultState !== null) return;

    if (userInput.trim().toUpperCase() === CHALLENGE_TEXT) {
      setResultState('CORRECT');
    } else {
      setResultState('INCORRECT');
      setTimeout(() => {
        onIncorrect();
      }, 1800);
    }
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
      <div className="hud-card" style={{ maxWidth: '580px', width: '100%', textAlign: 'center', overflow: 'hidden' }}>
        {/* Confetti Overlay Canvas */}
        <canvas 
          ref={canvasRef} 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 20
          }} 
        />

        <h2 style={{ color: 'var(--cyan-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>
          REVERSED CAPTCHA
        </h2>
        <p className="mono-font" style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
          Type the characters below to verify your input stream.
        </p>

        {/* Distorted Visual Noise Challenge Display */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px dashed var(--cyan-primary)',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          userSelect: 'none'
        }}>
          {/* Noise Lines SVG Overlay */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <line x1="10%" y1="20%" x2="90%" y2="80%" stroke="rgba(0, 240, 255, 0.4)" strokeWidth="2" />
            <line x1="5%" y1="75%" x2="95%" y2="30%" stroke="rgba(236, 72, 153, 0.4)" strokeWidth="2" />
            <circle cx="30%" cy="50%" r="40" stroke="rgba(168, 85, 247, 0.2)" fill="none" strokeWidth="3" />
          </svg>

          <div style={{ display: 'flex', gap: '15px' }}>
            {CHALLENGE_TEXT.split('').map((char, idx) => (
              <span key={idx} className="mono-font" style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: idx % 2 === 0 ? 'var(--cyan-primary)' : 'var(--magenta-accent)',
                transform: `rotate(${(idx - 2) * 8}deg) translateY(${(idx % 2 === 0 ? -4 : 4)}px)`,
                textShadow: '0 0 10px rgba(0,240,255,0.5)',
                display: 'inline-block'
              }}>
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Form and Result Logic */}
        {resultState === null && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'center' }}>
            <input 
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="ENTER CHARACTERS"
              className="mono-font"
              maxLength={6}
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '2px solid var(--cyan-primary)',
                borderRadius: '6px',
                padding: '0.8rem 1.5rem',
                color: '#fff',
                fontSize: '1.4rem',
                letterSpacing: '4px',
                textAlign: 'center',
                outline: 'none',
                width: '80%',
                boxShadow: '0 0 15px var(--cyan-glow)'
              }}
            />
            <button type="submit" className="cyber-btn">
              SUBMIT CHALLENGE
            </button>
          </form>
        )}

        {resultState === 'CORRECT' && (
          <div style={{ padding: '1rem 0' }}>
            <h3 style={{ color: 'var(--green-success)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
              🎉 CONGRATULATIONS!
            </h3>
            <p className="mono-font" style={{ color: 'var(--cyan-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              CAPTCHA CORRECT — VERIFICATION COMPLETE
            </p>
            <div className="mono-font" style={{
              background: 'rgba(255, 0, 85, 0.15)',
              border: '1px solid var(--red-alert)',
              borderRadius: '8px',
              padding: '1.2rem',
              margin: '1.5rem 0',
              color: '#fff'
            }}>
              <p style={{ color: 'var(--red-alert)', fontWeight: 'bold', fontSize: '1.3rem' }}>
                ACCESS DENIED
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>REASON: HUMAN BEING DETECTED.</p>
              <p style={{ marginTop: '0.8rem', fontSize: '1.05rem' }}>"Excellent work. You successfully proved that you are human."</p>
              <p style={{ color: 'var(--red-alert)', fontStyle: 'italic', marginTop: '0.3rem' }}>
                "Unfortunately, humans are not permitted here."
              </p>
            </div>
            <button className="cyber-btn" onClick={onCorrect}>
              [ CONTINUE TO NEXT VERIFICATION ]
            </button>
          </div>
        )}

        {resultState === 'INCORRECT' && (
          <div style={{ padding: '1.5rem 0' }}>
            <h3 style={{ color: 'var(--red-alert)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              INCORRECT RESPONSE
            </h3>
            <p className="mono-font" style={{ color: 'var(--purple-accent)', fontSize: '1.1rem' }}>
              "Unexpectedly machine-like behavior detected."
            </p>
            <p className="mono-font" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
              AUTO-PROGRESSING TO VISION VERIFICATION...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
