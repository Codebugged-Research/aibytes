import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles } from 'lucide-react';
import { Mascot } from './Mascot';

export const StreakUnfreeze = ({ currentStreak, onUnfreezeComplete, onClose }) => {
  const [phase, setPhase] = useState('frozen'); // frozen | breaking | unfrozen
  const [shards, setShards] = useState([]);

  const handleUnfreeze = () => {
    if (phase !== 'frozen') return;
    
    setPhase('breaking');

    // Generate random ice shards for explosion
    const newShards = Array.from({ length: 16 }).map((_, i) => {
      const angle = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const distance = 80 + Math.random() * 120;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        rotation: Math.random() * 360,
        scale: 0.4 + Math.random() * 0.8,
        duration: 0.6 + Math.random() * 0.4
      };
    });
    setShards(newShards);

    // Transition to hot/fire phase
    setTimeout(() => {
      setPhase('unfrozen');
    }, 700);

    // Call completion callback after showing the fire animation
    setTimeout(() => {
      onUnfreezeComplete();
    }, 2400);
  };

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#1D5AD6] to-[#0F3691] text-white p-6 select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Floating Sparkles in Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {phase === 'unfrozen' && Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-orange-400 rounded-full opacity-60"
            style={{
              width: Math.random() * 8 + 4,
              height: Math.random() * 8 + 4,
              left: `${Math.random() * 100}%`,
              bottom: '10%'
            }}
            animate={{
              y: -500,
              x: (Math.random() - 0.5) * 60,
              opacity: [0.6, 0.9, 0],
              scale: [1, 1.4, 0]
            }}
            transition={{
              duration: 2 + Math.random() * 1.5,
              repeat: Infinity,
              delay: Math.random() * 1.5
            }}
          />
        ))}
      </div>

      {/* Main Interactive Container */}
      <div className="flex flex-col items-center justify-center space-y-10 relative z-10 w-full">
        
        {/* Interactive Flame/Ice Container */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          
          {/* Shards Explosion */}
          <AnimatePresence>
            {phase === 'breaking' && shards.map((shard) => (
              <motion.div
                key={shard.id}
                className="absolute w-8 h-8 bg-sky-200/90 rounded-md border border-white/40 shadow-sm"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                }}
                initial={{ x: 0, y: 0, scale: shard.scale, rotate: 0, opacity: 1 }}
                animate={{
                  x: shard.x,
                  y: shard.y,
                  rotate: shard.rotation,
                  opacity: 0,
                  scale: 0.1
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: shard.duration, ease: [0.1, 0.8, 0.2, 1] }}
              />
            ))}
          </AnimatePresence>

          {/* Frozen / Active Flame Container */}
          <motion.div
            onClick={handleUnfreeze}
            className="cursor-pointer relative flex items-center justify-center"
            whileHover={phase === 'frozen' ? { scale: 1.05 } : {}}
            whileTap={phase === 'frozen' ? { scale: 0.95 } : {}}
            animate={
              phase === 'frozen'
                ? {
                    y: [0, -6, 0],
                    filter: ['drop-shadow(0 4px 12px rgba(14, 165, 233, 0.3))', 'drop-shadow(0 4px 20px rgba(14, 165, 233, 0.5))', 'drop-shadow(0 4px 12px rgba(14, 165, 233, 0.3))']
                  }
                : phase === 'breaking'
                ? {
                    x: [0, -8, 8, -6, 6, 0],
                    y: [0, 4, -4, 3, -3, 0],
                    scale: 0.92
                  }
                : {
                    scale: [1, 1.2, 1],
                    filter: 'drop-shadow(0 10px 30px rgba(239, 68, 68, 0.6))'
                  }
            }
            transition={
              phase === 'frozen'
                ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                : phase === 'breaking'
                ? { duration: 0.4 }
                : { type: 'spring', stiffness: 300, damping: 15 }
            }
          >
            {/* Ambient glows */}
            <AnimatePresence>
              {phase === 'frozen' && (
                <motion.div
                  className="absolute inset-0 bg-sky-400 rounded-full blur-3xl opacity-30"
                  exit={{ opacity: 0 }}
                />
              )}
              {phase === 'unfrozen' && (
                <motion.div
                  className="absolute inset-0 bg-orange-500 rounded-full blur-3xl opacity-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>

            {/* Ice / Fire Graphic */}
            {phase === 'frozen' || phase === 'breaking' ? (
              // Frozen Streak Graphic matching videoframe_2189.png style
              <div className="relative flex items-center justify-center">
                {/* Custom SVG ice flame shield/crystal */}
                <svg width="150" height="170" viewBox="0 0 150 170" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Ice outline outer */}
                  <path
                    d="M75 10C75 10 115 50 125 80C132 101 128 122 118 135C108 148 93 155 75 155C57 155 42 148 32 135C22 122 18 101 25 80C35 50 75 10 75 10Z"
                    fill="#E0F2FE"
                    fillOpacity="0.45"
                    stroke="#BAE6FD"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  {/* Ice inner facet lines to look frozen */}
                  <path d="M75 10L75 55" stroke="white" strokeWidth="2" strokeOpacity="0.6" />
                  <path d="M25 80L50 90" stroke="white" strokeWidth="2" strokeOpacity="0.6" />
                  <path d="M125 80L100 90" stroke="white" strokeWidth="2" strokeOpacity="0.6" />
                  <path d="M32 135L58 125" stroke="white" strokeWidth="2" strokeOpacity="0.6" />
                  <path d="M118 135L92 125" stroke="white" strokeWidth="2" strokeOpacity="0.6" />
                  {/* The frozen flame itself inside */}
                  <path
                    d="M75 35C75 35 100 68 100 90C100 103.8 88.8 115 75 115C61.2 115 50 103.8 50 90C50 68 75 35 75 35Z"
                    fill="#0EA5E9"
                    fillOpacity="0.85"
                  />
                  {/* Little highlight spark */}
                  <rect x="80" y="55" width="8" height="8" transform="rotate(45 80 55)" fill="white" />
                </svg>
              </div>
            ) : (
              // Unfrozen Fire Graphic - Roaring hot fire!
              <motion.div
                className="relative bg-gradient-to-br from-amber-500 to-red-600 p-8 rounded-full shadow-2xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              >
                {/* Outer pulsing ring */}
                <motion.div
                  className="absolute -inset-4 rounded-full border-4 border-orange-400 opacity-60"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -4, 4, 0]
                  }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Flame size={90} className="text-white fill-white" strokeWidth={1.5} />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Status Text & Instruction */}
        <div className="text-center space-y-3 px-6">
          <AnimatePresence mode="wait">
            {phase === 'frozen' && (
              <motion.div
                key="frozen-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-1.5"
              >
                <h3 className="text-2xl font-black tracking-tight" data-testid="unfreeze-prompt">
                  Tap to unfreeze your streak!
                </h3>
                <p className="text-sky-200/80 text-xs font-semibold">
                  Tapping the ice releases the fire inside.
                </p>
              </motion.div>
            )}

            {phase === 'breaking' && (
              <motion.div
                key="breaking-text"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-1.5"
              >
                <h3 className="text-2xl font-black text-sky-200 tracking-tight animate-pulse">
                  Unleashing heat...
                </h3>
              </motion.div>
            )}

            {phase === 'unfrozen' && (
              <motion.div
                key="unfrozen-text"
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-center gap-1.5 text-amber-300">
                  <Sparkles size={18} fill="currentColor" />
                  <span className="text-[11px] font-black uppercase tracking-wider">STREAK RESTORED!</span>
                </div>
                <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-red-400 tracking-tight">
                  {currentStreak + 1} Days Active!
                </h3>
                <p className="text-orange-200 text-xs font-medium max-w-xs mx-auto">
                  Awesome! Keep up the daily momentum to learn AI.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Byte reacts to your streak */}
        <Mascot
          mood={phase === 'unfrozen' ? 'celebrate' : phase === 'breaking' ? 'happy' : 'sleepy'}
          size={76}
        />
      </div>
    </motion.div>
  );
};
