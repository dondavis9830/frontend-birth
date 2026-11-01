import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Sparkles, Gift, X } from 'lucide-react';
import { wheelSlices } from '../data/wheelSlices';
import { useSound } from '../hooks/useSound';
import Confetti from './Confetti';

const SLICE = 360 / wheelSlices.length;

export default function SpinnWheel() {
  const { play } = useSound();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [resultKey, setResultKey] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [showSurprise, setShowSurprise] = useState(false);
  const totalRotRef = useRef(0);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    setShowSurprise(false);
    play('spin');

    const winningIndex = Math.floor(Math.random() * wheelSlices.length);
    const targetSliceCenter = winningIndex * SLICE + SLICE / 2;
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const newRotation = totalRotRef.current + fullSpins * 360 + (360 - targetSliceCenter);
    totalRotRef.current = newRotation;
    setRotation(newRotation);

    setTimeout(() => {
      const slice = wheelSlices[winningIndex];
      setSpinning(false);
      setResult(slice);
      setResultKey((k) => k + 1);
      play('ding');
      setShowSurprise(true);
      setConfettiTrigger((n) => n + 1);
      play('celebrate');
    }, 4200);
  }, [spinning, play]);

  const closeSurprise = () => {
    setShowSurprise(false);
    setResult(null);
    play('click');
  };

  return (
    <section className="px-4 py-24 sm:py-28">
      {/* local confetti burst scoped to this section's reveal */}
      <Confetti trigger={confettiTrigger} count={180} durationMs={5000} />

      <div className="mx-auto max-w-2xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-lavender/80"
        >
          Spin For A Wish
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-3 font-display text-3xl font-semibold text-warmwhite sm:text-4xl"
        >
          The Wheel Of Wishes
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mx-auto mt-4 max-w-md text-warmwhite/60"
        >
          Give it a spin. Wherever it lands, a little surprise is waiting for you.
        </motion.p>

        {/* Spacious, larger wheel container */}
        <div className="relative mx-auto mt-12 h-80 w-80 sm:h-96 sm:w-96">
          {/* pointer */}
          <div className="absolute left-1/2 top-[-8px] z-20 -translate-x-1/2">
            <div className="h-0 w-0 border-x-[14px] border-t-[24px] border-x-transparent border-t-champagne drop-shadow-lg" />
          </div>

          {/* wheel */}
          <motion.div
            className="relative h-full w-full rounded-full border-4 border-lavender/30 shadow-glow-lavender"
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg viewBox="0 0 200 200" className="h-full w-full">
              {wheelSlices.map((slice, i) => {
                const startAngle = (i * SLICE - 90) * (Math.PI / 180);
                const endAngle = ((i + 1) * SLICE - 90) * (Math.PI / 180);
                const x1 = 100 + 95 * Math.cos(startAngle);
                const y1 = 100 + 95 * Math.sin(startAngle);
                const x2 = 100 + 95 * Math.cos(endAngle);
                const y2 = 100 + 95 * Math.sin(endAngle);
                const midAngle = (i * SLICE + SLICE / 2 - 90) * (Math.PI / 180);
                // Position emojis further out for spaciousness
                const tx = 100 + 62 * Math.cos(midAngle);
                const ty = 100 + 62 * Math.sin(midAngle);

                // Assign a nice clean matching emoji per slice index
                const sliceEmojis = ['🌿', '☕', '✨', '🚀', '🎯', '💖', '🌟', '🎉'];

                return (
                  <g key={slice.id}>
                    <path
                      d={`M 100 100 L ${x1} ${y1} A 95 95 0 0 1 ${x2} ${y2} Z`}
                      fill={slice.color}
                      opacity={0.78}
                      stroke="#0B0912"
                      strokeWidth={1.5}
                    />
                    <text
                      x={tx}
                      y={ty}
                      fontSize="14"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${i * SLICE + SLICE / 2} ${tx} ${ty})`}
                    >
                      {sliceEmojis[i % sliceEmojis.length]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </motion.div>

          {/* center hub */}
          <div className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-midnight border-2 border-lavender/40 shadow-glow-lavender">
            <span className="text-xl">💜</span>
          </div>
        </div>

        <button
          onClick={spin}
          disabled={spinning}
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-lavender to-softpink px-7 py-3 font-semibold text-midnight shadow-glow-lavender transition-transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
        >
          <RotateCw size={20} className={spinning ? 'animate-spin' : ''} />
          {spinning ? 'Spinning...' : 'Spin the wheel'}
        </button>
      </div>

      {/* the surprise reveal — full cinematic modal with big avatar */}
      <AnimatePresence>
        {showSurprise && result && (
          <motion.div
            key={`surprise-${resultKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-midnight/85 p-4 backdrop-blur-md"
            onClick={closeSurprise}
            role="dialog"
            aria-modal="true"
            aria-label="Your surprise"
          >
            {/* glow flashes behind the card */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.4, 2, 1.6], opacity: [0, 0.7, 0] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="pointer-events-none absolute h-96 w-96 rounded-full blur-3xl"
              style={{ background: result.color }}
            />

            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateX: -25 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong relative w-full max-w-xl overflow-hidden rounded-3xl border-2 p-8 text-center shadow-2xl sm:p-12"
              style={{ borderColor: `${result.color}80` }}
            >
              {/* floating sparkles around the card */}
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="pointer-events-none absolute text-champagne/70"
                  style={{
                    top: `${10 + (i * 27) % 80}%`,
                    left: `${5 + (i * 53) % 90}%`,
                  }}
                  animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3], rotate: [0, 180, 360] }}
                  transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
                >
                  <Sparkles size={14 + (i % 3) * 4} />
                </motion.span>
              ))}

              {/* LARGE Emotion Avatar in Modal */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 12 }}
                className="mx-auto flex h-48 w-48 sm:h-56 sm:w-56 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-lavender/30 to-softpink/30 border-4 border-lavender/70 shadow-2xl relative"
              >
                {result?.image ? (
                  <img
                    src={result.image}
                    alt={result.label}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">{result?.emoji || '🌟'}</span>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-champagne"
              >
                <Gift size={16} /> Your Surprise
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-3 font-display text-3xl font-semibold text-warmwhite sm:text-4xl"
              >
                {result.label}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-warmwhite/90 sm:text-xl"
              >
                {result.surprise}
              </motion.p>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={closeSurprise}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-lavender to-softpink px-8 py-3 font-semibold text-midnight shadow-glow-lavender transition-transform hover:scale-105 active:scale-95 text-base"
              >
                <Sparkles size={18} /> Thank you!
              </motion.button>

              {/* close button */}
              <button
                onClick={closeSurprise}
                aria-label="Close surprise"
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-warmwhite/60 transition-colors hover:bg-warmwhite/15 hover:text-warmwhite"
              >
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}