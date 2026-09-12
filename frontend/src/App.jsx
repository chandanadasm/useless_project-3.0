import React, { useState, useCallback } from 'react';
import { VERIFICATION_STATES, TRANSITION_EVENTS, getNextState } from './logic/verificationState';
import LoadingScreen from './components/LoadingScreen';
import NotHumanCheckbox from './components/NotHumanCheckbox';
import VerificationHero from './components/VerificationHero';
import Task01TargetChase from './components/Task01TargetChase';
import HumanDetectedAlert from './components/HumanDetectedAlert';
import ReversedCaptcha from './components/ReversedCaptcha';
import OpenCVVerification from './components/OpenCVVerification';
import RobotVerifiedCelebration from './components/RobotVerifiedCelebration';
import ProtectedSite from './components/ProtectedSite';

export default function App() {
  const [currentState, setCurrentState] = useState(VERIFICATION_STATES.LOADING);
  const [resetKey, setResetKey] = useState(0);

  // Transition Handler
  const transition = useCallback((event) => {
    setCurrentState((prev) => getNextState(prev, event));
  }, []);

  // Single resetAll function
  const resetAll = useCallback(async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch (e) {
      console.warn('Backend reset call encountered network error (running in local sandbox mode).', e);
    }
    setResetKey((prev) => prev + 1);
    setCurrentState(VERIFICATION_STATES.CHECKBOX_CARD);
  }, []);

  return (
    <div key={resetKey} style={{ minHeight: '100vh', width: '100vw' }}>
      {/* 1. LOADING SCREEN */}
      {currentState === VERIFICATION_STATES.LOADING && (
        <LoadingScreen onComplete={() => transition(TRANSITION_EVENTS.BOOT_COMPLETE)} />
      )}

      {/* 2. CHECKBOX CARD */}
      {currentState === VERIFICATION_STATES.CHECKBOX_CARD && (
        <NotHumanCheckbox onProceed={() => transition(TRANSITION_EVENTS.CHECKBOX_CHECKED)} />
      )}

      {/* 3. INITIALIZING / VERIFICATION HERO */}
      {currentState === VERIFICATION_STATES.INITIALIZING && (
        <VerificationHero onStart={() => transition(TRANSITION_EVENTS.START_VERIFICATION)} />
      )}

      {/* 4. TASK 01 - TARGET CHASE */}
      {currentState === VERIFICATION_STATES.ANALYZING && (
        <Task01TargetChase onComplete={() => transition(TRANSITION_EVENTS.HUMAN_SCORE_100)} />
      )}

      {/* 5. HUMAN DETECTED ALERT */}
      {currentState === VERIFICATION_STATES.HUMAN_DETECTED && (
        <HumanDetectedAlert onProceedToCaptcha={() => transition(TRANSITION_EVENTS.PROCEED_TO_CAPTCHA)} />
      )}

      {/* 6. REVERSED CAPTCHA (Challenge Input) */}
      {currentState === VERIFICATION_STATES.REVERSED_CAPTCHA && (
        <ReversedCaptcha 
          isResultMode={false}
          onCorrectSubmit={() => transition(TRANSITION_EVENTS.CAPTCHA_SUBMIT_CORRECT)}
          onIncorrectSubmit={() => transition(TRANSITION_EVENTS.CAPTCHA_SUBMIT_INCORRECT)}
        />
      )}

      {/* 6b. CAPTCHA RESULT (Celebration + Access Denied Reveal) */}
      {currentState === VERIFICATION_STATES.CAPTCHA_RESULT && (
        <ReversedCaptcha 
          isResultMode={true}
          onProceedToOpenCV={() => transition(TRANSITION_EVENTS.PROCEED_TO_OPENCV)}
        />
      )}

      {/* 7. OPENCV INITIALIZING & SCANNING */}
      {(currentState === VERIFICATION_STATES.OPENCV_INITIALIZING || 
        currentState === VERIFICATION_STATES.OPENCV_SCANNING) && (
        <OpenCVVerification 
          onVerdictRobot={() => transition(TRANSITION_EVENTS.OPENCV_VERIFIED_ROBOT)}
          onVerdictHuman={() => transition(TRANSITION_EVENTS.OPENCV_VERIFIED_HUMAN)}
        />
      )}

      {/* 8. ROBOT VERIFIED CELEBRATION */}
      {currentState === VERIFICATION_STATES.ROBOT_VERIFIED && (
        <RobotVerifiedCelebration onProceed={() => transition(TRANSITION_EVENTS.PROCEED_TO_PROTECTED_SITE)} />
      )}

      {/* 9. PROTECTED SITE */}
      {currentState === VERIFICATION_STATES.ACCESS_GRANTED && (
        <ProtectedSite onReset={resetAll} />
      )}

      {/* 9. FINAL ACCESS DENIED */}
      {currentState === VERIFICATION_STATES.ACCESS_DENIED && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem'
        }}>
          <div className="hud-card red-alert" style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
            <h1 style={{ color: 'var(--red-alert)', fontSize: '2.5rem', marginBottom: '1rem' }}>
              FINAL ACCESS DENIED
            </h1>
            <p className="mono-font" style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '2rem' }}>
              BIOLOGICAL ENTITY DETECTED BY VISION VERIFICATION. ACCESS STRICTLY FORBIDDEN.
            </p>
            <button className="cyber-btn red-btn" onClick={resetAll}>
              RESTART VERIFICATION
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
