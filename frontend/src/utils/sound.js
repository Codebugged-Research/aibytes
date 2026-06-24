/*
 * Tiny synthesized UI sounds (Web Audio, no asset files). Call from user
 * gestures so autoplay policies are satisfied. A single shared AudioContext is
 * created lazily and resumed on demand.
 */

let _ctx = null;
const ctx = () => {
  try {
    if (!_ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      _ctx = AC ? new AC() : null;
    }
    if (_ctx && _ctx.state === 'suspended') _ctx.resume();
  } catch (e) {
    _ctx = null;
  }
  return _ctx;
};

// Cheerful ascending arpeggio (C-E-G-C) with a sparkle harmonic — the "you're in" moment.
export function playHappyChime() {
  const c = ctx();
  if (!c) return;
  const t0 = c.currentTime + 0.02;
  const master = c.createGain();
  master.gain.value = 0.2;
  master.connect(c.destination);

  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => {
    const at = t0 + i * 0.1;
    const o = c.createOscillator();
    o.type = 'triangle';
    o.frequency.value = f;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.5, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
    o.connect(g).connect(master);
    o.start(at);
    o.stop(at + 0.55);

    const o2 = c.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = f * 2;
    const g2 = c.createGain();
    g2.gain.setValueAtTime(0.0001, at);
    g2.gain.exponentialRampToValueAtTime(0.16, at + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.0001, at + 0.35);
    o2.connect(g2).connect(master);
    o2.start(at);
    o2.stop(at + 0.4);
  });
}

// Soft tap/blip for button presses and OTP entry.
export function playPop() {
  const c = ctx();
  if (!c) return;
  const t0 = c.currentTime + 0.005;
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(420, t0);
  o.frequency.exponentialRampToValueAtTime(720, t0 + 0.07);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + 0.14);
}
