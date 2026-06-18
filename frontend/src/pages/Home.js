import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Zap, TrendingUp, ChevronRight, Award } from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import { useCurriculum } from '../hooks/useData';
import { getCurrentLesson, isLessonCompleted } from '../utils/storage';
import { Button, Card, ProgressBar } from '../components/ui-components';

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
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Zap size={48} className="text-[#6248FF]" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="px-6 py-8 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="space-y-2">
        <motion.h1 
          className="text-4xl font-bold text-white"
          data-testid="home-title"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          AIBytes
        </motion.h1>
        <motion.p 
          className="text-[#94A3B8] text-base"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Master AI, one byte at a time
        </motion.p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
        >
          <Card testId="streak-card" className="bg-gradient-to-br from-[#FF6B35]/20 to-[#FF6B35]/5 border-[#FF6B35]/30">
            <div className="text-center space-y-2">
              <Flame size={28} className="text-[#FF6B35] mx-auto" strokeWidth={2} />
              <div className="text-2xl font-bold text-white" data-testid="streak-count">{streak}</div>
              <div className="text-xs text-[#94A3B8] font-medium">Day Streak</div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <Card testId="xp-card" className="bg-gradient-to-br from-[#6248FF]/20 to-[#6248FF]/5 border-[#6248FF]/30">
            <div className="text-center space-y-2">
              <Zap size={28} className="text-[#6248FF] mx-auto" strokeWidth={2} fill="#6248FF" />
              <div className="text-2xl font-bold text-white" data-testid="xp-count">{xp}</div>
              <div className="text-xs text-[#94A3B8] font-medium">Total XP</div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
        >
          <Card testId="lessons-card" className="bg-gradient-to-br from-[#22C55E]/20 to-[#22C55E]/5 border-[#22C55E]/30">
            <div className="text-center space-y-2">
              <Award size={28} className="text-[#22C55E] mx-auto" strokeWidth={2} />
              <div className="text-2xl font-bold text-white">{completedCount}/{totalLessons}</div>
              <div className="text-xs text-[#94A3B8] font-medium">Lessons</div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Today's Lesson */}
      <motion.div 
        className="space-y-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Continue Learning</h2>
          <TrendingUp size={20} className="text-[#6248FF]" strokeWidth={2} />
        </div>
        
        <Card 
          interactive 
          onClick={handleStartLesson} 
          testId="todays-lesson-card" 
          className="border-[#6248FF]/50 hover:border-[#6248FF] glow-purple"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#6248FF] to-[#8B5CF6] flex items-center justify-center">
              <Zap size={32} className="text-white" strokeWidth={2} fill="white" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-[#94A3B8] font-medium mb-1">
                LESSON {currentLessonId.split('-')[1].substring(1)}
              </div>
              <div className="text-base font-bold text-white mb-1">
                {curriculum?.units?.[0]?.lessons?.find(l => l.id === currentLessonId)?.title || 'Loading...'}
              </div>
              <div className="text-sm text-[#64748B]">
                ~7 minutes
              </div>
            </div>
            <ChevronRight size={24} className="text-[#6248FF]" strokeWidth={2} />
          </div>
        </Card>
      </motion.div>

      {/* Progress Section */}
      <motion.div 
        className="space-y-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h2 className="text-xl font-bold text-white">Your Progress</h2>
        
        <Card testId="progress-card">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-white">Foundations Track</span>
              <span className="text-sm text-[#6248FF] font-bold">
                {Math.round((completedCount / totalLessons) * 100)}%
              </span>
            </div>
            <ProgressBar progress={(completedCount / totalLessons) * 100} />
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#64748B]">{completedCount} of {totalLessons} completed</span>
              {completedCount > 0 && (
                <span className="text-[#22C55E] font-medium">Keep going!</span>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <Button 
          onClick={handleStartLesson}
          className="w-full"
          testId="start-lesson-button"
        >
          Start Learning
        </Button>
      </motion.div>
    </motion.div>
  );
};
