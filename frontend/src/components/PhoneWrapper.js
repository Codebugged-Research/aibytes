import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Signal, Battery } from 'lucide-react';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

export const PhoneWrapper = ({ children }) => {
  const [time, setTime] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      setTime(`${hours}:${minutes < 10 ? '0' + minutes : minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // On real mobile devices, render full-screen without the fake phone chrome
  if (isMobile) {
    return (
      <div className="h-screen w-full bg-[#F8FAFC] flex flex-col overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-100 flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Phone chassis */}
      <motion.div
        className="relative w-full max-w-[375px] h-full max-h-[780px] bg-white rounded-[52px] shadow-2xl border-[10px] border-slate-900 overflow-hidden flex flex-col"
        initial={{ y: 80, opacity: 0, scale: 0.94 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26, delay: 0.08 }}
      >
        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-slate-900 rounded-full z-50 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-850 absolute left-4 border border-slate-800" />
        </div>

        {/* Status Bar */}
        <div className="h-11 w-full bg-white flex items-center justify-between px-7 select-none z-40 flex-shrink-0 text-slate-900">
          <span className="text-xs font-bold font-sans tracking-tight leading-none pt-1">
            {time || '19:47'}
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <Signal size={12} className="text-slate-900" strokeWidth={2.5} />
            <Wifi size={12} className="text-slate-900" strokeWidth={2.5} />
            <Battery size={16} className="text-slate-900" strokeWidth={2.5} />
          </div>
        </div>

        {/* Main App Content Viewport */}
        <div className="flex-1 w-full overflow-hidden relative bg-[#F8FAFC] flex flex-col" style={{ minHeight: 0 }}>
          {children}
        </div>

        {/* Home Indicator */}
        <div className="h-8 w-full bg-white flex items-center justify-center pb-2 select-none z-40 flex-shrink-0">
          <div className="w-32 h-1.5 bg-slate-900 rounded-full opacity-80" />
        </div>
      </motion.div>
    </div>
  );
};
