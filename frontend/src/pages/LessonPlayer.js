import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check, XCircle, Trophy, Zap } from 'lucide-react';
import { useLesson } from '../hooks/useData';
import { useProgress } from '../hooks/useProgress';
import { markLessonComplete, addXP, clearLessonProgress, setCurrentLesson } from '../utils/storage';
import { Button, Card } from '../components/ui-components';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Zap size={48} className="text-[#6248FF]" />
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
    
    const lessonIndex = parseInt(lessonId.split('-l')[1]);
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
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a] flex items-center justify-center px-6">
        <motion.div
          className="max-w-md w-full space-y-6 text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#22C55E] to-[#10B981] mx-auto flex items-center justify-center mb-6">
              <Trophy size={64} className="text-white" strokeWidth={2} />
            </div>
          </motion.div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white" data-testid="lesson-complete-title">
              Lesson Complete!
            </h1>
            <p className="text-[#94A3B8] text-lg">
              You earned <span className="text-[#6248FF] font-bold">{lesson.xp + earnedXP} XP</span>
            </p>
          </div>

          <Card testId="completion-card" className="bg-gradient-to-br from-[#6248FF]/20 to-[#8B5CF6]/20 border-[#6248FF]/30">
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Zap size={20} strokeWidth={2} />
                <span>Key Takeaway</span>
              </div>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                {lesson.concept}
              </p>
            </div>
          </Card>

          <div className="space-y-3 pt-4">
            <Button 
              onClick={() => navigate('/path')}
              className="w-full"
              testId="continue-button"
            >
              Continue Learning
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="secondary"
              className="w-full"
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
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/95 backdrop-blur-xl border-b border-[#334155]">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center hover:bg-[#334155] transition-colors"
              data-testid="close-lesson-button"
            >
              <X size={20} className="text-white" strokeWidth={2} />
            </button>
            <div className="text-xs text-[#94A3B8] font-medium uppercase tracking-wider">
              {lesson.title}
            </div>
            <div className="w-10" />
          </div>
          <div className="h-2 w-full bg-[#1E293B] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#6248FF] to-[#8B5CF6] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-28 pb-32 px-6">
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

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0F172A]/95 backdrop-blur-xl border-t border-[#334155]">
        <div className="max-w-md mx-auto px-6 py-6">
          <Button
            onClick={handleNext}
            className="w-full"
            disabled={!isTeachSegment && !selectedAnswer}
            testId="next-button"
          >
            <div className="flex items-center justify-center gap-2">
              {showExplanation ? 'Continue' : 'Next'}
              <ChevronRight size={20} strokeWidth={2.5} />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

const TeachCard = ({ card }) => {
  return (
    <Card testId={`teach-card-${card.kind}`} className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="px-3 py-1 rounded-lg bg-[#6248FF]/20 border border-[#6248FF]/30">
          <span className="text-xs uppercase tracking-wider text-[#6248FF] font-bold">
            {card.kind}
          </span>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white leading-tight">
        {card.title}
      </h2>

      <div 
        className="text-[#94A3B8] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: card.body }}
      />

      {card.compare && (
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 text-center space-y-3">
            <div className="text-xs uppercase tracking-wider text-[#94A3B8] font-bold">
              {card.compare.left.tag}
            </div>
            <div 
              className="text-sm text-white"
              dangerouslySetInnerHTML={{ __html: card.compare.left.text }}
            />
          </div>
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 text-center space-y-3">
            <div className="text-xs uppercase tracking-wider text-[#94A3B8] font-bold">
              {card.compare.right.tag}
            </div>
            <div 
              className="text-sm text-white"
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
      {/* Question */}
      <Card testId="exercise-card" className="bg-gradient-to-br from-[#6248FF]/10 to-[#8B5CF6]/10 border-[#6248FF]/30">
        <div className="space-y-4">
          <div className="px-3 py-1 rounded-lg bg-[#6248FF]/20 border border-[#6248FF]/30 inline-block">
            <span className="text-xs uppercase tracking-wider text-[#6248FF] font-bold">
              {exercise.type === 'true_false' ? 'True or False' : 
               exercise.type === 'fill_blank' ? 'Fill in the Blank' :
               exercise.type === 'boss' ? 'Final Challenge' : 'Question'}
            </span>
          </div>
          <p className="text-xl font-semibold text-white leading-relaxed">
            {exercise.prompt}
          </p>
          {exercise.sentence && (
            <p className="text-base text-[#94A3B8] italic border-l-2 border-[#6248FF] pl-4">
              {exercise.sentence}
            </p>
          )}
        </div>
      </Card>

      {/* MCQ Options */}
      <div className="space-y-3">
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

      {/* Explanation */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card 
              testId="explanation-card"
              className={isCorrect 
                ? 'bg-gradient-to-br from-[#22C55E]/20 to-[#10B981]/20 border-[#22C55E]/50' 
                : 'bg-gradient-to-br from-[#EF4444]/20 to-[#DC2626]/20 border-[#EF4444]/50'
              }
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-[#22C55E] flex items-center justify-center">
                        <Check size={20} className="text-white" strokeWidth={3} />
                      </div>
                      <span className="font-bold text-[#22C55E] text-lg">Correct!</span>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-[#EF4444] flex items-center justify-center">
                        <XCircle size={20} className="text-white" strokeWidth={3} />
                      </div>
                      <span className="font-bold text-[#EF4444] text-lg">Not quite</span>
                    </>
                  )}
                </div>
                <p className="text-[#94A3B8] leading-relaxed">
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
    if (isCorrect === true) return 'border-[#22C55E] bg-[#22C55E]/10 glow-green';
    if (isCorrect === false) return 'border-[#EF4444] bg-[#EF4444]/10';
    if (selected) return 'border-[#6248FF] bg-[#6248FF]/10';
    return 'border-[#334155] hover:border-[#475569] hover:bg-[#1E293B]';
  };

  return (
    <motion.button
      onClick={onClick}
      data-testid={`option-${id}`}
      className={`w-full bg-[#1E293B]/30 backdrop-blur-sm border-2 rounded-xl p-4 text-left transition-all ${
        getBorderClass()
      }`}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          isCorrect === true ? 'border-[#22C55E] bg-[#22C55E]' :
          isCorrect === false ? 'border-[#EF4444] bg-[#EF4444]' :
          selected ? 'border-[#6248FF] bg-[#6248FF]' :
          'border-[#475569]'
        }`}>
          {(isCorrect === true || (selected && isCorrect === null)) && (
            <Check size={14} className="text-white" strokeWidth={3} />
          )}
          {isCorrect === false && (
            <X size={14} className="text-white" strokeWidth={3} />
          )}
        </div>
        <span className="text-white font-medium">{text}</span>
      </div>
    </motion.button>
  );
};
