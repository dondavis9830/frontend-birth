import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageOff } from 'lucide-react';

export default function PhotoReveal() {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <section id="about" className="relative px-4 py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/12 blur-[120px]" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-purple-300/80"
        >
          The Person Behind Our Progress
        </motion.span>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* animated gradient border */}
          <div className="absolute -inset-[2px] animate-pulse rounded-[1.6rem] bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 opacity-60 blur-[2px]" />
          <div className="absolute -inset-3 rounded-[1.9rem] bg-purple-500/20 blur-2xl" />

          <div className="relative h-72 w-72 overflow-hidden rounded-[1.5rem] border border-purple-500/30 bg-slate-950/80 sm:h-96 sm:w-96 shadow-2xl">
            {!errored ? (
              <img
                src="/images/amritha.jpg"
                alt="Portrait of Amritha Ma'am, our MERN Stack trainer"
                onLoad={() => setLoaded(true)}
                onError={() => setErrored(true)}
                className={`h-full w-full object-cover transition-opacity duration-700 ${
                  loaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ) : (
              <Fallback />
            )}

            {!loaded && !errored && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400/30 border-t-purple-400" />
              </div>
            )}
          </div>

          {/* decorative stars */}
          {['-top-3 -left-3', '-top-2 right-6', 'bottom-6 -right-3', 'bottom-3 -left-4'].map(
            (pos, i) => (
              <motion.span
                key={i}
                className={`absolute ${pos} text-yellow-300/70`}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
              >
                ✦
              </motion.span>
            )
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl space-y-4"
        >
          <h2 className="font-display text-2xl font-semibold text-purple-100 sm:text-3xl">
            Our favourite trainer, our mentor, our Amritha Ma'am.
          </h2>
          <p className="text-purple-200/70 font-sans">
            Thank you for showing up, explaining one more time, encouraging one more
            attempt, and helping us believe that we can figure things out.
          </p>
          <p className="font-mono text-xs text-purple-300/40">
            A little appreciation for someone who makes a difference.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function Fallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-purple-950/40 to-slate-950 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-purple-400/40 bg-purple-500/10 font-display text-2xl font-bold text-purple-300 shadow-lg">
        AM
      </div>
      <p className="text-sm text-purple-200/70 font-sans">A special person deserves a special celebration.</p>
     <p className="flex items-center gap-1.5 text-xs text-purple-300/40 font-mono">
  <ImageOff size={12} /> <img src="./miss.jpeg" alt="Amritha Ma'am" />
</p>
    </div>
  );
}