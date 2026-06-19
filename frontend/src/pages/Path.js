import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { useCurriculum } from '../hooks/useData';
import { isLessonCompleted, getCurrentLesson } from '../utils/storage';
import { Card } from '../components/ui-components';
import { getIconForEmoji } from '../utils/icons';
import { Skeleton } from '../components/Skeleton';

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
      <motion.div
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Skeleton.PathScreen />
      </motion.div>
    );
  }

  const unit = curriculum?.units?.[0] || {};

  return (
    <motion.div
      className="px-6 py-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="space-y-1"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight" data-testid="path-title">
          Learning Path
        </h1>
        <p className="text-slate-400 text-sm font-medium">
          Your journey to AI mastery
        </p>
      </motion.div>

      {/* Unit Header */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-100 shadow-sm shadow-violet-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md">
              {getIconForEmoji(unit.tierIcon, { size: 24, className: 'text-white' })}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {unit.tier}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {unit.title}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Lessons */}
      <div className="space-y-5 relative">
        {/* Connection line */}
        <div 
          className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200" 
          style={{ height: `${(lessons.length - 1) * 116}px` }} 
        />
        
        {lessons.map((lesson, index) => {
          const completed = isLessonCompleted(lesson.id);
          const isCurrent = lesson.id === currentLessonId;
          const isLocked = index > 0 && !isLessonCompleted(lessons[index - 1].id) && !completed;

          return (
            <motion.div
              key={lesson.id}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="relative"
            >
              {/* Status indicator */}
              <div className={`absolute left-6 top-6 w-4 h-4 rounded-full border-2 flex items-center justify-center z-10 ${
                completed 
                  ? 'bg-emerald-500 border-emerald-500' 
                  : isCurrent 
                  ? 'bg-violet-600 border-violet-600 animate-pulse'
                  : 'bg-slate-50 border-slate-300'
              }`}>
                {completed && <Check size={10} className="text-white" strokeWidth={3.5} />}
              </div>

              <Card
                interactive={!isLocked}
                onClick={() => handleLessonClick(lesson.id, isLocked)}
                testId={`lesson-card-${lesson.id}`}
                className={`ml-14 ${
                  isCurrent && !completed ? 'border-violet-400 shadow-md shadow-violet-50' : ''
                } ${
                  completed ? 'border-emerald-200' : ''
                } ${
                  isLocked ? 'opacity-60 bg-slate-50/50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                    completed 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                      : isLocked
                      ? 'bg-slate-100 border border-slate-200'
                      : 'bg-gradient-to-br from-violet-600 to-indigo-600'
                  }`}>
                    {isLocked ? (
                      <Lock size={18} className="text-slate-400" strokeWidth={2.5} />
                    ) : (
                      getIconForEmoji(lesson.icon, { size: 20, className: 'text-white' })
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-0.5">
                      LESSON {index + 1}
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 leading-tight">
                      {lesson.title}
                    </div>
                    {completed && (
                      <div className="text-xs text-emerald-600 mt-1 font-bold">
                        Completed
                      </div>
                    )}
                    {isCurrent && !completed && (
                      <div className="text-xs text-violet-600 mt-1 font-bold">
                        Continue
                      </div>
                    )}
                    {isLocked && (
                      <div className="text-xs text-slate-400 mt-1 font-medium">
                        Complete previous lesson
                      </div>
                    )}
                  </div>

                  {isCurrent && !completed && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2.5 h-2.5 bg-violet-600 rounded-full shadow-sm shadow-violet-400"
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
