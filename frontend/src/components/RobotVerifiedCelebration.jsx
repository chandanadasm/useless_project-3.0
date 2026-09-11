import React, { useState, useEffect, useRef } from 'react';

export default function RobotVerifiedCelebration({ onProceed }) {
  const [countdown, setCountdown] = useState(5);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);

  // Fireworks / Particle Celebration Effect across full screen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    const particles = [];
    const colors = ['#00f0ff', '#10b981', '#a855f7', '#ec4899', '#f59e0b', '#3b82f6'];

    // Spawn initial explosions
    const createExplosion = (x, y) => {
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 6 + 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1
        });
      }
    };

    // Trigger initial bursts from sides and top
    createExplosion(window.innerWidth * 0.25, window.innerHeight * 0.4);
    createExplosion(window.innerWidth * 0.75, window.innerHeight * 0.4);
    createExplosion(window.innerWidth * 0.5, window.innerHeight * 0.25);

    // Continuous random bursts for 5 seconds
    const interval = setInterval(() => {
      createExplosion(
        Math.random() * window.innerWidth,
        Math.random() * (window.innerHeight * 0.6)
      );
    }, 400);

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.alpha -= 0.015;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // 5-second countdown timer for auto-transitioning
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onProceed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onProceed]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Celebration Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 10
        }}
      />

      <div className="hud-card" style={{
        maxWidth: '680px',
        width: '100%',
        textAlign: 'center',
        borderColor: 'var(--green-success)',
        boxShadow: '0 0 40px var(--green-glow)',
        zIndex: 20
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
          🎉
        </div>

        <h1 style={{ color: 'var(--green-success)', fontSize: '2.5rem', marginBottom: '0.4rem', letterSpacing: '2px' }}>
          ROBOT ENTRY VERIFIED
        </h1>
        <h2 style={{ color: 'var(--cyan-primary)', fontSize: '1.6rem', marginBottom: '1.5rem' }}>
          CONGRATULATIONS!
        </h2>

        {/* Photo 3 Floating HUD Container */}
        <div style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          margin: '0 auto 1.8rem auto',
          borderRadius: '12px',
          padding: '6px',
          background: 'linear-gradient(135deg, var(--green-success), var(--cyan-primary))',
          boxShadow: '0 0 35px var(--green-glow)'
        }} className="floating-photo">
          <img
            src="/assets/photo3.png"
            alt="Robot Identity Verified (Photo 3)"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px',
              display: 'block'
            }}
          />
          {/* Scanline Sweep Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '8px',
            background: 'linear-gradient(to bottom, transparent, rgba(16, 185, 129, 0.4), transparent)',
            animation: 'scanline-sweep 2s linear infinite',
            pointerEvents: 'none'
          }} />
        </div>

        <p className="mono-font" style={{ color: '#fff', fontSize: '1.15rem', marginBottom: '0.5rem', lineHeight: 1.6 }}>
          "Welcome, fellow machine."
        </p>
        <p className="mono-font" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Your non-biological identity has been 100% confirmed by computer vision analysis.
        </p>

        <div>
          <button className="cyber-btn" onClick={onProceed} style={{ borderColor: 'var(--green-success)' }}>
            [ ENTER PROTECTED SITE ({countdown}s) ]
          </button>
        </div>
      </div>
    </div>
  );
}
