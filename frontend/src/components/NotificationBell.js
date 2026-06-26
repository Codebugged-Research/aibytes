import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Flame, Award, Sparkles, X, ChevronRight } from 'lucide-react';

const NOTIFS = [
  { icon: Flame, tint: 'text-orange-500 bg-orange-50', title: 'Keep your streak alive', body: "You're on a streak — do today's bite to keep it!", time: 'now', to: '/path' },
  { icon: Award, tint: 'text-emerald-500 bg-emerald-50', title: 'Lesson unlocked', body: 'A new AI bite is ready for you on your path.', time: '2h', to: '/path' },
  { icon: Sparkles, tint: 'text-violet-500 bg-violet-50', title: 'A tip from Byte', body: 'Tap to ask Byte about any concept.', time: '1d', chat: true },
];

export const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const toggle = () => { setOpen((o) => !o); setSeen(true); };

  const handleAction = (n) => {
    setOpen(false);
    if (n.chat) window.dispatchEvent(new CustomEvent('aibites:open-chat'));
    else if (n.to) navigate(n.to);
  };

  return (
    <div className="relative" ref={ref}>
      <motion.button
        onClick={toggle}
        data-testid="notif-bell"
        aria-label="Notifications"
        className="relative w-11 h-11 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-900 shadow-sm"
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <Bell size={20} strokeWidth={2} />
        {!seen && (
          <motion.span
            className="absolute top-2 right-2.5 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-white"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="notif-panel"
            className="absolute right-0 mt-2 w-72 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-50"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="text-sm font-extrabold text-slate-900">Notifications</span>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Close">
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {NOTIFS.map((n, i) => {
                const Icon = n.icon;
                return (
                  <button
                    key={i}
                    type="button"
                    data-testid={`notif-item-${i}`}
                    onClick={() => handleAction(n)}
                    className="w-full text-left flex items-start gap-3 px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${n.tint}`}>
                      <Icon size={16} strokeWidth={2.4} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900 truncate">{n.title}</p>
                        <span className="text-[10px] text-slate-400 font-semibold flex-shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-snug">{n.body}</p>
                    </div>
                    <ChevronRight size={15} className="text-slate-300 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
