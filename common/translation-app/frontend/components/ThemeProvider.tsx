'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { isDarkMode } = useThemeStore();

  // Apply dark mode class to html element
  useEffect(() => {
    // Check system preference on first load if we don't have a stored preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (localStorage.getItem('theme-storage') === null) {
        useThemeStore.getState().setDarkMode(prefersDark);
      }
    }

    // Apply class to HTML element
    const htmlElement = document.documentElement;
    
    if (isDarkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }

    // This logging helps with debugging
    console.log('Theme updated:', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return <>{children}</>;
};

export default ThemeProvider;
