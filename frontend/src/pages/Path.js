import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Lock, Circle } from 'lucide-react';
import { useCurriculum } from '../hooks/useData';
import { isLessonCompleted, getCurrentLesson } from '../utils/storage';
import { Card } from '../components/ui-components';

export const Path = () => {
  const navigate = useNavigate();
  const { curriculum, loading } = useCurriculum();

  const currentLessonId = getCurrentLesson();
  const lessons = curriculum?.units?.[0]?.lessons || [];

  const handleLessonClick = (lessonId, isLocked) => {
    if (!isLocked) {
      navigate(`/lesson/${lessonId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Circle size={48} className="text-[#6248FF]" />
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
      <motion.div 
        className="space-y-2"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl font-bold text-white" data-testid="path-title">
          Learning Path
        </h1>
        <p className="text-[#94A3B8] text-base">
          Your journey to AI mastery
        </p>
      </motion.div>

      {/* Unit Header */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-r from-[#6248FF]/20 to-[#8B5CF6]/20 border-[#6248FF]/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6248FF] to-[#8B5CF6] flex items-center justify-center">
              <span className="text-2xl">{curriculum?.units?.[0]?.tierIcon}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {curriculum?.units?.[0]?.tier}
              </h2>
              <p className="text-sm text-[#94A3B8]">
                {curriculum?.units?.[0]?.title}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Lessons */}
      <div className="space-y-4 relative">
        {/* Connection line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#6248FF] via-[#334155] to-transparent" 
             style={{ height: `${(lessons.length - 1) * 120}px` }} 
        />
        
        {lessons.map((lesson, index) => {
          const completed = isLessonCompleted(lesson.id);
          const isCurrent = lesson.id === currentLessonId;
          const isLocked = index > 0 && !isLessonCompleted(lessons[index - 1].id) && !completed;

          return (
            <motion.div
              key={lesson.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="relative"
            >
              {/* Status indicator */}
              <div className={`absolute left-6 top-6 w-4 h-4 rounded-full border-2 flex items-center justify-center z-10 ${
                completed 
                  ? 'bg-[#22C55E] border-[#22C55E]' 
                  : isCurrent 
                  ? 'bg-[#6248FF] border-[#6248FF] animate-pulse'
                  : 'bg-[#1E293B] border-[#334155]'
              }`}>
                {completed && <Check size={10} className="text-white" strokeWidth={3} />}
              </div>

              <Card
                interactive={!isLocked}
                onClick={() => handleLessonClick(lesson.id, isLocked)}
                testId={`lesson-card-${lesson.id}`}
                className={`ml-14 ${
                  isCurrent && !completed ? 'border-[#6248FF] glow-purple' : ''
                } ${
                  completed ? 'border-[#22C55E]/50' : ''
                } ${
                  isLocked ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                    completed 
                      ? 'bg-gradient-to-br from-[#22C55E] to-[#10B981]' 
                      : isLocked
                      ? 'bg-[#1E293B]'
                      : 'bg-gradient-to-br from-[#6248FF] to-[#8B5CF6]'
                  }`}>
                    {isLocked ? (
                      <Lock size={24} className="text-[#64748B]" strokeWidth={2} />
                    ) : (
                      <span>{lesson.icon}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-xs text-[#94A3B8] font-medium mb-1">
                      LESSON {index + 1}
                    </div>
                    <div className="text-base font-bold text-white">
                      {lesson.title}
                    </div>
                    {completed && (
                      <div className="text-sm text-[#22C55E] mt-1 font-medium">
                        Completed
                      </div>
                    )}
                    {isCurrent && !completed && (
                      <div className="text-sm text-[#6248FF] mt-1 font-medium">
                        Continue
                      </div>
                    )}
                    {isLocked && (
                      <div className="text-sm text-[#64748B] mt-1">
                        Complete previous lesson
                      </div>
                    )}
                  </div>

                  {isCurrent && !completed && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 bg-[#6248FF] rounded-full"
                    />
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
