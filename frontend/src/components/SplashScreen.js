import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export const SplashScreen = ({ onComplete }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={() => setTimeout(onComplete, 2000)}
    >
      {/* Animated background circles */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
      >
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#6248FF] rounded-full blur-[100px] opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#8B5CF6] rounded-full blur-[100px] opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        />
      </motion.div>

      {/* Logo and text */}
      <div className="relative z-10 text-center space-y-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#6248FF] to-[#8B5CF6] rounded-2xl blur-xl opacity-50"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative bg-gradient-to-r from-[#6248FF] to-[#8B5CF6] p-6 rounded-2xl">
              <Zap size={64} className="text-white" strokeWidth={2} fill="white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            AIBytes
          </h1>
          <p className="text-[#94A3B8] text-lg font-medium">Master AI in 10 minutes</p>
        </motion.div>

        <motion.div
          className="flex gap-2 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-[#6248FF] rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};