import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { Mascot } from './Mascot';
import { setOnboarded, setUser } from '../utils/storage';
import { playHappyChime, playPop } from '../utils/sound';

const GoogleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

// celebratory particle burst on success (tuned for a light background)
const SuccessBurst = () => {
  const colors = ['#6248FF', '#22d3ee', '#8b5cf6', '#10b981', '#ec4899', '#f59e0b'];
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {Array.from({ length: 22 }, (_, i) => {
        const angle = (i / 22) * 360;
        return (
          <motion.div
            key={i}
            className="absolute w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: colors[i % colors.length] }}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.2, 0.4],
              x: Math.cos((angle * Math.PI) / 180) * (90 + (i % 3) * 22),
              y: Math.sin((angle * Math.PI) / 180) * (90 + (i % 3) * 22),
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 1, delay: 0.05 + (i % 6) * 0.03, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
};

export const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState('welcome'); // welcome | loading | success

  const finish = (method, payload) => {
    setUser({ method, ...payload, joinedAt: Date.now() });
    setStep('success');
    playHappyChime();
    setTimeout(() => { setOnboarded(true); onComplete(); }, 2400);
  };

  const handleGoogle = () => {
    playPop();
    setStep('loading');
    setTimeout(() => finish('google', { name: 'Learner', email: 'you@gmail.com' }), 1500);
  };

  const byteMood = step === 'success' ? 'celebrate' : 'wave';

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-[#F8FAFC]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.4 }}
      data-testid="onboarding"
    >
      {/* soft brand glow accents (kept subtle to match the home screen) */}
      <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle,rgba(124,92,255,0.12),transparent)' }} />
      <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle,rgba(124,92,255,0.08),transparent)' }} />

      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-8">
        {/* Byte welcomes the user */}
        <div className="relative flex flex-col items-center">
          {step === 'success' && <SuccessBurst />}
          <motion.div
            key={byteMood}
            initial={{ scale: 0.6, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
          >
            <Mascot mood={byteMood} size={120} />
          </motion.div>
        </div>

        <div className="w-full mt-3">
          <AnimatePresence mode="wait">
            {step === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-7"
              >
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-[11px] font-bold text-violet-600">
                    Hi, I&apos;m Byte — your AI guide
                  </div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Welcome to{' '}
                    <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#6248FF,#8b5cf6)' }}>AIBites</span>
                  </h1>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
                    Master AI in fun 5-minute bites. Let&apos;s set up your account.
                  </p>
                </div>

                <motion.button
                  onClick={handleGoogle}
                  data-testid="google-auth"
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-800 font-bold text-sm rounded-2xl py-3.5 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <GoogleIcon size={19} />
                  Continue with Google
                </motion.button>

                <p className="text-[10px] text-slate-400 text-center leading-relaxed px-4">
                  By continuing you agree to our Terms &amp; Privacy Policy.
                </p>
              </motion.div>
            )}

            {step === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3 pt-2">
                <Loader2 size={26} className="text-[#6248FF] animate-spin" />
                <p className="text-sm text-slate-500 font-semibold">Connecting to Google…</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-black text-emerald-600 uppercase tracking-wider">
                  <ShieldCheck size={13} /> Verified
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>You&apos;re all set!</h2>
                <p className="text-sm text-slate-500 font-medium">Byte can&apos;t wait to teach you. Let&apos;s dive in.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
