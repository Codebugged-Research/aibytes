import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Heart, Volume2, VolumeX } from 'lucide-react';
import { useLesson } from '../hooks/useData';
import { useProgress } from '../hooks/useProgress';
import { markLessonComplete, addXP, clearLessonProgress, setCurrentLesson } from '../utils/storage';
import { Button, Card } from '../components/ui-components';
import { getIconForEmoji } from '../utils/icons';
import { Mascot } from '../components/Mascot';
import { useNarrator } from '../hooks/useSpeech';
import { buildNarration } from '../utils/narrate';

// ── Particle burst (correct answer celebration) ────────────────────────────────
const BURST_COLORS = ['#10b981','#34d399','#6248FF','#a78bfa','#fbbf24','#f97316','#06b6d4','#ec4899'];

const ParticleBurst = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-30 flex items-center justify-center">
    {Array.from({ length: 16 }, (_, i) => {
      const angle = (i / 16) * Math.PI * 2;
      const dist = 60 + (i % 4) * 22;
      return (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: i % 3 === 0 ? 10 : 7,
            height: i % 3 === 0 ? 10 : 7,
            backgroundColor: BURST_COLORS[i % BURST_COLORS.length],
          }}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1.3, 0.9, 0],
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
          }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.015 }}
        />
      );
    })}
  </div>
);

// ── Option button with correct/wrong reveal animations ────────────────────────
const OptionButton = ({ id, text, selected, onClick, revealState, disabled }) => {
  const base = 'w-full border-2 rounded-2xl p-4 text-left transition-colors duration-200 shadow-sm';
  const getColor = () => {
    if (revealState === 'correct') return 'border-emerald-500 bg-emerald-50 text-emerald-900';
    if (revealState === 'wrong')   return 'border-red-500 bg-rose-50 text-red-950';
    if (selected)                  return 'border-[#6248FF] bg-violet-50 text-violet-900';
    return 'border-slate-200 bg-white text-slate-700';
  };
  const getDot = () => {
    if (revealState === 'correct') return 'border-emerald-500 bg-emerald-500';
    if (revealState === 'wrong')   return 'border-red-500 bg-red-500';
    if (selected)                  return 'border-[#6248FF] bg-[#6248FF]';
    return 'border-slate-300 bg-white';
  };

  return (
    <motion.button
      onClick={!disabled ? onClick : undefined}
      data-testid={`option-${id}`}
      className={`${base} ${getColor()}`}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      animate={
        revealState === 'correct'
          ? { scale: [1, 1.04, 0.99, 1], transition: { duration: 0.38 } }
          : revealState === 'wrong'
          ? { x: [0, -10, 10, -6, 6, -2, 2, 0], transition: { duration: 0.46 } }
          : {}
      }
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${getDot()}`}>
          {revealState === 'correct' && <Check size={12} className="text-white" strokeWidth={3.5} />}
          {revealState === 'wrong'   && <X    size={12} className="text-white" strokeWidth={3.5} />}
          {!revealState && selected  && <Check size={12} className="text-white" strokeWidth={3.5} />}
        </div>
        <span className="font-extrabold text-sm leading-tight">{text}</span>
      </div>
    </motion.button>
  );
};

// ── Teach card ────────────────────────────────────────────────────────────────
const KIND_LABEL = {
  hook: 'Hook', definition: 'Definition', analogy: 'Analogy',
  example: 'Example', mythbust: 'Myth Buster', visual: 'Compare', compare: 'Compare',
};

// One karaoke word — lights up as Byte reads it aloud
const KWord = ({ tok, kind, talking, activeWord }) => {
  const italic = tok.italic ? ' italic' : '';
  const reading = talking && activeWord >= 0;
  let cls;
  if (reading && tok.wi === activeWord) {
    cls = 'bg-[#6248FF] text-white rounded-[5px] px-1';
  } else if (reading && tok.wi < activeWord) {
    cls = kind === 'title' ? 'text-slate-900' : (tok.bold ? 'text-slate-700 font-bold' : 'text-slate-600');
  } else if (reading) {
    cls = 'text-slate-300';
  } else {
    cls = kind === 'title' ? 'text-slate-900' : (tok.bold ? 'text-slate-700 font-bold' : 'text-slate-500');
  }
  return (<><span className={`transition-colors duration-150 ${cls}${italic}`}>{tok.text}</span>{' '}</>);
};

// ── Teach card — Byte pops up and reads the lesson aloud ──────────────────────
const TeachCard = ({ card }) => {
  const { activeWord, talking, enabled, supported, play, stop, toggle } = useNarrator();
  const narration = useMemo(() => buildNarration(card.title, card.body), [card.title, card.body]);

  // Auto-read only once the user has opted in — play() no-ops while voice is off
  useEffect(() => {
    play(narration);
    return () => stop();
  }, [narration, play, stop]);

  const handleToggle = () => { if (toggle()) play(narration); };
  const handleByteTap = () => { if (enabled) play(narration); else if (toggle()) play(narration); };

  return (
    <Card testId={`teach-card-${card.kind}`} className="space-y-5 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="px-2.5 py-0.5 rounded-lg bg-violet-50 border border-violet-100 shadow-sm">
          <span className="text-[10px] uppercase tracking-wider text-violet-600 font-extrabold">{KIND_LABEL[card.kind] || card.kind}</span>
        </div>
        {supported && (
          <button
            onClick={handleToggle}
            data-testid="voice-toggle"
            aria-label={enabled ? 'Mute Byte' : 'Let Byte read aloud'}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
              enabled
                ? 'bg-slate-50 border-slate-200 text-slate-500 hover:text-violet-600 hover:border-violet-200'
                : 'bg-[#6248FF] border-violet-500 text-white shadow-sm shadow-violet-200'
            }`}
          >
            {enabled ? <Volume2 size={15} strokeWidth={2.4} /> : <VolumeX size={15} strokeWidth={2.4} />}
          </button>
        )}
      </div>

      {/* Enable-voice prompt — shown on every card while sound is off, placed
          above Byte so it never overlaps the character */}
      {supported && !enabled && (
        <motion.button
          type="button"
          onClick={handleByteTap}
          data-testid="voice-hint"
          className="w-full flex items-center justify-center gap-2 bg-violet-50 border border-violet-200 text-[#6248FF] text-xs font-extrabold rounded-xl py-2.5"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
        >
          <Volume2 size={15} strokeWidth={2.6} />
          Tap to hear Byte read this aloud
        </motion.button>
      )}

      <div className="flex flex-col items-center pt-1">
        <motion.div
          className="relative"
          initial={{ scale: 0, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          {talking && (
            <motion.span
              className="absolute rounded-full pointer-events-none"
              style={{ inset: '-8%', border: '2px solid rgba(98,72,255,0.35)' }}
              animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
          <Mascot mood={talking ? 'talking' : 'thinking'} size={88} onClick={handleByteTap} testId="teach-byte" />
        </motion.div>
        {supported && (
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
            {talking ? 'Byte is reading…' : enabled ? 'Tap Byte to replay' : 'Tap to hear Byte'}
          </div>
        )}
      </div>

      <h2 className="text-xl font-extrabold leading-tight text-center">
        {narration.titleTokens.map((tok, i) => (
          <KWord key={i} tok={tok} kind="title" talking={talking} activeWord={activeWord} />
        ))}
      </h2>

      <p className="text-sm font-medium leading-relaxed">
        {narration.bodyTokens.map((tok, i) => (tok.br
          ? <br key={i} />
          : <KWord key={i} tok={tok} kind="body" talking={talking} activeWord={activeWord} />))}
      </p>

      {card.compare && (
        <div className="grid grid-cols-2 gap-4 pt-2">
          {[card.compare.left, card.compare.right].map((side) => (
            <div key={side.tag} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-3 shadow-sm">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">{side.tag}</div>
              <div className="flex justify-center">{getIconForEmoji(side.emoji, { size: 28, className: 'text-slate-700' })}</div>
              <div className="text-xs font-bold text-slate-700 leading-normal" dangerouslySetInnerHTML={{ __html: side.text }} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// ── Exercise card (no inline explanation — it lives in the bottom panel) ───────
const ExerciseCard = ({ exercise, selectedAnswer, onAnswerSelect, onFillBlank, isRevealed }) => {
  const getReveal = (optId) => {
    if (!isRevealed) return null;
    if (exercise.type === 'fill_blank') {
      return selectedAnswer === optId ? (optId === exercise.blank ? 'correct' : 'wrong') : null;
    }
    if (selectedAnswer === optId) {
      return exercise.options.find(o => o.id === optId)?.correct ? 'correct' : 'wrong';
    }
    return null;
  };

  return (
    <div className="space-y-5">
      <Card testId="exercise-card" className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-100 shadow-sm">
        <div className="space-y-3">
          <div className="px-2.5 py-0.5 rounded-lg bg-violet-100/60 border border-violet-150 inline-block shadow-sm">
            <span className="text-[10px] uppercase tracking-wider text-violet-750 font-extrabold">
              {exercise.type === 'true_false' ? 'True or False' :
               exercise.type === 'fill_blank' ? 'Fill in the Blank' :
               exercise.type === 'boss' ? 'Final Challenge' : 'Question'}
            </span>
          </div>
          <p className="text-lg font-extrabold text-slate-900 leading-snug">{exercise.prompt}</p>
          {exercise.sentence && (
            <p className="text-sm text-slate-500 italic border-l-2 border-violet-600 pl-3.5 py-0.5 font-medium">
              {exercise.sentence}
            </p>
          )}
        </div>
      </Card>

      <div className="space-y-2.5">
        {exercise.type === 'fill_blank'
          ? exercise.words.map(word => (
              <OptionButton key={word} id={word} text={word}
                selected={selectedAnswer === word}
                onClick={() => onFillBlank(word)}
                revealState={getReveal(word)}
                disabled={isRevealed}
              />
            ))
          : exercise.options.map(opt => (
              <OptionButton key={opt.id} id={opt.id} text={opt.text}
                selected={selectedAnswer === opt.id}
                onClick={() => onAnswerSelect(opt.id)}
                revealState={getReveal(opt.id)}
                disabled={isRevealed}
              />
            ))}
      </div>
    </div>
  );
};

// ── Main lesson player ────────────────────────────────────────────────────────
export const LessonPlayer = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { lesson, loading } = useLesson(lessonId);
  const { refreshProgress } = useProgress();

  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex]   = useState(0);
  const [selectedAnswer, setSelectedAnswer]         = useState(null);
  const [isCorrect, setIsCorrect]                   = useState(null);
  const [showExplanation, setShowExplanation]       = useState(false);
  const [earnedXP, setEarnedXP]                     = useState(0);
  const [showCompletion, setShowCompletion]         = useState(false);

  // Gamification state
  const [hearts, setHearts]             = useState(3);
  const [animatingHeart, setAnimatingHeart] = useState(-1);
  const [correctStreak, setCorrectStreak]   = useState(0);
  const [showBurst, setShowBurst]           = useState(false);
  const [flashBg, setFlashBg]               = useState(null); // 'correct' | 'wrong' | null
  const [screenShake, setScreenShake]       = useState(false);

  useEffect(() => {
    if (lesson) { setCurrentSegmentIndex(0); setCurrentCardIndex(0); }
  }, [lesson]);

  if (loading || !lesson) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#F8FAFC]">
        <Mascot mood="thinking" size={96} />
      </div>
    );
  }

  // ── Completion screen ───────────────────────────────────────────────────────
  if (showCompletion) {
    const totalXP = lesson.xp + earnedXP;
    const particles = Array.from({ length: 16 }, (_, i) => ({
      angle: (i / 16) * 360,
      color: ['#6248FF','#10B981','#FF6B35','#FFE27C','#8B5CF6','#34D399','#06B6D4','#EC4899'][i % 8],
      delay: i * 0.04,
    }));

    return (
      <div className="h-full w-full bg-[#F8FAFC] flex items-center justify-center px-6">
        <motion.div
          className="max-w-md w-full space-y-6 text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <div className="relative flex justify-center">
            {particles.map((p, i) => (
              <motion.div key={i} className="absolute w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{ scale: [0, 1.2, 0.6], x: Math.cos((p.angle * Math.PI) / 180) * 90, y: Math.sin((p.angle * Math.PI) / 180) * 90, opacity: [1, 1, 0] }}
                transition={{ delay: 0.3 + p.delay, duration: 0.8, ease: 'easeOut' }}
              />
            ))}
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 18 }}>
              <Mascot mood="celebrate" size={124} />
            </motion.div>
          </div>

          <div className="space-y-2">
            <motion.h1
              className="text-3xl font-extrabold text-slate-900 tracking-tight"
              data-testid="lesson-complete-title"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            >
              Lesson Complete!
            </motion.h1>
            <motion.div
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.65, type: 'spring' }}
            >
              <Zap size={18} className="text-[#6248FF]" fill="#6248FF" />
              <span className="text-slate-700 font-black text-xl">
                +<motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >{totalXP}</motion.span> XP
              </span>
            </motion.div>
          </div>

          {hearts > 0 && (
            <motion.div
              className="flex items-center justify-center gap-1.5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            >
              {[0,1,2].map(i => (
                <Heart key={i} size={18} fill={i < hearts ? '#ef4444' : '#e2e8f0'} className={i < hearts ? 'text-red-500' : 'text-slate-200'} strokeWidth={0} />
              ))}
              {hearts === 3 && <span className="text-xs font-black text-slate-500 ml-1">Perfect!</span>}
            </motion.div>
          )}

          <Card testId="completion-card" className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-100 shadow-sm">
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <Zap size={18} className="text-violet-600" strokeWidth={2.5} />
                <span>Key Takeaway</span>
              </div>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed">{lesson.concept}</p>
            </div>
          </Card>

          <div className="space-y-3 pt-2">
            <Button onClick={() => navigate('/path')} className="w-full font-bold text-sm py-4" testId="continue-button">
              Continue Learning
            </Button>
            <Button onClick={() => navigate('/')} variant="secondary" className="w-full font-bold text-sm py-4" testId="back-home-button">
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Guards ──────────────────────────────────────────────────────────────────
  const currentSegment = lesson.segments?.[currentSegmentIndex];
  if (!currentSegment) return null;

  const isTeachSegment = currentSegment.type === 'teach';
  const currentContent = isTeachSegment
    ? currentSegment.cards[currentCardIndex]
    : currentSegment.exercises[currentCardIndex];
  const totalItems  = isTeachSegment ? currentSegment.cards.length : currentSegment.exercises.length;
  const progress    = ((currentSegmentIndex * 100) + (currentCardIndex / totalItems * 100)) / lesson.segments.length;
  const explanation = !isTeachSegment ? (currentContent?.explain || currentContent?.explanation) : null;
  const xpForThis   = !isTeachSegment ? (currentContent?.xp || 2) : 0;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const resetExerciseState = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false);
  };

  const moveToNextSegment = () => {
    if (currentSegmentIndex < lesson.segments.length - 1) {
      setCurrentSegmentIndex(currentSegmentIndex + 1);
      setCurrentCardIndex(0);
      resetExerciseState();
    } else {
      markLessonComplete(lessonId, earnedXP);
      clearLessonProgress(lessonId);
      const [unitPart, lessonPart] = lessonId.split('-');
      const unitNum   = parseInt(unitPart.replace('u', ''), 10);
      const lessonNum = parseInt(lessonPart.replace('l', ''), 10);
      const LESSONS_PER_UNIT = 5;
      const TOTAL_UNITS = 3;
      let nextLessonId;
      if (lessonNum < LESSONS_PER_UNIT) {
        nextLessonId = `u${unitNum}-l${lessonNum + 1}`;
      } else if (unitNum < TOTAL_UNITS - 1) {
        nextLessonId = `u${unitNum + 1}-l1`;
      } else {
        nextLessonId = 'u0-l1';
      }
      setCurrentLesson(nextLessonId);
      refreshProgress();
      setShowCompletion(true);
    }
  };

  const handleNext = () => {
    if (isTeachSegment) {
      if (currentCardIndex < currentSegment.cards.length - 1) setCurrentCardIndex(currentCardIndex + 1);
      else moveToNextSegment();
      return;
    }

    if (!selectedAnswer) return;

    if (!showExplanation) {
      // Reveal answer
      setShowExplanation(true);

      if (isCorrect) {
        // Correct
        const xp = xpForThis;
        setEarnedXP(prev => prev + xp);
        addXP(xp);
        refreshProgress();
        setCorrectStreak(prev => prev + 1);
        setShowBurst(true);
        setFlashBg('correct');
        setTimeout(() => { setShowBurst(false); setFlashBg(null); }, 800);
      } else {
        // Wrong
        setCorrectStreak(0);
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 500);
        setFlashBg('wrong');
        setTimeout(() => setFlashBg(null), 600);
        if (hearts > 0) {
          const idx = hearts - 1;
          setAnimatingHeart(idx);
          setTimeout(() => { setHearts(prev => Math.max(0, prev - 1)); setAnimatingHeart(-1); }, 380);
        }
      }
    } else {
      // Move on
      if (currentCardIndex < currentSegment.exercises.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        resetExerciseState();
      } else {
        moveToNextSegment();
      }
    }
  };

  const handleAnswerSelect = (optionId) => {
    if (showExplanation) return;
    setSelectedAnswer(optionId);
    const correct = currentContent.options.find(opt => opt.id === optionId)?.correct;
    setIsCorrect(correct);
  };

  const handleFillBlank = (word) => {
    if (showExplanation) return;
    setSelectedAnswer(word);
    setIsCorrect(word === currentContent.blank);
  };

  // Bottom panel button label + style
  const btnDisabled = !isTeachSegment && !selectedAnswer;
  const btnLabel = isTeachSegment
    ? 'CONTINUE'
    : showExplanation ? (isCorrect ? 'CONTINUE' : 'GOT IT') : 'CHECK';
  const btnClass = btnDisabled
    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
    : showExplanation && isCorrect
    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
    : showExplanation && !isCorrect
    ? 'bg-red-500 text-white shadow-lg shadow-red-100'
    : 'bg-[#6248FF] text-white shadow-lg shadow-violet-100';

  return (
    <motion.div
      className="h-full w-full bg-[#F8FAFC] flex flex-col overflow-hidden relative"
      animate={screenShake ? { x: [0, -8, 8, -5, 5, -2, 2, 0] } : {}}
      transition={{ duration: 0.45 }}
    >
      {/* ── Flash overlay ───────────────────────────────────────────── */}
      <AnimatePresence>
        {flashBg && (
          <motion.div
            className={`absolute inset-0 z-20 pointer-events-none ${flashBg === 'correct' ? 'bg-emerald-400/12' : 'bg-red-400/12'}`}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      {/* ── Particle burst ──────────────────────────────────────────── */}
      <AnimatePresence>{showBurst && <ParticleBurst />}</AnimatePresence>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur-xl border-b border-slate-100 px-5 pt-3.5 pb-3 z-40">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm"
            data-testid="close-lesson-button"
          >
            <X size={17} className="text-slate-700" strokeWidth={2.5} />
          </button>

          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {lesson.title}
          </div>

          {/* Hearts */}
          <div className="flex items-center gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={animatingHeart === i
                  ? { scale: [1, 1.6, 0.5, 1.1, 1], rotate: [0, -12, 12, -4, 0], y: [0, -6, 2, 0] }
                  : {}}
                transition={{ duration: 0.4 }}
              >
                <Heart
                  size={17}
                  fill={i < hearts || i === animatingHeart ? '#ef4444' : '#e2e8f0'}
                  className={i < hearts || i === animatingHeart ? 'text-red-500' : 'text-slate-200'}
                  strokeWidth={0}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#6248FF] rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* ── Content area ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-52 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentSegmentIndex}-${currentCardIndex}`}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {isTeachSegment
              ? <TeachCard card={currentContent} />
              : <ExerciseCard
                  exercise={currentContent}
                  selectedAnswer={selectedAnswer}
                  onAnswerSelect={handleAnswerSelect}
                  onFillBlank={handleFillBlank}
                  isRevealed={showExplanation}
                />
            }
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom panel (Duolingo-style) ───────────────────────────── */}
      <motion.div
        className={`absolute bottom-0 left-0 right-0 z-40 rounded-t-3xl border-t transition-colors duration-300 ${
          showExplanation && isCorrect  ? 'bg-emerald-50 border-emerald-200' :
          showExplanation && !isCorrect ? 'bg-rose-50 border-red-200' :
          'bg-white border-slate-100'
        }`}
        layout
        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      >
        {/* Feedback area */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="px-5 pt-5 pb-1"
            >
              {isCorrect ? (
                <div className="flex items-start gap-3">
                  <Mascot mood="celebrate" size={52} glow={false} className="flex-shrink-0 -mt-1" />
                  <div className="flex-1">
                    <p className="text-emerald-700 font-black text-xl leading-none mb-1">Amazing!</p>
                    <div className="flex items-center gap-2">
                      <p className="text-emerald-500 text-xs font-bold">+{xpForThis} XP earned</p>
                      {correctStreak >= 2 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, delay: 0.15 }}
                          className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full"
                        >
                          🔥 {correctStreak}x combo
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Mascot mood="sad" size={52} glow={false} className="flex-shrink-0 -my-1" />
                    <p className="text-red-600 font-black text-xl">Incorrect</p>
                  </div>
                  {explanation && (
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed pl-1">{explanation}</p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action button */}
        <div className="px-5 py-4">
          <motion.button
            onClick={handleNext}
            disabled={btnDisabled}
            data-testid="next-button"
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-colors duration-200 ${btnClass}`}
            whileTap={!btnDisabled ? { scale: 0.97 } : {}}
          >
            {btnLabel}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
