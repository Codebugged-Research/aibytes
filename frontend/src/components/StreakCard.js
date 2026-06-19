import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Snowflake, Flame } from 'lucide-react';
import { setStreak, getStreak } from '../utils/storage';

/* ─── Fire particle ──────────────────────────────────────────────────────── */
const PARTICLE_COUNT = 22;

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function createParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    angle: randomBetween(0, 360),          // degrees
    speed: randomBetween(48, 130),          // px distance
    size:  randomBetween(5, 16),            // px
    delay: randomBetween(0, 0.08),          // seconds
    color: ['#FF6B35','#FF4500','#FFD700','#FF8C00','#FFA500','#FF3D00'][
      Math.floor(Math.random() * 6)
    ],
    shape: Math.random() > 0.4 ? 'circle' : 'spark'
  }));
}

function FireParticle({ p, active }) {
  if (!active) return null;
  const rad = (p.angle * Math.PI) / 180;
  const tx  = Math.cos(rad) * p.speed;
  const ty  = Math.sin(rad) * p.speed;

  return (
    <motion.div
      key={p.id}
      className="absolute top-1/2 left-1/2 pointer-events-none z-30"
      style={{ translateX: '-50%', translateY: '-50%' }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: tx, y: ty,
        opacity: 0,
        scale: p.shape === 'spark' ? 0.2 : 0,
      }}
      transition={{
        duration: 0.65,
        delay: p.delay,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {p.shape === 'circle' ? (
        <div
          style={{
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size * 1.5}px ${p.color}`,
          }}
        />
      ) : (
        // Spark — thin elongated streak
        <div
          style={{
            width: p.size * 2.5,
            height: p.size * 0.35,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${p.color}, transparent)`,
            transform: `rotate(${p.angle}deg)`,
          }}
        />
      )}
    </motion.div>
  );
}

/* ─── Ice crystal background ─────────────────────────────────────────────── */
function IceCrystals() {
  return (
    <>
      {/* Corner ice spikes */}
      {[
        { top: '8%',  left: '10%',  rotate: -15, scale: 0.7 },
        { top: '12%', right: '8%',  rotate:  20, scale: 0.55 },
        { bottom:'10%', left:'8%',  rotate:  10, scale: 0.6  },
        { bottom:'8%',  right:'10%',rotate: -20, scale: 0.65 },
      ].map((s, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ ...s }}
          animate={{ opacity: [0.25, 0.55, 0.25], scale: [s.scale, s.scale * 1.1, s.scale] }}
          transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
            <path d="M9 0 L9 24 M0 6 L18 18 M18 6 L0 18" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </motion.div>
      ))}
    </>
  );
}

/* ─── Main StreakCard ─────────────────────────────────────────────────────── */
export const StreakCard = ({ streak, onStreakUpdated }) => {
  const [iced,     setIced]     = useState(true);
  const [bursting, setBursting] = useState(false);
  const [particles, setParticles] = useState([]);
  const [localStreak, setLocalStreak] = useState(streak);

  // Sync if external streak changes (e.g. on load)
  useEffect(() => { setLocalStreak(streak); }, [streak]);

  const handleTap = useCallback(() => {
    if (!iced || bursting) return;

    // 1. Generate particles
    setParticles(createParticles());
    setBursting(true);

    // 2. Update streak in storage
    const newStreak = getStreak() + 1;
    setStreak(newStreak);
    setLocalStreak(newStreak);
    onStreakUpdated?.();

    // 3. After burst completes, switch to fire mode
    setTimeout(() => {
      setIced(false);
      setBursting(false);
    }, 750);
  }, [iced, bursting, onStreakUpdated]);

  return (
    <motion.div
      className="relative cursor-pointer"
      whileTap={iced ? { scale: 0.88 } : { scale: 0.93 }}
      onClick={handleTap}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
    >
      {/* Particle burst layer */}
      <AnimatePresence>
        {bursting && particles.map(p => (
          <FireParticle key={p.id} p={p} active={bursting} />
        ))}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {iced ? (
          /* ─── ICE STATE ──────────────────────────────────────── */
          <motion.div
            key="ice"
            className="relative rounded-2xl p-4 text-center space-y-1 shadow-sm overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #eff6ff 100%)',
              border: '1.5px solid #93c5fd',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0, scale: 1.15,
              filter: 'brightness(2)',
              transition: { duration: 0.2 }
            }}
          >
            <IceCrystals />

            {/* Frost sheen sweep */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            />

            {/* Snowflake */}
            <motion.div
              className="relative z-10"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <Snowflake
                size={24}
                className="mx-auto"
                style={{ color: '#3b82f6', filter: 'drop-shadow(0 0 6px #93c5fd)' }}
                strokeWidth={2}
              />
            </motion.div>

            {/* Count */}
            <motion.div
              className="text-xl font-extrabold relative z-10"
              style={{ color: '#1d4ed8' }}
              animate={{ textShadow: ['0 0 0px #93c5fd', '0 0 10px #93c5fd', '0 0 0px #93c5fd'] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              {localStreak}
            </motion.div>

            {/* Label */}
            <div className="text-[9px] font-extrabold uppercase tracking-wider relative z-10" style={{ color: '#3b82f6' }}>
              Tap to thaw!
            </div>
          </motion.div>

        ) : (
          /* ─── FIRE STATE ──────────────────────────────────────── */
          <motion.div
            key="fire"
            className="bg-[#FFF4F0] border border-orange-100 rounded-2xl p-4 text-center space-y-1 shadow-sm relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
          >
            {/* Fire glow behind */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              animate={{ opacity: [0, 0.35, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ background: 'radial-gradient(ellipse at center, rgba(255,107,53,0.4) 0%, transparent 70%)' }}
            />

            <motion.div
              className="relative z-10"
              animate={{ rotate: [0, -6, 6, -4, 4, 0], scale: [1, 1.12, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.5 }}
            >
              <Flame
                size={24}
                className="mx-auto"
                style={{ color: '#FF6B35', filter: 'drop-shadow(0 0 8px #FF6B35)' }}
                strokeWidth={2.5}
              />
            </motion.div>

            <motion.div
              key={localStreak}
              className="text-xl font-extrabold text-slate-900 relative z-10"
              initial={{ scale: 1.6, y: -4, color: '#FF6B35' }}
              animate={{ scale: 1, y: 0, color: '#0F172A' }}
              transition={{ type: 'spring', stiffness: 400, damping: 14 }}
            >
              {localStreak}
            </motion.div>

            <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider relative z-10">
              Streak 🔥
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
