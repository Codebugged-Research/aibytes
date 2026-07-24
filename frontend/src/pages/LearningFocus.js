import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { RoleChips } from '../components/RoleChips';
import { getRolePref, setRolePref, setShowAllLessons } from '../utils/storage';
import { invalidateCurriculumCache } from '../hooks/useData';
import { playPop } from '../utils/sound';

// Full-screen page (outside the tab Layout, like LessonPlayer) so learners can
// revisit the onboarding role choice and re-filter their curriculum.
export const LearningFocus = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(() => getRolePref());

  const selectRole = (id) => {
    playPop();
    setRole(id);
  };

  const save = () => {
    setRolePref(role);
    setShowAllLessons(false); // switching role resets the escape hatch
    invalidateCurriculumCache();
    navigate(-1);
  };

  return (
    <motion.div
      className="absolute inset-0 overflow-y-auto bg-[#F8FAFC]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      data-testid="learning-focus"
    >
      <div className="px-6 py-6 space-y-8 pb-10">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={15} /> Back
        </button>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Your role</h1>
            <p className="text-sm text-slate-500 font-medium">Pick a role to filter your path down to what matters for your work. Leave unselected to see every lesson.</p>
          </div>
          <RoleChips selected={role} onSelect={selectRole} />
        </div>

        <button
          data-testid="learning-focus-save"
          onClick={save}
          className="w-full bg-[#6248FF] text-white font-bold text-sm rounded-2xl py-3.5 shadow-sm"
        >
          Save
        </button>
      </div>
    </motion.div>
  );
};
