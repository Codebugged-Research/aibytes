import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { TopicChips } from '../components/TopicChips';
import { getTopicPrefs, setTopicPrefs } from '../utils/storage';
import { playPop } from '../utils/sound';

// Full-screen page (outside the tab Layout, like LessonPlayer) so learners can
// revisit the onboarding topic survey and re-prioritize their curriculum order.
export const LearningFocus = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(() => getTopicPrefs());

  const toggle = (id) => {
    playPop();
    setSelected((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const save = () => {
    setTopicPrefs(selected);
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
      <div className="px-6 py-6 space-y-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={15} /> Back
        </button>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Learning focus</h1>
          <p className="text-sm text-slate-500 font-medium">Pick your focus areas — we&apos;ll bring those lessons forward on your path. Leave everything unselected to learn in the original order.</p>
        </div>

        <TopicChips selected={selected} onToggle={toggle} />

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
