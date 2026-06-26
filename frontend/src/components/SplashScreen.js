import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mascot } from './Mascot';

const TAGLINE = 'Master AI in 10 minutes';
const LOADING_TIPS = [
  'Neural networks learn from examples...',
  'GPT = Generative Pre-trained Transformer',
  'LLMs predict the next word, one at a time',
  'AI sees images as grids of numbers',
];

// ── Canvas neural-network particle background ──────────────────────────────────
function useParticleCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W   = window.innerWidth;
    const H   = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const N   = 50;
    const pts = Array.from({ length: N }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r:  1.2 + Math.random() * 1.8,
      a:  0.2 + Math.random() * 0.45,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx   = pts[i].x - pts[j].x;
          const dy   = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(100,130,220,${0.22 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      pts.forEach(p => {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        g.addColorStop(0, `rgba(120,160,240,${p.a * 0.5})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160,190,255,${p.a})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [canvasRef]);
}

// ── Shockwave rings that fire once ────────────────────────────────────────────
const ShockwaveRings = () => (
  <>
    {[0, 0.14, 0.28].map((delay, i) => (
      <motion.div
        key={i}
        className="absolute rounded-[36px] border-2 border-white/25"
        style={{ inset: -(i * 12) - 8 }}
        initial={{ scale: 1, opacity: 0 }}
        animate={{ scale: [1, 2.6], opacity: [0.55, 0] }}
        transition={{ duration: 0.85, delay: 0.52 + delay, ease: 'easeOut' }}
      />
    ))}
  </>
);

export const SplashScreen = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [progress, setProgress]     = useState(0);
  const [phase, setPhase]           = useState('loading');
  const [typed, setTyped]           = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [tipIdx, setTipIdx]         = useState(0);

  useParticleCanvas(canvasRef);

  // Progress bar — fills over ~1.6s
  useEffect(() => {
    const step = 100 / (1600 / 28);
    const iv   = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(iv); setPhase('done'); return 100; }
        return Math.min(p + step, 100);
      });
    }, 28);
    const done = setTimeout(onComplete, 2500);
    return () => { clearInterval(iv); clearTimeout(done); };
  }, [onComplete]);

  // Typing tagline starts at 1.1s
  useEffect(() => {
    let i = 0, iv;
    const start = setTimeout(() => {
      iv = setInterval(() => {
        setTyped(TAGLINE.slice(0, ++i));
        if (i >= TAGLINE.length) {
          clearInterval(iv);
          setTimeout(() => setShowCursor(false), 700);
        }
      }, 40);
    }, 1100);
    return () => { clearTimeout(start); clearInterval(iv); };
  }, []);

  // Cycle AI tips
  useEffect(() => {
    const iv = setInterval(() => setTipIdx(t => (t + 1) % LOADING_TIPS.length), 1100);
    return () => clearInterval(iv);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#07060f 0%,#0b0922 55%,#11093a 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Ambient colour blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle,rgba(45,90,200,0.18),transparent)', top: '5%', left: '-15%' }}
          animate={{ x: [0, 28, 0], y: [0, -18, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle,rgba(60,100,220,0.14),transparent)', bottom: '8%', right: '-8%' }}
          animate={{ x: [0, -22, 0], y: [0, 16, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute w-56 h-56 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle,rgba(100,60,200,0.1),transparent)', top: '55%', left: '58%' }}
          animate={{ scale: [1, 1.35, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      </div>

      {/* Content column */}
      <div className="relative z-10 flex flex-col items-center gap-7 px-8 w-full max-w-sm text-center">

        {/* ── LOGO hero ─────────────────────────────────────────────── */}
        <div className="relative flex items-center justify-center">
          {/* Shockwave that fires when logo lands */}
          <ShockwaveRings />

          {/* Slow-spinning dashed ring */}
          <motion.div
            className="absolute rounded-[40px] border-2 border-dashed"
            style={{ inset: -18, borderColor: 'rgba(100,140,255,0.22)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          />
          {/* Counter-spinning ring */}
          <motion.div
            className="absolute rounded-[48px] border border-dashed"
            style={{ inset: -30, borderColor: 'rgba(100,140,255,0.12)' }}
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />

          {/* Breathing glow behind logo */}
          <motion.div
            className="absolute rounded-[32px] blur-2xl"
            style={{ background: 'linear-gradient(135deg,#1a3a9f,#2d55cc)', inset: -6 }}
            animate={{ opacity: [0.45, 0.8, 0.45], scale: [1, 1.18, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Logo card — drops in from above */}
          <motion.div
            className="relative bg-white rounded-[28px] shadow-2xl overflow-hidden"
            style={{ padding: 14 }}
            initial={{ y: -120, opacity: 0, scale: 0.82, rotate: -6 }}
            animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 175, damping: 14, delay: 0.1 }}
          >
            <img
              src="/kidlin-logo.png"
              alt="Kidlin"
              style={{ width: 88, height: 88, objectFit: 'contain', display: 'block' }}
            />
          </motion.div>

          {/* Byte peeks in to greet you */}
          <motion.div
            className="absolute"
            style={{ bottom: -28, right: -34, zIndex: 20 }}
            initial={{ opacity: 0, scale: 0, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.95, type: 'spring', stiffness: 300, damping: 16 }}
          >
            <Mascot mood="wave" size={64} />
          </motion.div>
        </div>

        {/* ── Brand name — letter by letter ─────────────────────────── */}
        <div>
          <h1
            className="text-5xl font-black tracking-tight flex justify-center"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {'AIBites'.split('').map((char, i) => (
              <motion.span
                key={i}
                className="inline-block"
                style={{ color: i < 2 ? '#93c5fd' : '#ffffff' }}
                initial={{ opacity: 0, y: 36, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.48 + i * 0.07, type: 'spring', stiffness: 360, damping: 18 }}
              >
                {char}
              </motion.span>
            ))}
          </h1>

          {/* Typing tagline */}
          <motion.div
            className="h-5 mt-3 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05 }}
          >
            <span className="text-blue-300/70 text-xs font-bold tracking-[0.18em] uppercase">
              {typed}
              {showCursor && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.55, repeat: Infinity }}
                  className="inline-block ml-px"
                >|</motion.span>
              )}
            </span>
          </motion.div>
        </div>

        {/* ── Loading section ───────────────────────────────────────── */}
        <motion.div
          className="w-full space-y-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {/* Progress bar */}
          <div
            className="w-44 mx-auto h-1 rounded-full overflow-hidden relative"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(147,197,253,0.4),transparent)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="h-full rounded-full absolute left-0 top-0"
              style={{ background: 'linear-gradient(90deg,#1d4ed8,#60a5fa)' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.06, ease: 'linear' }}
            />
          </div>

          {/* Status text */}
          <AnimatePresence mode="wait">
            {phase === 'done' ? (
              <motion.div
                key="ready"
                className="flex items-center justify-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <motion.div
                  className="w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, repeat: 2 }}
                >
                  <span className="text-[8px] text-white font-black">✓</span>
                </motion.div>
                <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Ready!</span>
              </motion.div>
            ) : (
              <motion.p
                key="pct"
                className="text-blue-400/50 text-[10px] font-bold uppercase tracking-widest"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {Math.round(progress)}%
              </motion.p>
            )}
          </AnimatePresence>

          {/* Cycling AI tip */}
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIdx}
              className="text-[10px] font-medium"
              style={{ color: 'rgba(147,197,253,0.45)' }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              {LOADING_TIPS[tipIdx]}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* ── Decorative dots ───────────────────────────────────────── */}
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
        >
          {[0, 1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'rgba(96,165,250,0.35)' }}
              animate={{ scale: [1, 1.7, 1], opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};
