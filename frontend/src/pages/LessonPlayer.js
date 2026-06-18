import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check, Sparkles } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-white text-lg"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading lesson...
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

  const handleClose = () => {
    navigate('/');
  };

  const handleFillBlank = (word) => {
    if (showExplanation) return;
    
    setSelectedAnswer(word);
    const correct = word === currentContent.blank;
    setIsCorrect(correct);
  };

  if (showCompletion) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-md w-full space-y-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <div className="w-32 h-32 rounded-full bg-white mx-auto flex items-center justify-center text-6xl mb-6">
              🎉
            </div>
          </motion.div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white" data-testid="lesson-complete-title">
              Lesson Complete!
            </h1>
            <p className="text-[#BDBDBD] text-lg">
              You earned <span className="text-white font-bold">{lesson.xp + earnedXP} XP</span>
            </p>
          </div>

          <Card testId="completion-card" className="shine-effect">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-white">
                <Sparkles size={20} strokeWidth={1.5} />
                <span className="font-semibold">Key Concept</span>
              </div>
              <p className="text-[#BDBDBD] text-sm leading-relaxed">
                {lesson.concept}
              </p>
            </div>
          </Card>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/path')}
              className="w-full"
              testId="continue-button"
            >
              Continue Learning
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="ghost"
              className="w-full"
              testId="back-home-button"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-[#222222]">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center"
              data-testid="close-lesson-button"
            >
              <X size={20} className="text-white" strokeWidth={1.5} />
            </button>
            <div className="text-xs uppercase tracking-[0.2em] text-[#888888] font-medium">
              {lesson.title}
            </div>
            <div className="w-10" />
          </div>
          <div className="h-2 w-full bg-[#222222] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
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
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-[#222222]">
        <div className="max-w-md mx-auto px-6 py-6">
          <Button
            onClick={handleNext}
            className="w-full"
            disabled={!isTeachSegment && !selectedAnswer}
            testId="next-button"
          >
            <div className="flex items-center justify-center gap-2">
              {showExplanation ? 'Continue' : 'Next'}
              <ChevronRight size={20} strokeWidth={2} />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

const TeachCard = ({ card }) => {
  return (
    <Card testId={`teach-card-${card.kind}`} className="space-y-6">
      {/* Icon and Label */}
      {card.kind !== 'visual' && (
        <div className="flex items-center gap-3">
          <div className="text-4xl">{card.icon}</div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#888888] font-medium">
            {card.kind}
          </div>
        </div>
      )}

      {/* Title */}
      <h2 className="text-2xl font-semibold text-white leading-tight">
        {card.title}
      </h2>

      {/* Body */}
      <div 
        className="text-[#BDBDBD] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: card.body }}
      />

      {/* Comparison (for visual cards) */}
      {card.compare && (
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="bg-black border border-[#222222] rounded-2xl p-4 text-center space-y-3">
            <div className="text-4xl">{card.compare.left.emoji}</div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#888888] font-medium">
              {card.compare.left.tag}
            </div>
            <div 
              className="text-sm text-[#BDBDBD]"
              dangerouslySetInnerHTML={{ __html: card.compare.left.text }}
            />
          </div>
          <div className="bg-black border border-[#222222] rounded-2xl p-4 text-center space-y-3">
            <div className="text-4xl">{card.compare.right.emoji}</div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#888888] font-medium">
              {card.compare.right.tag}
            </div>
            <div 
              className="text-sm text-[#BDBDBD]"
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
    <div className="space-y-6">
      {/* Question */}
      <Card testId="exercise-card">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[#888888] font-medium">
            {exercise.type === 'true_false' ? 'True or False' : 
             exercise.type === 'fill_blank' ? 'Fill in the Blank' :
             exercise.type === 'warmup' ? 'Warmup' :
             exercise.type === 'boss' ? 'Final Question' : 'Question'}
          </div>
          <p className="text-xl font-medium text-white leading-relaxed">
            {exercise.prompt}
          </p>
          {exercise.sentence && (
            <p className="text-lg text-[#BDBDBD] italic">
              {exercise.sentence}
            </p>
          )}
        </div>
      </Card>

      {/* Options */}
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card 
              testId="explanation-card"
              className={isCorrect ? 'border-white glow-white' : 'border-[#333333]'}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <Check size={24} className="text-white" strokeWidth={2} />
                  ) : (
                    <X size={24} className="text-[#888888]" strokeWidth={2} />
                  )}
                  <span className="font-semibold text-white">
                    {isCorrect ? 'Correct!' : 'Not quite'}
                  </span>
                </div>
                <p className="text-[#BDBDBD] leading-relaxed">
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
    if (isCorrect === true) return 'border-white glow-white';
    if (isCorrect === false) return 'border-[#333333]';
    if (selected) return 'border-white';
    return 'border-[#222222]';
  };

  return (
    <motion.button
      onClick={onClick}
      data-testid={`option-${id}`}
      className={`w-full bg-[#111111] border-2 rounded-3xl p-5 text-left transition-all ${
        getBorderClass()
      } hover:bg-[#1A1A1A]`}
      whileTap={{ scale: 0.98 }}
    >
      <span className="text-white font-medium">{text}</span>
    </motion.button>
  );
};