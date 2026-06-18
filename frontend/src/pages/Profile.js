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
    { icon: Flame, label: 'Day Streak', value: streak, testId: 'profile-streak' },
    { icon: Zap, label: 'Total XP', value: xp, testId: 'profile-xp' },
    { icon: Award, label: 'Lessons', value: completedLessons.length, testId: 'profile-lessons' }
  ];

  return (
    <motion.div
      className="px-6 py-8 space-y-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-white" data-testid="profile-title">
          Your Progress
        </h1>
        <p className="text-[#BDBDBD] text-base leading-relaxed">
          Track your AI learning journey
        </p>
      </div>

      {/* Profile Card */}
      <Card testId="profile-card" className="text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-black border border-[#222222] flex items-center justify-center mx-auto text-5xl">
          🧠
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">AI Learner</h2>
          <p className="text-[#888888] text-sm mt-1">Foundation Explorer</p>
        </div>
      </Card>

      {/* Stats */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Statistics</h2>
        <div className="grid gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card testId={stat.testId}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-black border border-[#222222] flex items-center justify-center">
                        <Icon size={24} className="text-white" strokeWidth={1.5} />
                      </div>
                      <div className="text-[#BDBDBD]">{stat.label}</div>
                    </div>
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Achievements</h2>
        <Card testId="achievements-card">
          <div className="text-center py-8">
            <Award size={48} className="text-[#888888] mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-[#888888]">Complete more lessons to unlock achievements</p>
          </div>
        </Card>
      </div>

      {/* Reset Button */}
      <div className="pt-8">
        <Button
          onClick={() => setShowReset(!showReset)}
          variant="ghost"
          className="w-full"
          testId="reset-progress-button"
        >
          <div className="flex items-center justify-center gap-2">
            <RotateCcw size={18} strokeWidth={1.5} />
            Reset Progress
          </div>
        </Button>
        {showReset && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4"
          >
            <Button
              onClick={handleReset}
              variant="secondary"
              className="w-full"
              testId="confirm-reset-button"
            >
              Confirm Reset
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};