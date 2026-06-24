import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/*
 * Byte — the AIBites guide mascot.
 * A floating squircle "AI device" in the brand violet, with a lightning-spark
 * antenna (echoes the app logo) and an expressive glowing face. Pure SVG so it
 * scales crisply and tints to any size. Drive expression via the `mood` prop.
 *
 * moods: idle | wave | happy | celebrate | thinking | sad | sleepy
 */

const C = {
  body1: '#8466FF',
  body2: '#5A38F0',
  screen: '#160F33',
  eye: '#CFEFFF',
  blush: '#FF8FB5',
  spark: '#FFFFFF',
  accent: '#8466FF',
};

const OPEN_MOODS = ['idle', 'wave', 'happy', 'talking'];

const L = 49, R = 71, EY = 64; // eye anchor points

function Eyes({ mood, blink }) {
  if (OPEN_MOODS.includes(mood)) {
    if (blink) {
      return (
        <>
          <rect x={L - 5} y={EY - 1.2} width="10" height="2.4" rx="1.2" fill={C.eye} />
          <rect x={R - 5} y={EY - 1.2} width="10" height="2.4" rx="1.2" fill={C.eye} />
        </>
      );
    }
    return (
      <>
        <ellipse cx={L} cy={EY} rx="4.7" ry="6.4" fill={C.eye} />
        <ellipse cx={R} cy={EY} rx="4.7" ry="6.4" fill={C.eye} />
      </>
    );
  }
  if (mood === 'celebrate') {
    const arc = (cx) => `M${cx - 5},${EY + 1} Q${cx},${EY - 7} ${cx + 5},${EY + 1}`;
    return (
      <>
        <path d={arc(L)} stroke={C.eye} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d={arc(R)} stroke={C.eye} strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    );
  }
  if (mood === 'thinking') {
    return (
      <>
        <ellipse cx={L} cy={EY - 3} rx="3.8" ry="4.4" fill={C.eye} />
        <ellipse cx={R} cy={EY - 3} rx="3.8" ry="4.4" fill={C.eye} />
      </>
    );
  }
  if (mood === 'sad') {
    return (
      <>
        <ellipse cx={L} cy={EY + 2} rx="3.8" ry="4.4" fill={C.eye} />
        <ellipse cx={R} cy={EY + 2} rx="3.8" ry="4.4" fill={C.eye} />
        <path d={`M${L - 6},${EY - 6} L${L + 4},${EY - 3}`} stroke={C.eye} strokeWidth="2.4" strokeLinecap="round" />
        <path d={`M${R + 6},${EY - 6} L${R - 4},${EY - 3}`} stroke={C.eye} strokeWidth="2.4" strokeLinecap="round" />
      </>
    );
  }
  if (mood === 'sleepy') {
    const arc = (cx) => `M${cx - 5},${EY - 1} Q${cx},${EY + 5} ${cx + 5},${EY - 1}`;
    return (
      <>
        <path d={arc(L)} stroke={C.eye} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d={arc(R)} stroke={C.eye} strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    );
  }
  return null;
}

function Mouth({ mood }) {
  if (mood === 'talking') {
    return (
      <motion.ellipse
        cx="60" cy="79" rx="5" ry="3" fill="#FF9DBE"
        animate={{ ry: [1.6, 4.6, 2.2, 4.2, 1.8] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    );
  }
  if (mood === 'celebrate') return <path d="M53,75 Q60,87 67,75 Z" fill="#FF9DBE" />;
  if (mood === 'happy' || mood === 'wave') return <path d="M53,77 Q60,84 67,77" stroke={C.eye} strokeWidth="2.6" fill="none" strokeLinecap="round" />;
  if (mood === 'thinking') return <path d="M55,79 Q60,80.5 65,79" stroke={C.eye} strokeWidth="2.4" fill="none" strokeLinecap="round" />;
  if (mood === 'sad') return <path d="M54,82 Q60,76 66,82" stroke={C.eye} strokeWidth="2.6" fill="none" strokeLinecap="round" />;
  if (mood === 'sleepy') return <path d="M57,80 Q60,82 63,80" stroke={C.eye} strokeWidth="2.2" fill="none" strokeLinecap="round" />;
  return <path d="M55,78 Q60,82 65,78" stroke={C.eye} strokeWidth="2.4" fill="none" strokeLinecap="round" />;
}

function Hands({ mood }) {
  const fill = 'url(#byte-body)';
  if (mood === 'wave') {
    return (
      <>
        <ellipse cx="24" cy="74" rx="6.5" ry="7.5" fill={fill} />
        <motion.g
          style={{ transformOrigin: '96px 64px' }}
          animate={{ rotate: [-8, 22, -8] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ellipse cx="96" cy="60" rx="6.5" ry="7.5" fill={fill} />
        </motion.g>
      </>
    );
  }
  if (mood === 'celebrate') {
    return (
      <>
        <ellipse cx="28" cy="48" rx="6.5" ry="7.5" fill={fill} />
        <ellipse cx="92" cy="48" rx="6.5" ry="7.5" fill={fill} />
      </>
    );
  }
  if (mood === 'sad') {
    return (
      <>
        <ellipse cx="25" cy="80" rx="6.5" ry="7.5" fill={fill} />
        <ellipse cx="95" cy="80" rx="6.5" ry="7.5" fill={fill} />
      </>
    );
  }
  return (
    <>
      <ellipse cx="24" cy="74" rx="6.5" ry="7.5" fill={fill} />
      <ellipse cx="96" cy="74" rx="6.5" ry="7.5" fill={fill} />
    </>
  );
}

function Extras({ mood }) {
  if (mood === 'talking') {
    return (
      <>
        <ellipse cx="40" cy="73" rx="3.6" ry="2.3" fill={C.blush} opacity="0.55" />
        <ellipse cx="80" cy="73" rx="3.6" ry="2.3" fill={C.blush} opacity="0.55" />
        {[0, 1, 2].map((k) => (
          <motion.path
            key={k}
            d={`M${95 + k * 5},${56 - k * 2} Q${101 + k * 5},66 ${95 + k * 5},${76 + k * 2}`}
            stroke={C.accent} strokeWidth="2" fill="none" strokeLinecap="round"
            animate={{ opacity: [0, 0.85, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: k * 0.18, ease: 'easeOut' }}
          />
        ))}
      </>
    );
  }
  if (mood === 'wave' || mood === 'celebrate' || mood === 'happy') {
    return (
      <>
        <ellipse cx="40" cy="73" rx="3.6" ry="2.3" fill={C.blush} opacity="0.55" />
        <ellipse cx="80" cy="73" rx="3.6" ry="2.3" fill={C.blush} opacity="0.55" />
      </>
    );
  }
  if (mood === 'sleepy') {
    return (
      <motion.text
        x="88" y="42" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="13" fill={C.accent}
        animate={{ opacity: [0, 1, 0], x: [88, 96, 100], y: [42, 32, 26] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
      >
        z
      </motion.text>
    );
  }
  if (mood === 'thinking') {
    return (
      <motion.g animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.6, repeat: Infinity }}>
        <circle cx="92" cy="46" r="2" fill={C.accent} opacity="0.5" />
        <circle cx="98" cy="40" r="3" fill={C.accent} opacity="0.7" />
      </motion.g>
    );
  }
  return null;
}

const BODY_ANIM = {
  idle: { y: [0, -6, 0] },
  wave: { y: [0, -5, 0], rotate: [0, -3, 3, 0] },
  happy: { y: [0, -7, 0] },
  celebrate: { y: [0, -12, 0] },
  thinking: { rotate: [-3, 3, -3] },
  sad: { y: [0, 3, 0] },
  sleepy: { y: [0, -3, 0] },
  talking: { y: [0, -3, 0] },
};
const BODY_DUR = { idle: 3, wave: 2.4, happy: 1.6, celebrate: 0.9, thinking: 3.2, sad: 2.4, sleepy: 3.8, talking: 2.2 };

export const Mascot = ({ mood = 'idle', size = 96, glow = true, float = true, className = '', onClick, testId }) => {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (!OPEN_MOODS.includes(mood)) return undefined;
    let timer;
    const loop = () => {
      const delay = 2200 + Math.random() * 2600;
      timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 130);
        loop();
      }, delay);
    };
    loop();
    return () => clearTimeout(timer);
  }, [mood]);

  const showOrbit = mood === 'idle' || mood === 'thinking';
  const sparkCelebrate = mood === 'celebrate' || mood === 'talking';

  return (
    <span
      className={`relative inline-block ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size * 1.1 }}
      onClick={onClick}
      data-testid={testId}
    >
      {glow && (
        <motion.span
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: '-16%',
            background: 'radial-gradient(circle, rgba(124,92,255,0.45), rgba(124,92,255,0) 70%)',
            filter: 'blur(6px)',
            zIndex: 0,
          }}
          animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <svg viewBox="0 0 120 132" width={size} height={size * 1.1} className="relative" style={{ zIndex: 1, display: 'block' }}>
        <defs>
          <linearGradient id="byte-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={C.body1} />
            <stop offset="1" stopColor={C.body2} />
          </linearGradient>
          <radialGradient id="byte-hl" cx="0.35" cy="0.25" r="0.7">
            <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {showOrbit && (
          <motion.g
            style={{ transformOrigin: '60px 66px' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
          >
            <circle cx="60" cy="16" r="2" fill={C.accent} opacity="0.5" />
            <circle cx="60" cy="116" r="2.4" fill={C.accent} opacity="0.4" />
          </motion.g>
        )}

        <ellipse cx="60" cy="122" rx="26" ry="5" fill={C.body2} opacity="0.14" />

        <motion.g
          style={{ transformOrigin: '60px 66px' }}
          animate={float ? BODY_ANIM[mood] || BODY_ANIM.idle : {}}
          transition={{ duration: BODY_DUR[mood] || 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* antenna */}
          <line x1="60" y1="34" x2="60" y2="23" stroke={C.accent} strokeWidth="2.4" strokeLinecap="round" />
          <motion.g
            style={{ transformOrigin: '60px 15px' }}
            animate={sparkCelebrate ? { scale: [1, 1.5, 1], opacity: [0.9, 1, 0.9] } : { scale: [1, 1.25, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: sparkCelebrate ? 0.7 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M60,7 L62.4,12.6 L68,15 L62.4,17.4 L60,23 L57.6,17.4 L52,15 L57.6,12.6 Z" fill={C.spark} />
          </motion.g>

          <Hands mood={mood} />

          {/* body */}
          <rect x="26" y="34" width="68" height="64" rx="26" fill="url(#byte-body)" />
          <rect x="26" y="34" width="68" height="64" rx="26" fill="url(#byte-hl)" />

          {/* face screen */}
          <rect x="33" y="45" width="54" height="42" rx="19" fill={C.screen} />
          <g style={{ filter: 'drop-shadow(0 0 3px #8be9ff)' }}>
            <Eyes mood={mood} blink={blink} />
            <Mouth mood={mood} />
          </g>
          <Extras mood={mood} />
        </motion.g>
      </svg>
    </span>
  );
};

/*
 * MascotCoach — Byte plus a speech bubble. Used wherever Byte "talks" to guide
 * the user (home greeting, streak nudges, etc).
 */
export const MascotCoach = ({ mood = 'wave', message, size = 64, side = 'left', className = '', testId }) => {
  const byteFirst = side === 'left';
  const byte = <Mascot mood={mood} size={size} />;
  const bubble = (
    <motion.div
      className="relative bg-white border border-violet-100 rounded-2xl px-4 py-2.5 shadow-sm shadow-violet-100/60 flex-1 min-w-0"
      style={byteFirst ? { borderBottomLeftRadius: 6 } : { borderBottomRightRadius: 6 }}
      initial={{ opacity: 0, scale: 0.9, x: byteFirst ? -8 : 8 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.15 }}
    >
      <p className="text-[13px] font-semibold text-slate-600 leading-snug">{message}</p>
    </motion.div>
  );

  return (
    <div className={`flex items-center gap-2.5 ${className}`} data-testid={testId}>
      {byteFirst ? (<>{byte}{bubble}</>) : (<>{bubble}{byte}</>)}
    </div>
  );
};
