import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ROLES } from '../utils/roles';

// Single-select list of role rows (radio semantics — unlike TopicChips'
// multi-select grid, only one role applies at a time). `selected` is a
// single role id or null, `onSelect(id)` picks one; picking the already-
// selected role clears it back to null (no role = show everything).
export const RoleChips = ({ selected, onSelect }) => {
  return (
    <div className="space-y-2" data-testid="role-chips">
      {ROLES.map((role) => {
        const active = selected === role.id;
        return (
          <motion.button
            key={role.id}
            type="button"
            onClick={() => onSelect(active ? null : role.id)}
            data-testid={`role-chip-${role.id}`}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors ${
              active
                ? 'bg-violet-50 border-[#6248FF]'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-xl">{role.icon}</span>
            <span className="flex-1 text-sm font-bold text-slate-800">{role.label}</span>
            {active && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                className="w-5 h-5 rounded-full bg-[#6248FF] flex items-center justify-center flex-shrink-0"
              >
                <Check size={12} className="text-white" strokeWidth={3} />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
