import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Map, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', path: '/', testId: 'nav-home' },
    { icon: Map, label: 'Path', path: '/path', testId: 'nav-path' },
    { icon: User, label: 'Profile', path: '/profile', testId: 'nav-profile' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-black relative">
      <div className="max-w-md mx-auto min-h-screen pb-24">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto bg-black/80 backdrop-blur-xl border-t border-[#222222] pb-8 pt-4 px-6">
          <div className="flex justify-between items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <motion.button
                  key={item.path}
                  data-testid={item.testId}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-1 relative"
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon 
                    size={24} 
                    strokeWidth={1.5}
                    className={active ? 'text-white' : 'text-[#888888]'}
                  />
                  <span className={`text-xs font-medium ${
                    active ? 'text-white' : 'text-[#888888]'
                  }`}>
                    {item.label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};