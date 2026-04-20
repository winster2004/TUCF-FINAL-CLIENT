import React, { useEffect, useMemo, useState } from 'react';
import { usePlanState } from '../hooks/usePlanState';

interface TrialTimerProps {
  inline?: boolean;
}

const DURATION = 172800000;

const TrialTimer: React.FC<TrialTimerProps> = ({ inline = false }) => {
  const [remaining, setRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const plan = usePlanState();

  useEffect(() => {
    const tick = () => {
      const hasPaidPlan = ['pro', 'starter', 'complete'].includes(plan);
      if (hasPaidPlan) {
        setIsActive(false);
        setRemaining(0);
        return;
      }

      const active = localStorage.getItem('tucf_trial_active') === 'true';
      const start = Number(localStorage.getItem('tucf_trial_start') || '0');

      if (!active || !start) {
        setIsActive(false);
        setRemaining(0);
        return;
      }

      const nextRemaining = DURATION - (Date.now() - start);
      if (nextRemaining <= 0) {
        localStorage.removeItem('tucf_trial_active');
        localStorage.removeItem('tucf_trial_start');
        window.dispatchEvent(new Event('trial-state-changed'));
        setIsActive(false);
        setRemaining(0);
        return;
      }

      setIsActive(true);
      setRemaining(nextRemaining);
    };

    tick();

    const interval = window.setInterval(tick, 1000);
    window.addEventListener('storage', tick);
    window.addEventListener('trial-state-changed', tick);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', tick);
      window.removeEventListener('trial-state-changed', tick);
    };
  }, [plan]);

  const formatted = useMemo(() => {
    const h = Math.floor(remaining / 3600000)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((remaining % 3600000) / 60000)
      .toString()
      .padStart(2, '0');
    const s = Math.floor((remaining % 60000) / 1000)
      .toString()
      .padStart(2, '0');
    return `${h}:${m}:${s}`;
  }, [remaining]);

  if (!isActive || ['pro', 'starter', 'complete'].includes(plan)) {
    return null;
  }

  if (inline) {
    return (
      <>
        <style>
          {`
            @keyframes tucf-hg-flip {
              0%, 45% { transform: rotate(0deg); }
              50%, 95% { transform: rotate(180deg); }
              100% { transform: rotate(180deg); }
            }
          `}
        </style>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '16px',
              animation: 'tucf-hg-flip 2s ease-in-out infinite',
              transformOrigin: 'center',
            }}
          >
            ⏳
          </span>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>Trial ends in:</span>
          <span style={{ color: '#f97316', fontWeight: 700, fontSize: '14px', fontFamily: 'monospace' }}>
            {formatted}
          </span>
        </span>
      </>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes tucf-hg-flip {
            0%, 45% { transform: rotate(0deg); }
            50%, 95% { transform: rotate(180deg); }
            100% { transform: rotate(180deg); }
          }
          @keyframes tucf-trial-slide-down {
            from { opacity: 0; transform: translate(-50%, -40px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
        `}
      </style>
      <div
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9998,
          background: '#1e1412',
          border: '1px solid rgba(249,115,22,0.4)',
          borderRadius: '999px',
          padding: '8px 18px',
          animation: 'tucf-trial-slide-down 400ms ease forwards',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '16px',
              animation: 'tucf-hg-flip 2s ease-in-out infinite',
              transformOrigin: 'center',
            }}
          >
            ⏳
          </span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>Trial ends in:</span>
          <span style={{ color: '#f97316', fontWeight: 700, fontSize: '14px', fontFamily: 'monospace' }}>
            {formatted}
          </span>
        </div>
      </div>
    </>
  );
};

export default TrialTimer;
