import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const lerp  = (a, b, t) => a + (b - a) * t;
const easeOut = (t, p = 3) => 1 - Math.pow(1 - t, p);
const easeIn  = (t, p = 3) => Math.pow(t, p);

// Frame boundaries (60fps)
const PE = 24;   // enter ends
const PB = 40;   // brake ends
const PD = 58;   // idle ends
const PC = 118;  // countdown ends (3 numbers × 20f)
const PL = 148;  // launch ends

const COLORS = [
  { hex: '#8b5cf6', r: 139, g: 92,  b: 246 },
  { hex: '#6366f1', r: 99,  g: 102, b: 241 },
  { hex: '#22d3ee', r: 34,  g: 211, b: 238 },
  { hex: '#a78bfa', r: 167, g: 139, b: 250 },
];

function rgba(col, a) {
  return `rgba(${col.r},${col.g},${col.b},${a})`;
}

// Sleek side-view F1 car facing LEFT
function drawCar(ctx, cx, cy, opts = {}) {
  const { shake = 0, tilt = 0, headlights = false, spinL = 0, spinR = 0 } = opts;

  ctx.save();
  ctx.translate(cx + shake, cy);
  ctx.rotate(tilt);

  // Ground shadow ellipse
  const sh = ctx.createRadialGradient(4, 26, 5, 4, 26, 88);
  sh.addColorStop(0, 'rgba(0,0,0,0.55)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.ellipse(4, 26, 86, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = sh;
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.moveTo(-72, 8);
  ctx.bezierCurveTo(-84, 8, -84, -6, -68, -13);
  ctx.lineTo(-20, -23);
  ctx.bezierCurveTo(-10, -31, 10, -31, 20, -23);
  ctx.lineTo(54, -19);
  ctx.bezierCurveTo(71, -16, 73, -3, 68, 8);
  ctx.closePath();
  const bodyG = ctx.createLinearGradient(0, -31, 0, 8);
  bodyG.addColorStop(0, '#f1f5f9');
  bodyG.addColorStop(0.6, '#dde4ed');
  bodyG.addColorStop(1, '#afc0d0');
  ctx.fillStyle = bodyG;
  ctx.fill();
  ctx.strokeStyle = 'rgba(100,116,139,0.22)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Violet racing stripe
  ctx.fillStyle = 'rgba(124,58,237,0.82)';
  ctx.fillRect(-62, -11, 116, 4);

  // Cockpit glass
  ctx.beginPath();
  ctx.moveTo(-16, -23);
  ctx.bezierCurveTo(-8, -33, 8, -33, 18, -23);
  ctx.closePath();
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-8, -27);
  ctx.bezierCurveTo(-2, -32, 5, -32, 9, -27);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Front wing (left)
  ctx.beginPath();
  ctx.moveTo(-64, 8);
  ctx.lineTo(-92, 8);
  ctx.lineTo(-96, 19);
  ctx.lineTo(-58, 19);
  ctx.closePath();
  ctx.fillStyle = '#1e293b';
  ctx.fill();
  ctx.fillStyle = 'rgba(124,58,237,0.9)';
  ctx.fillRect(-96, 15, 14, 4);

  // Rear wing vertical strut
  ctx.fillStyle = '#334155';
  ctx.fillRect(56, -22, 6, 22);

  // Rear wing horizontal
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(44, -44, 26, 8);
  ctx.fillStyle = 'rgba(124,58,237,0.7)';
  ctx.fillRect(44, -44, 26, 2.5);

  // Headlight glow
  if (headlights) {
    ctx.save();
    const hl = ctx.createRadialGradient(-84, 1, 0, -84, 1, 38);
    hl.addColorStop(0, 'rgba(255,252,200,0.95)');
    hl.addColorStop(0.45, 'rgba(255,248,186,0.45)');
    hl.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(-84, 1, 38, 0, Math.PI * 2);
    ctx.fillStyle = hl;
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = headlights ? '#fef08a' : 'rgba(226,232,240,0.3)';
  ctx.fillRect(-86, -7, 9, 7);

  // Taillights (always red)
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(68, -10, 6, 10);

  // Wheels
  const wheel = (wx, wy, spin) => {
    ctx.beginPath();
    ctx.arc(wx, wy, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#111827';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(wx, wy, 10, 0, Math.PI * 2);
    const rg = ctx.createRadialGradient(wx - 3, wy - 3, 0, wx, wy, 10);
    rg.addColorStop(0, '#64748b');
    rg.addColorStop(1, '#374151');
    ctx.fillStyle = rg;
    ctx.fill();

    // Spokes
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    for (let s = 0; s < 5; s++) {
      const a = spin + (s / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(wx + Math.cos(a) * 3, wy + Math.sin(a) * 3);
      ctx.lineTo(wx + Math.cos(a) * 13, wy + Math.sin(a) * 13);
      ctx.strokeStyle = '#94a3b8';
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(wx, wy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();
  };

  wheel(-48, 18, spinL);
  wheel(46, 18, spinR);

  ctx.restore();
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
    const dpr = window.devicePixelRatio || 1;

    canvas.width  = canvas.offsetWidth  * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    const groundY = H * 0.57;
    const CAR_Y   = groundY - 34;
    const CAR_MID = W / 2;

    // Particle pools
    const smoke       = [];
    const launchParts = [];
    const skids = [
      { wx: CAR_MID - 48, len: 0 },
      { wx: CAR_MID + 46, len: 0 },
    ];

    let frame = 0;
    let spinL = 0, spinR = 0;

    const addSmoke = (x, y, exhaust = true) => {
      smoke.push({
        x, y,
        vx: exhaust ? (1.1 + Math.random() * 0.9) : ((Math.random() - 0.5) * 2),
        vy: -(0.35 + Math.random() * 0.6),
        r:    exhaust ? 4  : 1.5,
        maxR: exhaust ? (10 + Math.random() * 7) : 3,
        life: 1,
        decay: exhaust ? 0.022 : 0.075,
      });
    };

    const addLaunchParticle = (x, y, lt) => {
      const isNeural = Math.random() < lt;
      const col = COLORS[Math.floor(Math.random() * COLORS.length)];
      launchParts.push({
        x, y,
        vx: 1.2 + Math.random() * 4.5,
        vy: (Math.random() - 0.5) * 2.2,
        r:    isNeural ? (2 + Math.random() * 3.5) : (1 + Math.random() * 1.5),
        life: 1,
        decay: 0.03 + Math.random() * 0.045,
        col,
        isNeural,
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // ── Background ─────────────────────────────────────────────────
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#08070f');
      bg.addColorStop(0.5, '#0c0a1e');
      bg.addColorStop(1, '#101030');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Subtle purple grid
      ctx.strokeStyle = 'rgba(124,58,237,0.04)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 36) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += 36) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      // Road
      const roadG = ctx.createLinearGradient(0, groundY, 0, groundY + 28);
      roadG.addColorStop(0, '#1c1c2e');
      roadG.addColorStop(1, '#0a0a14');
      ctx.fillStyle = roadG;
      ctx.fillRect(0, groundY, W, H - groundY);

      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();

      // Road centre dashes
      for (let rx = 0; rx < W; rx += 38) {
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(rx, groundY + 11, 20, 3);
      }

      // ── Phase calc ─────────────────────────────────────────────────
      let carX = CAR_MID, shake = 0, tilt = 0, headlights = false;

      if (frame < PE) {
        // ENTER: fast slide from right
        const t = easeOut(frame / PE, 5);
        carX = lerp(W + 140, CAR_MID, t);
        const spd = 1 - t * 0.8;
        spinL -= 0.22 * spd;
        spinR -= 0.22 * spd;

      } else if (frame < PB) {
        // BRAKE: overshoot + shake + skids + headlight blink
        const bt = (frame - PE) / (PB - PE);
        carX = CAR_MID + Math.sin(bt * Math.PI) * 12;
        shake = (Math.random() - 0.5) * (1 - bt) * 9;
        tilt  = Math.sin(bt * Math.PI) * 0.048;        // nose dips
        headlights = Math.floor(frame / 4) % 2 === 0;   // blink
        spinL -= 0.04;
        spinR -= 0.04;
        skids[0].len = easeOut(bt, 2) * 72;
        skids[1].len = easeOut(bt, 2) * 72;
        if (frame % 3 === 0) {
          addSmoke(CAR_MID - 48, groundY - 1, false);
          addSmoke(CAR_MID + 46, groundY - 1, false);
        }

      } else if (frame < PD) {
        // IDLE: engine vibration + exhaust puffs
        carX  = CAR_MID + Math.sin(frame * 0.95) * 1.1;
        shake = Math.sin(frame * 15) * 0.75;
        if (frame % 10 === 0) addSmoke(carX + 78, CAR_Y + 7, true);
        // Tiny wheel shimmy particles
        if (frame % 6 === 0) {
          smoke.push({
            x: CAR_MID - 48 + (Math.random() - 0.5) * 22, y: groundY,
            vx: (Math.random() - 0.5) * 2, vy: -0.3,
            r: 1, maxR: 2, life: 0.7, decay: 0.09,
          });
        }

      } else if (frame < PC) {
        // COUNTDOWN: still idling
        carX  = CAR_MID + Math.sin(frame * 0.95) * 0.9;
        shake = Math.sin(frame * 15) * 0.45;
        if (frame % 14 === 0) addSmoke(carX + 78, CAR_Y + 7, true);

      } else {
        // LAUNCH: accelerate off screen left
        const lt  = (frame - PC) / (PL - PC);
        const acc = easeIn(lt, 2.5);
        carX  = lerp(CAR_MID, -170, acc);
        tilt  = -easeIn(lt, 2) * 0.07;           // nose lifts
        spinL -= 0.16 + acc * 0.65;
        spinR -= 0.16 + acc * 0.65;

        const rearX = carX + 78 + acc * 18;
        if (rearX > -10 && frame % 2 === 0) {
          addLaunchParticle(rearX, CAR_Y + 6, lt);
          addLaunchParticle(rearX, CAR_Y + 6, lt);
          if (lt > 0.3) addLaunchParticle(rearX, CAR_Y + 2, lt);
        }

        // Brief violet screen flash at launch start
        if (lt < 0.15) {
          const fa = Math.sin((lt / 0.15) * Math.PI) * 0.28;
          ctx.fillStyle = `rgba(124,58,237,${fa})`;
          ctx.fillRect(0, 0, W, H);
        }
      }

      // Spotlight on ground under car while idling / countdown
      if (frame >= PB && frame < PC) {
        const sg = ctx.createRadialGradient(carX, groundY, 0, carX, groundY, 90);
        sg.addColorStop(0, 'rgba(139,92,246,0.09)');
        sg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.ellipse(carX, groundY, 90, 18, 0, 0, Math.PI * 2);
        ctx.fillStyle = sg;
        ctx.fill();
      }

      // ── Skid marks ─────────────────────────────────────────────────
      skids.forEach(s => {
        if (s.len <= 0) return;
        const g = ctx.createLinearGradient(s.wx, 0, s.wx + s.len, 0);
        g.addColorStop(0, 'rgba(18,12,38,0)');
        g.addColorStop(0.15, 'rgba(12,8,28,0.72)');
        g.addColorStop(1, 'rgba(12,8,28,0.52)');
        ctx.fillStyle = g;
        ctx.fillRect(s.wx, groundY - 3, s.len, 7);
      });

      // ── Smoke particles ─────────────────────────────────────────────
      for (let i = smoke.length - 1; i >= 0; i--) {
        const p = smoke[i];
        p.x += p.vx; p.y += p.vy;
        p.r   = Math.min(p.r + 0.22, p.maxR);
        p.life -= p.decay;
        if (p.life <= 0) { smoke.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(155,150,180,${p.life * 0.28})`;
        ctx.fill();
      }

      // ── Launch particles + circuit connections ──────────────────────
      if (frame >= PC) {
        // Circuit lines between neural nodes
        for (let i = 0; i < launchParts.length; i++) {
          const a = launchParts[i];
          if (!a.isNeural) continue;
          for (let j = i + 1; j < launchParts.length; j++) {
            const b = launchParts[j];
            if (!b.isNeural) continue;
            const dx = a.x - b.x, dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 44) {
              const lineA = Math.min(a.life, b.life) * (1 - dist / 44) * 0.55;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(139,92,246,${lineA})`;
              ctx.lineWidth = 0.7;
              ctx.stroke();
            }
          }
        }

        for (let i = launchParts.length - 1; i >= 0; i--) {
          const p = launchParts[i];
          p.x += p.vx; p.y += p.vy;
          p.life -= p.decay;
          if (p.life <= 0) { launchParts.splice(i, 1); continue; }

          if (p.isNeural) {
            // Outer glow
            ctx.save();
            ctx.globalAlpha = p.life * 0.45;
            const gw = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4.5);
            gw.addColorStop(0, p.col.hex);
            gw.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 4.5, 0, Math.PI * 2);
            ctx.fillStyle = gw;
            ctx.fill();
            ctx.restore();

            // Core dot
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.col.hex;
            ctx.fill();
            ctx.restore();
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(155,150,180,${p.life * 0.38})`;
            ctx.fill();
          }
        }
      }

      // ── GO! text at launch start ────────────────────────────────────
      if (frame >= PC && frame < PC + 18) {
        const gt = (frame - PC) / 18;
        const ga = Math.sin(gt * Math.PI);
        ctx.save();
        ctx.globalAlpha = ga;
        ctx.translate(W / 2, CAR_Y - 90);
        ctx.scale(1 + gt * 0.25, 1 + gt * 0.25);
        ctx.font = '900 52px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 24;
        ctx.fillStyle = '#22d3ee';
        ctx.fillText('GO!', 0, 0);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // ── Car ─────────────────────────────────────────────────────────
      drawCar(ctx, carX, CAR_Y, { shake, tilt, headlights, spinL, spinR });

      // ── Countdown 3 → 2 → 1 ────────────────────────────────────────
      if (frame >= PD && frame < PC) {
        const cdF    = frame - PD;
        const numIdx = Math.floor(cdF / 20);
        const numT   = (cdF % 20) / 20;
        const num    = 3 - numIdx;

        let scale, alpha;
        if (numT < 0.2) {
          scale = easeOut(numT / 0.2, 2) * 1.06;
          alpha = easeOut(numT / 0.2);
        } else if (numT < 0.72) {
          scale = 1;
          alpha = 1;
        } else {
          const ft = (numT - 0.72) / 0.28;
          scale = 1 + ft * 0.09;
          alpha = 1 - ft;
        }

        const glowCol = num === 1 ? '#22d3ee' : num === 2 ? '#a78bfa' : '#8b5cf6';
        ctx.save();
        ctx.translate(W / 2, CAR_Y - 90);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;
        ctx.font = '900 72px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = glowCol;
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(String(num), 0, 0);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      // ── Done ────────────────────────────────────────────────────────
      frame++;
      if (frame >= PL) {
        cancelAnimationFrame(animRef.current);
        onDoneRef.current?.();
        return;
      }
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="race-transition"
          className="absolute inset-0 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.06 }}
        >
          <canvas ref={canvasRef} className="w-full h-full block" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
