import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Flame, Zap, Award, RotateCcw, ChevronRight, ShieldCheck, AlertCircle, LogOut, Palette, Target } from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import { getCompletedLessons, resetAllProgress, setOnboarded, setUser } from '../utils/storage';
import { Button, Card } from '../components/ui-components';
import { useState, useEffect } from 'react';
import { Skeleton } from '../components/Skeleton';
import { ThemeToggle } from '../components/ThemeToggle';

/* Stagger helpers */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } }
};
const cardVariants = {
  hidden: { opacity: 0, x: -24, scale: 0.97 },
  show:   { opacity: 1, x: 0,   scale: 1,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } }
};

export const Profile = () => {
  const navigate = useNavigate();
  const { xp, streak, refreshProgress } = useProgress();
  const completedLessons = getCompletedLessons();
  const [showReset, setShowReset] = useState(false);
  const [avatarPopped, setAvatarPopped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, []);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      resetAllProgress();
      refreshProgress();
      window.location.reload();
    }
  };

  const handleAvatarTap = () => {
    setAvatarPopped(true);
    setTimeout(() => setAvatarPopped(false), 600);
  };

  const stats = [
    {
      icon: Flame,
      label: 'Day Streak',
      value: streak,
      testId: 'profile-streak',
      gradient: 'from-orange-500 to-amber-500',
      glow: 'glow-orange',
      bg: 'from-orange-50 to-amber-50',
      border: 'border-orange-100'
    },
    {
      icon: Zap,
      label: 'Total XP',
      value: xp,
      testId: 'profile-xp',
      gradient: 'from-violet-600 to-indigo-600',
      glow: 'glow-purple',
      bg: 'from-violet-50 to-indigo-50',
      border: 'border-violet-100'
    },
    {
      icon: Award,
      label: 'Completed Lessons',
      value: completedLessons.length,
      testId: 'profile-lessons',
      gradient: 'from-emerald-500 to-teal-500',
      glow: 'glow-green',
      bg: 'from-emerald-50 to-teal-50',
      border: 'border-emerald-100'
    }
  ];

  if (loading) {
    return (
      <motion.div
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Skeleton.ProfileScreen />
      </motion.div>
    );
  }

  const handleLogout = () => {
    setOnboarded(false);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <motion.div
      className="px-6 py-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <motion.div
        className="space-y-1"
        initial={{ y: -14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.06, duration: 0.38 }}
      >
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight" data-testid="profile-title">
          Profile
        </h1>
        <p className="text-slate-400 text-sm font-medium">
          Track your learning progress
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 22 }}
      >
        <Card testId="profile-card" className="text-center bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-100 shadow-sm">
          <div className="space-y-3">
            {/* Avatar with animated ring */}
            <div className="relative w-20 h-20 mx-auto">
              {/* Outer animated glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-violet-400 opacity-30"
                animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="w-20 h-20 rounded-full bg-[#FFE27C] flex items-center justify-center text-slate-900 font-extrabold text-2xl shadow-md border-2 border-amber-200 relative z-10 cursor-pointer select-none"
                whileTap={{ scale: 0.88, rotate: -10 }}
                animate={avatarPopped ? { scale: [1, 1.25, 1] } : {}}
                transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                onClick={handleAvatarTap}
              >
                AV
              </motion.div>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900">AI Learner</h2>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <ShieldCheck size={12} className="text-violet-500" strokeWidth={2} />
                <p className="text-violet-500 text-xs font-bold uppercase tracking-wider">Foundation Explorer</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="space-y-3">
        <motion.h2
          className="text-xs font-extrabold text-slate-950 uppercase tracking-wider px-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          Statistics
        </motion.h2>

        <motion.div className="space-y-3" variants={containerVariants} initial="hidden" animate="show">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} variants={cardVariants}>
                <motion.div
                  whileHover={{ x: 4, boxShadow: '0 6px 20px rgba(0,0,0,0.07)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                >
                  <Card testId={stat.testId} className={`bg-gradient-to-br ${stat.bg} ${stat.border}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <motion.div
                          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}
                          whileTap={{ rotate: -15 }}
                          animate={stat.label === 'Day Streak' ? {
                            rotate: [0, -5, 5, -3, 3, 0]
                          } : {}}
                          transition={stat.label === 'Day Streak' ? {
                            duration: 1.4, repeat: Infinity, repeatDelay: 2
                          } : {}}
                        >
                          <Icon size={20} className="text-white" strokeWidth={2.5} />
                        </motion.div>
                        <span className="text-slate-900 font-extrabold text-sm">{stat.label}</span>
                      </div>
                      <motion.span
                        className="text-2xl font-black text-slate-900"
                        key={stat.value}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 380 }}
                      >
                        {stat.value}
                      </motion.span>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Learning Focus */}
      <motion.div
        className="pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          onClick={() => navigate('/learning-focus')}
          className="w-full flex items-center justify-between gap-2 bg-white border border-slate-200 text-slate-800 font-bold text-sm py-3.5 px-4 rounded-2xl shadow-sm"
          whileTap={{ scale: 0.96 }}
          whileHover={{ borderColor: '#CBD5E1', boxShadow: '0 4px 14px rgba(0,0,0,0.07)' }}
          data-testid="learning-focus-button"
        >
          <span className="flex items-center gap-2">
            <Target size={16} strokeWidth={2.5} className="text-[#6248FF]" />
            Learning Focus
          </span>
          <ChevronRight size={14} strokeWidth={2.5} className="text-slate-400" />
        </motion.button>
      </motion.div>

      {/* Reset Section */}
      <motion.div
        className="pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
      >
        <motion.button
          onClick={() => setShowReset(!showReset)}
          className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-500 font-bold text-sm py-3.5 rounded-2xl shadow-sm"
          whileTap={{ scale: 0.96 }}
          whileHover={{ borderColor: '#CBD5E1', boxShadow: '0 4px 14px rgba(0,0,0,0.07)' }}
          data-testid="reset-progress-button"
        >
          <motion.div
            animate={showReset ? { rotate: 180 } : { rotate: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          >
            <RotateCcw size={16} strokeWidth={2.5} />
          </motion.div>
          Reset Progress
          <motion.div
            animate={showReset ? { rotate: 90 } : { rotate: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          >
            <ChevronRight size={14} strokeWidth={2.5} />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {showReset && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 overflow-hidden"
            >
              <Button
                onClick={handleReset}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-sm py-4"
                testId="confirm-reset-button"
              >
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle size={16} strokeWidth={2.5} />
                  Confirm Reset — Cannot be undone
                </div>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Appearance / theme */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.68 }}
        className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-700">
            <Palette size={16} strokeWidth={2.4} />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-900 leading-tight">Appearance</p>
            <p className="text-xs text-slate-400 font-medium">Light or dark theme</p>
          </div>
        </div>
        <ThemeToggle />
      </motion.div>

      {/* Log out */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.72 }}
      >
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-red-500 font-bold text-sm py-3.5 rounded-2xl shadow-sm"
          whileTap={{ scale: 0.96 }}
          whileHover={{ borderColor: '#FCA5A5', boxShadow: '0 4px 14px rgba(0,0,0,0.07)' }}
          data-testid="logout-button"
        >
          <LogOut size={16} strokeWidth={2.5} />
          Log Out
        </motion.button>
      </motion.div>
    </motion.div>
  );
};


