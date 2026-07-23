import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { TOPIC_CATEGORIES } from '../utils/topics';

// Multi-select grid of learning-focus chips. Controlled: `selected` is an
// array of category ids, `onToggle(id)` flips one entry.
export const TopicChips = ({ selected, onToggle }) => {
  const isOn = (id) => selected.includes(id);

  return (
    <div className="grid grid-cols-2 gap-2.5" data-testid="topic-chips">
      {TOPIC_CATEGORIES.map((cat) => {
        const active = isOn(cat.id);
        return (
          <motion.button
            key={cat.id}
            type="button"
            onClick={() => onToggle(cat.id)}
            data-testid={`topic-chip-${cat.id}`}
            whileTap={{ scale: 0.95 }}
            className={`relative flex flex-col items-start gap-1.5 rounded-2xl border-2 p-3.5 text-left transition-colors ${
              active
                ? 'bg-violet-50 border-[#6248FF]'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            {active && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#6248FF] flex items-center justify-center"
              >
                <Check size={10} className="text-white" strokeWidth={3} />
              </motion.div>
            )}
            <span className="text-2xl">{cat.icon}</span>
            <span className="text-xs font-bold text-slate-800 leading-tight pr-4">{cat.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
