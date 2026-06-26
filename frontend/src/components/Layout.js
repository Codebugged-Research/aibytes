import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Trophy, User, Route } from 'lucide-react';
import { motion } from 'framer-motion';
import { ByteChat } from './ByteChat';
import { NotificationBell } from './NotificationBell';

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home,    label: 'Home',         path: '/',            testId: 'nav-home'        },
    { icon: Trophy,  label: 'Leaderboard',  path: '/leaderboard', testId: 'nav-leaderboard' },
    { icon: Route,   label: 'Path',         path: '/path',        testId: 'nav-path'        },
    { icon: User,    label: 'Account',      path: '/profile',     testId: 'nav-profile'     }
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
    <div className="relative h-full w-full bg-[#F8FAFC] flex flex-col" style={{ minHeight: 0 }}>
      {/* Top Profile Header */}
      <motion.div
        className="px-6 pt-5 pb-3 flex items-center justify-between bg-[#F8FAFC] flex-shrink-0"
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
            <div className="text-xl font-bold text-slate-900 leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              AIBites
            </div>
            <div className="text-[10px] text-slate-400 font-semibold tracking-wide leading-none mt-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Bite. Learn. Repeat.
            </div>
          </div>
        </div>

        <NotificationBell />
      </motion.div>

      {/* Main Content Area — flex-1 + min-h-0 is key for scroll inside flex-col */}
      <div className="flex-1 w-full overflow-y-auto pb-28" style={{ minHeight: 0 }}>
        <Outlet />
      </div>

      {/* Bottom Navigation — floats above content as an absolute overlay */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-40 px-4 pb-4"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="liquid-glass rounded-[28px] py-2.5 px-5">
          <div className="flex justify-between items-center max-w-[388px] mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <motion.button
                  key={item.path}
                  data-testid={item.testId}
                  onClick={() => navigate(item.path)}
                  aria-label={item.label}
                  className="flex-1 flex items-center justify-center py-1.5"
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                >
                  <Icon
                    size={26}
                    strokeWidth={2}
                    className={active ? 'text-slate-900' : 'text-slate-400'}
                    fill={active ? 'currentColor' : 'none'}
                  />
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Floating AI tutor chat */}
      <ByteChat />
    </div>
  );
};