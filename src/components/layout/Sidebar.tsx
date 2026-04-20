import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Briefcase,
  FileText, 
  Globe, 
  Map,
  Settings,
  FilePenLine,
  Target,
  Milestone,
  Bot,
  ScrollText,
} from 'lucide-react';
import './Sidebar.css';
import { isFeatureUnlocked } from '../../lib/plan';
import { usePlanState } from '../../hooks/usePlanState';

interface SidebarProps {
  isOpen: boolean;
}

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/jobs', icon: Briefcase, label: 'Job Search' },
  { path: '/ats', icon: FileText, label: 'ATS Score Checker' },
  { path: '/portfolio', icon: Globe, label: 'Portfolio Builder' },
  { path: '/roadmaps', icon: Map, label: 'Roadmaps' },
  { path: '/roadmap-generator', icon: Milestone, label: 'Roadmap Planner' },
  { path: '/interview-prep', icon: Target, label: 'Interview Guide' },
  { path: '/ai-assistant', icon: Bot, label: 'AI Chat Bot' },
  { path: '/cover-letter', icon: FilePenLine, label: 'CV Generator' },
  { path: '/resume-builder', icon: ScrollText, label: 'Resume Builder' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const lockedPaths = new Set(['/ats', '/resume-builder', '/roadmaps', '/roadmap-generator']);

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();
  const plan = usePlanState();
  const [hoveredLock, setHoveredLock] = useState<string | null>(null);
  const [lockedTooltip, setLockedTooltip] = useState<string | null>(null);
  const [shakingLock, setShakingLock] = useState<string | null>(null);

  const handleLockedClick = (event: React.MouseEvent, itemId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setLockedTooltip(itemId);
    setShakingLock(itemId);
    window.setTimeout(() => setShakingLock((current) => (current === itemId ? null : current)), 320);
    window.setTimeout(() => setLockedTooltip((current) => (current === itemId ? null : current)), 2000);
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const itemLocked = !isFeatureUnlocked(item.path, plan) && lockedPaths.has(item.path);
            const lockKey = item.path;
            
            return (
              <div
                key={item.path}
                style={{ position: 'relative', cursor: itemLocked ? 'pointer' : 'default' }}
                onMouseEnter={() => itemLocked && setHoveredLock(lockKey)}
                onMouseLeave={() => setHoveredLock((current) => (current === lockKey ? null : current))}
              >
                <Link
                  to={item.path}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  title={item.label}
                  style={{ opacity: itemLocked ? 0.45 : 1, pointerEvents: itemLocked ? 'none' : 'auto' }}
                  onClick={(event) => {
                    if (itemLocked) {
                      handleLockedClick(event, lockKey);
                    }
                  }}
                >
                  <Icon className="sidebar-icon" />
                  {isOpen && (
                    <span className="sidebar-label">{item.label}</span>
                  )}
                </Link>

                {itemLocked ? (
                  <div
                    onClick={(event) => handleLockedClick(event, lockKey)}
                    style={{ position: 'absolute', inset: 0 }}
                    aria-hidden
                  />
                ) : null}

                {itemLocked ? (
                  <span
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: hoveredLock === lockKey ? 'translateY(-50%) scale(1.2)' : 'translateY(-50%) scale(1)',
                      fontSize: 13,
                      opacity: hoveredLock === lockKey ? 1 : 0.7,
                      transition: 'opacity 200ms, transform 200ms',
                      animation: shakingLock === lockKey ? 'lock-shake 300ms 1' : 'none',
                    }}
                  >
                    🔒
                  </span>
                ) : null}

                {itemLocked && (hoveredLock === lockKey || lockedTooltip === lockKey) ? (
                  <div
                    style={{
                      position: 'absolute',
                      left: '105%',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#2a1a12',
                      border: '1px solid rgba(249,115,22,0.3)',
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontSize: 12,
                      color: '#ffffff',
                      whiteSpace: 'nowrap',
                      zIndex: 9999,
                      pointerEvents: 'none',
                      animation: 'fadeIn 150ms ease',
                    }}
                  >
                    🔒 Upgrade to unlock this feature
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
