import React from 'react';
import { motion } from 'framer-motion';
import { GitCommitHorizontal, Terminal } from 'lucide-react';
import { timeline } from '../data/birthdayContent';

export default function JourneyTimeline() {
  return (
    <section id="journey" className="px-4 py-24 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-purple-300/80">
            Our Journey, One Commit at a Time
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-purple-100 sm:text-4xl">
            From <span className="text-pink-400">git init</span> to today
          </h2>
        </motion.div>

        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-4 top-2 h-full w-px bg-gradient-to-b from-purple-400 via-pink-400 to-yellow-300 opacity-40 sm:left-1/2 sm:-translate-x-1/2" />

          <ul className="space-y-10">
            {timeline.map((item, i) => {
              const left = i % 2 === 0;
              return (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6 }}
                  className={`relative pl-12 sm:pl-0 sm:flex ${left ? 'sm:justify-start' : 'sm:justify-end'}`}
                >
                  {/* node */}
                  <span className="absolute left-4 top-1.5 z-10 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full bg-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)] sm:left-1/2">
                    <span className="absolute h-5 w-5 animate-ping rounded-full bg-purple-400/30" />
                  </span>

                  <div
                    className={`rounded-xl bg-slate-950/80 border border-purple-500/20 p-5 backdrop-blur-md w-full sm:w-[46%] shadow-lg ${
                      left ? '' : 'sm:text-right'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 font-mono text-sm text-pink-400 ${
                        left ? '' : 'sm:justify-end'
                      }`}
                    >
                      {item.command.includes('commit') ? (
                        <GitCommitHorizontal size={14} />
                      ) : (
                        <Terminal size={14} />
                      )}
                      <span className="text-purple-300/40">{item.label}</span>
                    </div>
                    <code className="mt-1 block font-mono text-sm text-purple-300">
                      {item.command}
                    </code>
                    <p className="mt-3 text-purple-100 font-semibold">{item.title}</p>
                    <p className="text-sm text-purple-200/60 font-sans">{item.text}</p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mx-auto mt-14 max-w-xl text-center text-purple-200/70 sm:text-lg font-sans"
        >
          Thank you for being part of our journey from{' '}
          <span className="text-pink-400">'I don't understand this'</span> to{' '}
          <span className="text-yellow-300">'Wait, I think I got it!'</span>
        </motion.p>
      </div>
    </section>
  );
}