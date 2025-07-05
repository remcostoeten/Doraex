import { writable } from 'svelte/store';
import type { TTheme, TThemeState } from '../types';
import { browser } from '$app/environment';

function getInitialTheme(): TTheme {
  if (!browser) return 'dark';
  
  const storedTheme = localStorage.getItem('theme') as TTheme;
  
  if (storedTheme && (storedTheme === 'dark' || storedTheme === 'light')) {
    return storedTheme;
  }
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function createThemeStore() {
  const initialTheme = getInitialTheme();
  
  const initialState: TThemeState = {
    theme: initialTheme,
    isDark: initialTheme === 'dark',
    isLight: initialTheme === 'light'
  };

  const { subscribe, set, update } = writable<TThemeState>(initialState);

  function setTheme(theme: TTheme) {
    update(state => ({
      ...state,
      theme,
      isDark: theme === 'dark',
      isLight: theme === 'light'
    }));
    
    if (browser) {
      localStorage.setItem('theme', theme);
    }
    updateDocumentClass(theme);
  }

  function toggleTheme() {
    update(state => {
      const newTheme: TTheme = state.theme === 'dark' ? 'light' : 'dark';
      
      if (browser) {
        localStorage.setItem('theme', newTheme);
      }
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
    if (browser && typeof document !== 'undefined') {
      const htmlElement = document.documentElement;
      if (theme === 'dark') {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }
    }
  }

  function initializeTheme() {
    if (browser) {
      const theme = getInitialTheme();
      setTheme(theme);
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
