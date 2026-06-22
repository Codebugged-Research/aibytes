import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Trophy, Crown, ChevronUp, ChevronDown } from 'lucide-react';
import { useProgress } from '../hooks/useProgress';

// ── Static mock league data ────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: 'm1',  name: 'Alex Chen',   initials: 'AC', color: '#6248FF', streak: 45, xp: 890 },
  { id: 'm2',  name: 'Priya M.',    initials: 'PM', color: '#f59e0b', streak: 38, xp: 760 },
  { id: 'm3',  name: 'Jordan K.',   initials: 'JK', color: '#10b981', streak: 31, xp: 620 },
  { id: 'm4',  name: 'Sam W.',      initials: 'SW', color: '#ef4444', streak: 22, xp: 440 },
  { id: 'm5',  name: 'Maria L.',    initials: 'ML', color: '#3b82f6', streak: 18, xp: 360 },
  { id: 'm6',  name: 'Kevin T.',    initials: 'KT', color: '#8b5cf6', streak: 14, xp: 280 },
  { id: 'm7',  name: 'Nina R.',     initials: 'NR', color: '#ec4899', streak: 11, xp: 220 },
  { id: 'm8',  name: 'Omar F.',     initials: 'OF', color: '#14b8a6', streak:  7, xp: 140 },
  { id: 'm9',  name: 'Lily Z.',     initials: 'LZ', color: '#f97316', streak:  5, xp: 100 },
  { id: 'm10', name: 'Chris A.',    initials: 'CA', color: '#06b6d4', streak:  3, xp:  60 },
  { id: 'm11', name: 'Emma B.',     initials: 'EB', color: '#a855f7', streak:  2, xp:  40 },
  { id: 'm12', name: 'Raj S.',      initials: 'RS', color: '#64748b', streak:  1, xp:  20 },
];

const MEDAL = {
  1: { bg: 'from-yellow-400 to-amber-500',  shadow: 'shadow-yellow-200',  ring: '#f59e0b', label: 'Gold'   },
  2: { bg: 'from-slate-300 to-slate-400',   shadow: 'shadow-slate-200',   ring: '#94a3b8', label: 'Silver' },
  3: { bg: 'from-amber-600 to-amber-700',   shadow: 'shadow-amber-200',   ring: '#b45309', label: 'Bronze' },
};

// ── Avatar ─────────────────────────────────────────────────────────────────────
const Avatar = ({ initials, color, size = 40, isYou = false }) => (
  <div
    className="rounded-full flex items-center justify-center font-black text-white flex-shrink-0"
    style={{
      width: size, height: size,
      background: isYou ? 'linear-gradient(135deg,#6248FF,#8B5CF6)' : color,
      fontSize: size * 0.35,
      boxShadow: isYou ? '0 0 0 2px #fff, 0 0 0 4px #6248FF' : undefined,
    }}
  >
    {isYou ? 'You' : initials}
  </div>
);

// ── Rank badge ─────────────────────────────────────────────────────────────────
const RankBadge = ({ rank }) => {
  const medal = MEDAL[rank];
  if (medal) {
    return (
      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${medal.bg} ${medal.shadow} shadow flex items-center justify-center flex-shrink-0`}>
        {rank === 1
          ? <Crown size={13} className="text-white" fill="white" strokeWidth={0} />
          : <span className="text-white font-black text-[11px]">{rank}</span>
        }
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
      <span className="text-slate-500 font-black text-[11px]">{rank}</span>
    </div>
  );
};

// ── Single leaderboard row ─────────────────────────────────────────────────────
const Row = ({ entry, rank, index, tab }) => {
  const isYou = entry.id === 'you';
  const isTop3 = rank <= 3;
  const medal = MEDAL[rank];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.06 + index * 0.045, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors ${
        isYou
          ? 'bg-violet-50 border-violet-200'
          : isTop3
          ? 'bg-white border-slate-100 shadow-sm'
          : 'bg-white border-slate-100'
      }`}
    >
      <RankBadge rank={rank} />
      <Avatar initials={entry.initials} color={entry.color} size={38} isYou={isYou} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-extrabold truncate ${isYou ? 'text-violet-700' : 'text-slate-900'}`}>
            {entry.name}
          </span>
          {isYou && (
            <span className="text-[9px] font-black bg-violet-600 text-white px-1.5 py-0.5 rounded-full">YOU</span>
          )}
        </div>
        {/* Secondary stat */}
        <div className="flex items-center gap-2 mt-0.5">
          {tab === 'streak' ? (
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
              <Zap size={9} className="text-violet-400" /> {entry.xp} XP
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
              <Flame size={9} className="text-orange-400" /> {entry.streak}d streak
            </span>
          )}
        </div>
      </div>

      {/* Primary stat */}
      <div className="flex flex-col items-end">
        {tab === 'streak' ? (
          <div className="flex items-center gap-1">
            <Flame size={14} className="text-orange-500" strokeWidth={2.5} />
            <span className={`text-base font-black ${isYou ? 'text-violet-700' : 'text-slate-900'}`}>
              {entry.streak}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Zap size={14} className="text-violet-500" strokeWidth={2.5} fill="#8b5cf6" />
            <span className={`text-base font-black ${isYou ? 'text-violet-700' : 'text-slate-900'}`}>
              {entry.xp}
            </span>
          </div>
        )}
        <span className="text-[9px] text-slate-400 font-medium">
          {tab === 'streak' ? 'days' : 'XP'}
        </span>
      </div>
    </motion.div>
  );
};

// ── Top-3 Podium ───────────────────────────────────────────────────────────────
const PodiumCard = ({ entry, rank }) => {
  const medal  = MEDAL[rank];
  const isYou  = entry.id === 'you';
  const height = rank === 1 ? 76 : rank === 2 ? 58 : 46;

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + (rank === 1 ? 0 : rank === 2 ? 0.07 : 0.14), type: 'spring', stiffness: 300, damping: 22 }}
    >
      {rank === 1 && (
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Crown size={22} className="text-yellow-500 fill-yellow-400" strokeWidth={1} />
        </motion.div>
      )}
      <Avatar initials={entry.initials} color={entry.color} size={rank === 1 ? 52 : 44} isYou={isYou} />
      <div className="text-center">
        <div className="text-[11px] font-extrabold text-slate-900 leading-tight">{isYou ? 'You' : entry.name.split(' ')[0]}</div>
        <div className="flex items-center justify-center gap-0.5 mt-0.5">
          <Flame size={9} className="text-orange-500" />
          <span className="text-[10px] font-black text-slate-700">{entry.streak}d</span>
        </div>
      </div>
      {/* Podium pillar */}
      <motion.div
        className={`w-20 bg-gradient-to-b ${medal.bg} rounded-t-xl flex items-start justify-center pt-2`}
        style={{ height }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.3 + rank * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1], originY: 1 }}
      >
        <span className="text-white/90 font-black text-xl leading-none">{rank}</span>
      </motion.div>
    </motion.div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
export const Leaderboard = () => {
  const { streak, xp } = useProgress();
  const [tab, setTab] = useState('streak'); // 'streak' | 'xp'

  const youEntry = {
    id: 'you', name: 'You', initials: 'You',
    color: '#6248FF', streak: streak || 0, xp: xp || 0,
  };

  // Build sorted list with "you" inserted
  const sorted = [...MOCK_USERS, youEntry]
    .sort((a, b) => tab === 'streak' ? b.streak - a.streak || b.xp - a.xp : b.xp - a.xp || b.streak - a.streak);

  const youRank = sorted.findIndex(e => e.id === 'you') + 1;
  const top3    = sorted.slice(0, 3);
  // Reorder podium: 2nd left, 1st centre, 3rd right
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const rest        = sorted.slice(3);
  // If "you" is outside top 10 show a sticky bottom card
  const youInRest   = rest.some(e => e.id === 'you');
  const listCap     = 10;
  const restShown   = rest.slice(0, listCap);

  return (
    <div className="space-y-4">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div
        className="px-5 pt-5 pb-4 bg-gradient-to-br from-[#6248FF] to-[#8B5CF6] text-white flex-shrink-0"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-yellow-300 fill-yellow-300" strokeWidth={1} />
            <span className="text-base font-black">Bronze League</span>
          </div>
          <motion.div
            className="text-[10px] font-bold text-white/70 bg-white/10 rounded-full px-2.5 py-1"
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Resets Sun
          </motion.div>
        </div>
        <p className="text-white/70 text-[11px]">Top 3 advance to Silver League →</p>

        {/* Your rank highlight */}
        <motion.div
          className="mt-3 bg-white/15 rounded-xl px-3 py-2 flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-1">
            {youRank <= 3
              ? <Crown size={13} className="text-yellow-300 fill-yellow-300" strokeWidth={0} />
              : youRank <= 10
              ? <ChevronUp size={13} className="text-emerald-300" />
              : <ChevronDown size={13} className="text-red-300" />
            }
            <span className="font-black text-sm">#{youRank}</span>
          </div>
          <span className="text-white/80 text-xs flex-1">Your rank</span>
          <div className="flex items-center gap-2.5 text-xs font-extrabold">
            <span className="flex items-center gap-1">
              <Flame size={11} className="text-orange-300" />
              {streak}d
            </span>
            <span className="flex items-center gap-1">
              <Zap size={11} className="text-violet-200" />
              {xp} XP
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Tab switcher ───────────────────────────────────────────────── */}
      <div className="flex gap-2 px-5 pt-4 pb-2 bg-[#F8FAFC] flex-shrink-0">
        {[['streak', 'Streak', Flame], ['xp', 'XP', Zap]].map(([key, label, Icon]) => (
          <motion.button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition-colors ${
              tab === key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-500 border border-slate-200'
            }`}
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
          >
            <Icon size={12} className={tab === key ? 'text-white' : 'text-slate-400'} />
            {label}
          </motion.button>
        ))}
      </div>

      {/* ── Scrollable list ────────────────────────────────────────────── */}
      <div className="pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* Podium (top 3) */}
            <div className="px-4 pt-3 pb-1">
              <div className="flex items-end justify-center gap-3">
                {podiumOrder.map((entry, i) => {
                  const rank = sorted.indexOf(entry) + 1;
                  return <PodiumCard key={entry.id} entry={entry} rank={rank} />;
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="mx-5 my-3 h-px bg-slate-200" />

            {/* Rows #4 onward */}
            <div className="px-4 space-y-2">
              {restShown.map((entry, i) => {
                const rank = sorted.indexOf(entry) + 1;
                return <Row key={entry.id} entry={entry} rank={rank} index={i} tab={tab} />;
              })}
            </div>

            {/* Sticky "you" card if outside top 10 */}
            {youInRest && youRank > listCap + 3 && (
              <div className="px-4 mt-3">
                <div className="border-t border-dashed border-slate-200 mb-2" />
                <Row entry={youEntry} rank={youRank} index={0} tab={tab} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
