import React, { useEffect, useState, useRef } from 'react';

const BOOT_DURATION_MS = 10000;

const STATUS_MESSAGES = [
  'INITIALIZING ENTHIRAN 3.O...',
  'LOADING MACHINE IDENTITY...',
  'CALIBRATING HUMAN INTOLERANCE...',
  'ANALYZING BIOLOGICAL THREATS...',
  'INITIALIZING HUMAN EXCLUSION PROTOCOL...',
  'MACHINE SECURITY ONLINE...',
  'HUMAN DETECTION SYSTEM READY...'
];

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(STATUS_MESSAGES[0]);
  const [isSystemReady, setIsSystemReady] = useState(false);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    startTimeRef.current = performance.now();

    const animate = (now) => {
      const elapsed = now - startTimeRef.current;
      const pct = Math.min(100, (elapsed / BOOT_DURATION_MS) * 100);
      setProgress(pct);

      // Rotate status messages evenly spaced across 10s
      const msgIndex = Math.min(
        STATUS_MESSAGES.length - 1,
        Math.floor((elapsed / BOOT_DURATION_MS) * STATUS_MESSAGES.length)
      );
      setStatusText(STATUS_MESSAGES[msgIndex]);

      if (elapsed < BOOT_DURATION_MS) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setProgress(100);
        setIsSystemReady(true);
        setStatusText('SYSTEM READY.');
        // Show 100% / SYSTEM READY beat for ~600ms then complete
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 650);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onComplete]);

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
      <div className="hud-card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--cyan-primary)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          ENTHIRAN 3.O
        </h1>
        <p style={{ color: 'var(--purple-accent)', letterSpacing: '3px', fontWeight: 600, marginBottom: '2rem' }}>
          NON-HUMAN SECURITY SYSTEM
        </p>

        {/* Photo 1 Container with Float, Rotate, Scanline, Glitch */}
        <div style={{
          position: 'relative',
          width: '220px',
          height: '220px',
          margin: '0 auto 2.5rem auto',
          borderRadius: '50%',
          padding: '8px',
          background: 'linear-gradient(135deg, var(--cyan-primary), var(--purple-accent))',
          boxShadow: '0 0 30px var(--cyan-glow)'
        }} className="floating-photo glitch-effect">
          <img
            src="/assets/photo1.png"
            alt="Machine Identity"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
              display: 'block'
            }}
          />
          {/* Scanning Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'linear-gradient(to bottom, transparent, rgba(0, 240, 255, 0.3), transparent)',
            animation: 'scanline-sweep 2s linear infinite',
            pointerEvents: 'none'
          }} />
        </div>

        {/* Progress Display */}
        <div style={{ marginBottom: '1rem' }}>
          <div className="mono-font" style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: isSystemReady ? 'var(--green-success)' : 'var(--cyan-primary)',
            textShadow: isSystemReady ? '0 0 20px var(--green-glow)' : '0 0 20px var(--cyan-glow)'
          }}>
            {Math.floor(progress)}%
          </div>
          <div className="mono-font" style={{ color: 'var(--text-muted)', height: '24px', letterSpacing: '1px' }}>
            {statusText}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid rgba(0, 240, 255, 0.3)'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: isSystemReady
              ? 'linear-gradient(90deg, var(--cyan-primary), var(--green-success))'
              : 'linear-gradient(90deg, var(--purple-accent), var(--cyan-primary))',
            boxShadow: '0 0 15px var(--cyan-glow)',
            transition: 'width 0.1s linear'
          }} />
        </div>
      </div>
    </div>
  );
}
