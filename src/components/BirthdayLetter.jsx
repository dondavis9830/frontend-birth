import React from 'react';
import { motion } from 'framer-motion';
import { letterParagraphs } from '../data/birthdayContent';

export default function BirthdayLetter() {
  return (
    <section className="px-4 py-24 sm:py-28">
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-2xl rounded-3xl bg-slate-950/80 border border-purple-500/30 p-8 shadow-[0_0_50px_rgba(168,85,247,0.2)] backdrop-blur-md sm:p-12"
      >
        <h2 className="font-display text-2xl font-semibold text-purple-100 sm:text-3xl">
          Dear Amritha Ma'am,
        </h2>

        <div className="mt-6 space-y-5">
          {letterParagraphs.map((para, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.15 }}
              className={`leading-relaxed text-purple-200/80 ${
                para === "Happy Birthday, Amritha Ma'am!" ? 'font-display text-xl text-yellow-300 font-semibold' : ''
              }`}
            >
              {para}
            </motion.p>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col items-start gap-1"
        >
          <p className="text-purple-300/60">With love and gratitude,</p>
          <p className="font-display text-2xl italic text-pink-400">
            <span className="inline-block">Your Students</span>{' '}
            <span className="text-purple-400">💜</span>
          </p>
        </motion.div>
      </motion.article>
    </section>
  );
}