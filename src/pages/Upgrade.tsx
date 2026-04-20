import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import ThemeToggle from '../components/ThemeToggle';
import { pricingPlans } from '../lib/plans';
import './Landing.css';
import './Upgrade.css';

const Upgrade: React.FC = () => (
  <div className="landing-page upgrade-page">
    <header className="landing-topbar">
      <Link className="landing-brand" to="/">
        <BrandLogo />
      </Link>

      <div className="landing-actions">
        <ThemeToggle />
        <Link to="/dashboard" className="landing-outline-button">
          <ArrowLeft size={18} />
          Dashboard
        </Link>
      </div>
    </header>

    <main className="landing-pricing upgrade-pricing">
      <div className="landing-section-top landing-pricing-top">
        <div className="landing-section-title">
          <span>Upgrade Your</span>
          <span>Preparation</span>
          <strong>Workspace</strong>
        </div>
        <p className="landing-section-copy">
          Pick a plan, complete checkout, and TUCF will unlock the full subscribed dashboard for
          your current account.
        </p>
      </div>

      <div className="landing-pricing-grid">
        {pricingPlans.map((plan, index) => (
          <motion.article
            key={plan.id}
            className={`landing-pricing-card ${plan.highlighted ? 'featured' : ''}`}
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            whileHover={{ y: -10, scale: 1.02 }}
          >
            {plan.highlighted ? <span className="landing-pricing-ribbon">Best Value</span> : null}

            <div className="landing-pricing-head">
              <span className="landing-pricing-name">{plan.name}</span>
              <div className="landing-pricing-price">
                <sup>Rs</sup>
                <strong>{plan.price}</strong>
              </div>
              <p>{plan.note}</p>
            </div>

            <ul className="landing-pricing-features">
              {plan.features.map((feature) => (
                <li key={feature.label} className={!feature.included ? 'muted' : ''}>
                  <span className="landing-pricing-icon">
                    {feature.included ? <Check size={16} /> : <X size={16} />}
                  </span>
                  <span>{feature.label}</span>
                </li>
              ))}
            </ul>

            <Link
              to={`/checkout?plan=${plan.id}`}
              className={`landing-pricing-button ${
                plan.highlighted ? 'landing-solid-button' : 'landing-outline-button'
              }`}
            >
              {plan.cta}
            </Link>
          </motion.article>
        ))}
      </div>
    </main>
  </div>
);

export default Upgrade;
