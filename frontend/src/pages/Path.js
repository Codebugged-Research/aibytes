import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Zap, Star, ChevronRight, Lock } from 'lucide-react';
import { useCurriculum } from '../hooks/useData';
import { isLessonCompleted } from '../utils/storage';
import { getIconForEmoji } from '../utils/icons';
import { Skeleton } from '../components/Skeleton';
import { useState } from 'react';
import { StartLearningTransition } from '../components/StartLearningTransition';

export const Path = () => {
  const navigate = useNavigate();
  const { curriculum, loading } = useCurriculum();
  const [pendingLesson, setPendingLesson] = useState(null);
  const [showTransition, setShowTransition] = useState(false);
  const startLesson = (id) => { setPendingLesson(id); setShowTransition(true); };

  if (loading) {
    return (
      <motion.div className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Skeleton.PathScreen />
      </motion.div>
    );
  }

  const units = curriculum?.units || [];

  const orderedLessons = units.flatMap((u) => u.lessons);
  const getLessonState = (lesson) => {
    if (isLessonCompleted(lesson.id)) return 'done';
    const idx = orderedLessons.findIndex((l) => l.id === lesson.id);
    const prevDone = idx <= 0 || isLessonCompleted(orderedLessons[idx - 1].id);
    return prevDone ? 'current' : 'locked';
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="pb-8">
        {units.map((unit, unitIndex) => {
          const completedCount = unit.lessons.filter(l => isLessonCompleted(l.id)).length;
          const lessons = unit.lessons;

          const gradients = [
            'from-[#6248FF] to-[#8B5CF6]',
            'from-[#0EA5E9] to-[#6366F1]',
            'from-[#10B981] to-[#0EA5E9]',
          ];
          const gradient = gradients[unitIndex % gradients.length];

          return (
            <div key={unit.id} className="mb-2">
              {/* ── Unit section header ──────────────────────────────── */}
              <motion.div
                className={`bg-gradient-to-br ${gradient} px-6 pt-5 pb-5 text-white`}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: unitIndex * 0.08 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                      {getIconForEmoji(unit.tierIcon, { size: 20, className: 'text-white' })}
                    </div>
                    <div>
                      <p className="text-white/65 text-[10px] font-bold uppercase tracking-wider">{unit.tier}</p>
                      <h2 className="text-base font-black text-white">{unit.title}</h2>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {completedCount >= 0 && (
                  <div className="mt-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-white/70 text-xs font-bold">
                        <Star size={10} className="text-yellow-300 fill-yellow-300" />
                        {completedCount} / {lessons.length} complete
                      </span>
                      <span className="text-white/70 text-xs font-bold">
                        {Math.round((completedCount / lessons.length) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-white/80 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedCount / lessons.length) * 100}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 + unitIndex * 0.1 }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>

              {/* ── Lesson list for this unit ────────────────────────── */}
              <div className="px-4 pt-4 pb-2">
                {lessons.map((lesson, lessonIndex) => {
                  const state = getLessonState(lesson);
                  const isDone    = state === 'done';
                  const isCurrent = state === 'current';
                  const isLocked  = state === 'locked';
                  const isLast    = lessonIndex === lessons.length - 1;

                  return (
                    <div key={lesson.id} className="flex gap-3">
                      {/* ── Left: icon + connector ────────────────────── */}
                      <div className="flex flex-col items-center" style={{ width: 52 }}>
                        <div className="relative flex-shrink-0">
                          {isCurrent && (
                            <>
                              <motion.div
                                className="absolute inset-0 rounded-2xl border-2 border-[#6248FF]"
                                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                              />
                              <motion.div
                                className="absolute inset-0 rounded-2xl border border-violet-400"
                                animate={{ scale: [1, 1.7, 1], opacity: [0.3, 0, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                              />
                            </>
                          )}
                          <motion.button
                            onClick={() => { if (!isLocked) startLesson(lesson.id); }}
                            disabled={isLocked}
                            data-testid={`lesson-card-${lesson.id}`}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md focus:outline-none relative z-10 ${
                              isDone    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-100'
                              : isCurrent ? 'bg-gradient-to-br from-[#6248FF] to-[#8B5CF6] shadow-violet-200'
                              : 'bg-white border-2 border-slate-200 shadow-slate-50'
                            }`}
                            whileTap={{ scale: 0.87 }}
                            whileHover={{ scale: 1.08 }}
                            transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                          >
                            {isDone ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -30 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.1 + lessonIndex * 0.06, type: 'spring', stiffness: 500 }}
                              >
                                <Check size={22} className="text-white" strokeWidth={3} />
                              </motion.div>
                            ) : isLocked ? (
                              <Lock size={19} className="text-slate-400" strokeWidth={2.5} />
                            ) : (
                              getIconForEmoji(lesson.icon, { size: 22, className: 'text-white' })
                            )}
                          </motion.button>

                          {/* Lesson number */}
                          <div className={`absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black z-20 ${
                            isDone ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-[#6248FF] text-white' : 'bg-slate-200 text-slate-400'
                          }`}>
                            {lessonIndex + 1}
                          </div>
                        </div>

                        {/* Connector line */}
                        {!isLast && (
                          <div className="flex-1 w-0.5 my-1.5 rounded-full min-h-[20px]"
                            style={{ background: isDone ? '#a78bfa' : '#e2e8f0' }}
                          />
                        )}
                      </div>

                      {/* ── Right: lesson card ─────────────────────────── */}
                      <motion.div
                        className="flex-1 min-w-0 mb-3"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + lessonIndex * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <motion.button
                          onClick={() => { if (!isLocked) startLesson(lesson.id); }}
                          disabled={isLocked}
                          className={`w-full text-left rounded-2xl px-4 py-3.5 border transition-colors focus:outline-none ${
                            isDone
                              ? 'bg-emerald-50 border-emerald-100'
                              : isCurrent
                              ? 'bg-white border-violet-200 shadow-sm shadow-violet-50'
                              : 'bg-white border-slate-100 opacity-60'
                          }`}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className={`text-[9px] font-black uppercase tracking-wider mb-0.5 ${
                                isDone ? 'text-emerald-500' : isCurrent ? 'text-violet-500' : 'text-slate-400'
                              }`}>
                                Lesson {lessonIndex + 1}
                              </p>
                              <h3 className={`text-sm font-extrabold leading-snug clamp-2 ${
                                isDone ? 'text-slate-700' : isCurrent ? 'text-slate-900' : 'text-slate-400'
                              }`}>
                                {lesson.title}
                              </h3>
                            </div>

                            {isDone && (
                              <motion.div
                                className="flex items-center gap-1 bg-yellow-100 rounded-full px-2 py-1 flex-shrink-0"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 + lessonIndex * 0.06, type: 'spring', stiffness: 500 }}
                              >
                                <Zap size={9} className="text-yellow-500" fill="#f59e0b" strokeWidth={0} />
                                <span className="text-[9px] font-black text-yellow-600">+10</span>
                              </motion.div>
                            )}
                            {isCurrent && (
                              <motion.div
                                className="flex items-center gap-0.5 text-violet-600 flex-shrink-0"
                                animate={{ x: [0, 3, 0] }}
                                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                              >
                                <span className="text-[10px] font-black">START</span>
                                <ChevronRight size={13} strokeWidth={3} />
                              </motion.div>
                            )}
                            {isLocked && (
                              <div className="flex items-center gap-0.5 text-slate-400 flex-shrink-0">
                                <Lock size={12} strokeWidth={2.5} />
                                <span className="text-[10px] font-black">LOCKED</span>
                              </div>
                            )}
                          </div>
                        </motion.button>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <StartLearningTransition
        isVisible={showTransition}
        onDone={() => navigate(`/lesson/${pendingLesson}`)}
      />
    </motion.div>
  );
};
