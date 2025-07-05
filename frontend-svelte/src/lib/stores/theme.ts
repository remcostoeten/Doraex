import { writable } from 'svelte/store';
import type { TTheme, TThemeState } from '../types';

function createThemeStore() {
  const defaultTheme: TTheme = 'dark';
  
  const initialState: TThemeState = {
    theme: defaultTheme,
    isDark: defaultTheme === 'dark',
    isLight: defaultTheme === 'light'
  };

  const { subscribe, set, update } = writable<TThemeState>(initialState);

  function setTheme(theme: TTheme) {
    update(state => ({
      ...state,
      theme,
      isDark: theme === 'dark',
      isLight: theme === 'light'
    }));
    
    localStorage.setItem('theme', theme);
    updateDocumentClass(theme);
  }

  function toggleTheme() {
    update(state => {
      const newTheme: TTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      updateDocumentClass(newTheme);
      
      return {
        ...state,
        theme: newTheme,
        isDark: newTheme === 'dark',
        isLight: newTheme === 'light'
      };
    });
  }

  function updateDocumentClass(theme: TTheme) {
    if (typeof document !== 'undefined') {
      const htmlElement = document.documentElement;
      if (theme === 'dark') {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }
    }
  }

  function initializeTheme() {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') as TTheme;
      
      if (storedTheme && (storedTheme === 'dark' || storedTheme === 'light')) {
        setTheme(storedTheme);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
    }
  }

  return {
    subscribe,
    setTheme,
    toggleTheme,
    initializeTheme
  };
}

export const themeStore = createThemeStore();
