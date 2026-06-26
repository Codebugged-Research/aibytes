// Theme management — toggles a `dark` class on <html>; persisted in localStorage.
// Default is light (see storage.getTheme).
import { getTheme, setTheme as persistTheme } from './storage';

export const applyTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

// Call once at startup (before render) to avoid a flash of the wrong theme.
export const initTheme = () => {
  const theme = getTheme();
  applyTheme(theme);
  return theme;
};

// Persist + apply in one call.
export const setTheme = (theme) => {
  persistTheme(theme);
  applyTheme(theme);
};

export { getTheme };
