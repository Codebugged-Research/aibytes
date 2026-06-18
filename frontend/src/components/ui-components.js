import { motion } from 'framer-motion';

export const Button = ({ children, onClick, variant = 'primary', className = '', testId, disabled = false }) => {
  const baseClass = "font-semibold rounded-xl py-4 px-8 transition-all focus:outline-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#6248FF] to-[#8B5CF6] text-white hover:shadow-lg hover:shadow-[#6248FF]/50 active:scale-95",
    secondary: "bg-[#1E293B] border border-[#334155] text-white hover:bg-[#334155] hover:border-[#475569]",
    success: "bg-gradient-to-r from-[#22C55E] to-[#10B981] text-white hover:shadow-lg hover:shadow-[#22C55E]/50"
  };

  return (
    <motion.button
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {children}
    </motion.button>
  );
};

export const Card = ({ children, className = '', interactive = false, onClick, testId }) => {
  const baseClass = "bg-[#1E293B]/50 backdrop-blur-sm border border-[#334155] rounded-2xl p-5";
  const interactiveClass = interactive ? "hover:bg-[#1E293B] hover:border-[#6248FF] hover:-translate-y-1 transition-all cursor-pointer" : "";

  return (
    <motion.div
      data-testid={testId}
      onClick={onClick}
      className={`${baseClass} ${interactiveClass} ${className}`}
      whileTap={interactive ? { scale: 0.98 } : {}}
    >
      {children}
    </motion.div>
  );
};

export const ProgressBar = ({ progress, className = '' }) => {
  return (
    <div className={`h-2 w-full bg-[#1E293B] rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-[#6248FF] to-[#8B5CF6] rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
};