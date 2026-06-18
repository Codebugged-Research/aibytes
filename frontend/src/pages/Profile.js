import { motion } from 'framer-motion';
import { Flame, Zap, Award, RotateCcw } from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import { getCompletedLessons, resetAllProgress } from '../utils/storage';
import { Button, Card } from '../components/ui-components';
import { useState } from 'react';

export const Profile = () => {
  const { xp, streak, refreshProgress } = useProgress();
  const completedLessons = getCompletedLessons();
  const [showReset, setShowReset] = useState(false);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      resetAllProgress();
      refreshProgress();
      window.location.reload();
    }
  };

  const stats = [
    { icon: Flame, label: 'Day Streak', value: streak, testId: 'profile-streak', gradient: 'from-[#FF6B35] to-[#FF8C42]' },
    { icon: Zap, label: 'Total XP', value: xp, testId: 'profile-xp', gradient: 'from-[#6248FF] to-[#8B5CF6]' },
    { icon: Award, label: 'Completed', value: completedLessons.length, testId: 'profile-lessons', gradient: 'from-[#22C55E] to-[#10B981]' }
  ];

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
        <h1 className="text-4xl font-bold text-white" data-testid="profile-title">
          Profile
        </h1>
        <p className="text-[#94A3B8] text-base">
          Track your learning progress
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card testId="profile-card" className="text-center bg-gradient-to-br from-[#6248FF]/20 to-[#8B5CF6]/20 border-[#6248FF]/30">
          <div className="space-y-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6248FF] to-[#8B5CF6] flex items-center justify-center mx-auto">
              <span className="text-4xl">👤</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Learner</h2>
              <p className="text-[#94A3B8] text-sm mt-1">Foundation Explorer</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-white">Statistics</h2>
        <div className="space-y-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card testId={stat.testId}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                        <Icon size={24} className="text-white" strokeWidth={2} />
                      </div>
                      <span className="text-white font-semibold">{stat.label}</span>
                    </div>
                    <span className="text-3xl font-bold text-white">{stat.value}</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <motion.div 
        className="pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <Button
          onClick={() => setShowReset(!showReset)}
          variant="secondary"
          className="w-full"
          testId="reset-progress-button"
        >
          <div className="flex items-center justify-center gap-2">
            <RotateCcw size={18} strokeWidth={2} />
            Reset Progress
          </div>
        </Button>
        {showReset && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3"
          >
            <Button
              onClick={handleReset}
              className="w-full bg-gradient-to-r from-[#EF4444] to-[#DC2626]"
              testId="confirm-reset-button"
            >
              Confirm Reset
            </Button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};
