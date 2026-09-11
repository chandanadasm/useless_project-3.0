import React, { useState, useEffect, useRef } from 'react';

// NOTE: Fictional browser-only behavioral demo, no raw keystrokes or biometric data are collected or stored.

export default function Task01TargetChase({ onComplete }) {
  const containerRef = useRef(null);
  
  // Target position state (in percentage of container bounds)
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [relocationsCount, setRelocationsCount] = useState(0);
  const maxRelocationsRef = useRef(Math.floor(Math.random() * 2) + 2); // Random choice in {2, 3}
  const [isStabilized, setIsStabilized] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Behavior metrics
  const [humanScore, setHumanScore] = useState(0);
  const [robotScore, setRobotScore] = useState(100);

  // Tracking references for RAF calculations
  const metricsRef = useRef({
    startTime: Date.now(),
    lastMousePos: null,
    totalTravelDistance: 0,
    directionChanges: 0,
    lastVelocity: { x: 0, y: 0 },
    relocations: 0
  });

  const rafRef = useRef(null);
  const isCompletedRef = useRef(false);

  // Handle Mouse Movement & Proximity Evade Logic
  const handleMouseMove = (e) => {
    if (isCompletedRef.current || isLocked || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    // Metric tracking: Travel Distance & Vector Sign Changes
    const m = metricsRef.current;
    if (m.lastMousePos) {
      const dx = cursorX - m.lastMousePos.x;
      const dy = cursorY - m.lastMousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      m.totalTravelDistance += dist;

      // Check vector direction sign changes
      if (Math.sign(dx) !== Math.sign(m.lastVelocity.x) && dx !== 0) m.directionChanges++;
      if (Math.sign(dy) !== Math.sign(m.lastVelocity.y) && dy !== 0) m.directionChanges++;
      m.lastVelocity = { x: dx, y: dy };
    }
    m.lastMousePos = { x: cursorX, y: cursorY };

    // Proximity evasion check if relocations not capped
    if (m.relocations < maxRelocationsRef.current) {
      const targetPxX = (targetPos.x / 100) * rect.width;
      const targetPxY = (targetPos.y / 100) * rect.height;
      const distToTarget = Math.sqrt((cursorX - targetPxX) ** 2 + (cursorY - targetPxY) ** 2);

      const PROXIMITY_RADIUS = 120; // 120px proximity trigger
      if (distToTarget < PROXIMITY_RADIUS) {
        // Relocate to new safe bounds (avoiding outer 15% edges & center top header)
        const newX = Math.floor(Math.random() * 60) + 20; // 20% to 80%
        const newY = Math.floor(Math.random() * 50) + 35; // 35% to 85%
        setTargetPos({ x: newX, y: newY });
        
        m.relocations += 1;
        setRelocationsCount(m.relocations);

        if (m.relocations >= maxRelocationsRef.current) {
          setIsStabilized(true);
        }
      }
    }
  };

  // Deterministic Telemetry Loop using requestAnimationFrame
  useEffect(() => {
    metricsRef.current.startTime = Date.now();

    const updateTelemetry = () => {
      if (isCompletedRef.current) return;

      const m = metricsRef.current;
      const elapsedMs = Date.now() - m.startTime;

      // Deterministic Pure Monotonic Score Formula
      // Reaches 100% naturally over 10 - 15 seconds based on user movement
      const timeContrib = (elapsedMs / 12000) * 45; // up to 45% from elapsed time
      const travelContrib = Math.min(30, (m.totalTravelDistance / 3500) * 30); // up to 30% from movement
      const dirChangeContrib = Math.min(15, (m.directionChanges / 40) * 15); // up to 15% from erratic curves
      const relocationContrib = m.relocations * 5; // 5% per relocation

      const rawHuman = Math.min(100, Math.floor(timeContrib + travelContrib + dirChangeContrib + relocationContrib));
      
      setHumanScore(rawHuman);
      setRobotScore(100 - rawHuman);

      // Immediate Halt on Human = 100%
      if (rawHuman >= 100) {
        isCompletedRef.current = true;
        setIsLocked(true);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        onComplete();
        return;
      }

      rafRef.current = requestAnimationFrame(updateTelemetry);
    };

    rafRef.current = requestAnimationFrame(updateTelemetry);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onComplete]);

  const handleTargetClick = () => {
    if (isStabilized && !isLocked && !isCompletedRef.current) {
      isCompletedRef.current = true;
      setIsLocked(true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      onComplete();
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        minHeight: '100vh',
        width: '100vw',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'crosshair',
        background: 'radial-gradient(circle at center, #0f172a 0%, #070913 100%)'
      }}
    >
      {/* Header HUD Bar */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <h2 style={{ color: 'var(--cyan-primary)', fontSize: '1.8rem' }}>
          TASK 01 — CATCH THE MACHINE ENTITY
        </h2>
        <p className="mono-font" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {isStabilized 
            ? "TARGET STABILIZED — CLICK TARGET TO COMPLETE" 
            : `EVASION PROTOCOL ACTIVE (${relocationsCount}/${maxRelocationsRef.current} EVASIONS)`}
        </p>
      </div>

      {/* Telemetry Panel */}
      <div className="hud-card mono-font" style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '650px',
        padding: '1.2rem 2rem',
        zIndex: 10,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ color: 'var(--red-alert)', fontWeight: 'bold', fontSize: '1.1rem' }}>
            HUMAN BEHAVIOR {humanScore}%
          </div>
          <div style={{
            width: '200px',
            height: '8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            marginTop: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ width: `${humanScore}%`, height: '100%', background: 'var(--red-alert)', transition: 'width 0.1s linear' }} />
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--cyan-primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>
            ROBOT BEHAVIOR {robotScore}%
          </div>
          <div style={{
            width: '200px',
            height: '8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            marginTop: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ width: `${robotScore}%`, height: '100%', background: 'var(--cyan-primary)', transition: 'width 0.1s linear' }} />
          </div>
        </div>
      </div>

      {/* Circular Moving Target */}
      <div 
        onClick={handleTargetClick}
        style={{
          position: 'absolute',
          top: `${targetPos.y}%`,
          left: `${targetPos.x}%`,
          transform: 'translate(-50%, -50%)',
          width: isStabilized ? '130px' : '100px',
          height: isStabilized ? '130px' : '100px',
          borderRadius: '50%',
          border: isStabilized ? '3px solid var(--green-success)' : '3px solid var(--cyan-primary)',
          boxShadow: isStabilized ? '0 0 30px var(--green-glow)' : '0 0 30px var(--cyan-glow)',
          transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isStabilized ? 'pointer' : 'default',
          zIndex: 5
        }}
      >
        <img 
          src="/assets/photo2.png" 
          alt="Target Entity" 
          style={{
            width: '70%',
            height: '70%',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
        {/* Reticle Ring */}
        <div style={{
          position: 'absolute',
          width: '120%',
          height: '120%',
          borderRadius: '50%',
          border: '1px dashed var(--magenta-accent)',
          animation: 'spin 8s linear infinite'
        }} />
      </div>
    </div>
  );
}
