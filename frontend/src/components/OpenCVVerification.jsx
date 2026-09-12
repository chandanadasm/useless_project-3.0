import React, { useState, useEffect, useRef } from 'react';

const MIN_SCAN_TIME_MS = 6000; // 6-second presentation delay requirement (between 5–10s)

export default function OpenCVVerification({ onVerdictRobot, onVerdictHuman }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [streamUrl, setStreamUrl] = useState('/api/video_feed');
  const [opencvStatus, setOpencvStatus] = useState({
    is_active: false,
    verdict: 'SCANNING',
    good_matches: 0,
    inliers: 0
  });

  const startTimeRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const verdictHandledRef = useRef(false);

  // Transition screen delay (2 seconds) before camera flow
  useEffect(() => {
    const initTimer = setTimeout(() => {
      setIsInitializing(false);
      startVerificationSession();
    }, 2000);

    return () => clearTimeout(initTimer);
  }, []);

  const startVerificationSession = async () => {
    try {
      await fetch('/api/start-verification', { method: 'POST' });
    } catch (e) {
      console.warn('Backend start-verification request failed.', e);
    }
    
    startTimeRef.current = Date.now();
    setStreamUrl(`/api/video_feed?t=${Date.now()}`);

    // Poll backend status endpoint every 300ms for live real-time metrics
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/opencv-status');
        if (res.ok) {
          const data = await res.json();
          setOpencvStatus(data);

          const elapsed = Date.now() - startTimeRef.current;
          
          // Check if minimum 5–10s presentation delay has elapsed AND backend has verdict
          if (elapsed >= MIN_SCAN_TIME_MS && !verdictHandledRef.current) {
            if (data.verdict === 'ROBOT_VERIFIED') {
              verdictHandledRef.current = true;
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              onVerdictRobot(data);
            } else if (data.verdict === 'HUMAN_DETECTED' || data.verdict === 'DENIED') {
              verdictHandledRef.current = true;
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              onVerdictHuman(data);
            }
          }
        }
      } catch (err) {
        console.error('OpenCV status poll error:', err);
      }
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleImageError = () => {
    // Retry streaming feed after brief delay if connection was momentarily interrupted
    setTimeout(() => {
      setStreamUrl(`/api/video_feed?t=${Date.now()}`);
    }, 800);
  };

  if (isInitializing) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem'
      }}>
        <div className="hud-card" style={{ maxWidth: '540px', width: '100%', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--cyan-primary)', fontSize: '2.2rem', marginBottom: '1rem' }}>
            VISION VERIFICATION INITIALIZING...
          </h2>
          <p className="mono-font" style={{ color: 'var(--purple-accent)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            "Enough behavioral analysis."
          </p>
          <p className="mono-font" style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            "Show us what you are."
          </p>
        </div>
      </div>
    );
  }

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
      <div className="hud-card" style={{ maxWidth: '720px', width: '100%', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--cyan-primary)', fontSize: '2rem', marginBottom: '0.4rem' }}>
          OPENCV ENTITY SCANNER
        </h2>
        <p className="mono-font" style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          ANALYZING ENTITY IN REAL-TIME...
        </p>

        {/* Live Camera Feed Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '640px',
          height: '380px',
          margin: '0 auto 1.5rem auto',
          background: '#000',
          borderRadius: '8px',
          border: '2px solid var(--cyan-primary)',
          boxShadow: '0 0 25px var(--cyan-glow)',
          overflow: 'hidden'
        }}>
          <img 
            src={streamUrl} 
            alt="OpenCV Live Feed" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
            onError={handleImageError}
          />

          {/* HUD Targeting Overlay */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none',
            border: '20px solid rgba(0, 240, 255, 0.05)',
            boxSizing: 'border-box'
          }}>
            <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'var(--cyan-primary)', fontSize: '0.85rem' }} className="mono-font">
              CAM_01 // 30FPS
            </div>
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', color: 'var(--magenta-accent)', fontSize: '0.85rem' }} className="mono-font">
              FEATURE MATCHING ACTIVE
            </div>
          </div>
        </div>

        {/* Live Metrics Display */}
        <div className="mono-font" style={{
          display: 'flex',
          justifyContent: 'space-around',
          background: 'rgba(0,0,0,0.5)',
          padding: '1rem',
          borderRadius: '6px',
          border: '1px solid rgba(0, 240, 255, 0.2)'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>ORB MATCHES: </span>
            <span style={{ color: 'var(--cyan-primary)', fontWeight: 'bold' }}>{opencvStatus.good_matches || 0}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>INLIERS: </span>
            <span style={{ color: 'var(--purple-accent)', fontWeight: 'bold' }}>{opencvStatus.inliers || 0}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>VERDICT: </span>
            <span style={{
              color: opencvStatus.verdict === 'ROBOT_VERIFIED' ? 'var(--green-success)' :
                     opencvStatus.verdict === 'HUMAN_DETECTED' ? 'var(--red-alert)' : 'var(--cyan-primary)',
              fontWeight: 'bold'
            }}>
              {opencvStatus.verdict}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
