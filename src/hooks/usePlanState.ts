import { useEffect, useState } from 'react';
import { getStoredPlan, type TucfPlan } from '../lib/plan';

export const PLAN_CHANGED_EVENT = 'plan-changed';

export function usePlanState() {
  const [plan, setPlan] = useState<TucfPlan>(() => getStoredPlan());

  useEffect(() => {
    const refresh = () => setPlan(getStoredPlan());

    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('auth-changed', refresh);
    window.addEventListener('trial-state-changed', refresh);
    window.addEventListener(PLAN_CHANGED_EVENT, refresh);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('auth-changed', refresh);
      window.removeEventListener('trial-state-changed', refresh);
      window.removeEventListener(PLAN_CHANGED_EVENT, refresh);
    };
  }, []);

  return plan;
}
