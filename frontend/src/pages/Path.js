import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
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
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-white" data-testid="path-title">
          Learning Path
        </h1>
        <p className="text-[#BDBDBD] text-base leading-relaxed">
          Your journey to AI mastery
        </p>
      </div>

      {/* Unit Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{curriculum?.units?.[0]?.tierIcon}</span>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            {curriculum?.units?.[0]?.tier}
          </h2>
        </div>
        <p className="text-[#888888] text-sm uppercase tracking-[0.2em]">
          {curriculum?.units?.[0]?.title}
        </p>
      </div>

      {/* Lessons */}
      <div className="space-y-4">
        {lessons.map((lesson, index) => {
          const completed = isLessonCompleted(lesson.id);
          const isCurrent = lesson.id === currentLessonId;
          const isLocked = index > 0 && !isLessonCompleted(lessons[index - 1].id) && !completed;

          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                interactive={!isLocked}
                onClick={() => handleLessonClick(lesson.id, isLocked)}
                testId={`lesson-card-${lesson.id}`}
                className={`relative ${
                  isCurrent && !completed ? 'border-white glow-white' : ''
                } ${
                  isLocked ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl ${
                      completed 
                        ? 'bg-white border-white text-black' 
                        : isLocked
                        ? 'bg-[#111111] border-[#222222]'
                        : 'bg-black border-[#222222]'
                    }`}>
                      {completed ? (
                        <Check size={32} strokeWidth={2.5} />
                      ) : isLocked ? (
                        <Lock size={24} className="text-[#888888]" strokeWidth={1.5} />
                      ) : (
                        lesson.icon
                      )}
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-[#888888] font-medium mb-1">
                        Lesson {index + 1}
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {lesson.title}
                      </div>
                      {completed && (
                        <div className="text-sm text-[#BDBDBD] mt-1">
                          ✓ Completed
                        </div>
                      )}
                      {isCurrent && !completed && (
                        <div className="text-sm text-white mt-1 font-medium">
                          Start here
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isCurrent && !completed && (
                  <motion.div
                    className="absolute -right-1 -top-1 w-3 h-3 bg-white rounded-full"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.6, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};