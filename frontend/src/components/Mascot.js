import { motion } from 'framer-motion';

/*
 * Byte — the AIBites mascot. Uses the branded character artwork (the AI-hoodie
 * boy + sidekick bot) mapped to moods, with a gentle float and a real eye-blink
 * (a closed-eye frame cross-faded over the open one on a loop).
 *
 * moods: idle | wave | happy | celebrate | thinking | sad | sleepy | talking
 */
const SRC = {
  idle: '/mascot/wave.png?v=7',
  wave: '/mascot/wave.png?v=7',
  talking: '/mascot/talking.png?v=2',
  happy: '/mascot/celebrate.png?v=2',
  celebrate: '/mascot/celebrate.png?v=2',
  thinking: '/mascot/thinking.png?v=2',
  sad: '/mascot/sad.png?v=2',
  sleepy: '/mascot/sad.png?v=2',
};

// eyes-closed frame per mood (omit -> no blink, e.g. sleepy already closed)
const BLINK = {
  idle: '/mascot/wave-blink.png?v=7',
  wave: '/mascot/wave-blink.png?v=7',
  talking: '/mascot/talking-blink.png?v=2',
  happy: '/mascot/celebrate-blink.png?v=2',
  celebrate: '/mascot/celebrate-blink.png?v=2',
  thinking: '/mascot/thinking-blink.png?v=2',
  sad: '/mascot/sad-blink.png?v=2',
};

const FLOAT = {
  idle: { y: [0, -5, 0] },
  wave: { y: [0, -5, 0], rotate: [0, -1.5, 1.5, 0] },
  happy: { y: [0, -7, 0] },
  celebrate: { y: [0, -10, 0] },
  thinking: { y: [0, -3, 0] },
  sad: { y: [0, 2, 0] },
  sleepy: { y: [0, -2, 0] },
  talking: { y: [0, -4, 0] },
};
const FLOAT_DUR = { idle: 3, wave: 2.6, happy: 1.9, celebrate: 1.1, thinking: 3.2, sad: 2.8, sleepy: 3.8, talking: 2.4 };

const imgStyle = { objectFit: 'contain', transformOrigin: '50% 82%' };

export const Mascot = ({ mood = 'idle', size = 96, glow = true, float = false, className = '', onClick, testId }) => {
  const src = SRC[mood] || SRC.idle;
  const blinkSrc = BLINK[mood];

  return (
    <span
      className={`relative inline-block ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      data-testid={testId}
    >
      {glow && (
        <motion.span
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: '4%',
            background: 'radial-gradient(circle at 50% 46%, rgba(124,92,255,0.38), rgba(124,92,255,0) 68%)',
            filter: 'blur(8px)',
            zIndex: 0,
          }}
          animate={{ opacity: [0.45, 0.8, 0.45], scale: [1, 1.07, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <motion.div
        className="relative w-full h-full"
        style={{ zIndex: 1 }}
        animate={float ? (FLOAT[mood] || FLOAT.idle) : {}}
        transition={{ duration: FLOAT_DUR[mood] || 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img src={src} alt="Byte mascot" draggable={false} className="w-full h-full select-none" style={imgStyle} />
        {blinkSrc && (
          <motion.img
            src={blinkSrc}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 w-full h-full select-none pointer-events-none"
            style={imgStyle}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'linear', times: [0, 0.93, 0.945, 0.965, 0.98, 1] }}
          />
        )}
      </motion.div>
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
