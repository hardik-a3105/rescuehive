import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const workstation = localStorage.getItem('rescuehive_workstation_settings');
      if (workstation) {
        const parsed = JSON.parse(workstation);
        if (parsed.theme) return parsed.theme;
      }
    } catch {}
    const saved = localStorage.getItem('rescuehive_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('rescuehive_accent') || 'cyan';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('rescuehive_theme', theme);
    try {
      const workstation = localStorage.getItem('rescuehive_workstation_settings');
      const parsed = workstation ? JSON.parse(workstation) : {};
      localStorage.setItem('rescuehive_workstation_settings', JSON.stringify({ ...parsed, theme }));
    } catch {}
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('rescuehive_accent', accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
