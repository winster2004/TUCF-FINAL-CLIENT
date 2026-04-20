import { useEffect, useMemo, useState } from 'react';

export const TRIAL_ACTIVE_KEY = 'tucf_trial_active';
export const TRIAL_START_KEY = 'tucf_trial_start';
export const TRIAL_DURATION_KEY = 'tucf_trial_duration_ms';
export const TRIAL_DURATION_MS = 172800000;

export const getTrialSnapshot = () => {
  const isActive = localStorage.getItem(TRIAL_ACTIVE_KEY) === 'true';
  const start = Number(localStorage.getItem(TRIAL_START_KEY) || '0');
  const duration = Number(localStorage.getItem(TRIAL_DURATION_KEY) || TRIAL_DURATION_MS);
  const remainingMs = Math.max(0, start + duration - Date.now());

  return {
    isActive,
    isExpired: isActive && remainingMs <= 0,
    remainingMs,
  };
};

export const activateTrialStorage = () => {
  localStorage.setItem(TRIAL_ACTIVE_KEY, 'true');
  localStorage.setItem(TRIAL_START_KEY, String(Date.now()));
  localStorage.setItem(TRIAL_DURATION_KEY, String(TRIAL_DURATION_MS));
  window.dispatchEvent(new Event('trial-state-changed'));
};

export const formatTrialTime = (remainingMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
};

export function useTrialTimer() {
  const [snapshot, setSnapshot] = useState(() => getTrialSnapshot());

  useEffect(() => {
    const refresh = () => setSnapshot(getTrialSnapshot());
    const interval = window.setInterval(refresh, 1000);

    window.addEventListener('storage', refresh);
    window.addEventListener('trial-state-changed', refresh);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('trial-state-changed', refresh);
    };
  }, []);

  return useMemo(
    () => ({
      ...snapshot,
      formattedTime: formatTrialTime(snapshot.remainingMs),
    }),
    [snapshot],
  );
}
