import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Music2, Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../hooks/useSound';

export default function SoundControls({ visible }) {
  const { musicOn, sfxOn, toggleMusic, toggleSfx } = useSound();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
        >
          <button
            type="button"
            onClick={toggleMusic}
            className={`flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/80 border border-purple-500/30 backdrop-blur-md transition-all hover:scale-110 cursor-pointer ${
              musicOn ? 'text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'text-purple-300/40'
            }`}
            aria-label={musicOn ? 'Mute music' : 'Play music'}
            aria-pressed={musicOn}
            title={musicOn ? 'Mute background music' : 'Play background music'}
          >
            {musicOn ? <Music2 size={18} /> : <Music size={18} />}
          </button>
          <button
            type="button"
            onClick={toggleSfx}
            className={`flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/80 border border-purple-500/30 backdrop-blur-md transition-all hover:scale-110 cursor-pointer ${
              sfxOn ? 'text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.3)]' : 'text-purple-300/40'
            }`}
            aria-label={sfxOn ? 'Mute sound effects' : 'Enable sound effects'}
            aria-pressed={sfxOn}
            title={sfxOn ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {sfxOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}