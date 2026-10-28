import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Music2 } from 'lucide-react';
import { useSound } from '../hooks/useSound';

export default function SoundControls({ visible }) {
  const { musicOn, toggleMusic } = useSound();

  const handleMusicToggle = () => {
    if (typeof window !== 'undefined' && typeof window.__unlockBirthdayVideoAudio === 'function') {
      window.__unlockBirthdayVideoAudio();
    }

    const videoEls = document.querySelectorAll('video');
    videoEls.forEach((video) => {
      video.muted = false;
      video.volume = 1;
      video.play().catch(() => {});
    });

    toggleMusic();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <button
            type="button"
            onClick={handleMusicToggle}
            className={`flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/80 border border-purple-500/30 backdrop-blur-md transition-all hover:scale-110 cursor-pointer ${
              musicOn ? 'text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'text-purple-300/40'
            }`}
            aria-label={musicOn ? 'Mute music' : 'Play music'}
            aria-pressed={musicOn}
            title={musicOn ? 'Mute background music' : 'Play background music'}
          >
            {musicOn ? <Music2 size={18} /> : <Music size={18} />}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}