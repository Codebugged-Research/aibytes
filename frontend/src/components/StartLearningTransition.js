import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Relative positions [rx, ry] — multiplied by canvas dimensions at runtime
const NODE_DEFS = [
  [0.50, 0.50], // 0 — seed (center)
  [0.33, 0.38], // 1
  [0.67, 0.38], // 2 — TARGET node (lights up → lesson card)
  [0.28, 0.60], // 3
  [0.72, 0.60], // 4
  [0.20, 0.26], // 5
  [0.50, 0.20], // 6
  [0.80, 0.26], // 7
  [0.14, 0.52], // 8
  [0.86, 0.52], // 9
  [0.24, 0.76], // 10
  [0.50, 0.80], // 11
  [0.76, 0.76], // 12
];

// [fromIdx, toIdx, startT] — startT in 0..1 of BRANCH phase, each edge reveals over 0.45
const EDGE_DEFS = [
  [0, 1, 0.00], [0, 2, 0.04], [0, 3, 0.08], [0, 4, 0.12],
  [1, 5, 0.20], [1, 6, 0.24], [2, 6, 0.22], [2, 7, 0.28],
  [3, 8, 0.30], [4, 9, 0.33],
  [1, 2, 0.38], [3, 4, 0.40],
  [5, 6, 0.45], [6, 7, 0.47],
  [3, 10, 0.42], [4, 12, 0.44],
  [8, 10, 0.52], [9, 12, 0.54],
  [10, 11, 0.60], [11, 12, 0.63],
];

const TARGET = 2;
const EDGE_DUR = 0.45;

const SPAWN_END  = 20;
const BRANCH_END = 80;
const FLASH_END  = 108;

const easeOut   = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
const clamp     = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function drawEdge(ctx, a, b, progress, alpha) {
  if (progress <= 0 || alpha <= 0) return;
  const tx = a.x + (b.x - a.x) * progress;
  const ty = a.y + (b.y - a.y) * progress;

  // Glow layer
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(tx, ty);
  ctx.strokeStyle = `rgba(139,92,246,${0.18 * alpha})`;
  ctx.lineWidth = 5;
  ctx.stroke();

  // Core line
  const g = ctx.createLinearGradient(a.x, a.y, tx, ty);
  g.addColorStop(0, `rgba(109,40,217,${0.55 * alpha})`);
  g.addColorStop(1, `rgba(167,139,250,${0.85 * alpha})`);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(tx, ty);
  ctx.strokeStyle = g;
  ctx.lineWidth = 1.3;
  ctx.stroke();
}

function drawNode(ctx, x, y, r, isTarget, alpha) {
  if (r <= 0 || alpha <= 0) return;

  const glowR = r * 3.8;
  const gc = isTarget ? '167,139,250' : '124,58,237';
  const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
  glow.addColorStop(0, `rgba(${gc},${0.4 * alpha})`);
  glow.addColorStop(1, `rgba(${gc},0)`);
  ctx.beginPath();
  ctx.arc(x, y, glowR, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  const core = ctx.createRadialGradient(x - r*0.3, y - r*0.3, 0, x, y, r);
  if (isTarget) {
    core.addColorStop(0, `rgba(255,255,255,${alpha})`);
    core.addColorStop(0.5, `rgba(196,181,253,${alpha})`);
    core.addColorStop(1, `rgba(109,40,217,${alpha})`);
  } else {
    core.addColorStop(0, `rgba(196,181,253,${alpha})`);
    core.addColorStop(1, `rgba(109,40,217,${alpha})`);
  }
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = core;
  ctx.fill();
}

function drawPulse(ctx, a, b, t) {
  const trailT = Math.max(0, t - 0.18);
  const x0 = a.x + (b.x - a.x) * trailT;
  const y0 = a.y + (b.y - a.y) * trailT;
  const x1 = a.x + (b.x - a.x) * t;
  const y1 = a.y + (b.y - a.y) * t;

  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, 'rgba(196,181,253,0)');
  g.addColorStop(1, 'rgba(255,255,255,0.92)');
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = g;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x1, y1, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.fill();
}

export const StartLearningTransition = ({ isVisible, onDone }) => {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width;
    const H = canvas.height;

    const nodes = NODE_DEFS.map(([rx, ry]) => ({ x: rx * W, y: ry * H }));
    const pulses = [];
    let lastPulseF = 0;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0f0a1e');
      bg.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      if (frame < SPAWN_END) {
        // Phase 1: seed dot blooms in
        const t = easeOut(frame / SPAWN_END);
        drawNode(ctx, nodes[0].x, nodes[0].y, t * 8, false, t);

      } else if (frame < BRANCH_END) {
        // Phase 2: network expands outward
        const bt = (frame - SPAWN_END) / (BRANCH_END - SPAWN_END); // 0..1

        // Draw edges
        EDGE_DEFS.forEach(([fi, ti, startT]) => {
          const progress = clamp((bt - startT) / EDGE_DUR, 0, 1);
          drawEdge(ctx, nodes[fi], nodes[ti], easeOut(progress), 1);
        });

        // Draw nodes — appear once their best incoming edge is 70%+ revealed
        nodes.forEach((n, i) => {
          if (i === 0) { drawNode(ctx, n.x, n.y, 8, false, 1); return; }
          const bestProg = Math.max(0, ...EDGE_DEFS.filter(e => e[1] === i).map(([,, s]) =>
            easeOut(clamp((bt - s) / EDGE_DUR, 0, 1))
          ));
          if (bestProg < 0.6) return;
          const nt = (bestProg - 0.6) / 0.4;
          drawNode(ctx, n.x, n.y, easeOut(nt) * 7, i === TARGET, easeOut(nt));
        });

        // Spawn data pulses on fully-revealed edges
        if (frame - lastPulseF > 9 && bt > 0.35) {
          const ready = EDGE_DEFS.filter(([fi, ti, s]) =>
            easeOut(clamp((bt - s) / EDGE_DUR, 0, 1)) >= 0.97
          );
          if (ready.length) {
            const [fi, ti] = ready[Math.floor(Math.random() * ready.length)];
            pulses.push({ fi, ti, t: 0 });
            lastPulseF = frame;
          }
        }
        for (let i = pulses.length - 1; i >= 0; i--) {
          pulses[i].t = Math.min(pulses[i].t + 0.055, 1);
          if (pulses[i].t < 1) drawPulse(ctx, nodes[pulses[i].fi], nodes[pulses[i].ti], pulses[i].t);
          else pulses.splice(i, 1);
        }

      } else {
        // Phase 3: target node lights up and expands to fill screen
        const ft = easeInOut((frame - BRANCH_END) / (FLASH_END - BRANCH_END));
        const networkAlpha = 1 - ft;

        // Fade out network
        EDGE_DEFS.forEach(([fi, ti]) => drawEdge(ctx, nodes[fi], nodes[ti], 1, networkAlpha));
        nodes.forEach((n, i) => {
          if (i === TARGET) return;
          drawNode(ctx, n.x, n.y, 7, false, networkAlpha * 0.9);
        });

        // Target node expands into full-screen flash
        const tn = nodes[TARGET];
        const expandR = 7 + easeOut(ft) * Math.max(W, H) * 1.1;

        const glow = ctx.createRadialGradient(tn.x, tn.y, 0, tn.x, tn.y, expandR * 2.2);
        glow.addColorStop(0, `rgba(221,214,254,${clamp(ft * 1.6, 0, 1)})`);
        glow.addColorStop(0.35, `rgba(139,92,246,${ft * 0.7})`);
        glow.addColorStop(1, 'rgba(109,40,217,0)');
        ctx.beginPath();
        ctx.arc(tn.x, tn.y, expandR * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        const core = ctx.createRadialGradient(tn.x, tn.y, 0, tn.x, tn.y, expandR);
        core.addColorStop(0, `rgba(255,255,255,${clamp(ft * 2.2, 0, 1)})`);
        core.addColorStop(0.4, `rgba(196,181,253,${ft})`);
        core.addColorStop(1, 'rgba(109,40,217,0)');
        ctx.beginPath();
        ctx.arc(tn.x, tn.y, expandR, 0, Math.PI * 2);
        ctx.fillStyle = core;
        ctx.fill();

        if (frame >= FLASH_END) {
          cancelAnimationFrame(animRef.current);
          onDoneRef.current?.();
          return;
        }
      }

      frame++;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="nn-transition"
          className="absolute inset-0 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.08 }}
        >
          <canvas ref={canvasRef} className="w-full h-full block" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
