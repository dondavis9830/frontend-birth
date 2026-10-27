import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Sparkles } from 'lucide-react';
import { scratchFortunes } from '../data/scratchFortunes';

const SCRATCH_W = 320;
const SCRATCH_H = 200;
const BRUSH_RADIUS = 22;
const REVEAL_THRESHOLD = 0.5;

export default function ScratchCard() {
  const [fortune, setFortune] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPosRef = useRef(null);

  const pickFortune = useCallback(() => {
    const pick = scratchFortunes[Math.floor(Math.random() * scratchFortunes.length)];
    setFortune(pick);
    setRevealed(false);
    setProgress(0);
  }, []);

  useEffect(() => {
    pickFortune();
  }, [pickFortune]);

  // paint the scratch overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.globalCompositeOperation = 'source-over';
    const gradient = ctx.createLinearGradient(0, 0, SCRATCH_W, SCRATCH_H);
    gradient.addColorStop(0, '#A78BFA');
    gradient.addColorStop(0.5, '#F0ABFC');
    gradient.addColorStop(1, '#C4B5FD');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SCRATCH_W, SCRATCH_H);

    // subtle text on overlay
    ctx.fillStyle = 'rgba(11,9,18,0.5)';
    ctx.font = '600 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch to reveal', SCRATCH_W / 2, SCRATCH_H / 2 - 8);
    ctx.font = '400 12px JetBrains Mono, monospace';
    ctx.fillText('a little fortune ✨', SCRATCH_W / 2, SCRATCH_H / 2 + 14);
  }, [fortune]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const scratch = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const pos = getPos(e);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = BRUSH_RADIUS * 2;

    if (lastPosRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, BRUSH_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
    lastPosRef.current = pos;
  };

  const calcProgress = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let cleared = 0;
    const total = imageData.data.length / 4;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) cleared++;
    }
    const ratio = cleared / total;
    setProgress(ratio);
    if (ratio > REVEAL_THRESHOLD && !revealed) {
      setRevealed(true);
      // fully clear
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handlePointerDown = (e) => {
    if (revealed) return;
    drawingRef.current = true;
    lastPosRef.current = null;
    e.target.setPointerCapture(e.pointerId);
    scratch(e);
  };

  const handlePointerMove = (e) => {
    if (!drawingRef.current || revealed) return;
    scratch(e);
  };

  const handlePointerUp = () => {
    drawingRef.current = false;
    lastPosRef.current = null;
    calcProgress();
  };

  const reset = () => {
    pickFortune();
  };

  return (
    <section className="px-4 py-24 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-purple-300/80"
        >
          A Scratch-Off Surprise
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-3 font-display text-3xl font-semibold text-purple-100 sm:text-4xl"
        >
          Scratch Your Fortune
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mx-auto mt-4 max-w-md text-purple-200/60 font-sans"
        >
          Use your finger or mouse to scratch the card and reveal a little fortune
          we picked just for you.
        </motion.p>

        {/* scratch card */}
        <div className="relative mx-auto mt-10 w-full max-w-sm">
          <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-slate-950/80 shadow-[0_0_40px_rgba(168,85,247,0.2)] backdrop-blur-md">
            {/* fortune underneath */}
            <div
              className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-6"
              style={{ width: '100%' }}
            >
              <AnimatePresence mode="wait">
                {fortune && (
                  <motion.div
                    key={fortune.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: revealed ? 1 : 0.4 }}
                    className="text-center"
                  >
                    <span className="text-3xl">🔮</span>
                    <h3 className="mt-2 font-display text-lg font-semibold text-yellow-300">
                      {fortune.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-purple-100 font-sans">
                      {fortune.message}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* canvas overlay */}
            {!revealed && (
              <canvas
                ref={canvasRef}
                width={SCRATCH_W}
                height={SCRATCH_H}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="absolute inset-0 h-full w-full cursor-pointer touch-none"
                aria-label="Scratch card — scratch to reveal your fortune"
                role="img"
              />
            )}
          </div>

          {/* progress hint */}
          {!revealed && progress > 0 && (
            <p className="mt-3 font-mono text-xs text-purple-300/40">
              {Math.round(progress * 100)}% scratched — keep going!
            </p>
          )}

          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 flex flex-col items-center gap-3"
            >
              <p className="flex items-center gap-1.5 font-mono text-xs text-yellow-300">
                <Sparkles size={14} /> Fortune revealed!
              </p>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-5 py-2.5 text-sm text-purple-300 transition-colors hover:bg-purple-500/25 cursor-pointer"
              >
                <RefreshCw size={15} /> Get a new fortune
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}