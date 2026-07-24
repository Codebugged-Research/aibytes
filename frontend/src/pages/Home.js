import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, TrendingUp, ChevronRight, Award, Check, Sparkles } from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import { useCurriculum, useRoleFilter } from '../hooks/useData';
import { applyRoleFilter } from '../utils/roles';
import { isLessonCompleted, setStreak, addXP, getUser } from '../utils/storage';
import { Button, Card, ProgressBar } from '../components/ui-components';
import { Skeleton, HomeScreenSkeleton } from '../components/Skeleton';
import { StreakUnfreeze } from '../components/StreakUnfreeze';
import { MascotCoach } from '../components/Mascot';

/* Stagger container/item variants */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } }
};

export const Home = () => {
  const navigate = useNavigate();
  const { xp, streak, refreshProgress } = useProgress();
  const { curriculum, loading } = useCurriculum();
  const { role, showAll } = useRoleFilter();
  const [xpPopped, setXpPopped] = useState(false);
  const [showUnfreeze, setShowUnfreeze] = useState(false);

  const handleUnfreezeComplete = () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    addXP(15);
    refreshProgress();
    setShowUnfreeze(false);
  };

  const allUnits = curriculum?.units || [];
  const roleUnits = applyRoleFilter(allUnits, role, showAll);
  const allLessons = roleUnits.flatMap(u => u.lessons);
  const completedCount = allLessons.filter(l => isLessonCompleted(l.id)).length;
  const totalLessons   = allLessons.length || 15;
  const firstName = (getUser()?.name || '').trim().split(' ')[0] || 'there';


  if (loading) {
    return (
      <motion.div
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <HomeScreenSkeleton />
      </motion.div>
    );
  }

  // Weekday demo streak data
  const weekDays = [
    { day: 'M', active: true,  isToday: false, label: 'Mon' },
    { day: 'T', active: true,  isToday: false, label: 'Tue' },
    { day: 'W', active: true,  isToday: false, label: 'Wed' },
    { day: 'T', active: false, isToday: true,  label: 'Thu' },
    { day: 'F', active: false, isToday: false, label: 'Fri' },
    { day: 'S', active: false, isToday: false, label: 'Sat' },
    { day: 'S', active: false, isToday: false, label: 'Sun' }
  ];

  return (
    <>
      <div className="px-6 py-4 space-y-5">
        {/* Greeting + minimal CTA */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight min-w-0" data-testid="home-title">
            Hey, <span className="whitespace-nowrap">{firstName} 👋</span>
          </h1>
          <div className="relative flex items-center justify-center">
            {/* Soft breathing glow behind the button */}
            <motion.span
              className="absolute inset-0 rounded-full bg-violet-600/35 blur-md pointer-events-none"
              animate={{ scale: [0.95, 1.12, 0.95], opacity: [0.4, 0.75, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.button
              onClick={() => navigate('/path')}
              className="relative overflow-hidden flex items-center gap-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-extrabold px-3.5 py-2 rounded-full shadow-sm flex-shrink-0 whitespace-nowrap z-10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            >
              {/* Shimmer sheen sweep across button */}
              <motion.span
                className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                style={{ transform: 'skewX(-20deg)', left: '-100%' }}
                animate={{ x: ['-20%', '120%'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
              />
              <Sparkles size={10} className="text-violet-400" />
              <span>Let&apos;s start</span>
              <ChevronRight size={10} strokeWidth={3} />
            </motion.button>
          </div>
        </div>

        {/* Byte — your guide */}
        <MascotCoach
          mood="wave"
          size={58}
          testId="byte-greeting"
          message={
            xp === 0
              ? "Hi, I'm Byte! Let's start your first AI bite."
              : completedCount >= totalLessons
              ? 'You finished every bite! Fancy a refresher?'
              : streak > 1
              ? `${streak}-day streak! Keep it sharp — one bite today?`
              : `Welcome back! ${completedCount} bite${completedCount === 1 ? '' : 's'} down. One more?`
          }
        />

        {/* XP Level bar */}
        {(() => {
          const XP_PER_LEVEL = 20;
          const level = Math.floor(xp / XP_PER_LEVEL) + 1;
          const levelXP = xp % XP_PER_LEVEL;
          const pct = (levelXP / XP_PER_LEVEL) * 100;
          return (
            <motion.div
              className="bg-white border border-slate-150 rounded-2xl px-4 py-3 shadow-sm space-y-1.5"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6248FF] to-violet-500 flex items-center justify-center">
                    <Zap size={12} className="text-white" fill="white" strokeWidth={0} />
                  </div>
                  <span className="text-xs font-black text-slate-900">Level {level}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{levelXP} / {XP_PER_LEVEL} XP</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#6248FF] to-violet-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                />
              </div>
            </motion.div>
          );
        })()}

        {/* Stats Grid — streak is first thing you see */}
        <div className="grid grid-cols-3 gap-3">
          {/* Streak */}
          <motion.div
            className="bg-[#FFF4F0] border border-orange-100 rounded-2xl p-4 text-center space-y-1 shadow-sm cursor-pointer"
            whileTap={{ scale: 0.93 }}
            onClick={() => setShowUnfreeze(true)}
          >
            <motion.div
              animate={{ rotate: [0, -6, 6, -4, 4, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2 }}
            >
              <Flame size={22} className="text-[#FF6B35] mx-auto" strokeWidth={2.5} />
            </motion.div>
            <div className="text-xl font-extrabold text-slate-900" data-testid="streak-count">{streak}</div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Streak</div>
          </motion.div>

          {/* XP */}
          <motion.div
            className="bg-[#F5F3FF] border border-violet-100 rounded-2xl p-4 text-center space-y-1 shadow-sm relative overflow-hidden"
            whileTap={{ scale: 0.93 }}
            onClick={() => { setXpPopped(true); setTimeout(() => setXpPopped(false), 800); }}
          >
            <AnimatePresence>
              {xpPopped && (
                <motion.div
                  key="xp-pop"
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 1, scale: 1, y: 0 }}
                  animate={{ opacity: 0, scale: 1.4, y: -20 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  <span className="text-xs font-black text-violet-600">+XP!</span>
                </motion.div>
              )}
            </AnimatePresence>
            <Zap size={22} className="text-[#6248FF] mx-auto" strokeWidth={2.5} fill="#6248FF" />
            <div className="text-xl font-extrabold text-slate-900" data-testid="xp-count">{xp}</div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total XP</div>
          </motion.div>

          {/* Lessons */}
          <motion.div
            className="bg-[#ECFDF5] border border-emerald-100 rounded-2xl p-4 text-center space-y-1 shadow-sm"
            whileTap={{ scale: 0.93 }}
          >
            <Award size={22} className="text-[#10B981] mx-auto" strokeWidth={2.5} />
            <div className="text-xl font-extrabold text-slate-900">{completedCount}/{totalLessons}</div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Lessons</div>
          </motion.div>
        </div>

        {/* Streak Tracker */}
        <div>
          <Card className="bg-white border border-slate-150 p-4 shadow-sm relative overflow-hidden cursor-pointer animate-glow-pulse" onClick={() => setShowUnfreeze(true)}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Habit Tracker</span>
                <motion.span
                  className="text-[10px] text-[#FF6B35] font-black uppercase tracking-wider"
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                >
                  3 Day Streak active
                </motion.span>
              </div>

              {/* Streak Calendar Grid */}
              <div className="relative flex justify-between items-center pt-1 px-1">
                {/* Background line */}
                <div className="absolute left-4 right-4 h-0.5 bg-slate-100 top-1/2 -translate-y-2 z-0" />
                {/* Active progress line */}
                <motion.div
                  className="absolute left-4 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 top-1/2 -translate-y-2 z-0"
                  initial={{ width: '0%' }}
                  animate={{ width: '38%' }}
                  transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />

                {weekDays.map((wd, i) => (
                  <div
                    key={wd.label}
                    className="relative z-10 flex flex-col items-center gap-1.5"
                  >
                    <motion.div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        wd.active
                          ? 'bg-gradient-to-br from-orange-500 to-amber-500 border-transparent shadow-sm text-white'
                          : wd.isToday
                          ? 'bg-white border-orange-500 text-orange-500'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                      whileTap={{ scale: 0.85 }}
                      animate={wd.isToday ? { scale: [1, 1.08, 1] } : {}}
                      transition={wd.isToday ? { duration: 1.8, repeat: Infinity } : {}}
                    >
                      {wd.active ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.4 + i * 0.07, type: 'spring', stiffness: 450 }}
                        >
                          <Check size={14} className="text-white" strokeWidth={3.5} />
                        </motion.div>
                      ) : (
                        <span className="text-[10px] font-extrabold">{wd.day}</span>
                      )}
                    </motion.div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">{wd.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider">Your Progress</h2>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <TrendingUp size={14} className="text-[#6248FF]" strokeWidth={2.5} />
            </motion.div>
          </div>

          <Card testId="progress-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-slate-900">AI Course</span>
                <motion.span
                  className="text-xs text-[#6248FF] font-black"
                  key={completedCount}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {Math.round((completedCount / totalLessons) * 100)}%
                </motion.span>
              </div>
              <ProgressBar progress={(completedCount / totalLessons) * 100} />
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400 font-medium">{completedCount} of {totalLessons} completed</span>
                {completedCount > 0 && (
                  <motion.span
                    className="text-emerald-600 font-bold"
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    Keep going!
                  </motion.span>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {showUnfreeze && (
          <StreakUnfreeze
            currentStreak={streak}
            onUnfreezeComplete={handleUnfreezeComplete}
            onClose={() => setShowUnfreeze(false)}
          />
        )}
      </AnimatePresence>

    </>
  );
};
