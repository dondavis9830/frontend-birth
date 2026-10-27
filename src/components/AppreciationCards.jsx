import React from 'react';
import { motion } from 'framer-motion';
import { Compass, HeartHandshake, Sparkles, Star } from 'lucide-react';
import { appreciationCards } from '../data/birthdayContent'; // Adjust path if needed, e.g. '@/data/birthdayContent'

const ICONS = {
  Compass,
  HeartHandshake,
  Sparkles,
  Star,
};

export default function AppreciationCards() {
  return (
    <section className="px-4 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-purple-300/80">
            What Makes You Special
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-purple-100 sm:text-4xl">
            Four reasons we're grateful
          </h2>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {appreciationCards.map((card, i) => {
            const Icon = ICONS[card.icon] ?? Star;
            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                whileHover={{ y: -6 }}
                className="glass group relative overflow-hidden rounded-2xl p-6 text-center bg-slate-950/60 border border-purple-500/20 backdrop-blur-md shadow-lg"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl transition-opacity group-hover:bg-pink-500/20" />
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300 transition-colors group-hover:text-pink-400">
                  <Icon size={22} />
                </div>
                <h3 className="font-display text-lg font-semibold text-purple-100">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-purple-200/70">{card.text}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}