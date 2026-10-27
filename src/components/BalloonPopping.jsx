import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles } from 'lucide-react';
import { balloonMessages } from '../data/balloonMessages';

const COLORS = ['#A78BFA', '#F0ABFC', '#F4D58D', '#C4B5FD'];

function makeBalloons() {
  return balloonMessages.map((m, i) => ({
    id: i,
    msgId: m.id,
    color: COLORS[i % COLORS.length],
    left: 6 + ((i * 73) % 88),
    delay: (i % 6) * 0.3,
    duration: 4.5 + (i % 4),
  }));
}

export default function BalloonPopping() {
  const [balloons, setBalloons] = useState(makeBalloons);
  const [popped, setPopped] = useState(new Set());
  const [revealed, setRevealed] = useState(null);

  const pop = useCallback(
    (balloon) => {
      if (popped.has(balloon.id)) return;
      setPopped((prev) => new Set(prev).add(balloon.id));
      setRevealed(balloon.msgId);
    },
    [popped]
  );

  const reset = () => {
    setBalloons(makeBalloons());
    setPopped(new Set());
    setRevealed(null);
  };

  const remaining = balloons.length - popped.size;
  const revealedMsg = useMemo(
    () => balloonMessages.find((m) => m.id === revealed) ?? null,
    [revealed]
  );

  return (
    <section className="px-4 py-24 sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-purple-300/80"
        >
          Pop A Balloon
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-3 font-display text-3xl font-semibold text-purple-100 sm:text-4xl"
        >
          Each Balloon Holds A Message
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mx-auto mt-4 max-w-md text-purple-200/60"
        >
          Tap a balloon to pop it and reveal a hidden note from us.{' '}
          {remaining > 0 ? `${remaining} balloons left to pop!` : 'You popped them all! 🎉'}
        </motion.p>

        {/* balloon field */}
        <div className="relative mt-10 h-72 overflow-hidden rounded-3xl border border-purple-500/20 bg-purple-950/20 backdrop-blur-md sm:h-80">
          {balloons.map((b) => {
            const isPopped = popped.has(b.id);
            return (
              <motion.button
                key={b.id}
                onClick={() => pop(b)}
                disabled={isPopped}
                initial={{ y: 320, opacity: 0 }}
                animate={
                  isPopped
                    ? { scale: [1, 1.3, 0], opacity: 0 }
                    : { y: [320, -20], opacity: [0, 1] }
                }
                transition={
                  isPopped
                    ? { duration: 0.3 }
                    : { duration: b.duration, delay: b.delay, ease: 'easeOut' }
                }
                style={{ left: `${b.left}%` }}
                className="absolute top-0 -translate-x-1/2 focus:outline-none focus-visible:rounded-full focus-visible:ring-2 focus-visible:ring-purple-400/60 cursor-pointer"
                aria-label={`Pop balloon ${b.id + 1}`}
              >
                <span className="relative flex flex-col items-center">
                  <span
                    className="block h-16 w-12 rounded-[50%] opacity-85 transition-transform hover:scale-110 sm:h-20 sm:w-16"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, ${b.color}, ${b.color}88)`,
                      boxShadow: `0 0 20px -4px ${b.color}66`,
                    }}
                  />
                  <span className="h-6 w-px bg-purple-200/20" />
                </span>
              </motion.button>
            );
          })}

          {remaining === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/40 backdrop-blur-sm"
            >
              <Sparkles className="text-yellow-300" size={28} />
              <p className="font-display text-lg text-purple-100">All balloons popped! 🎉</p>
            </motion.div>
          )}
        </div>

        {/* revealed message */}
        <AnimatePresence mode="wait">
          {revealedMsg && (
            <motion.div
              key={revealedMsg.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-8 rounded-2xl bg-slate-950/80 border border-purple-500/30 p-5 shadow-[0_0_30px_rgba(236,72,153,0.15)] backdrop-blur-md"
            >
              <p className="text-sm leading-relaxed text-purple-100">{revealedMsg.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-5 py-2.5 text-sm text-purple-300 transition-colors hover:bg-purple-500/20 cursor-pointer"
        >
          <RotateCcw size={15} /> Release all balloons again
        </button>
      </div>
    </section>
  );
}