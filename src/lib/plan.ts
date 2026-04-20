export type TucfPlan = 'free' | 'starter' | 'complete' | 'trial_active' | 'pro';
export type UserPlan = 'FREE' | 'PRO_99' | 'PRO_499';

const SUBSCRIPTION_KEY = 'tucf-subscription';
const PAID_USERS_KEY = 'tucf-paid-users';
const USER_PLAN_KEY = 'userPlan';

const normalize = (value: string | null | undefined): TucfPlan => {
  const plan = (value ?? 'free').toLowerCase();

  if (plan === 'starter' || plan === 'complete' || plan === 'trial_active' || plan === 'pro') {
    return plan;
  }

  return 'free';
};

const normalizeUserPlan = (value: string | null | undefined): UserPlan | null => {
  const plan = (value ?? '').toUpperCase();

  if (plan === 'FREE' || plan === 'PRO_99' || plan === 'PRO_499') {
    return plan;
  }

  return null;
};

const toUserPlan = (plan: TucfPlan): UserPlan => {
  if (plan === 'starter') {
    return 'PRO_99';
  }

  if (plan === 'complete' || plan === 'pro' || plan === 'trial_active') {
    return 'PRO_499';
  }

  return 'FREE';
};

const toTucfPlan = (plan: UserPlan): TucfPlan => {
  if (plan === 'PRO_99') {
    return 'starter';
  }

  if (plan === 'PRO_499') {
    return 'complete';
  }

  return 'free';
};

const readStoredSubscriptionPlan = () => {
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { plan?: string } | null;
    return parsed?.plan ?? null;
  } catch {
    return null;
  }
};

const readPaidUsersPlan = () => {
  try {
    const raw = localStorage.getItem(PAID_USERS_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Record<string, { plan?: string }> | null;
    if (!parsed) {
      return null;
    }

    const values = Object.values(parsed);
    return values.find((entry) => entry?.plan)?.plan ?? null;
  } catch {
    return null;
  }
};

export const getStoredPlan = (): TucfPlan => {
  const directPlan = normalize(localStorage.getItem('tucf_plan'));
  if (directPlan === 'trial_active') {
    return 'trial_active';
  }

  const userPlan = normalizeUserPlan(localStorage.getItem(USER_PLAN_KEY));
  if (userPlan) {
    return toTucfPlan(userPlan);
  }

  const localPlan = normalize(localStorage.getItem('tucf_plan'));
  if (localPlan !== 'free') {
    return localPlan;
  }

  const subscriptionPlan = normalize(readStoredSubscriptionPlan());
  if (subscriptionPlan !== 'free') {
    return subscriptionPlan;
  }

  const paidUsersPlan = normalize(readPaidUsersPlan());
  if (paidUsersPlan !== 'free') {
    return paidUsersPlan;
  }

  return localStorage.getItem('tucf_trial_active') === 'true' ? 'trial_active' : 'free';
};

export const getStoredUserPlan = (): UserPlan => {
  const explicitUserPlan = normalizeUserPlan(localStorage.getItem(USER_PLAN_KEY));
  if (explicitUserPlan) {
    return explicitUserPlan;
  }

  return toUserPlan(getStoredPlan());
};

export const setStoredUserPlan = (plan: UserPlan) => {
  localStorage.setItem(USER_PLAN_KEY, plan);
  localStorage.setItem('tucf_plan', toTucfPlan(plan));

  if (plan === 'FREE') {
    localStorage.removeItem('tucf_trial_active');
    localStorage.removeItem('tucf_trial_start');
  }

  window.dispatchEvent(new Event('plan-changed'));
  window.dispatchEvent(new Event('auth-changed'));
  window.dispatchEvent(new Event('trial-state-changed'));
};

export const getAccess = (plan: UserPlan) => {
  if (plan === 'PRO_499') {
    return {
      ats: true,
      resumeBuilder: true,
      roadmaps: true,
      planner: true,
    };
  }

  if (plan === 'PRO_99') {
    return {
      ats: true,
      resumeBuilder: false,
      roadmaps: false,
      planner: false,
    };
  }

  return {
    ats: false,
    resumeBuilder: false,
    roadmaps: false,
    planner: false,
  };
};

export const isUnlockedPlan = (plan: TucfPlan) => plan !== 'free';

export const isPremiumPlan = (plan: TucfPlan) =>
  plan === 'starter' || plan === 'complete' || plan === 'trial_active' || plan === 'pro';

export const isFeatureUnlocked = (path: string, plan: TucfPlan) => {
  const access = getAccess(toUserPlan(plan));

  if (path === '/ats') {
    return access.ats;
  }

  if (path === '/resume-builder') {
    return access.resumeBuilder;
  }

  if (path === '/roadmaps') {
    return access.roadmaps;
  }

  if (path === '/roadmap-generator') {
    return access.planner;
  }

  return true;
};

export const getPlanDisplayLabel = (plan: TucfPlan) => {
  const userPlan = toUserPlan(plan);

  if (userPlan === 'PRO_99') {
    return 'Pro 99 Plan - Rs 99';
  }

  if (userPlan === 'PRO_499') {
    return 'Complete Plan - Rs 499';
  }

  if (plan === 'trial_active') {
    return '2-Day Trial Active';
  }

  return 'Free Plan';
};

export const getPlanUnlockSummary = (plan: TucfPlan) => {
  const userPlan = toUserPlan(plan);

  if (userPlan === 'FREE') {
    return 'ATS, Resume Builder, Roadmaps, and Roadmap Planner are locked.';
  }

  if (userPlan === 'PRO_99') {
    return 'Only ATS is unlocked. Resume Builder, Roadmaps, and Roadmap Planner are locked.';
  }

  return 'ATS, Resume Builder, Roadmaps, and Roadmap Planner are unlocked.';
};
