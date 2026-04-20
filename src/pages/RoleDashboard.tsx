import React from 'react';
import { usePlanState } from '../hooks/usePlanState';
import { isUnlockedPlan } from '../lib/plan';
import Dashboard from './Dashboard';
import FreeDashboard from './FreeDashboard';

const RoleDashboard: React.FC = () => {
  const plan = usePlanState();

  if (isUnlockedPlan(plan)) {
    return <Dashboard />;
  }

  return <FreeDashboard />;
};

export default RoleDashboard;
