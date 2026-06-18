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
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a] relative">
      <div className="max-w-md mx-auto min-h-screen pb-24">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-md mx-auto bg-[#0F172A]/95 backdrop-blur-xl border-t border-[#334155] pb-6 pt-3 px-6">
          <div className="flex justify-between items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <motion.button
                  key={item.path}
                  data-testid={item.testId}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-1.5 relative flex-1"
                  whileTap={{ scale: 0.9 }}
                >
                  <div className={`p-2 rounded-xl transition-all ${
                    active ? 'bg-[#6248FF]' : ''
                  }`}>
                    <Icon 
                      size={24} 
                      strokeWidth={2}
                      className={active ? 'text-white' : 'text-[#64748B]'}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    active ? 'text-white' : 'text-[#64748B]'
                  }`}>
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};