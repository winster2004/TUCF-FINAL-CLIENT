import React from 'react';
import { Lock } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import type { User } from '../../contexts/AuthContext';

interface DashboardUserHeaderProps {
  user: User | null;
  badge?: string;
}

const DashboardUserHeader: React.FC<DashboardUserHeaderProps> = ({ user, badge = 'Free plan' }) => {
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="dashboard-main-top">
      <div>
        <h1>Hello, {firstName}</h1>
        <p>{user?.email}</p>
      </div>

      <div className="dashboard-main-actions">
        <ThemeToggle />
        <span className="dashboard-tier-badge">
          <Lock size={15} />
          {badge}
        </span>
      </div>
    </div>
  );
};

export default DashboardUserHeader;
