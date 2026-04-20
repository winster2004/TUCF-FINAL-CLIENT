import React, { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import BrandLogo from '../components/BrandLogo';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth, type User } from '../contexts/AuthContext';
import { getPricingPlan } from '../lib/plans';
import { setStoredUserPlan } from '../lib/plan';
import './Landing.css';
import './Upgrade.css';

const TEST_CARD = '4242424242424242';
const PAID_USERS_KEY = 'tucf-paid-users';

type CheckoutState = 'idle' | 'processing' | 'success';

const isFutureExpiry = (value: string) => {
  const match = value.trim().match(/^(\d{1,2})\s*\/\s*(\d{2}|\d{4})$/);
  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const rawYear = Number(match[2]);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;
  if (month < 1 || month > 12) {
    return false;
  }

  const now = new Date();
  const expiryEnd = new Date(year, month, 0, 23, 59, 59, 999);
  return expiryEnd > now;
};

const rememberPaidUser = (email: string, planId: string, amount: number) => {
  let paidUsers: Record<string, { role: string; plan: string; amount: number; paidAt: string }> = {};

  try {
    const raw = localStorage.getItem(PAID_USERS_KEY);
    paidUsers = raw ? JSON.parse(raw) : {};
  } catch {
    paidUsers = {};
  }

  paidUsers[email.toLowerCase()] = {
    role: 'SUBSCRIBED',
    plan: planId,
    amount,
    paidAt: new Date().toISOString(),
  };
  localStorage.setItem(PAID_USERS_KEY, JSON.stringify(paidUsers));
};

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = useMemo(() => getPricingPlan(searchParams.get('plan')), [searchParams]);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState(user?.name ?? '');
  const [error, setError] = useState('');
  const [checkoutState, setCheckoutState] = useState<CheckoutState>('idle');
  const [processingStep, setProcessingStep] = useState('Securing checkout');

  const handlePayment = (event: FormEvent) => {
    event.preventDefault();

    const cleanCard = cardNumber.replace(/\D/g, '');
    if (cleanCard !== TEST_CARD) {
      setError('Enter the approved 16-digit test card number.');
      return;
    }

    if (!isFutureExpiry(expiry)) {
      setError('Enter an expiry date later than the current month.');
      return;
    }

    if (cvc.trim() !== '666') {
      setError('Enter the approved CVC.');
      return;
    }

    const fallbackName = name.trim() || user?.name || 'TUCF User';
    const fallbackEmail = user?.email || 'free-user@tucf.local';
    const upgradedUser: User = {
      id: user?.id || fallbackEmail.replace(/[^a-z0-9]+/gi, '-').toLowerCase(),
      name: fallbackName,
      email: fallbackEmail,
      avatar:
        user?.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=3B82F6&color=fff`,
      role: 'SUBSCRIBED',
    };

    setError('');
    setCheckoutState('processing');
    setProcessingStep('Securing checkout');

    window.setTimeout(() => setProcessingStep('Verifying payment'), 850);
    window.setTimeout(() => setProcessingStep('Upgrading account'), 1650);
    window.setTimeout(() => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('userData', JSON.stringify(upgradedUser));
      setStoredUserPlan(plan.id === 'starter' ? 'PRO_99' : 'PRO_499');
      localStorage.removeItem('tucf_trial_active');
      localStorage.removeItem('tucf_trial_start');
      localStorage.setItem(
        'tucf-subscription',
        JSON.stringify({
          plan: plan.id,
          amount: plan.price,
          paidAt: new Date().toISOString(),
        }),
      );
      rememberPaidUser(upgradedUser.email, plan.id, plan.price);
      window.dispatchEvent(new Event('auth-changed'));
      window.dispatchEvent(new Event('trial-state-changed'));
      setCheckoutState('success');
    }, 2450);
  };

  const goToDashboard = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="landing-page checkout-page">
      <header className="landing-topbar">
        <Link className="landing-brand" to="/">
          <BrandLogo />
        </Link>

        <div className="landing-actions">
          <ThemeToggle />
          <Link to="/upgrade" className="landing-outline-button">
            <ArrowLeft size={18} />
            Plans
          </Link>
        </div>
      </header>

      <main className="checkout-shell">
        <section className="checkout-copy">
          <span className="landing-pricing-name">Secure Checkout</span>
          <h1>Complete your {plan.name} upgrade.</h1>
          <p>
            Finish your payment to unlock the full TUCF dashboard for this account.
          </p>

          <div className="checkout-plan-summary">
            <span>{plan.name}</span>
            <strong>Rs {plan.price}</strong>
            <small>Paid dashboard access</small>
          </div>
        </section>

        <form className="checkout-card" onSubmit={handlePayment}>
          <AnimatePresence mode="wait">
            {checkoutState === 'success' ? (
              <motion.div
                key="success"
                className="checkout-success"
                initial={{ opacity: 0, y: 28, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -18, scale: 0.98 }}
                transition={{ duration: 0.42 }}
              >
                <div className="checkout-confetti" aria-hidden="true">
                  {Array.from({ length: 18 }).map((_, index) => (
                    <span key={index}></span>
                  ))}
                </div>
                <motion.div
                  className="checkout-success-check"
                  initial={{ scale: 0.4, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 18 }}
                >
                  <Check size={46} />
                </motion.div>
                <h2>Payment succeeded</h2>
                <p>You have paid Rs {plan.price}. Your account is now upgraded.</p>
                <button type="button" className="landing-solid-button checkout-dashboard-button" onClick={goToDashboard}>
                  Go to Dashboard
                </button>
              </motion.div>
            ) : checkoutState === 'processing' ? (
              <motion.div
                key="processing"
                className="checkout-processing"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.3 }}
              >
                <div className="checkout-loader-ring">
                  <span></span>
                </div>
                <h2>{processingStep}</h2>
                <p>Please keep this page open while we complete your upgrade.</p>
                <div className="checkout-dots" aria-label="Processing payment">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.28 }}
              >
              <div className="checkout-card-head">
                <CreditCard size={22} />
                <div>
                  <h2>Payment Details</h2>
                  <p>Enter your card details to continue.</p>
                </div>
              </div>

              <label>
                <span>Name on card</span>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
              </label>

              <label>
                <span>Card number</span>
                <input
                  value={cardNumber}
                  onChange={(event) => setCardNumber(event.target.value)}
                  inputMode="numeric"
                  placeholder="Card number"
                  maxLength={19}
                />
              </label>

              <div className="checkout-row">
                <label>
                  <span>Expiry</span>
                  <input value={expiry} onChange={(event) => setExpiry(event.target.value)} placeholder="MM/YY" />
                </label>
                <label>
                  <span>CVC</span>
                  <input value={cvc} onChange={(event) => setCvc(event.target.value)} placeholder="CVC" maxLength={4} />
                </label>
              </div>

              {error ? <p className="checkout-error">{error}</p> : null}

              <button type="submit" className="landing-solid-button checkout-pay-button">
                Pay Rs {plan.price}
              </button>

              <div className="checkout-secure-note">
                <ShieldCheck size={16} />
                Payment completion unlocks your subscribed dashboard.
              </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </main>
    </div>
  );
};

export default Checkout;
