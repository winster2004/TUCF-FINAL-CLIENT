import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface TrialFlowProps {
  trialStep: number;
  setTrialStep: React.Dispatch<React.SetStateAction<number>>;
}

const features = [
  'ATS Calculator & Score Tracking',
  'Resume Builder (Full Access)',
  'Portfolio Builder',
  'Job Portal Access',
  'AI Chat Bot',
  'Career Roadmap',
];

const getFallbackEmail = () => {
  const candidates = ['tucf_user_email', 'user_email', 'auth_email', 'email'];
  for (const key of candidates) {
    const value = localStorage.getItem(key);
    if (value && value.includes('@')) {
      return value;
    }
  }
  return 'your-email@example.com';
};

const TrialFlow: React.FC<TrialFlowProps> = ({ trialStep, setTrialStep }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step2Ready, setStep2Ready] = useState(false);
  const [step4ShowSuccess, setStep4ShowSuccess] = useState(false);
  const [step4ProgressStarted, setStep4ProgressStarted] = useState(false);

  const emailValue = useMemo(() => user?.email || getFallbackEmail(), [user?.email]);

  useEffect(() => {
    if (trialStep !== 2) {
      setStep2Ready(false);
      return;
    }

    const startPhaseB = window.setTimeout(() => setStep2Ready(true), 600);
    const toCheckout = window.setTimeout(() => setTrialStep(3), 2400);

    return () => {
      window.clearTimeout(startPhaseB);
      window.clearTimeout(toCheckout);
    };
  }, [trialStep, setTrialStep]);

  useEffect(() => {
    if (trialStep !== 4) {
      setStep4ShowSuccess(false);
      setStep4ProgressStarted(false);
      return;
    }

    const revealSuccess = window.setTimeout(() => setStep4ShowSuccess(true), 200);
    const kickProgress = window.setTimeout(() => setStep4ProgressStarted(true), 220);
    const complete = window.setTimeout(() => {
      localStorage.setItem('tucf_plan', 'trial_active');
      localStorage.setItem('tucf_trial_active', 'true');
      localStorage.setItem('tucf_trial_start', Date.now().toString());
      window.dispatchEvent(new Event('plan-changed'));
      window.dispatchEvent(new Event('trial-state-changed'));
      setTrialStep(6);
      navigate('/dashboard');
    }, 2600);

    return () => {
      window.clearTimeout(revealSuccess);
      window.clearTimeout(kickProgress);
      window.clearTimeout(complete);
    };
  }, [navigate, setTrialStep, trialStep]);

  if (trialStep <= 0 || trialStep >= 6) {
    return null;
  }

  const overlayBase: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: trialStep === 4 && step4ShowSuccess ? 'rgba(0,0,0,0.92)' : 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(6px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  };

  const cardBase: React.CSSProperties = {
    width: 'min(460px, 92vw)',
    background: '#1e1412',
    borderRadius: '16px',
    padding: '32px',
    position: 'relative',
    color: '#ffffff',
  };

  const step1CardStyle: React.CSSProperties = {
    ...cardBase,
    animation: 'tucf-step1-card-in 280ms cubic-bezier(0.34,1.56,0.64,1) forwards',
  };

  const step2CardStyle: React.CSSProperties = {
    ...cardBase,
    minHeight: '290px',
  };

  const step3CardStyle: React.CSSProperties = {
    ...cardBase,
    animation: 'tucf-step3-card-in 350ms cubic-bezier(0.16,1,0.3,1) forwards',
  };

  const ctaStyle: React.CSSProperties = {
    width: '100%',
    height: '48px',
    border: 'none',
    borderRadius: '10px',
    background: '#f97316',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
  };

  const checkSvg = (
    <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden>
      <circle
        cx="48"
        cy="48"
        r="40"
        stroke="#f97316"
        strokeWidth="3"
        fill="none"
        strokeDasharray="251"
        strokeDashoffset="251"
        style={{ animation: 'tucf-check-circle 400ms ease forwards' }}
      />
      <path
        d="M28 52 L42 66 L68 40"
        stroke="#f97316"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray="50"
        strokeDashoffset="50"
        style={{ animation: 'tucf-check-path 300ms ease 200ms forwards' }}
      />
    </svg>
  );

  const checkSvgLarge = (
    <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden>
      <circle
        cx="60"
        cy="60"
        r="50"
        stroke="#f97316"
        strokeWidth="3"
        fill="none"
        strokeDasharray="314"
        strokeDashoffset="314"
        style={{ animation: 'tucf-check-circle-lg 450ms ease forwards' }}
      />
      <path
        d="M38 64 L54 80 L84 48"
        stroke="#f97316"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray="60"
        strokeDashoffset="60"
        style={{ animation: 'tucf-check-path-lg 320ms ease 220ms forwards' }}
      />
    </svg>
  );

  return ReactDOM.createPortal(
    <>
      <style>
        {`
          @keyframes tucf-step1-card-in {
            from { opacity: 0; transform: scale(0.93); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes tucf-step3-card-in {
            from { opacity: 0; transform: translateX(60px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes tucf-pulse {
            0% { box-shadow: 0 0 0 0 rgba(249,115,22,0.5); }
            100% { box-shadow: 0 0 0 12px rgba(249,115,22,0); }
          }
          @keyframes tucf-spin {
            to { transform: rotate(360deg); }
          }
          @keyframes tucf-check-circle {
            from { stroke-dashoffset: 251; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes tucf-check-path {
            from { stroke-dashoffset: 50; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes tucf-check-circle-lg {
            from { stroke-dashoffset: 314; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes tucf-check-path-lg {
            from { stroke-dashoffset: 60; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes tucf-dot {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }
          @keyframes tucf-slide-fade-up {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes tucf-list-in {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <div style={overlayBase}>
        {trialStep === 1 ? (
          <div style={step1CardStyle}>
            <button
              type="button"
              onClick={() => setTrialStep(0)}
              aria-label="Close trial modal"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255,255,255,0.08)',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              ×
            </button>

            <span
              style={{
                display: 'inline-flex',
                background: 'rgba(249,115,22,0.18)',
                color: '#f97316',
                border: '1px solid rgba(249,115,22,0.5)',
                borderRadius: '999px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '16px',
              }}
            >
              Limited Offer
            </span>

            <h2 style={{ margin: '0 0 10px', fontSize: '28px', fontWeight: 700 }}>2-Day Free Trial</h2>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '18px' }}>
              <strong style={{ fontSize: '40px', lineHeight: 1, color: '#ffffff' }}>$0</strong>
              <span style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'line-through' }}>$999/mo</span>
            </div>

            <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
              {features.map((feature, index) => (
                <div
                  key={feature}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    animation: `tucf-list-in 280ms ease ${index * 80}ms both`,
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#f97316',
                      color: '#ffffff',
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                  <span style={{ fontSize: '14px', color: '#ffffff' }}>{feature}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              style={{ ...ctaStyle, animation: 'tucf-pulse 1.8s infinite' }}
              onClick={() => setTrialStep(2)}
            >
              Activate 2-Day Free Trial →
            </button>

            <p
              style={{
                margin: '12px 0 0',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.45)',
                fontSize: '12px',
              }}
            >
              No credit card required · Cancel anytime
            </p>
          </div>
        ) : null}

        {trialStep === 2 ? (
          <div style={step2CardStyle}>
            {!step2Ready ? (
              <div style={{ opacity: 0, animation: 'tucf-slide-fade-up 300ms ease forwards' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '22px', fontWeight: 700 }}>Activating your trial...</h3>
                <button type="button" style={{ ...ctaStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '3px solid #ffffff',
                      borderTopColor: 'transparent',
                      animation: 'tucf-spin 0.6s linear infinite',
                    }}
                  />
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  minHeight: '220px',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                {checkSvg}
                <h3
                  style={{
                    margin: '16px 0 8px',
                    color: '#f97316',
                    fontSize: '22px',
                    fontWeight: 700,
                    opacity: 0,
                    animation: 'tucf-slide-fade-up 300ms ease 400ms forwards',
                  }}
                >
                  Trial Activated!
                </h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.72)', fontSize: '14px' }}>
                  Setting up checkout
                  <span style={{ marginLeft: '6px' }}>
                    <span style={{ animation: 'tucf-dot 1s infinite' }}>•</span>
                    <span style={{ animation: 'tucf-dot 1s infinite 200ms', marginLeft: '4px' }}>•</span>
                    <span style={{ animation: 'tucf-dot 1s infinite 400ms', marginLeft: '4px' }}>•</span>
                  </span>
                </p>
              </div>
            )}
          </div>
        ) : null}

        {trialStep === 3 ? (
          <div style={step3CardStyle}>
            <div
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <p
                style={{
                  margin: '0 0 10px',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.45)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Order Summary
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '14px' }}>
                <span>TUCF Pro — 2 Day Trial</span>
                <strong style={{ color: '#22c55e' }}>FREE</strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  fontSize: '14px',
                  marginTop: '8px',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                <span>After trial: TUCF Pro</span>
                <span style={{ textDecoration: 'line-through' }}>$29/mo</span>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '15px', fontWeight: 700 }}>
                <span>Total today</span>
                <span>$0.00</span>
              </div>
              <p style={{ margin: '10px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>🔒 Secured checkout</p>
            </div>

            <div>
              <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 700 }}>You're almost in!</h3>
              <input
                value={emailValue}
                readOnly
                aria-label="Email"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '14px',
                  marginBottom: '12px',
                }}
              />

              <button type="button" style={ctaStyle} onClick={() => setTrialStep(4)}>
                Confirm & Unlock Dashboard →
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                <div style={{ display: 'flex' }}>
                  {['W', 'A', 'R', 'S'].map((initial, index) => (
                    <span
                      key={initial}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(249,115,22,0.3)',
                        border: '1px solid rgba(249,115,22,0.6)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        marginLeft: index === 0 ? 0 : '-6px',
                      }}
                    >
                      {initial}
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>Join 100+ engineers</span>
              </div>
            </div>
          </div>
        ) : null}

        {trialStep === 4 ? (
          step4ShowSuccess ? (
            <>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px',
                  textAlign: 'center',
                }}
              >
                {checkSvgLarge}
                <h2
                  style={{
                    margin: 0,
                    color: '#ffffff',
                    fontSize: '26px',
                    fontWeight: 700,
                    opacity: 0,
                    animation: 'tucf-slide-fade-up 300ms ease 400ms forwards',
                  }}
                >
                  Welcome to TUCF Pro!
                </h2>
                <p
                  style={{
                    margin: 0,
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: '14px',
                    opacity: 0,
                    animation: 'tucf-slide-fade-up 300ms ease 500ms forwards',
                  }}
                >
                  Your 2-day trial is now active.
                </p>
              </div>

              <div
                style={{
                  position: 'fixed',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: '4px',
                  background: 'rgba(255,255,255,0.1)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: step4ProgressStarted ? '100%' : '0%',
                    background: '#f97316',
                    transition: 'width 2200ms linear',
                  }}
                />
              </div>
            </>
          ) : (
            <div style={{ ...cardBase, opacity: 1, animation: 'tucf-slide-fade-up 200ms ease reverse forwards' }} />
          )
        ) : null}
      </div>
    </>,
    document.body,
  );
};

export default TrialFlow;