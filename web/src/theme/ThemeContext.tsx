import React, { createContext, useContext, useEffect, useState } from 'react';
import { ColorScheme, DARK, LIGHT } from './tokens';

type Mode = 'dark' | 'light';

type ThemeContextValue = {
  mode: Mode;
  colors: ColorScheme;
  toggle: () => void;
  ready: boolean;
};

const THEME_KEY = 'decitrack:theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('dark');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as Mode | null;
    if (saved === 'dark' || saved === 'light') setMode(saved);
    setReady(true);
  }, []);

  const toggle = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  };

  const colors = mode === 'dark' ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggle, ready }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
