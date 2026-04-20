export type AppTheme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'theme';
export const THEME_EVENT = 'theme-change';

export function getStoredTheme(): AppTheme {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' ? 'light' : 'dark';
}

export function applyTheme(theme: AppTheme) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.setAttribute('data-theme', theme);
}

export function setTheme(theme: AppTheme) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.dispatchEvent(new CustomEvent<AppTheme>(THEME_EVENT, { detail: theme }));
  }

  applyTheme(theme);
}

export function initializeTheme() {
  applyTheme(getStoredTheme());
}
