import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { navLinks } from '../data/birthdayContent';

export default function Navigation({ visible, onReplay }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
      let current = navLinks[0].id;
      for (const link of navLinks) {
        const el = document.getElementById(link.id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) {
          current = link.id;
        }
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [visible]);

  const scrollTo = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed left-1/2 top-4 z-50 w-[min(960px,calc(100%-2rem))] -translate-x-1/2"
          aria-label="Primary"
        >
          <div className="flex items-center justify-between rounded-full bg-slate-950/80 border border-purple-500/30 px-4 py-2.5 shadow-[0_0_30px_rgba(168,85,247,0.2)] backdrop-blur-md sm:px-6">
            <button
              type="button"
              onClick={() => scrollTo('home')}
              className="font-display text-sm font-semibold tracking-wide text-purple-100 sm:text-base cursor-pointer"
            >
              For Amritha <span className="text-purple-400">💜</span>
            </button>

            <ul className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(link.id)}
                    className={`rounded-full px-3.5 py-1.5 text-sm transition-colors cursor-pointer ${
                      active === link.id
                        ? 'bg-purple-500/20 text-purple-100'
                        : 'text-purple-300/70 hover:text-purple-100'
                    }`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={onReplay}
                  className="rounded-full px-3.5 py-1.5 text-sm text-yellow-300/80 transition-colors hover:text-yellow-300 cursor-pointer"
                >
                  Replay ↻
                </button>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="rounded-full p-2 text-purple-100 md:hidden cursor-pointer"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* scroll progress */}
          <div className="mx-2 mt-1 h-0.5 overflow-hidden rounded-full bg-purple-500/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>

          <AnimatePresence>
            {open && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 flex flex-col gap-1 rounded-2xl bg-slate-950/90 border border-purple-500/30 p-2 backdrop-blur-md md:hidden shadow-xl"
              >
                {navLinks.map((link) => (
                  <li key={link.id}>
                    <button
                      type="button"
                      onClick={() => scrollTo(link.id)}
                      className={`w-full rounded-xl px-4 py-2.5 text-left text-sm cursor-pointer ${
                        active === link.id
                          ? 'bg-purple-500/20 text-purple-100'
                          : 'text-purple-200/80'
                      }`}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onReplay();
                    }}
                    className="w-full rounded-xl px-4 py-2.5 text-left text-sm text-yellow-300 cursor-pointer"
                  >
                    Replay ↻
                  </button>
                </li>
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}