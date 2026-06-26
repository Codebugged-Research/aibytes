import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTheme, setTheme } from '../utils/theme';

// Compact icon button that flips between light and dark.
// Shows a Moon while in light mode (tap to go dark) and a Sun while in dark.
export const ThemeToggle = ({ className = '', size = 16 }) => {
  const [theme, setThemeState] = useState(() => getTheme());
  const dark = theme === 'dark';

  const toggle = () => {
    const next = dark ? 'light' : 'dark';
    setThemeState(next);
    setTheme(next);
  };

  return (
    <motion.button
      type="button"
      onClick={toggle}
      data-testid="theme-toggle"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      whileTap={{ scale: 0.88 }}
      className={`w-9 h-9 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 transition-colors ${className}`}
    >
      <motion.span key={dark ? 'sun' : 'moon'} initial={{ rotate: -40, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.25 }}>
        {dark ? <Sun size={size} strokeWidth={2.4} /> : <Moon size={size} strokeWidth={2.4} />}
      </motion.span>
    </motion.button>
  );
};
