import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, RefreshCw, Sparkles } from 'lucide-react';
import { surprises } from '../data/surprises';
import { useSound } from '../hooks/useSound';

export default function SurpriseBox() {
  const { play } = useSound();
  const [opened, setOpened] = useState(null);
  const [openedIds, setOpenedIds] = useState(new Set());
  const [shakeKey, setShakeKey] = useState(0);
  const [revealKey, setRevealKey] = useState(0);

  const open = useCallback(() => {
    let pool = surprises;
    if (surprises.length > 1 && opened) {
      pool = surprises.filter((s) => s.id !== opened.id);
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setOpened(pick);
    setOpenedIds((prev) => new Set(prev).add(pick.id));
    setRevealKey((k) => k + 1);
    play('ding');
  }, [opened, play]);

  const shake = () => {
    setShakeKey((k) => k + 1);
    play('whoosh');
    open();
  };

  const remaining = surprises.length - openedIds.size;

  return (
    <section className="px-4 py-24 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-purple-300/80"
        >
          A Hidden Surprise
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-3 font-display text-3xl font-semibold text-purple-100 sm:text-4xl"
        >
          Open The Mystery Box
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mx-auto mt-4 max-w-md text-purple-200/60 font-sans"
        >
          We hid a few little surprises inside. Give it a shake and open it — there's
          something new each time.
        </motion.p>

        {/* the box */}
        <div className="relative mt-12 flex flex-col items-center gap-8">
          <motion.button
            key={shakeKey}
            type="button"
            onClick={shake}
            initial={{ scale: 1 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-40 w-40 items-center justify-center rounded-3xl bg-linear-to-br from-purple-500/30 to-pink-500/20 border border-purple-400/40 shadow-[0_0_40px_rgba(168,85,247,0.3)] cursor-pointer"
            aria-label="Open the mystery box"
          >
            <motion.div
              animate={
                shakeKey > 0
                  ? { rotate: [-4, 4, -4, 4, 0], y: [0, -4, 0] }
                  : { rotate: [0, 2, -2, 0], y: [0, -3, 0] }
              }
              transition={{ duration: shakeKey > 0 ? 0.5 : 4, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <Gift className="text-yellow-300" size={56} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-purple-200/50">
                {opened ? 'Shake again' : 'Tap to open'}
              </span>
            </motion.div>

            {/* sparkles */}
            <motion.span
              className="absolute -right-3 -top-3 text-pink-400"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles size={20} />
            </motion.span>
            <motion.span
              className="absolute -left-2 bottom-2 text-purple-400"
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            >
              <Sparkles size={14} />
            </motion.span>
          </motion.button>

          {/* reveal */}
          <AnimatePresence mode="wait">
            {opened && (
              <motion.div
                key={revealKey}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md rounded-2xl bg-slate-950/80 border border-purple-500/30 p-6 shadow-[0_0_40px_rgba(236,72,153,0.2)] backdrop-blur-md"
              >
                <span className="text-4xl">{opened.emoji}</span>
                <h3 className="mt-3 font-display text-xl font-semibold text-purple-100">
                  {opened.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-purple-200/70 font-sans">
                  {opened.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {opened && remaining > 0 && (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={shake}
              className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-5 py-2.5 text-sm text-purple-300 transition-colors hover:bg-purple-500/20 cursor-pointer"
            >
              <RefreshCw size={15} className="transition-transform hover:rotate-180" />
              <span>Reveal another ({remaining} left)</span>
            </motion.button>
          )}

          {opened && remaining === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-xs text-yellow-300/70"
            >
              ✨ You've uncovered every surprise. Keep shaking to revisit them!
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}