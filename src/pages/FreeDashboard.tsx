import React, { useEffect, useState } from 'react';
import { Briefcase, CalendarDays, ExternalLink, Lock, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardCalendarRail from '../components/dashboard/DashboardCalendarRail';
import DashboardUserHeader from '../components/dashboard/DashboardUserHeader';
import { useAuth } from '../contexts/AuthContext';
import { usePlanState } from '../hooks/usePlanState';
import { isUnlockedPlan } from '../lib/plan';
import { readDashboardData, type UserDashboardData } from '../lib/dashboardStore';
import './Dashboard.css';
import './FreeDashboard.css';

const freeJobListings = [
  {
    title: 'Frontend Developer',
    company: 'Nexora Labs',
    location: 'Bangalore, India',
    type: 'Full-time',
    posted: '2 hours ago',
  },
  {
    title: 'Backend Developer',
    company: 'CloudForge Tech',
    location: 'Hyderabad, India',
    type: 'Full-time',
    posted: '1 day ago',
  },
  {
    title: 'Full Stack Engineer',
    company: 'VertexPath',
    location: 'Delhi, India',
    type: 'Full-time',
    posted: '7 hours ago',
  },
];

const lockedFeatures = [
  'Resume upload and download',
  'ATS score analysis',
  'Task creation and editing',
  'AI coaching and premium modules',
];

const FreeDashboard: React.FC = () => {
  const { user } = useAuth();
  const plan = usePlanState();
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const refreshDashboardData = () => {
      setDashboardData(readDashboardData({ id: user.id, email: user.email }));
    };

    refreshDashboardData();
    window.addEventListener('dashboard-data-changed', refreshDashboardData);

    return () => {
      window.removeEventListener('dashboard-data-changed', refreshDashboardData);
    };
  }, [user]);

  const calendarTasks = dashboardData?.calendarTasks ?? [];

  if (isUnlockedPlan(plan)) {
    return null;
  }

  return (
    <div className="dashboard-page free-dashboard-page">
      <div className="dashboard-board free-dashboard-board">
        <section className="dashboard-main-panel dashboard-main-panel-full">
          <DashboardUserHeader user={user} badge="Free plan" />

          <div className="free-upgrade-banner">
            <div>
              <span className="free-upgrade-kicker">Free tier workspace</span>
              <h2>Explore jobs and track your prep calendar.</h2>
              <p>
                Resume uploads, ATS analysis, editable tasks, and premium career tools are
                available on the subscribed plan.
              </p>
            </div>
            <Link to="/upgrade" className="dashboard-primary-button">
              Upgrade
            </Link>
          </div>

          <div className="dashboard-project-grid">
            <article className="dashboard-project-card cyan">
              <div className="dashboard-project-top">
                <span className="dashboard-project-count">{freeJobListings.length}</span>
                <Briefcase size={24} />
              </div>
              <h3>Job Listings</h3>
              <p>View curated openings from your free dashboard.</p>
              <div className="dashboard-project-progress">
                <span style={{ width: '64%' }}></span>
              </div>
            </article>

            <article className="dashboard-project-card orange">
              <div className="dashboard-project-top">
                <span className="dashboard-project-count">{calendarTasks.length}</span>
                <CalendarDays size={24} />
              </div>
              <h3>Calendar View</h3>
              <p>Keep an eye on scheduled preparation items.</p>
              <div className="dashboard-project-progress">
                <span style={{ width: '52%' }}></span>
              </div>
            </article>

            <article className="dashboard-project-card purple free-locked-project">
              <div className="dashboard-project-top">
                <span className="dashboard-project-count">Locked</span>
                <Lock size={24} />
              </div>
              <h3>Premium Tools</h3>
              <p>Upgrade to unlock uploads, ATS scoring, builders, and AI help.</p>
              <div className="dashboard-project-progress">
                <span style={{ width: '24%' }}></span>
              </div>
            </article>
          </div>

          <div className="dashboard-lower-grid">
            <div className="dashboard-section">
              <div className="dashboard-section-head">
                <h2>Job Listings</h2>
                <span className="dashboard-locked-chip">View only</span>
              </div>

              <div className="free-job-list">
                {freeJobListings.map((job) => (
                  <article key={`${job.company}-${job.title}`} className="free-job-card">
                    <div className="free-job-icon">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <h3>{job.title}</h3>
                      <p>
                        {job.company} · {job.location}
                      </p>
                      <span>
                        {job.type} · {job.posted}
                      </span>
                    </div>
                    <Link to="/jobs" className="free-job-link" aria-label={`View ${job.title}`}>
                      <ExternalLink size={16} />
                    </Link>
                  </article>
                ))}
              </div>
            </div>

            <div className="dashboard-section">
              <div className="dashboard-section-head">
                <h2>Basic Info</h2>
              </div>

              <div className="dashboard-stat-grid free-info-grid">
                <div className="dashboard-stat-card">
                  <UserRound size={22} />
                  <strong>{user?.name || 'User'}</strong>
                  <span>Account name</span>
                </div>
                <div className="dashboard-stat-card">
                  <strong>USER</strong>
                  <span>Current role</span>
                </div>
                <div className="dashboard-plan-card free-locked-card">
                  <div className="dashboard-plan-copy">
                    <Lock size={24} />
                    <h3>Locked Premium Features</h3>
                    <p>{lockedFeatures.join(', ')}</p>
                  </div>
                  <div className="dashboard-plan-illustration">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <DashboardCalendarRail
          calendarTasks={calendarTasks}
          summary="Free users can view saved preparation reminders."
          readOnly
        />
      </div>
    </div>
  );
};

export default FreeDashboard;
