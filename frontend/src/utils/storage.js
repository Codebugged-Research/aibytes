// Local storage utilities for progress tracking

const STORAGE_KEYS = {
  XP: 'aiquest_xp',
  STREAK: 'aiquest_streak',
  LAST_LESSON_DATE: 'aiquest_last_date',
  COMPLETED_LESSONS: 'aiquest_completed',
  CURRENT_LESSON: 'aiquest_current',
  LESSON_PROGRESS: 'aiquest_lesson_progress',
  VOICE: 'aiquest_voice',
  ROLE_PREF: 'aiquest_role_pref',
  SHOW_ALL_LESSONS: 'aiquest_show_all_lessons'
};

// Role-based path — a single ROLES id (see utils/roles.js), or null for "no
// role picked" (nothing filtered).
export const getRolePref = () => {
  try { return localStorage.getItem(STORAGE_KEYS.ROLE_PREF) || null; } catch (e) { return null; }
};

export const setRolePref = (roleId) => {
  try {
    if (roleId) localStorage.setItem(STORAGE_KEYS.ROLE_PREF, roleId);
    else localStorage.removeItem(STORAGE_KEYS.ROLE_PREF);
  } catch (e) { /* noop */ }
};

// Escape hatch: when a role filter is active, lets the learner see the full
// catalog without abandoning their role selection.
export const getShowAllLessons = () => {
  try { return localStorage.getItem(STORAGE_KEYS.SHOW_ALL_LESSONS) === '1'; } catch (e) { return false; }
};

export const setShowAllLessons = (value) => {
  try { localStorage.setItem(STORAGE_KEYS.SHOW_ALL_LESSONS, value ? '1' : '0'); } catch (e) { /* noop */ }
};

export const getXP = () => {
  return parseInt(localStorage.getItem(STORAGE_KEYS.XP) || '0', 10);
};

export const setXP = (xp) => {
  localStorage.setItem(STORAGE_KEYS.XP, xp.toString());
};

export const addXP = (points) => {
  const current = getXP();
  setXP(current + points);
};

export const getStreak = () => {
  return parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || '0', 10);
};

export const setStreak = (streak) => {
  localStorage.setItem(STORAGE_KEYS.STREAK, streak.toString());
};

export const updateStreak = () => {
  const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_LESSON_DATE);
  const today = new Date().toDateString();
  
  if (lastDate === today) {
    return getStreak();
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (lastDate === yesterday.toDateString()) {
    const newStreak = getStreak() + 1;
    setStreak(newStreak);
    localStorage.setItem(STORAGE_KEYS.LAST_LESSON_DATE, today);
    return newStreak;
  }
  
  setStreak(1);
  localStorage.setItem(STORAGE_KEYS.LAST_LESSON_DATE, today);
  return 1;
};

export const getCompletedLessons = () => {
  const data = localStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS);
  return data ? JSON.parse(data) : [];
};

export const markLessonComplete = (lessonId, xpEarned) => {
  const completed = getCompletedLessons();
  if (!completed.includes(lessonId)) {
    completed.push(lessonId);
    localStorage.setItem(STORAGE_KEYS.COMPLETED_LESSONS, JSON.stringify(completed));
    addXP(xpEarned);
    updateStreak();
  }
};

export const isLessonCompleted = (lessonId) => {
  return getCompletedLessons().includes(lessonId);
};

export const getCurrentLesson = () => {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_LESSON) || 'u0-l1';
};

export const setCurrentLesson = (lessonId) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_LESSON, lessonId);
};

export const getLessonProgress = (lessonId) => {
  const allProgress = localStorage.getItem(STORAGE_KEYS.LESSON_PROGRESS);
  const progress = allProgress ? JSON.parse(allProgress) : {};
  return progress[lessonId] || { segmentIndex: 0, exerciseIndex: 0 };
};

export const saveLessonProgress = (lessonId, segmentIndex, exerciseIndex) => {
  const allProgress = localStorage.getItem(STORAGE_KEYS.LESSON_PROGRESS);
  const progress = allProgress ? JSON.parse(allProgress) : {};
  progress[lessonId] = { segmentIndex, exerciseIndex };
  localStorage.setItem(STORAGE_KEYS.LESSON_PROGRESS, JSON.stringify(progress));
};

export const clearLessonProgress = (lessonId) => {
  const allProgress = localStorage.getItem(STORAGE_KEYS.LESSON_PROGRESS);
  const progress = allProgress ? JSON.parse(allProgress) : {};
  delete progress[lessonId];
  localStorage.setItem(STORAGE_KEYS.LESSON_PROGRESS, JSON.stringify(progress));
};

export const resetAllProgress = () => {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
};

// Sound starts OFF every session and is opt-in via the speaker control. Stored
// in sessionStorage so each fresh visit begins muted (and any legacy
// localStorage 'on' value is ignored).
export const getVoiceEnabled = () => {
  try { return sessionStorage.getItem(STORAGE_KEYS.VOICE) === 'on'; } catch (e) { return false; }
};

export const setVoiceEnabled = (enabled) => {
  try { sessionStorage.setItem(STORAGE_KEYS.VOICE, enabled ? 'on' : 'off'); } catch (e) { /* noop */ }
};

// Auth/onboarding (MVP — stored locally, independent of progress reset)
export const getOnboarded = () => {
  return localStorage.getItem('aiquest_onboarded') === '1';
};

export const setOnboarded = (value) => {
  if (value) localStorage.setItem('aiquest_onboarded', '1');
  else localStorage.removeItem('aiquest_onboarded');
};

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('aiquest_user') || 'null'); } catch (e) { return null; }
};

export const setUser = (user) => {
  localStorage.setItem('aiquest_user', JSON.stringify(user || null));
};

// Theme preference — 'light' (default) or 'dark'.
export const getTheme = () => {
  try { return localStorage.getItem('aiquest_theme') === 'dark' ? 'dark' : 'light'; } catch (e) { return 'light'; }
};

export const setTheme = (theme) => {
  try { localStorage.setItem('aiquest_theme', theme === 'dark' ? 'dark' : 'light'); } catch (e) { /* noop */ }
};