import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { Mascot } from './Mascot';
import { askByteStream } from '../utils/chat';

const SUGGESTIONS = [
  'What is AI, really?',
  'Explain machine learning simply',
  'AI vs ML — what\u2019s the difference?',
  'Give me a tip to remember this',
];

const ThinkingDots = () => (
  <div className="flex items-center gap-1 py-1">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-violet-400"
        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

export const ByteChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // { role: 'user' | 'assistant', content }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, streaming, open]);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener('aibites:open-chat', openChat);
    return () => window.removeEventListener('aibites:open-chat', openChat);
  }, []);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading || streaming) return;
    setInput('');
    const next = [...messages, { role: 'user', content }];
    setMessages(next);
    setLoading(true);
    let started = false;
    const setLast = (full) => setMessages((m) => {
      const c = [...m];
      c[c.length - 1] = { role: 'assistant', content: full };
      return c;
    });
    await askByteStream(next, {
      onToken: (_delta, full) => {
        if (!started) {
          started = true;
          setLoading(false);
          setStreaming(true);
          setMessages((m) => [...m, { role: 'assistant', content: full }]);
        } else {
          setLast(full);
        }
      },
      onDone: (full) => {
        if (!started) setMessages((m) => [...m, { role: 'assistant', content: full }]);
        else setLast(full);
        setStreaming(false);
        setLoading(false);
      },
    });
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Floating Ask-Byte button */}
      <motion.button
        onClick={() => setOpen(true)}
        data-testid="ask-byte-fab"
        aria-label="Ask Byte"
        className="absolute right-4 bottom-[104px] z-40 w-14 h-14 rounded-full bg-white border border-violet-100 shadow-lg shadow-violet-200/50 flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.5 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.span
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: '2px solid rgba(98,72,255,0.4)' }}
          animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
        <Mascot mood="happy" size={46} glow={false} />
        <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
      </motion.button>

      {/* Chat sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute inset-0 z-50 bg-[#F8FAFC] flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            data-testid="byte-chat"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 flex-shrink-0">
              <Mascot mood="happy" size={40} glow={false} />
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Ask Byte</h2>
                <p className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Your AI tutor
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                data-testid="close-chat"
                aria-label="Close chat"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <X size={17} strokeWidth={2.5} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5" style={{ minHeight: 0 }}>
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center text-center pt-6 pb-2">
                  <Mascot mood="wave" size={92} />
                  <p className="text-slate-900 font-extrabold text-base mt-2">Hi, I&apos;m Byte!</p>
                  <p className="text-slate-500 text-sm font-medium mt-1 px-4">Ask me anything about AI, data, or your lessons.</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-xs font-bold text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-3 py-2 hover:bg-violet-100 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                m.role === 'user' ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[80%] bg-[#6248FF] text-white text-sm font-medium leading-relaxed rounded-2xl rounded-br-md px-3.5 py-2.5 shadow-sm">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex items-end gap-2">
                    <div className="flex-shrink-0 mb-0.5">
                      <Mascot mood={streaming && i === messages.length - 1 ? 'talking' : 'idle'} size={34} glow={false} />
                    </div>
                    <div className="max-w-[80%] bg-white border border-slate-150 text-slate-700 text-sm font-medium leading-relaxed rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-sm whitespace-pre-wrap">
                      {m.content}
                      {streaming && i === messages.length - 1 && (
                        <motion.span
                          className="inline-block w-0.5 h-[1em] align-[-2px] bg-violet-500 ml-0.5"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                      )}
                    </div>
                  </div>
                )
              ))}

              {loading && (
                <div className="flex items-end gap-2">
                  <div className="flex-shrink-0 mb-0.5"><Mascot mood="thinking" size={34} glow={false} /></div>
                  <div className="bg-white border border-slate-150 rounded-2xl rounded-bl-md px-4 py-2 shadow-sm">
                    <ThinkingDots />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-3 bg-white border-t border-slate-100 flex-shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask Byte anything…"
                data-testid="chat-input"
                className="flex-1 h-11 px-4 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-300"
              />
              <motion.button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                data-testid="chat-send"
                aria-label="Send"
                className="w-11 h-11 rounded-full bg-[#6248FF] text-white flex items-center justify-center shadow-sm shadow-violet-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                whileTap={{ scale: 0.9 }}
              >
                <Send size={17} strokeWidth={2.5} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
