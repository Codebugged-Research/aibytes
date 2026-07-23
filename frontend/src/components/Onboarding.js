import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, ArrowLeft, Phone, Mail } from 'lucide-react';
import { Mascot } from './Mascot';
import { setOnboarded, setUser, setTopicPrefs } from '../utils/storage';
import { playHappyChime, playPop } from '../utils/sound';
import { dialForIso } from '../utils/countries';
import { PhoneField } from './PhoneField';
import { TopicChips } from './TopicChips';
import { ThemeToggle } from './ThemeToggle';

const GoogleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

const AppleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.89 2.65 3.23 2.6 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.39.81 1.4-.02 2.29-1.27 3.14-2.53.99-1.45 1.4-2.86 1.42-2.93-.03-.01-2.72-1.04-2.75-4.13zM14.5 4.6c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44z" />
  </svg>
);

// celebratory particle burst on success (tuned for a light background)
const SuccessBurst = () => {
  const colors = ['#6248FF', '#22d3ee', '#8b5cf6', '#10b981', '#ec4899', '#f59e0b'];
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {Array.from({ length: 22 }, (_, i) => {
        const angle = (i / 22) * Math.PI * 2;
        const dist = 90 + Math.random() * 50;
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{ backgroundColor: colors[i % colors.length] }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: 0, opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
};


const inputCls =
  'w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6248FF] transition-colors';
const primaryBtnCls =
  'w-full bg-[#6248FF] text-white font-bold text-sm rounded-2xl py-3.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity';
const backBtnCls = 'inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors';

const stepAnim = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

export const Onboarding = ({ onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState('welcome'); // welcome | loading | phone | email | otp | details | topics | success
  const [provider, setProvider] = useState('google'); // label for loading screen
  const [countryIso, setCountryIso] = useState('IN');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loginMethod, setLoginMethod] = useState(''); // 'phone' | 'email'
  const [resend, setResend] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [pendingFinish, setPendingFinish] = useState(null); // { method, payload } queued until the topics step completes
  const otpRefs = useRef([]);
  const cc = dialForIso(countryIso);
  const emailValid = /\S+@\S+\.\S+/.test(email.trim());

  // resend countdown while on the OTP step
  useEffect(() => {
    if (step !== 'otp' || resend <= 0) return undefined;
    const t = setTimeout(() => setResend((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resend]);

  const finish = (method, payload) => {
    setUser({ method, ...payload, joinedAt: Date.now() });
    setStep('success');
    playHappyChime();
    setTimeout(() => { setOnboarded(true); navigate('/', { replace: true }); onComplete(); }, 2400);
  };

  // Account creation is done, but we still need the learner's topic focus
  // before celebrating — queue the finish() call for the topics step.
  const goToTopics = (method, payload) => {
    setPendingFinish({ method, payload });
    setStep('topics');
  };

  const toggleTopic = (id) => {
    playPop();
    setSelectedTopics((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const finishTopics = () => {
    setTopicPrefs(selectedTopics);
    if (pendingFinish) finish(pendingFinish.method, pendingFinish.payload);
  };

  const handleOAuth = (which) => {
    playPop();
    setProvider(which);
    setStep('loading');
    const mock = which === 'apple'
      ? { name: 'Learner', email: 'you@icloud.com' }
      : { name: 'Learner', email: 'you@gmail.com' };
    setTimeout(() => goToTopics(which, mock), 1500);
  };

  const phoneDigits = phone.replace(/\D/g, '');

  const sendCode = () => {
    if (phoneDigits.length < 6) return;
    playPop();
    setOtp(['', '', '', '', '', '']);
    setResend(30);
    setStep('otp');
    setTimeout(() => otpRefs.current[0]?.focus(), 250);
  };

  const verifyOtp = () => {
    // Demo: any 6 digits are accepted; collect the user's details next.
    playPop();
    setStep('details');
  };

  const setDigit = (i, v) => {
    const d = v.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 5) otpRefs.current[i + 1]?.focus();
    if (next.every((x) => x !== '')) setTimeout(verifyOtp, 220);
  };

  const onOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const onOtpPaste = (e) => {
    const txt = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!txt) return;
    e.preventDefault();
    const next = ['', '', '', '', '', ''];
    for (let k = 0; k < txt.length; k += 1) next[k] = txt[k];
    setOtp(next);
    otpRefs.current[Math.min(txt.length, 5)]?.focus();
    if (txt.length === 6) setTimeout(verifyOtp, 220);
  };

  const completeDetails = () => {
    const isPhone = loginMethod === 'phone';
    const isEmail = loginMethod === 'email';
    if (!firstName.trim() || !lastName.trim()) return;
    if (isPhone && !emailValid) return;
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    if (isPhone) {
      goToTopics('phone', {
        name: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: `${cc} ${phone}`
      });
    } else if (isEmail) {
      goToTopics('email', {
        name: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim()
      });
    }
  };

  const sendEmailCode = () => {
    if (!emailValid) return;
    playPop();
    setOtp(['', '', '', '', '', '']);
    setResend(30);
    setStep('otp');
    setTimeout(() => otpRefs.current[0]?.focus(), 250);
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

      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

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
            <Mascot mood={byteMood} size={108} />
          </motion.div>
        </div>

        <div className="w-full mt-3">
          <AnimatePresence mode="wait">
            {step === 'welcome' && (
              <motion.div key="welcome" {...stepAnim} className="space-y-6">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-[11px] font-bold text-violet-600">
                    Hi, I&apos;m Byte — your AI guide
                  </div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Welcome to{' '}
                    <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#6248FF,#8b5cf6)' }}>AIBites</span>
                  </h1>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
                    Master AI in fun 5-minute bites. Pick how you&apos;d like to sign up.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <motion.button
                    onClick={() => handleOAuth('google')}
                    data-testid="google-auth"
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-800 font-bold text-sm rounded-2xl py-3.5 shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    <GoogleIcon size={19} />
                    Continue with Google
                  </motion.button>

                  <motion.button
                    onClick={() => handleOAuth('apple')}
                    data-testid="apple-auth"
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-sm rounded-2xl py-3.5 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                  >
                    <AppleIcon size={18} />
                    Continue with Apple
                  </motion.button>

                  <div className="flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">or</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  <motion.button
                    onClick={() => { playPop(); setLoginMethod('phone'); setStep('phone'); }}
                    data-testid="phone-auth"
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2.5 bg-white border border-slate-200 text-slate-800 font-bold text-sm rounded-2xl py-3.5 shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    <Phone size={17} className="text-[#6248FF]" />
                    Continue with phone
                  </motion.button>

                  <motion.button
                    onClick={() => { playPop(); setLoginMethod('email'); setStep('email'); }}
                    data-testid="email-auth"
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2.5 bg-white border border-slate-200 text-slate-800 font-bold text-sm rounded-2xl py-3.5 shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    <Mail size={17} className="text-[#6248FF]" />
                    Continue with email
                  </motion.button>

                </div>
                <p className="text-[10px] text-slate-400 text-center leading-relaxed px-4">
                  By continuing you agree to our Terms &amp; Privacy Policy.
                </p>
              </motion.div>
            )}

            {step === 'phone' && (
              <motion.div key="phone" {...stepAnim} className="space-y-5">
                <button onClick={() => setStep('welcome')} className={backBtnCls}>
                  <ArrowLeft size={15} /> Back
                </button>
                <div className="text-center space-y-1.5">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Enter your phone</h2>
                  <p className="text-sm text-slate-500 font-medium">We&apos;ll text you a 6-digit code.</p>
                </div>
                <PhoneField
                  countryIso={countryIso}
                  onCountry={setCountryIso}
                  phone={phone}
                  onPhone={setPhone}
                  placeholder="Phone number"
                />
                <button data-testid="send-code" onClick={sendCode} disabled={phoneDigits.length < 6} className={primaryBtnCls}>
                  Send code
                </button>
              </motion.div>
            )}
            {step === 'email' && (
              <motion.div key="email" {...stepAnim} className="space-y-5">
                <button onClick={() => setStep('welcome')} className={backBtnCls}>
                  <ArrowLeft size={15} /> Back
                </button>
                <div className="text-center space-y-1.5">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Enter your email</h2>
                  <p className="text-sm text-slate-500 font-medium">We&apos;ll email you a 6-digit code.</p>
                </div>
                <input
                  data-testid="email-signup-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className={inputCls}
                />
                <button data-testid="send-email-code" onClick={sendEmailCode} disabled={!emailValid} className={primaryBtnCls}>
                  Send code
                </button>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div key="otp" {...stepAnim} className="space-y-5">
                <button onClick={() => setStep(loginMethod === 'phone' ? 'phone' : 'email')} className={backBtnCls}>
                  <ArrowLeft size={15} /> Back
                </button>
                <div className="text-center space-y-1.5">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Verify your identity</h2>
                  <p className="text-sm text-slate-500 font-medium">
                    {loginMethod === 'phone' ? `Code sent to ${cc} ${phone}` : `Code sent to ${email}`}
                  </p>
                </div>
                <div className="flex justify-center gap-2" onPaste={onOtpPaste}>
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      data-testid={`otp-${i}`}
                      value={d}
                      onChange={(e) => setDigit(i, e.target.value)}
                      onKeyDown={(e) => onOtpKey(i, e)}
                      inputMode="numeric"
                      maxLength={1}
                      className="w-11 h-12 bg-white border-2 border-slate-200 rounded-xl text-center text-xl font-black text-slate-900 focus:outline-none focus:border-[#6248FF] transition-colors"
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 text-center">Demo — enter any 6 digits</p>
                <div className="text-center text-xs text-slate-400 font-semibold">
                  {resend > 0
                    ? `Resend code in ${resend}s`
                    : <button onClick={() => { playPop(); setResend(30); }} className="text-[#6248FF] font-bold">Resend code</button>}
                </div>
              </motion.div>
            )}

            {step === 'details' && (
              <motion.div key="details" {...stepAnim} className="space-y-5">
                <div className="text-center space-y-1.5">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Almost there!</h2>
                  <p className="text-sm text-slate-500 font-medium">Tell Byte what to call you.</p>
                </div>
                <div className="space-y-3">
                  <input
                    data-testid="first-name-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    autoComplete="given-name"
                    className={inputCls}
                  />
                  <input
                    data-testid="last-name-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    autoComplete="family-name"
                    className={inputCls}
                  />
                  {loginMethod === 'phone' && (
                    <input
                      data-testid="email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      autoComplete="email"
                      className={inputCls}
                    />
                  )}
                </div>
                <button
                  data-testid="details-continue"
                  onClick={completeDetails}
                  disabled={!firstName.trim() || !lastName.trim() || (loginMethod === 'phone' && !emailValid)}
                  className={primaryBtnCls}
                >
                  Continue
                </button>
              </motion.div>
            )}

            {step === 'topics' && (
              <motion.div key="topics" {...stepAnim} className="space-y-5">
                <div className="text-center space-y-1.5">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>What do you want to learn?</h2>
                  <p className="text-sm text-slate-500 font-medium">Pick your focus areas — we&apos;ll bring those lessons forward. You can change this anytime from your profile.</p>
                </div>
                <TopicChips selected={selectedTopics} onToggle={toggleTopic} />
                <button data-testid="topics-continue" onClick={finishTopics} className={primaryBtnCls}>
                  {selectedTopics.length > 0 ? 'Start learning' : 'Skip for now'}
                </button>
              </motion.div>
            )}

            {step === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3 pt-2">
                <Loader2 size={26} className="text-[#6248FF] animate-spin" />
                <p className="text-sm text-slate-500 font-semibold">Connecting to {provider === 'apple' ? 'Apple' : 'Google'}…</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-black text-emerald-600 uppercase tracking-wider">
                  <ShieldCheck size={13} /> Verified
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>You&apos;re all set!</h2>
                <p className="text-sm text-slate-500 font-medium">Byte can&apos;t wait to teach you. Let&apos;s dive in.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
