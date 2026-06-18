import { useState, useEffect } from 'react';
import { getXP, getStreak } from '../utils/storage';

export const useProgress = () => {
  const [xp, setXP] = useState(0);
  const [streak, setStreakState] = useState(0);

  const refreshProgress = () => {
    setXP(getXP());
    setStreakState(getStreak());
  };

  useEffect(() => {
    refreshProgress();
  }, []);

  return { xp, streak, refreshProgress };
};