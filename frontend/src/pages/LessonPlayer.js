import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check, XCircle, Trophy, Zap } from 'lucide-react';
import { useLesson } from '../hooks/useData';
import { useProgress } from '../hooks/useProgress';
import { markLessonComplete, addXP, clearLessonProgress, setCurrentLesson } from '../utils/storage';
import { Button, Card } from '../components/ui-components';
import { getIconForEmoji } from '../utils/icons';

export const LessonPlayer = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { lesson, loading } = useLesson(lessonId);
  const { refreshProgress } = useProgress();
  
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    if (lesson) {
      setCurrentSegmentIndex(0);
      setCurrentCardIndex(0);
    }
  }, [lesson]);

  if (loading || !lesson) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#F8FAFC]">
        <motion.div className="relative">
          <motion.div
            className="absolute inset-0 bg-violet-400 rounded-full blur-xl opacity-30"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
          >
            <Zap size={48} className="text-violet-600 relative z-10" fill="#7c3aed" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const currentSegment = lesson.segments[currentSegmentIndex];
  const isTeachSegment = currentSegment.type === 'teach';
  const currentContent = isTeachSegment 
    ? currentSegment.cards[currentCardIndex]
    : currentSegment.exercises[currentCardIndex];

  const totalItems = isTeachSegment 
    ? currentSegment.cards.length 
    : currentSegment.exercises.length;

  const progress = ((currentSegmentIndex * 100) + (currentCardIndex / totalItems * 100)) / lesson.segments.length;

  const handleNext = () => {
    if (isTeachSegment) {
      if (currentCardIndex < currentSegment.cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        moveToNextSegment();
      }
    } else {
      if (!selectedAnswer) return;
      
      if (!showExplanation) {
        setShowExplanation(true);
      } else {
        if (isCorrect) {
          const xp = currentContent.xp || 2;
          setEarnedXP(prev => prev + xp);
          addXP(xp);
          refreshProgress();
        }
        
        if (currentCardIndex < currentSegment.exercises.length - 1) {
          setCurrentCardIndex(currentCardIndex + 1);
          resetExerciseState();
        } else {
          moveToNextSegment();
        }
      }
    }
  };

  const moveToNextSegment = () => {
    if (currentSegmentIndex < lesson.segments.length - 1) {
      setCurrentSegmentIndex(currentSegmentIndex + 1);
      setCurrentCardIndex(0);
      resetExerciseState();
    } else {
      completeLesson();
    }
  };

  const completeLesson = () => {
    markLessonComplete(lessonId, earnedXP);
    clearLessonProgress(lessonId);
    
    const lessonIndex = parseInt(lessonId.split('-l')[1], 10);
    const nextLessonId = `u0-l${lessonIndex + 1}`;
    setCurrentLesson(nextLessonId);
    
    refreshProgress();
    setShowCompletion(true);
  };

  const resetExerciseState = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false);
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
    const correct = word === currentContent.blank;
    setIsCorrect(correct);
  };

  const handleClose = () => {
    navigate('/');
  };

  if (showCompletion) {
    // Confetti particle positions
    const particles = Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * 360,
      color: ['#6248FF','#10B981','#FF6B35','#FFE27C','#8B5CF6','#34D399'][i % 6],
      delay: i * 0.04
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
            {/* Confetti burst */}
            {particles.map((p, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{ backgroundColor: p.color }}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1, 0.6],
                  x: Math.cos((p.angle * Math.PI) / 180) * 80,
                  y: Math.sin((p.angle * Math.PI) / 180) * 80,
                  opacity: [1, 1, 0]
                }}
                transition={{ delay: 0.3 + p.delay, duration: 0.75, ease: 'easeOut' }}
              />
            ))}

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 18 }}
            >
              <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] mx-auto flex items-center justify-center mb-6 shadow-lg shadow-emerald-200"
                animate={{ boxShadow: [
                  '0 8px 24px rgba(16,185,129,0.3)',
                  '0 8px 40px rgba(16,185,129,0.6)',
                  '0 8px 24px rgba(16,185,129,0.3)'
                ] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy size={48} className="text-white" strokeWidth={2} />
              </motion.div>
            </motion.div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight" data-testid="lesson-complete-title">
              Lesson Complete!
            </h1>
            <p className="text-slate-500 text-base font-bold">
              You earned <span className="text-violet-600 font-extrabold">{lesson.xp + earnedXP} XP</span>
            </p>
          </div>

          <Card testId="completion-card" className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-100 shadow-sm">
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <Zap size={18} className="text-violet-600" strokeWidth={2.5} />
                <span>Key Takeaway</span>
              </div>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                {lesson.concept}
              </p>
            </div>
          </Card>

          <div className="space-y-3 pt-2">
            <Button 
              onClick={() => navigate('/path')}
              className="w-full font-bold text-sm py-4"
              testId="continue-button"
            >
              Continue Learning
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="secondary"
              className="w-full font-bold text-sm py-4"
              testId="back-home-button"
            >
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#F8FAFC] flex flex-col justify-between overflow-hidden relative">
      {/* Header */}
      <div className="w-full z-50 bg-white/95 backdrop-blur-xl border-b border-slate-150 py-4 px-6 flex-shrink-0 relative">
        <div className="flex items-center justify-between mb-3.5">
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 hover:bg-slate-50 transition-colors shadow-sm"
            data-testid="close-lesson-button"
          >
            <X size={18} className="text-slate-800" strokeWidth={2.5} />
          </button>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {lesson.title}
          </div>
          <div className="w-9" />
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-violet-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 w-full py-8 px-6 overflow-y-auto pb-36">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentSegmentIndex}-${currentCardIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {isTeachSegment ? (
              <TeachCard card={currentContent} />
            ) : (
              <ExerciseCard
                exercise={currentContent}
                selectedAnswer={selectedAnswer}
                onAnswerSelect={handleAnswerSelect}
                onFillBlank={handleFillBlank}
                isCorrect={isCorrect}
                showExplanation={showExplanation}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA Button area */}
      <div className="absolute bottom-4 left-0 right-0 z-40 px-4">
        <div className="max-w-[388px] mx-auto bg-white/95 backdrop-blur-xl border border-slate-150 rounded-2xl shadow-lg shadow-slate-200/50 py-4 px-6">
          <Button
            onClick={handleNext}
            className="w-full py-3.5 text-xs font-bold"
            disabled={!isTeachSegment && !selectedAnswer}
            testId="next-button"
          >
            <div className="flex items-center justify-center gap-1.5">
              <span>{showExplanation ? 'Continue' : 'Next'}</span>
              <ChevronRight size={16} strokeWidth={2.5} />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

const TeachCard = ({ card }) => {
  return (
    <Card testId={`teach-card-${card.kind}`} className="space-y-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="px-2.5 py-0.5 rounded-lg bg-violet-50 border border-violet-100 shadow-sm">
          <span className="text-[10px] uppercase tracking-wider text-violet-600 font-extrabold">
            {card.kind}
          </span>
        </div>
      </div>

      <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
        {card.title}
      </h2>

      <div 
        className="text-slate-500 text-sm font-medium leading-relaxed"
        dangerouslySetInnerHTML={{ __html: card.body }}
      />

      {card.compare && (
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-3 shadow-sm">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">
              {card.compare.left.tag}
            </div>
            <div className="flex justify-center mb-1 text-slate-850">
              {getIconForEmoji(card.compare.left.emoji, { size: 28, className: 'text-slate-700' })}
            </div>
            <div 
              className="text-xs font-bold text-slate-700 leading-normal"
              dangerouslySetInnerHTML={{ __html: card.compare.left.text }}
            />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-3 shadow-sm">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">
              {card.compare.right.tag}
            </div>
            <div className="flex justify-center mb-1 text-slate-850">
              {getIconForEmoji(card.compare.right.emoji, { size: 28, className: 'text-slate-700' })}
            </div>
            <div 
              className="text-xs font-bold text-slate-700 leading-normal"
              dangerouslySetInnerHTML={{ __html: card.compare.right.text }}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

const ExerciseCard = ({ 
  exercise, 
  selectedAnswer, 
  onAnswerSelect, 
  onFillBlank,
  isCorrect, 
  showExplanation 
}) => {
  return (
    <div className="space-y-5">
      {/* Question Card */}
      <Card testId="exercise-card" className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-100 shadow-sm">
        <div className="space-y-3">
          <div className="px-2.5 py-0.5 rounded-lg bg-violet-100/60 border border-violet-150 inline-block shadow-sm">
            <span className="text-[10px] uppercase tracking-wider text-violet-750 font-extrabold">
              {exercise.type === 'true_false' ? 'True or False' : 
               exercise.type === 'fill_blank' ? 'Fill in the Blank' :
               exercise.type === 'boss' ? 'Final Challenge' : 'Question'}
            </span>
          </div>
          <p className="text-lg font-extrabold text-slate-900 leading-snug">
            {exercise.prompt}
          </p>
          {exercise.sentence && (
            <p className="text-sm text-slate-500 italic border-l-2 border-violet-600 pl-3.5 py-0.5 font-medium">
              {exercise.sentence}
            </p>
          )}
        </div>
      </Card>

      {/* MCQ / Fill Options */}
      <div className="space-y-2.5">
        {exercise.type === 'fill_blank' ? (
          exercise.words.map((word) => (
            <OptionButton
              key={word}
              id={word}
              text={word}
              selected={selectedAnswer === word}
              onClick={() => onFillBlank(word)}
              isCorrect={showExplanation && selectedAnswer === word ? word === exercise.blank : null}
            />
          ))
        ) : (
          exercise.options.map((option) => (
            <OptionButton
              key={option.id}
              id={option.id}
              text={option.text}
              selected={selectedAnswer === option.id}
              onClick={() => onAnswerSelect(option.id)}
              isCorrect={showExplanation && selectedAnswer === option.id ? option.correct : null}
            />
          ))
        )}
      </div>

      {/* Explanation banner */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <Card 
              testId="explanation-card"
              className={isCorrect 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950 shadow-sm shadow-emerald-50/50' 
                : 'bg-rose-50 border-red-200 text-red-950 shadow-sm shadow-red-50/50'
              }
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <>
                      <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm text-white">
                        <Check size={16} className="text-white" strokeWidth={3.5} />
                      </div>
                      <span className="font-extrabold text-emerald-600 text-base">Correct!</span>
                    </>
                  ) : (
                    <>
                      <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shadow-sm text-white">
                        <XCircle size={16} className="text-white" strokeWidth={2.5} />
                      </div>
                      <span className="font-extrabold text-red-500 text-base">Not quite</span>
                    </>
                  )}
                </div>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  {exercise.explain || exercise.explanation}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const OptionButton = ({ id, text, selected, onClick, isCorrect }) => {
  const getBorderClass = () => {
    if (isCorrect === true) return 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm shadow-emerald-50/50';
    if (isCorrect === false) return 'border-red-500 bg-rose-50 text-red-950 shadow-sm shadow-red-50/50';
    if (selected) return 'border-violet-600 bg-violet-50 text-violet-900 shadow-sm shadow-violet-50/50';
    return 'border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50/50 text-slate-700 shadow-sm';
  };

  return (
    <motion.button
      onClick={onClick}
      data-testid={`option-${id}`}
      className={`w-full border-2 rounded-2xl p-4 text-left transition-all ${
        getBorderClass()
      }`}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          isCorrect === true ? 'border-emerald-500 bg-emerald-500' :
          isCorrect === false ? 'border-red-500 bg-red-500' :
          selected ? 'border-violet-600 bg-violet-600' :
          'border-slate-300'
        }`}>
          {(isCorrect === true || (selected && isCorrect === null)) && (
            <Check size={12} className="text-white" strokeWidth={3.5} />
          )}
          {isCorrect === false && (
            <X size={12} className="text-white" strokeWidth={3.5} />
          )}
        </div>
        <span className="font-extrabold text-sm">{text}</span>
      </div>
    </motion.button>
  );
};
