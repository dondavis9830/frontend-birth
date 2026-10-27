import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

export default function BirthdayReveal({ onConfetti }) {
  const [phase, setPhase] = useState('loading');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('revealed');
    }, 2200);
    const t2 = setTimeout(() => {
      if (onConfetti) onConfetti();
    }, 2300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onConfetti]);

  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/15 blur-[120px]" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-pink-500/10 blur-[100px]" />
      </div>

      {phase === 'loading' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative z-10 flex flex-col items-center gap-5"
        >
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-400/30 border-t-purple-400" />
          <p className="font-mono text-sm text-purple-200/70 sm:text-base">
            Compiling something special for Amritha<span className="animate-pulse">...</span>
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="relative z-10 flex max-w-3xl flex-col items-center gap-6"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-display text-4xl font-bold leading-tight sm:text-6xl"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
              HAPPY BIRTHDAY,
            </span>
            <br />
            <span className="text-purple-100">AMRITHA MA'AM!</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-purple-200/80 sm:text-xl font-sans"
          >
            Today, we're celebrating the person who taught us more than just code.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="max-w-2xl text-base text-purple-300/60 sm:text-lg font-sans"
          >
            Behind every growing developer is a mentor who makes the journey a little
            easier, a little brighter, and a lot more meaningful.
          </motion.p>

          <motion.pre
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-2 rounded-xl border border-purple-500/30 bg-slate-950/80 px-4 py-3 font-mono text-sm text-purple-200 sm:text-base shadow-inner"
          >
            <span className="text-purple-400">const</span>{' '}
            <span className="text-pink-300">today'sMission</span>{' '}
            <span className="text-purple-300">=</span>{' '}
            <span className="text-yellow-300">"Make Amritha Ma'am smile"</span>
            <span className="text-purple-400">;</span>
          </motion.pre>

          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            onClick={() => {
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 px-6 py-3 font-medium text-slate-950 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-transform hover:scale-105 active:scale-95 cursor-pointer font-sans"
          >
            <span>There's More for You</span>
            <ArrowDown size={18} className="transition-transform group-hover:translate-y-0.5" />
          </motion.button>
        </motion.div>
      )}
    </section>
  );
}