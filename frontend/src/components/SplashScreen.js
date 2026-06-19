import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

export const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('loading'); // loading | done

  useEffect(() => {
    const duration = 1500;
    const intervalTime = 30;
    const step = (100 / (duration / intervalTime));

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setPhase('done');
          return 100;
        }
        return Math.min(prev + step, 100);
      });
    }, intervalTime);

    const completeTimeout = setTimeout(onComplete, 2100);

    return () => {
      clearInterval(timer);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Ambient background blobs */}
      <motion.div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-100 rounded-full blur-3xl opacity-40"
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-35"
          animate={{ scale: [1.1, 1, 1.1], x: [0, -20, 0], y: [0, 15, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-50 rounded-full blur-3xl opacity-50"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 max-w-xs w-full px-6">

        {/* Logo Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="relative">
            {/* Animated outer ring */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#6248FF] to-[#8B5CF6] rounded-3xl blur-2xl"
              animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.18, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Spinning ring */}
            <motion.div
              className="absolute -inset-3 rounded-[34px] border-2 border-dashed border-violet-300 opacity-50"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            <div className="relative bg-gradient-to-br from-[#6248FF] to-[#8B5CF6] p-5 rounded-3xl shadow-xl">
              <motion.div
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1 }}
              >
                <Zap size={44} className="text-white" strokeWidth={2.5} fill="white" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* App name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
            AIBites
          </h1>
          <motion.p
            className="text-slate-400 text-[11px] font-extrabold tracking-[0.22em] uppercase"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            Master AI in 10 minutes
          </motion.p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="space-y-2.5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.38 }}
        >
          <div className="w-40 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden relative">
            {/* Shimmer overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full absolute left-0 top-0"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.08, ease: 'linear' }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.span
              key={Math.round(progress)}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest block select-none"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {phase === 'done' ? 'Ready!' : `${Math.round(progress)}%`}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};