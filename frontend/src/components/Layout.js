import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Activity, User, Bell, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home,     label: 'Home',     path: '/',         testId: 'nav-home'     },
    { icon: Activity, label: 'Activity', path: '/activity', testId: 'nav-activity' },
    { icon: Send,     label: 'Path',     path: '/path',     testId: 'nav-path'     },
    { icon: User,     label: 'Account',  path: '/profile',  testId: 'nav-profile'  }
  ];

  const isActive = (path) => location.pathname === path;

  // Cross-fade page transition — silky smooth feel
  const pageVariants = {
    initial: { opacity: 0, y: 8, scale: 0.995 },
    animate: { opacity: 1, y: 0,  scale: 1,
      transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
    },
    exit: { opacity: 0, scale: 0.995,
      transition: { duration: 0.18, ease: 'easeIn' }
    }
  };

  return (
    <div className="h-full w-full bg-[#F8FAFC] flex flex-col" style={{ minHeight: 0 }}>
      {/* Top Profile Header */}
      <motion.div
        className="px-6 pt-5 pb-3 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-100 flex-shrink-0"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3">
          {/* AIBites Logo */}
          <motion.div
            className="w-11 h-11 cursor-pointer flex-shrink-0"
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate('/profile')}
          >
            <img src="/kidlin-logo.png" alt="AIBites Logo" className="w-full h-full object-contain" />
          </motion.div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold leading-none">
              READY TO
            </div>
            <div className="text-xl font-bold text-slate-900 leading-tight">
              AIBites
            </div>
          </div>
        </div>

        {/* Bell Button with animated badge */}
        <motion.button
          className="relative w-11 h-11 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-900 shadow-sm"
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Bell size={20} strokeWidth={2} />
          {/* Animated green dot */}
          <motion.span
            className="absolute top-2 right-2.5 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-white"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        </motion.button>
      </motion.div>

      {/* Main Content Area — flex-1 + min-h-0 is key for scroll inside flex-col */}
      <div className="flex-1 w-full overflow-y-auto pb-24" style={{ minHeight: 0 }}>
        <Outlet />
      </div>

      {/* Bottom Navigation — sits in normal flow, not absolute */}
      <motion.div
        className="flex-shrink-0 z-40"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-slate-150 py-3 px-6 shadow-[0_-8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex justify-between items-center max-w-[388px] mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <motion.button
                  key={item.path}
                  data-testid={item.testId}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-1 relative flex-1"
                  whileTap={{ scale: 0.82 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                >
                  {/* Container for icon & background pill */}
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    {/* Active glowing pill behind icon */}
                    <AnimatePresence>
                      {active && (
                        <motion.div
                          layoutId="nav-active-bg"
                          className="absolute inset-0 rounded-xl bg-slate-900/[0.06]"
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                        />
                      )}
                    </AnimatePresence>

                    <motion.div
                      className="relative z-10"
                      animate={active ? { y: -1 } : { y: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                    >
                      <Icon
                        size={22}
                        strokeWidth={active ? 2.5 : 2}
                        className={active ? 'text-slate-900' : 'text-slate-400'}
                      />
                    </motion.div>
                  </div>

                  <span className={`text-[10px] ${
                    active ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'
                  }`}>
                    {item.label}
                  </span>

                  {/* Active indicator dot */}
                  <AnimatePresence>
                    {active && (
                      <motion.div
                        className="w-1 h-1 rounded-full bg-slate-900 nav-dot"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};