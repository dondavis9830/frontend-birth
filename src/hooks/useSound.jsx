import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const SoundContext = createContext(null);

const MUSIC_KEY = 'amritha_music_pref';
const SFX_KEY = 'amritha_sfx_pref';

export function SoundProvider({ children }) {
  const [musicOn, setMusicOn] = useState(false); // off by default per requirements
  const [sfxOn, setSfxOn] = useState(true);
  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const musicGainRef = useRef(null);
  const sfxGainRef = useRef(null);
  const musicTimerRef = useRef(null);
  const musicNodesRef = useRef([]);

  // load persisted prefs
  useEffect(() => {
    try {
      const m = localStorage.getItem(MUSIC_KEY);
      const s = localStorage.getItem(SFX_KEY);
      if (m === 'true') setMusicOn(true);
      if (s === 'false') setSfxOn(false);
    } catch {
      /* ignore */
    }
  }, []);

  const ensureCtx = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    const musicGain = ctx.createGain();
    musicGain.gain.value = 0.12;
    musicGain.connect(master);
    musicGainRef.current = musicGain;

    const sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.4;
    sfxGain.connect(master);
    sfxGainRef.current = sfxGain;

    return ctx;
  }, []);

  // --- Sound effects (synthesized) ---
  const play = useCallback(
    (name) => {
      if (!sfxOn) return;
      const ctx = ensureCtx();
      if (!ctx || !sfxGainRef.current) return;
      if (ctx.state === 'suspended') ctx.resume();
      const out = sfxGainRef.current;
      const now = ctx.currentTime;

      const tone = (
        freq,
        dur,
        type = 'sine',
        vol = 0.3,
        delay = 0,
        glideTo
      ) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + delay);
        if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, now + delay + dur);
        g.gain.setValueAtTime(0.0001, now + delay);
        g.gain.exponentialRampToValueAtTime(vol, now + delay + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);
        osc.connect(g);
        g.connect(out);
        osc.start(now + delay);
        osc.stop(now + delay + dur + 0.05);
      };

      const noise = (dur, vol = 0.2, delay = 0, filterFreq = 1000) => {
        const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = filterFreq;
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol, now + delay);
        g.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);
        src.connect(filter);
        filter.connect(g);
        g.connect(out);
        src.start(now + delay);
        src.stop(now + delay + dur);
      };

      switch (name) {
        case 'type':
          tone(880 + Math.random() * 120, 0.04, 'square', 0.08);
          break;
        case 'click':
          tone(600, 0.06, 'sine', 0.15, 0, 900);
          break;
        case 'pop':
          tone(520, 0.12, 'sine', 0.25, 0, 180);
          noise(0.08, 0.12, 0, 800);
          break;
        case 'confetti':
          noise(0.3, 0.15, 0, 2000);
          tone(523, 0.15, 'triangle', 0.12, 0.05);
          tone(659, 0.15, 'triangle', 0.1, 0.12);
          tone(784, 0.2, 'triangle', 0.1, 0.2);
          break;
        case 'celebrate':
          // little fanfare
          tone(523, 0.15, 'triangle', 0.2, 0);
          tone(659, 0.15, 'triangle', 0.2, 0.15);
          tone(784, 0.15, 'triangle', 0.2, 0.3);
          tone(1047, 0.4, 'triangle', 0.25, 0.45);
          noise(0.2, 0.08, 0, 1500);
          break;
        case 'spin':
          tone(200, 1.5, 'sawtooth', 0.06, 0, 600);
          noise(1.5, 0.04, 0, 400);
          break;
        case 'reveal':
          tone(440, 0.1, 'sine', 0.15, 0, 880);
          tone(660, 0.15, 'sine', 0.15, 0.08, 1320);
          tone(880, 0.3, 'sine', 0.12, 0.18);
          break;
        case 'whoosh':
          noise(0.4, 0.12, 0, 3000);
          tone(150, 0.4, 'sine', 0.06, 0, 400);
          break;
        case 'ding':
          tone(880, 0.3, 'sine', 0.2, 0, 1760);
          tone(1320, 0.4, 'sine', 0.1, 0.02);
          break;
        case 'scratch':
          noise(0.15, 0.06, 0, 5000);
          break;
        case 'unlock':
          tone(330, 0.12, 'triangle', 0.15, 0, 660);
          tone(440, 0.12, 'triangle', 0.15, 0.1, 880);
          tone(660, 0.12, 'triangle', 0.15, 0.2, 1320);
          tone(880, 0.5, 'triangle', 0.2, 0.3);
          noise(0.3, 0.06, 0.1, 2000);
          break;
      }
    },
    [sfxOn, ensureCtx]
  );

  // --- Background music (ambient arpeggio) ---
  const stopMusic = useCallback(() => {
    musicNodesRef.current.forEach((n) => {
      try {
        n.stop();
      } catch {
        /* already stopped */
      }
    });
    musicNodesRef.current = [];
    if (musicTimerRef.current) {
      clearTimeout(musicTimerRef.current);
      musicTimerRef.current = null;
    }
  }, []);

  const startMusic = useCallback(() => {
    const ctx = ensureCtx();
    if (!ctx || !musicGainRef.current) return;
    if (ctx.state === 'suspended') ctx.resume();
    stopMusic();

    const scale = [261.63, 311.13, 392.0, 466.16, 523.25, 622.25, 783.99];
    const padFreqs = [130.81, 155.56, 196.0];

    // sustained pad
    padFreqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      lfo.frequency.value = 0.15 + Math.random() * 0.1;
      lfoGain.gain.value = 2;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      g.gain.value = 0.04;
      osc.connect(g);
      g.connect(musicGainRef.current);
      osc.start();
      lfo.start();
      musicNodesRef.current.push(osc, lfo);
    });

    // gentle arpeggio
    let step = 0;
    const playNote = () => {
      if (!ctxRef.current || !musicGainRef.current) return;
      const noteFreq = scale[step % scale.length];
      const osc = ctxRef.current.createOscillator();
      const g = ctxRef.current.createGain();
      osc.type = 'triangle';
      osc.frequency.value = noteFreq * 2;
      const now = ctxRef.current.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.06, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      osc.connect(g);
      g.connect(musicGainRef.current);
      osc.start(now);
      osc.stop(now + 1.3);
      step++;
      musicTimerRef.current = setTimeout(playNote, 600 + Math.random() * 400);
    };
    playNote();
  }, [ensureCtx, stopMusic]);

  useEffect(() => {
    if (musicOn) {
      startMusic();
    } else {
      stopMusic();
    }
    try {
      localStorage.setItem(MUSIC_KEY, String(musicOn));
    } catch {
      /* ignore */
    }
  }, [musicOn, startMusic, stopMusic]);

  useEffect(() => {
    try {
      localStorage.setItem(SFX_KEY, String(sfxOn));
    } catch {
      /* ignore */
    }
  }, [sfxOn]);

  useEffect(() => {
    return () => {
      stopMusic();
      ctxRef.current?.close().catch(() => {});
    };
  }, [stopMusic]);

  const value = useMemo(
    () => ({
      musicOn,
      sfxOn,
      toggleMusic: () => setMusicOn((m) => !m),
      toggleSfx: () => setSfxOn((s) => !s),
      play,
    }),
    [musicOn, sfxOn, play]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    return {
      musicOn: false,
      sfxOn: false,
      toggleMusic: () => {},
      toggleSfx: () => {},
      play: () => {},
    };
  }
  return ctx;
}