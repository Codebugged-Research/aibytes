import { motion } from 'framer-motion';

export const Button = ({ children, onClick, variant = 'primary', className = '', testId, disabled = false }) => {
  const baseClass = "font-semibold rounded-xl py-4 px-8 transition-all focus:outline-none";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/10 active:scale-95",
    secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/10"
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
  const baseClass = "bg-white border border-slate-200 rounded-2xl p-5 shadow-sm shadow-slate-100/50";
  const interactiveClass = interactive ? "hover:bg-slate-50/50 hover:border-slate-300 hover:-translate-y-0.5 hover:shadow transition-all cursor-pointer" : "";

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
    <div className={`h-2 w-full bg-slate-100 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-violet-600 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
};