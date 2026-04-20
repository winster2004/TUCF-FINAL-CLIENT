import React, { useState } from 'react';

interface ActivationModalProps {
  onClose: () => void;
  onActivated: () => void;
}

const trialFeatures = [
  'ATS Calculator',
  'Resume Builder',
  'Portfolio Builder',
  'Job Portal Access',
  'AI Chat Bot',
];

const ActivationModal: React.FC<ActivationModalProps> = ({ onClose, onActivated }) => {
  const [phase, setPhase] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleActivate = () => {
    setPhase('loading');
    window.setTimeout(() => setPhase('success'), 600);
    window.setTimeout(onActivated, 1800);
  };

  return (
    <div className="trial-overlay">
      <div className={`trial-activation-card ${phase !== 'idle' ? 'is-morphing' : ''}`}>
        <button className="trial-modal-close" type="button" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <div className="trial-card-accent"></div>

        {phase === 'idle' || phase === 'loading' ? (
          <div className={`trial-activation-content ${phase === 'loading' ? 'is-fading' : ''}`}>
            <h2>Activate Your 2-Day Free Trial</h2>
            <p>Unlock full dashboard access — no credit card required for trial</p>
            <ul className="trial-feature-list">
              {trialFeatures.map((feature, index) => (
                <li key={feature} style={{ animationDelay: `${index * 150}ms` }}>
                  <span>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`trial-primary-button ${phase === 'loading' ? 'is-loading' : ''}`}
              onClick={handleActivate}
              disabled={phase === 'loading'}
            >
              {phase === 'loading' ? <span className="trial-spinner"></span> : 'Activate 2-Day Free Trial →'}
            </button>
          </div>
        ) : (
          <div className="trial-success-content">
            <svg viewBox="0 0 120 120" className="trial-check-svg" aria-hidden="true">
              <circle cx="60" cy="60" r="44" />
              <path d="M39 61.5 53.5 76 82 45" />
            </svg>
            <h2>Trial Activated!</h2>
            <p>
              Redirecting to checkout<span className="trial-dots"><span>.</span><span>.</span><span>.</span></span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivationModal;
