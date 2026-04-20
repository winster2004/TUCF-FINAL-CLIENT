import React, { useState } from 'react';

interface CheckoutPageProps {
  email?: string;
  onSuccess: (email: string) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ email = '', onSuccess }) => {
  const [checkoutEmail, setCheckoutEmail] = useState(email);
  const [phase, setPhase] = useState<'form' | 'loading' | 'success'>('form');

  const handleConfirm = () => {
    setPhase('loading');
    window.setTimeout(() => setPhase('success'), 800);
    window.setTimeout(() => onSuccess(checkoutEmail.trim() || 'trial@tucf.local'), 2800);
  };

  return (
    <div className={`trial-checkout-overlay ${phase === 'success' ? 'is-success' : ''}`}>
      {phase === 'success' ? (
        <div className="trial-final-success">
          <svg viewBox="0 0 140 140" className="trial-check-svg large" aria-hidden="true">
            <circle cx="70" cy="70" r="52" />
            <path d="M45 71 62 88 96 51" />
          </svg>
          <h2>Welcome to TUCF Pro!</h2>
          <p>Your 2-day trial is now active. Redirecting to dashboard...</p>
          <div className="trial-progress-bar">
            <span></span>
          </div>
        </div>
      ) : (
        <div className="trial-checkout-shell">
          <section className="trial-order-card">
            <h2>Order Summary</h2>
            <div className="trial-order-line">
              <span>TUCF Pro Trial — 2 Days FREE</span>
              <strong>$0.00</strong>
            </div>
            <div className="trial-order-line muted">
              <span>After trial: TUCF Pro</span>
              <strong>$29/mo</strong>
            </div>
            <div className="trial-order-divider"></div>
            <div className="trial-order-total">
              <span>Total</span>
              <strong>$0.00 today</strong>
            </div>
            <p className="trial-secure-text">🔒 Secure checkout</p>
            <p className="trial-starts-text">⚡ Trial starts immediately</p>
          </section>

          <section className="trial-confirm-card">
            <h2>You're almost in!</h2>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={checkoutEmail}
                onChange={(event) => setCheckoutEmail(event.target.value)}
                placeholder="you@company.com"
              />
            </label>
            <button
              type="button"
              className={`trial-primary-button ${phase === 'loading' ? 'is-loading' : ''}`}
              onClick={handleConfirm}
              disabled={phase === 'loading'}
            >
              {phase === 'loading' ? <span className="trial-spinner"></span> : 'Confirm & Activate Dashboard →'}
            </button>
            <p>No charge today. Cancel anytime.</p>
            <div className="trial-avatars-row">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <strong>Join 100+ engineers</strong>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
