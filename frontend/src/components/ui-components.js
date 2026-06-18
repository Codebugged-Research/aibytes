import { motion } from 'framer-motion';

export const Button = ({ children, onClick, variant = 'primary', className = '', testId, disabled = false }) => {
  const baseClass = "font-semibold rounded-full py-4 px-8 transition-all focus:outline-none";
  
  const variants = {
    primary: "bg-white text-black hover:bg-[#EAEAEA] focus:ring-4 focus:ring-white/20",
    secondary: "bg-transparent border border-[#222222] text-white hover:bg-[#111111]",
    ghost: "bg-[#111111] border border-[#222222] text-white hover:bg-[#222222]"
  };

  return (
    <motion.button
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileTap={!disabled ? { scale: 0.96 } : {}}
    >
      {children}
    </motion.button>
  );
};

export const Card = ({ children, className = '', interactive = false, onClick, testId }) => {
  const baseClass = "bg-[#111111] border border-[#222222] rounded-3xl p-6";
  const interactiveClass = interactive ? "hover:-translate-y-1 hover:border-white/50 transition-all cursor-pointer" : "";

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
    <div className={`h-2 w-full bg-[#222222] rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-white rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
};