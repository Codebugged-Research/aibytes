import { useState, useRef, useEffect, useCallback } from 'react';
import { wordAtChar } from '../utils/narrate';
import { getVoiceEnabled, setVoiceEnabled } from '../utils/storage';

// Female voices only. The Web Speech API exposes no reliable gender field, so we
// match well-known female voice names first, then any voice flagged "female",
// then any English voice that isn't a known male voice.
const FEMALE_VOICES = [
  'Google US English', 'Google UK English Female',
  'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Zira', 'Microsoft Michelle', 'Microsoft Eva', 'Microsoft Hazel',
  'Samantha', 'Karen', 'Moira', 'Tessa', 'Fiona', 'Victoria', 'Allison', 'Ava', 'Susan', 'Zoe', 'Serena', 'Catherine', 'Kate', 'Veena', 'Nicky',
];
const MALE_VOICES = [
  'Daniel', 'Alex', 'Fred', 'Albert', 'Aaron', 'Arthur', 'Gordon', 'Rishi', 'Oliver', 'Thomas', 'Reed', 'Rocko', 'Ralph', 'Bruce',
  'Microsoft David', 'Microsoft Mark', 'Microsoft Guy', 'Google UK English Male',
];

const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

/*
 * Narrator hook. play(narration) reads the card aloud while exposing the
 * currently-spoken `activeWord` index for karaoke highlighting. Falls back to a
 * timed highlight when the platform has no TTS voices, so the visual narration
 * always runs. `enabled` is persisted to localStorage and user-toggleable.
 */
export const useNarrator = () => {
  const [activeWord, setActiveWord] = useState(-1);
  const [talking, setTalking] = useState(false);
  const [enabled, setEnabled] = useState(getVoiceEnabled());

  const enabledRef = useRef(enabled);
  const timerRef = useRef(null);
  const uttRef = useRef(null);
  const voicesRef = useRef([]);
  const sessionRef = useRef(0);
  const watchdogRef = useRef(null);
  const safetyRef = useRef(null);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  useEffect(() => {
    if (!isSupported) return undefined;
    const load = () => { voicesRef.current = window.speechSynthesis.getVoices() || []; };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  const pickVoice = useCallback((voices) => {
    const all = voices && voices.length ? voices : voicesRef.current;
    if (!all || !all.length) return null;
    const isMale = (v) => {
      const n = (v.name || '').toLowerCase();
      if (/\bmale\b/.test(n) && !/female/.test(n)) return true;       // "...Male", not "Female"
      return MALE_VOICES.some((m) => n.includes(m.toLowerCase()));
    };
    const english = all.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
    const pool = english.length ? english : all;
    // 1) known female voices, in priority order
    for (const name of FEMALE_VOICES) {
      const v = pool.find((x) => !isMale(x) && (x.name === name || x.name.includes(name)));
      if (v) return v;
    }
    // 2) any voice whose name advertises "female"
    const flagged = pool.find((x) => /female/i.test(x.name) || /female/i.test(x.voiceURI || ''));
    if (flagged) return flagged;
    // 3) any voice that isn't a known male voice
    const notMale = pool.find((x) => !isMale(x));
    if (notMale) return notMale;
    // 4) last resort
    return pool[0];
  }, []);

  // Resolve a non-empty voice list. Chrome loads voices lazily, so wait for the
  // `voiceschanged` event (with a timeout fallback) before speaking — otherwise
  // the utterance speaks with the OS default voice (which may be male).
  const ensureVoices = useCallback((cb) => {
    if (!isSupported) { cb([]); return; }
    const synth = window.speechSynthesis;
    const have = synth.getVoices() || [];
    if (have.length) { cb(have); return; }
    let done = false;
    const onChange = () => {
      if (done) return;
      const vv = synth.getVoices() || [];
      if (vv.length) { done = true; synth.removeEventListener('voiceschanged', onChange); cb(vv); }
    };
    synth.addEventListener('voiceschanged', onChange);
    setTimeout(() => {
      if (done) return;
      done = true;
      synth.removeEventListener('voiceschanged', onChange);
      cb(synth.getVoices() || []);
    }, 800);
  }, []);

  const stop = useCallback(() => {
    sessionRef.current += 1;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
    if (safetyRef.current) { clearTimeout(safetyRef.current); safetyRef.current = null; }
    if (isSupported) { try { window.speechSynthesis.cancel(); } catch (e) { /* noop */ } }
    uttRef.current = null;
    setTalking(false);
    setActiveWord(-1);
  }, []);

  const play = useCallback((narration) => {
    if (!narration || !enabledRef.current) return;
    const { speakText, ranges, wordCount } = narration;
    if (!wordCount) return;

    stop();
    const session = sessionRef.current;          // unique id for this narration
    const alive = () => sessionRef.current === session;
    setTalking(true);
    setActiveWord(0);

    // Per-word durations proportional to spoken length, scaled to the estimated
    // speech duration (~13 chars/sec). Keeps the highlight tracking the audio even
    // when the voice emits no word-boundary events.
    const weights = ranges.map((r) => (r.end - r.start) + 1);
    const totalW = weights.reduce((a, b) => a + b, 0) || 1;
    const estTotal = Math.max(1400, (speakText.length / 13) * 1000);
    const durs = weights.map((w) => Math.max(150, (w / totalW) * estTotal));

    let i = 0;
    let audioStarted = false;
    let started = false;
    let usedBoundary = false;

    const finish = () => {
      if (!alive()) return;
      sessionRef.current += 1;
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
      if (safetyRef.current) { clearTimeout(safetyRef.current); safetyRef.current = null; }
      setTalking(false);
      setActiveWord(-1);
    };

    const advance = () => {
      if (!alive() || usedBoundary) return;
      i += 1;
      if (i >= wordCount) {
        if (!audioStarted) timerRef.current = setTimeout(finish, durs[wordCount - 1]);
        return;
      }
      setActiveWord(i);
      timerRef.current = setTimeout(advance, durs[i]);
    };

    const beginHighlight = () => {
      if (!alive() || started || usedBoundary) return;
      started = true;
      timerRef.current = setTimeout(advance, durs[0]);
    };

    if (isSupported) {
      try {
        const synth = window.speechSynthesis;
        const u = new SpeechSynthesisUtterance(speakText);
        u.rate = 1.0;
        u.pitch = 1.05;
        u.volume = 1;
        u.onstart = () => { if (alive()) beginHighlight(); };
        u.onboundary = (e) => {
          if (!alive()) return;
          if (e.name && e.name !== 'word') return;
          const idx = wordAtChar(ranges, e.charIndex);
          if (idx < 0) return;
          usedBoundary = true;
          started = true;
          if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
          setActiveWord(idx);
        };
        u.onend = () => { if (alive()) finish(); };
        u.onerror = () => { if (alive()) finish(); };
        uttRef.current = u;
        audioStarted = true;
        // Pick a female voice once voices have loaded, then speak. cancel +
        // deferred speak + resume sidesteps Chrome's "speak does nothing right
        // after cancel" bug (which left the highlight running with no audio).
        ensureVoices((voices) => {
          if (!alive()) return;
          const v = pickVoice(voices);
          if (v) u.voice = v;
          try { synth.cancel(); } catch (e) { /* noop */ }
          setTimeout(() => {
            if (!alive()) return;
            try { synth.speak(u); synth.resume(); } catch (e) { /* noop */ }
          }, 45);
        });
      } catch (e) {
        audioStarted = false;
      }
    }

    if (audioStarted) {
      // begin the estimated highlight shortly after audio starts; onstart/onboundary
      // refine it when the voice supports those events
      safetyRef.current = setTimeout(() => { safetyRef.current = null; beginHighlight(); }, 380);
    } else {
      beginHighlight();
    }

    watchdogRef.current = setTimeout(finish, estTotal + 4000);
  }, [pickVoice, ensureVoices, stop]);

  const toggle = useCallback(() => {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    setVoiceEnabled(next);
    if (!next) stop();
    return next;
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return { activeWord, talking, enabled, supported: isSupported, play, stop, toggle };
};
