import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  Briefcase,
  Check,
  ChevronDown,
  FileSpreadsheet,
  Globe,
  Instagram,
  Linkedin,
  MoreHorizontal,
  Sparkles,
  Target,
  Twitter,
  X,
} from 'lucide-react';
import heroImagePrimary from '../imgs/Mac wallpaper aesthetic.jpeg';
import heroImageSecondary from '../imgs/BCPL Resume Tips.jpeg';
import heroImageTertiary from '../imgs/Land the Interview with a Pro Resume!.jpeg';
import BrandLogo from '../components/BrandLogo';
import ThemeToggle from '../components/ThemeToggle';
import { pricingPlans } from '../lib/plans';
import { isFeatureUnlocked } from '../lib/plan';
import { usePlanState } from '../hooks/usePlanState';
import './Landing.css';

interface LandingProps {
  embedded?: boolean;
  onRequestDemo?: () => void;
}

interface FaqItem {
  question: string;
  answer: string;
}

const primaryModules = [
  { label: 'ATS Calculator', to: '/ats' },
  { label: 'Portfolio Builder', to: '/portfolio' },
  { label: 'Resume Builder', to: '/resume-builder' },
  { label: 'Job Portal', to: '/jobs' },
  { label: 'AI Chat Bot', to: '/ai-assistant' },
];

const overflowModules = [
  { label: 'Dashboard', to: '/dashboard', icon: Briefcase },
  { label: 'Roadmaps', to: '/roadmaps', icon: Sparkles },
  { label: 'Roadmap Planner', to: '/roadmap-generator', icon: FileSpreadsheet },
  { label: 'Interview Planner', to: '/interview-prep', icon: Target },
  { label: 'CV Generator', to: '/cover-letter', icon: FileSpreadsheet },
  { label: 'Settings', to: '/settings', icon: Globe },
];

const lockedTopNavPaths = new Set(['/ats', '/resume-builder', '/roadmaps', '/roadmap-generator']);

const faqCategories: Record<string, FaqItem[]> = {
  'Subscription & Future Updates': [
    {
      question: 'Will TUCF keep adding new interview resources and tools?',
      answer:
        'Yes. TUCF is structured as a living platform, so we keep expanding roadmaps, ATS guidance, interview preparation material, and builder workflows as hiring expectations change.',
    },
    {
      question: 'If the platform gets updated later, do current users benefit?',
      answer:
        'Current users continue to benefit from improvements inside the same product experience, including better workflows, clearer content, and more practical preparation modules.',
    },
  ],
  'Features & Functionality': [
    {
      question: 'What exactly can I do inside TUCF?',
      answer:
        'You can prepare for interviews, review ATS scores, build resumes, create portfolios, explore roadmaps, generate career assets, and use AI assistance from one connected workspace.',
    },
    {
      question: 'Is this only for interview questions, or is it a full career toolkit?',
      answer:
        'It is a broader career toolkit. The goal is to help you move from planning to preparation to execution without switching between disconnected tools.',
    },
  ],
  'Course Content & Curriculum': [
    {
      question: 'Does TUCF help with structured learning, not just job applications?',
      answer:
        'Yes. The roadmap and planner modules are meant to guide structured learning paths so users can improve fundamentals, project readiness, and interview depth in parallel.',
    },
    {
      question: 'How practical is the content for real placements and startup interviews?',
      answer:
        'The platform is designed around practical preparation: resume improvement, portfolio proof, ATS alignment, interview practice, and skill planning that maps to real hiring workflows.',
    },
  ],
  'Account Management': [
    {
      question: 'Does my dashboard stay personal when I switch accounts?',
      answer:
        'Yes. The dashboard is user-specific, so ATS results, tasks, resume state, and profile-related content are scoped to the logged-in user.',
    },
    {
      question: 'Can I manage my work without losing progress?',
      answer:
        'Your current app setup preserves progress per account so you can return to your resume, tasks, or roadmap planning without mixing data across users.',
    },
  ],
  'Course Access & Technical Support': [
    {
      question: 'Can I use TUCF across desktop and smaller screens?',
      answer:
        'Yes. The landing and dashboard experience are built to stay readable and usable across screen sizes, with stacked layouts and preserved spacing on smaller devices.',
    },
    {
      question: 'What if a module is temporarily unavailable or still being improved?',
      answer:
        'The platform keeps a unified navigation structure, and modules can be iterated without breaking the overall workflow so users still have a stable core experience.',
    },
  ],
  'Mentorship & Community Support': [
    {
      question: 'Does TUCF support guided preparation instead of isolated tools?',
      answer:
        'That is the intent. TUCF combines planning, preparation, and improvement tools so users can move with more clarity instead of handling each step separately.',
    },
    {
      question: 'How does TUCF help build confidence for interviews?',
      answer:
        'By combining realistic preparation paths, resume quality improvement, task tracking, and AI-assisted guidance, the platform reduces guesswork and makes progress visible.',
    },
  ],
};

const easeOut = [0.16, 1, 0.3, 1] as const;

const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const heroItemVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: easeOut,
    },
  },
};

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 44,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: easeOut,
    },
  },
};

const dropdownVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.2,
      ease: easeOut,
    },
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: easeOut,
    },
  },
};

const dropdownItemVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      delay: index * 0.03,
      ease: easeOut,
    },
  }),
};

const Landing: React.FC<LandingProps> = ({ embedded = false, onRequestDemo }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaqCategory, setActiveFaqCategory] = useState(Object.keys(faqCategories)[0]);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [hoveredLock, setHoveredLock] = useState<string | null>(null);
  const [lockedTooltip, setLockedTooltip] = useState<string | null>(null);
  const plan = usePlanState();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleLockedTopNav = (event: React.MouseEvent, lockId: string) => {
    event.preventDefault();
    setLockedTooltip(lockId);
    window.setTimeout(() => setLockedTooltip((current) => (current === lockId ? null : current)), 2000);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    setOpenFaqIndex(0);
  }, [activeFaqCategory]);

  const currentFaqItems = faqCategories[activeFaqCategory];

  return (
    <div className={`landing-page ${embedded ? 'embedded' : ''}`}>
      <header className="landing-topbar">
        <Link className="landing-brand" to="/">
          <BrandLogo />
        </Link>

        <nav className="landing-nav">
          {primaryModules.map((module) => {
            const lockId = `primary-${module.to}`;
            const isLocked = !isFeatureUnlocked(module.to, plan) && lockedTopNavPaths.has(module.to);

            return (
              <div
                key={module.label}
                style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
                onMouseEnter={() => isLocked && setHoveredLock(lockId)}
                onMouseLeave={() => setHoveredLock((current) => (current === lockId ? null : current))}
              >
                <Link
                  to={module.to}
                  className="landing-nav-link"
                  onClick={(event) => {
                    if (isLocked) {
                      handleLockedTopNav(event, lockId);
                    }
                  }}
                  style={{ opacity: isLocked ? 0.5 : 1 }}
                >
                  {module.label}
                </Link>
                {isLocked ? (
                  <span style={{ marginLeft: '4px', fontSize: '12px', opacity: hoveredLock === lockId ? 1 : 0.7 }}>🔒</span>
                ) : null}
                {isLocked && (hoveredLock === lockId || lockedTooltip === lockId) ? (
                  <div
                    style={{
                      position: 'absolute',
                      top: '125%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#2a1a12',
                      border: '1px solid rgba(249,115,22,0.3)',
                      borderRadius: 8,
                      padding: '6px 10px',
                      color: '#ffffff',
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                      zIndex: 9999,
                      animation: 'fadeIn 150ms ease',
                    }}
                  >
                    🔒 Upgrade to unlock this feature
                  </div>
                ) : null}
              </div>
            );
          })}

          <div className="landing-overflow" ref={menuRef}>
            <motion.button
              type="button"
              className="landing-overflow-trigger"
              aria-label="More modules"
              onClick={() => setMenuOpen((current) => !current)}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
            >
              <MoreHorizontal size={20} />
            </motion.button>

            <AnimatePresence>
              {menuOpen ? (
                <>
                  <motion.button
                    type="button"
                    aria-label="Close menu"
                    className="landing-menu-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: easeOut }}
                    onClick={() => setMenuOpen(false)}
                  />

                  <motion.div
                    className="landing-overflow-menu"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={dropdownVariants}
                  >
                    {overflowModules.map((module, index) => {
                      const Icon = module.icon;
                      const lockId = `overflow-${module.to}`;
                      const isLocked = !isFeatureUnlocked(module.to, plan) && lockedTopNavPaths.has(module.to);
                      return (
                        <motion.div
                          key={module.label}
                          custom={index}
                          variants={dropdownItemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          style={{ position: 'relative' }}
                          onMouseEnter={() => isLocked && setHoveredLock(lockId)}
                          onMouseLeave={() => setHoveredLock((current) => (current === lockId ? null : current))}
                        >
                          <Link
                            to={module.to}
                            className="landing-overflow-link"
                            onClick={(event) => {
                              if (isLocked) {
                                handleLockedTopNav(event, lockId);
                                return;
                              }
                              setMenuOpen(false);
                            }}
                            style={{ opacity: isLocked ? 0.5 : 1 }}
                          >
                            <motion.span whileHover={{ x: 3 }} className="landing-overflow-link-inner">
                              <span className="landing-overflow-link-icon">
                                <Icon size={14} />
                              </span>
                              <span className="landing-overflow-link-label">{module.label}</span>
                              {isLocked ? <span style={{ marginLeft: '6px', fontSize: '12px' }}>🔒</span> : null}
                            </motion.span>
                          </Link>
                          {isLocked && (hoveredLock === lockId || lockedTooltip === lockId) ? (
                            <div
                              style={{
                                position: 'absolute',
                                left: '100%',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: '#2a1a12',
                                border: '1px solid rgba(249,115,22,0.3)',
                                borderRadius: 8,
                                padding: '6px 10px',
                                color: '#ffffff',
                                fontSize: '12px',
                                whiteSpace: 'nowrap',
                                zIndex: 9999,
                                animation: 'fadeIn 150ms ease',
                              }}
                            >
                              🔒 Upgrade to unlock this feature
                            </div>
                          ) : null}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </>
              ) : null}
            </AnimatePresence>
          </div>
        </nav>

        <div className="landing-actions">
          <ThemeToggle />
          <Link to="/login" className="landing-link-button">
            Sign in
          </Link>
          <button
            type="button"
            className="landing-outline-button"
            onClick={() => onRequestDemo?.()}
          >
            Request a Demo
          </button>
          <Link to="/register" className="landing-solid-button">
            Get Started
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-glow landing-hero-glow-left"></div>
        <div className="landing-hero-glow landing-hero-glow-right"></div>

        <motion.div
          className="landing-hero-copy"
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span className="landing-hero-stat" variants={heroItemVariants}>
            100+
          </motion.span>
          <motion.h1 variants={heroItemVariants}>Engineers learning from TUCF</motion.h1>
          <motion.p variants={heroItemVariants}>
            TUCF brings your preparation into one focused workspace for resumes, ATS improvement,
            interview practice, roadmaps, and career execution without scattered tools or messy
            workflows.
          </motion.p>

          <motion.div className="landing-hero-socials" variants={heroItemVariants}>
            <motion.a href="#" className="landing-social-card" aria-label="TUCF LinkedIn" whileHover={{ y: -3 }}>
              <span className="landing-social-icon linkedin">
                <Linkedin size={18} />
              </span>
              <span>
                <strong>TUCF LinkedIn</strong>
                <small>@takeyourcareerforward</small>
              </span>
            </motion.a>

            <span className="landing-social-divider"></span>

            <motion.a href="#" className="landing-social-card" aria-label="TUCF Instagram" whileHover={{ y: -3 }}>
              <span className="landing-social-icon instagram">
                <Instagram size={18} />
              </span>
              <span>
                <strong>TUCF Instagram</strong>
                <small>@tucf.official</small>
              </span>
            </motion.a>
          </motion.div>

          <motion.div className="landing-hero-actions" variants={heroItemVariants}>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
              <Link to="/register" className="landing-solid-button landing-hero-button">
                Get Started
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
              <Link to="/dashboard" className="landing-outline-button landing-hero-button">
                Explore Dashboard
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="landing-showcase"
          initial={{ opacity: 0, y: 52 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.34, ease: easeOut }}
        >
          <motion.div className="landing-showcase-shell" whileHover={{ y: -4 }}>
            <div className="landing-showcase-bar">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="landing-showcase-head">
              <span>TUCF workspace</span>
              <strong>Career systems, interview prep, and ATS readiness</strong>
            </div>

            <div className="landing-showcase-grid">
              <motion.figure
                className="landing-showcase-image primary"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.48, ease: easeOut }}
                whileHover={{ y: -6, scale: 1.01 }}
              >
                <img src={heroImagePrimary} alt="TUCF dashboard visual" />
              </motion.figure>
              <motion.figure
                className="landing-showcase-image secondary"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.58, ease: easeOut }}
                whileHover={{ y: -6, scale: 1.01 }}
              >
                <img src={heroImageSecondary} alt="Resume builder preview" />
              </motion.figure>
              <motion.figure
                className="landing-showcase-image tertiary"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.68, ease: easeOut }}
                whileHover={{ y: -6, scale: 1.01 }}
              >
                <img src={heroImageTertiary} alt="Interview preparation preview" />
              </motion.figure>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <motion.section
        className="landing-features"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="landing-section-top">
          <div className="landing-section-title">
            <span>Everything You</span>
            <span>Need To Crack</span>
            <strong>Tech Interviews</strong>
          </div>
          <p className="landing-section-copy">
            A single platform that combines structured learning, focused preparation, resume
            quality improvement, and practical execution so you can move toward interviews with
            more confidence and much less friction.
          </p>
        </div>

        <div className="landing-divider"></div>

        <div className="landing-feature-grid">
          <article className="landing-feature-card">
            <span className="landing-feature-label">Company-Specific Interview Prep</span>
            <p>
              Target your dream role with practice flows and preparation modules designed around
              the kinds of questions and expectations companies actually use in interviews.
            </p>
            <p>
              Build confidence through stronger fundamentals, repeated exposure, and better
              decision-making under interview pressure.
            </p>
          </article>

          <article className="landing-feature-card">
            <span className="landing-feature-label">Personalized Roadmaps</span>
            <p>
              Create a custom learning path based on your schedule, current skill level, and the
              target role you are working toward.
            </p>
            <p>
              Whether you have a short sprint or a long runway, TUCF helps keep the next steps
              concrete and easier to follow.
            </p>
          </article>
        </div>
      </motion.section>

      <motion.section
        className="landing-pricing"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.18 }}
      >
        <div className="landing-section-top landing-pricing-top">
          <div className="landing-section-title">
            <span>Plans Built</span>
            <span>For Focused</span>
            <strong>Career Prep</strong>
          </div>
          <p className="landing-section-copy">
            Choose the workspace depth that fits your preparation rhythm. Start with the core
            interview toolkit, or unlock the complete TUCF system for resumes, portfolios,
            roadmaps, AI support, and job-search execution.
          </p>
        </div>

        <div className="landing-pricing-grid">
          {pricingPlans.map((plan, planIndex) => (
            <motion.article
              key={plan.name}
              className={`landing-pricing-card ${plan.highlighted ? 'featured' : ''}`}
              initial={{ opacity: 0, y: 42, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.58, delay: planIndex * 0.1, ease: easeOut }}
              whileHover={{
                y: -10,
                scale: 1.025,
                transition: { duration: 0.24, ease: easeOut },
              }}
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

              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={`/checkout?plan=${plan.id}`}
                  className={`landing-pricing-button ${
                    plan.highlighted ? 'landing-solid-button' : 'landing-outline-button'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            </motion.article>
          ))}
        </div>

        <p className="landing-pricing-note">
          Prices include the current TUCF preparation workspace. You can move between plans as your
          interview season changes.
        </p>
      </motion.section>

      <motion.section
        className="landing-faq"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.16 }}
      >
        <div className="landing-faq-header">
          <h2>Frequently Asked Questions</h2>
        </div>

        <div className="landing-faq-layout">
          <aside className="landing-faq-categories">
            {Object.keys(faqCategories).map((category) => (
              <motion.button
                key={category}
                type="button"
                className={`landing-faq-category ${
                  activeFaqCategory === category ? 'active' : ''
                }`}
                onClick={() => setActiveFaqCategory(category)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.99 }}
              >
                {category}
              </motion.button>
            ))}
          </aside>

          <div className="landing-faq-list">
            {currentFaqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <motion.article
                  key={item.question}
                  className={`landing-faq-item ${isOpen ? 'open' : ''}`}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  <motion.button
                    type="button"
                    className="landing-faq-question"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    whileTap={{ scale: 0.995 }}
                  >
                    <span>{item.question}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.22, ease: easeOut }}
                    >
                      <ChevronDown size={18} />
                    </motion.span>
                  </motion.button>

                  <div className="landing-faq-answer-wrap">
                    <div className="landing-faq-answer">
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.footer
        className="landing-footer"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="landing-footer-top">
          <div className="landing-footer-brand">
            <BrandLogo />
          </div>

          <nav className="landing-footer-links">
            <a href="#">About Us</a>
            <a href="#">Contact Us</a>
            <a href="#">Terms and Conditions</a>
          </nav>

          <div className="landing-footer-socials">
            <motion.a href="#" aria-label="Instagram" whileHover={{ y: -3, scale: 1.04 }}>
              <Instagram size={18} />
            </motion.a>
            <motion.a href="#" aria-label="LinkedIn" whileHover={{ y: -3, scale: 1.04 }}>
              <Linkedin size={18} />
            </motion.a>
            <motion.a href="#" aria-label="X" whileHover={{ y: -3, scale: 1.04 }}>
              <Twitter size={18} />
            </motion.a>
            <motion.a href="/ai-assistant" aria-label="AI Chat Bot" whileHover={{ y: -3, scale: 1.04 }}>
              <Bot size={18} />
            </motion.a>
          </div>
        </div>

        <p className="landing-footer-copy">© 2026 TUCF. All rights reserved.</p>
      </motion.footer>
    </div>
  );
};

export default Landing;
