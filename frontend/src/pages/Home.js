import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Zap, BookOpen, ChevronRight } from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import { useCurriculum } from '../hooks/useData';
import { getCurrentLesson, isLessonCompleted } from '../utils/storage';
import { Button, Card } from '../components/ui-components';

export const Home = () => {
  const navigate = useNavigate();
  const { xp, streak } = useProgress();
  const { curriculum, loading } = useCurriculum();

  const currentLessonId = getCurrentLesson();
  const completedCount = curriculum?.units?.[0]?.lessons?.filter(l => isLessonCompleted(l.id)).length || 0;
  const totalLessons = curriculum?.units?.[0]?.lessons?.length || 3;

  const handleStartLesson = () => {
    navigate(`/lesson/${currentLessonId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-white text-lg"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="px-6 py-8 space-y-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-white" data-testid="home-title">
          AI Quest
        </h1>
        <p className="text-[#BDBDBD] text-base leading-relaxed">
          Master AI in 10 minutes a day
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card testId="streak-card" className="shine-effect">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-black border border-[#222222] flex items-center justify-center">
              <Flame size={24} className="text-white" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#888888] font-medium">Streak</div>
              <div className="text-2xl font-bold text-white" data-testid="streak-count">{streak}</div>
            </div>
          </div>
        </Card>

        <Card testId="xp-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-black border border-[#222222] flex items-center justify-center">
              <Zap size={24} className="text-white" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#888888] font-medium">XP</div>
              <div className="text-2xl font-bold text-white" data-testid="xp-count">{xp}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Lesson */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Today's Lesson</h2>
        <Card interactive onClick={handleStartLesson} testId="todays-lesson-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-black border border-[#222222] flex items-center justify-center text-3xl">
                {curriculum?.units?.[0]?.lessons?.find(l => l.id === currentLessonId)?.icon || '🧠'}
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#888888] font-medium mb-1">
                  Lesson {currentLessonId.split('-')[1].substring(1)}
                </div>
                <div className="text-lg font-semibold text-white">
                  {curriculum?.units?.[0]?.lessons?.find(l => l.id === currentLessonId)?.title || 'Loading...'}
                </div>
                <div className="text-sm text-[#BDBDBD] mt-1">
                  ~7 minutes
                </div>
              </div>
            </div>
            <ChevronRight size={24} className="text-[#888888]" strokeWidth={1.5} />
          </div>
        </Card>
      </div>

      {/* Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Progress</h2>
          <span className="text-[#BDBDBD] text-sm">
            {completedCount}/{totalLessons} lessons
          </span>
        </div>
        
        <Card testId="progress-card">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <BookOpen size={20} className="text-white" strokeWidth={1.5} />
              <span className="text-[#BDBDBD]">Foundations</span>
            </div>
            <div className="h-2 w-full bg-[#222222] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / totalLessons) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="text-sm text-[#888888]">
              {Math.round((completedCount / totalLessons) * 100)}% complete
            </p>
          </div>
        </Card>
      </div>

      {/* CTA */}
      <Button 
        onClick={handleStartLesson}
        className="w-full"
        testId="start-lesson-button"
      >
        Start Learning
      </Button>
    </motion.div>
  );
};