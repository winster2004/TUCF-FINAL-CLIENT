import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { AppTheme, THEME_EVENT, getStoredTheme, initializeTheme, setTheme } from '../lib/theme';

const ThemeToggle: React.FC = () => {
  const [theme, setThemeState] = useState<AppTheme>('dark');

  useEffect(() => {
    initializeTheme();
    setThemeState(getStoredTheme());

    const handleThemeSync = (event: Event) => {
      const customEvent = event as CustomEvent<AppTheme>;
      if (customEvent.detail) {
        setThemeState(customEvent.detail);
      } else {
        setThemeState(getStoredTheme());
      }
    };

    const handleStorage = () => {
      setThemeState(getStoredTheme());
      initializeTheme();
    };

    window.addEventListener(THEME_EVENT, handleThemeSync as EventListener);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(THEME_EVENT, handleThemeSync as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    const nextTheme: AppTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
    setThemeState(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      className={`group relative inline-flex h-12 w-[94px] items-center rounded-full border p-1.5 shadow-[0_10px_28px_rgba(15,23,42,0.12)] transition-all duration-300 active:scale-[0.97] ${
        isDark
          ? 'border-white/10 bg-[#1c1c22] hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_14px_34px_rgba(255,122,0,0.18)]'
          : 'border-slate-300 bg-[#f4f4f5] hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-[0_14px_34px_rgba(148,163,184,0.22)]'
      }`}
    >
      <span
        className={`absolute top-1.5 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
          isDark
            ? 'left-[calc(100%-2.625rem)] bg-[#3944b8] text-white shadow-[0_10px_20px_rgba(57,68,184,0.35)]'
            : 'left-1.5 bg-[#3944b8] text-white shadow-[0_10px_20px_rgba(57,68,184,0.28)]'
        }`}
      >
        {isDark ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
      </span>

      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}
      >
        <Sun className="h-4.5 w-4.5" />
      </span>

      <span
        className={`ml-auto flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
          isDark ? 'text-slate-900' : 'text-slate-400'
        }`}
      >
        <Moon className="h-4.5 w-4.5" />
      </span>
    </button>
  );
};

export default ThemeToggle;
