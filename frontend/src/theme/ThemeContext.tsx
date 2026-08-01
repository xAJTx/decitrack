import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { storage } from "@/src/utils/storage";
import { ColorScheme, DARK, LIGHT } from "./tokens";

type Mode = "dark" | "light";

type ThemeContextValue = {
  mode: Mode;
  colors: ColorScheme;
  toggle: () => void;
  ready: boolean;
};

const THEME_KEY = "decitrack:theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await storage.getItem<Mode>(THEME_KEY, "dark");
      if (saved === "dark" || saved === "light") setMode(saved);
      setReady(true);
    })();
  }, []);

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      storage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const colors = mode === "dark" ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggle, ready }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
