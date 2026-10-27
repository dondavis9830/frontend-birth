import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import { birthdayWishes } from '../data/birthdayWishes';

const FLOATING = ['Happy Birthday!', 'Thank You!', 'You Are Appreciated!'];

export default function CelebrationSection({ onConfetti }) {
  const [active, setActive] = useState(false);
  const [wish, setWish] = useState(null);
  const [wishKey, setWishKey] = useState(0);
  const [floats, setFloats] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setFloats((f) => f + 1), 1200);
    return () => clearInterval(id);
  }, [active]);

  const celebrate = () => {
    setActive(true);
    if (onConfetti) onConfetti();
    const next = birthdayWishes[Math.floor(Math.random() * birthdayWishes.length)];
    setWish(next);
    setWishKey((k) => k + 1);
  };

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/12 blur-[130px]" />
      </div>

      {/* floating balloons */}
      {['#A78BFA', '#F0ABFC', '#F4D58D'].map((color, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute"
          style={{ left: `${15 + i * 30}%`, bottom: '8%' }}
          animate={{ y: [0, -22, 0], rotate: [-3, 3, -3] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="h-16 w-12 rounded-[50%] opacity-70"
            style={{ background: color, filter: 'blur(0.5px)' }}
          />
          <div className="mx-auto h-8 w-px bg-purple-200/20" />
        </motion.div>
      ))}

      {/* stars */}
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.span
          key={`s${i}`}
          className="absolute text-yellow-300/40"
          style={{ top: `${(i * 53) % 95}%`, left: `${(i * 71) % 97}%` }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.2 }}
        >
          ✦
        </motion.span>
      ))}

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* cake */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <Cake lit={active} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl font-semibold text-purple-100 sm:text-5xl"
        >
          Today, the code can wait.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
            It's your day!
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-5 max-w-xl text-purple-200/70 sm:text-lg font-sans"
        >
          You spend so much time helping others learn and grow. Today, we hope you receive
          all the happiness and appreciation you deserve.
        </motion.p>

        <button
          type="button"
          onClick={celebrate}
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-400 to-yellow-300 px-7 py-3.5 font-semibold text-slate-950 shadow-[0_0_25px_rgba(236,72,153,0.3)] transition-transform hover:scale-105 active:scale-95 cursor-pointer font-sans"
        >
          <PartyPopper size={20} className="transition-transform group-hover:rotate-12" />
          <span>Celebrate, Ma'am! 🎉</span>
        </button>

        <AnimatePresence mode="wait">
          {wish && (
            <motion.p
              key={wishKey}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="mt-8 max-w-lg rounded-2xl border border-yellow-300/30 bg-slate-950/80 px-6 py-4 font-display text-lg text-yellow-300 shadow-lg backdrop-blur-md"
            >
              {wish}
            </motion.p>
          )}
        </AnimatePresence>

        {/* floating texts */}
        <AnimatePresence>
          {active &&
            Array.from({ length: floats }).map((_, i) => {
              const text = FLOATING[i % FLOATING.length];
              const x = (i * 137) % 80 - 40;
              return (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 0, x }}
                  animate={{ opacity: [0, 1, 0], y: -120, x }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.4, ease: 'easeOut' }}
                  className="pointer-events-none absolute top-1/3 font-display text-lg text-pink-400"
                  style={{ left: '50%' }}
                >
                  {text}
                </motion.span>
              );
            })}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Cake({ lit }) {
  return (
    <svg width="160" height="150" viewBox="0 0 160 150" fill="none" aria-hidden="true">
      {/* plate */}
      <ellipse cx="80" cy="140" rx="68" ry="8" fill="#171127" opacity="0.7" />
      {/* bottom layer */}
      <rect x="22" y="95" width="116" height="40" rx="6" fill="#231534" stroke="#A78BFA" strokeWidth="1.5" />
      {/* top layer */}
      <rect x="42" y="65" width="76" height="32" rx="5" fill="#2a1840" stroke="#F0ABFC" strokeWidth="1.5" />
      {/* frosting drips */}
      <path d="M22 100 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0" stroke="#F0ABFC" strokeWidth="2.5" fill="none" />
      <path d="M42 70 q5 6 10 0 q5 6 10 0 q5 6 10 0 q5 6 10 0 q5 6 10 0" stroke="#F4D58D" strokeWidth="2" fill="none" />
      {/* candles */}
      {[58, 80, 102].map((cx) => (
        <g key={cx}>
          <rect x={cx - 2} y="40" width="4" height="26" rx="2" fill="#F4D58D" />
          {lit ? (
            <g>
              <ellipse cx={cx} cy="34" rx="4" ry="7" fill="#F4D58D">
                <animate
                  attributeName="ry"
                  values="7;9;6;8;7"
                  dur="0.6s"
                  repeatCount="indefinite"
                />
              </ellipse>
              <ellipse cx={cx} cy="33" rx="2" ry="4" fill="#fff" opacity="0.8" />
            </g>
          ) : (
            <line x1={cx} y1="36" x2={cx} y2="44" stroke="#94A3B8" strokeWidth="1" />
          )}
        </g>
      ))}
    </svg>
  );
}