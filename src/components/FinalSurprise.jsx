import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { finalLines } from '../data/birthdayContent';

export default function FinalSurprise({ onReplay }) {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines >= finalLines.length) return;
    const t = setTimeout(() => setVisibleLines((n) => n + 1), 900);
    return () => clearTimeout(t);
  }, [visibleLines]);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/15 blur-[120px]" />
      </div>

      <div className="relative z-10 flex max-w-2xl flex-col items-center gap-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl font-semibold text-purple-100 sm:text-5xl"
        >
          Thank You for Being Our{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
            Amritha Ma'am.
          </span>
        </motion.h2>

        <div className="space-y-4">
          <AnimatePresence>
            {finalLines.slice(0, visibleLines).map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-lg text-purple-200/75 sm:text-xl font-sans"
              >
                {line}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>

        {visibleLines >= finalLines.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center gap-6 pt-4"
          >
            <p className="font-display text-3xl font-bold text-purple-100 sm:text-5xl">
              Happy Birthday, Amritha Ma'am! <span className="text-purple-400">💜</span>
            </p>
            <p className="font-mono text-sm text-purple-300/40">
              crafted with love, gratitude, and a little JavaScript
            </p>
            <button
              type="button"
              onClick={onReplay}
              className="group mt-2 inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-6 py-3 font-medium text-purple-300 transition-colors hover:bg-purple-500/20 cursor-pointer"
            >
              <RotateCcw size={18} className="transition-transform group-hover:-rotate-180" />
              <span>Replay the Surprise ↻</span>
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}