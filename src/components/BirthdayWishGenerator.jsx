import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Sparkles } from 'lucide-react';
import { birthdayWishes } from '../data/birthdayWishes';

export default function BirthdayWishGenerator() {
  const [index, setIndex] = useState(0);
  const [key, setKey] = useState(0);

  const generate = useCallback(() => {
    if (birthdayWishes.length <= 1) {
      setKey((k) => k + 1);
      return;
    }
    let next = index;
    while (next === index) {
      next = Math.floor(Math.random() * birthdayWishes.length);
    }
    setIndex(next);
    setKey((k) => k + 1);
  }, [index]);

  return (
    <section id="wishes" className="px-4 py-24 sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-purple-300/80"
        >
          One More Wish
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-3 font-display text-3xl font-semibold text-purple-100 sm:text-4xl"
        >
          One More Wish for Our Favourite Trainer
        </motion.h2>

        <div className="relative mt-10 flex min-h-[12rem] items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-purple-500/10 blur-2xl" />
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={key}
              initial={{ opacity: 0, y: 20, rotateX: -8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -20, rotateX: 8 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 rounded-3xl bg-slate-950/80 border border-purple-500/30 px-6 py-10 sm:px-12 sm:py-14 shadow-[0_0_40px_rgba(168,85,247,0.2)] backdrop-blur-md"
            >
              <Sparkles className="mx-auto mb-4 text-yellow-300" size={24} />
              <p className="font-display text-xl font-medium leading-relaxed text-purple-100 sm:text-2xl">
                {birthdayWishes[index]}
              </p>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={generate}
          className="group mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 px-6 py-3 font-medium text-slate-950 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-transform hover:scale-105 active:scale-95 cursor-pointer font-sans"
        >
          <RefreshCw size={18} className="transition-transform group-hover:rotate-180" />
          <span>Generate Another Wish ✨</span>
        </button>
      </div>
    </section>
  );
}