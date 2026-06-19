import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, TrendingUp, Zap, BookOpen, Star, Target, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui-components';
import { Skeleton } from '../components/Skeleton';

/* Container / item stagger */
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } }
};
const rowVariants = {
  hidden: { opacity: 0, x: -22, scale: 0.97 },
  show:   { opacity: 1, x: 0,   scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

const statusConfig = {
  success:  { bg: 'bg-emerald-500', text: 'text-emerald-600', dotPulse: false },
  failed:   { bg: 'bg-red-400',     text: 'text-red-500',     dotPulse: false },
  inprog:   { bg: 'bg-amber-400',   text: 'text-amber-600',   dotPulse: true  }
};

export const Activity = () => {
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 480);
    return () => clearTimeout(t);
  }, []);

  const activities = [
    {
      id: 1,
      initials: 'WA',
      color: 'bg-violet-100 text-violet-700',
      icon: BookOpen,
      title: 'What is AI, really?',
      date: '18 Jun',
      method: 'Completed Lesson 1',
      xp: '+15 XP',
      status: 'success'
    },
    {
      id: 2,
      initials: 'AM',
      color: 'bg-indigo-100 text-indigo-700',
      icon: BookOpen,
      title: 'AI vs ML vs Deep Learning',
      date: '17 Jun',
      method: 'Completed Lesson 2',
      xp: '+15 XP',
      status: 'success'
    },
    {
      id: 3,
      initials: 'PQ',
      color: 'bg-amber-100 text-amber-700',
      icon: Star,
      title: 'Foundations Practice Quiz',
      date: '16 Jun',
      method: 'Practice Session',
      xp: '+5 XP',
      status: 'success'
    },
    {
      id: 4,
      initials: 'NG',
      color: 'bg-red-100 text-red-600',
      icon: Target,
      title: 'Narrow vs General AI',
      date: '15 Jun',
      method: 'Attempted Challenge',
      xp: '0 XP',
      status: 'failed',
      tag: 'FAILED'
    },
    {
      id: 5,
      initials: 'IP',
      color: 'bg-sky-100 text-sky-700',
      icon: Zap,
      title: 'Intro to Prompt Engineering',
      date: '14 Jun',
      method: 'In Progress',
      xp: '—',
      status: 'inprog',
      tag: 'IN PROGRESS'
    }
  ];

  const filters = ['all', 'success', 'failed'];
  const filtered = filter === 'all' ? activities : activities.filter(a => a.status === filter);

  const totalXP = activities
    .filter(a => a.status === 'success')
    .reduce((acc, a) => acc + parseInt(a.xp) || 0, 0);

  if (loading) {
    return (
      <motion.div
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Skeleton.ActivityScreen />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="px-6 py-4 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <motion.div
        className="space-y-1"
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Recent activity
        </h1>
        <p className="text-slate-400 text-sm font-medium">
          Review your learning accomplishments
        </p>
      </motion.div>

      {/* Filter chips */}
      <motion.div
        className="flex gap-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
      >
        {filters.map(f => (
          <motion.button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all ${
              filter === f
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-500'
            }`}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 450, damping: 22 }}
          >
            {f}
          </motion.button>
        ))}
      </motion.div>

      {/* Activity List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          className="space-y-1"
          variants={listVariants}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          {filtered.map((act) => {
            const sc = statusConfig[act.status];
            const Icon = act.icon;
            return (
              <motion.div
                key={act.id}
                variants={rowVariants}
                className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 group"
                whileHover={{ x: 3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              >
                {/* Left */}
                <div className="flex items-center gap-3.5">
                  <motion.div
                    className={`w-11 h-11 rounded-2xl ${act.color} flex items-center justify-center flex-shrink-0 shadow-sm`}
                    whileTap={{ scale: 0.88, rotate: -8 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </motion.div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm leading-snug">
                        {act.title}
                      </span>
                      {act.tag && (
                        <motion.span
                          className={`text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-md ${
                            act.status === 'failed'
                              ? 'bg-red-50 text-red-500 border border-red-100'
                              : 'bg-amber-50 text-amber-500 border border-amber-100'
                          }`}
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2, type: 'spring' }}
                        >
                          {act.tag}
                        </motion.span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {act.date} · {act.method}
                    </span>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-1.5">
                  {act.status === 'success' && (
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={false}
                    >
                      <ArrowUpRight size={14} className="text-slate-300" strokeWidth={3} />
                    </motion.div>
                  )}
                  <span className={`font-extrabold text-sm tracking-tight ${
                    act.status === 'success' ? 'text-emerald-600' :
                    act.status === 'failed'  ? 'text-red-400'     : 'text-slate-400'
                  }`}>
                    {act.xp}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <motion.div
              className="flex flex-col items-center py-10 text-slate-400 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AlertCircle size={32} strokeWidth={1.5} />
              <p className="text-xs font-bold">No activity found</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Weekly Overview Card */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-sm"
                animate={{ rotate: [0, 4, -4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
              >
                <TrendingUp size={18} strokeWidth={2.5} />
              </motion.div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Weekly Output</h3>
                <p className="text-slate-400 text-[10px] font-medium leading-none">Aggregating learning rate</p>
              </div>
            </div>
            <motion.span
              className="text-xl font-black text-violet-600"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 380 }}
            >
              {totalXP} XP
            </motion.span>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
