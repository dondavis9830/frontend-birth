import { useEffect, useRef } from 'react';

const COLORS_H = [260, 290, 40]; // lavender, pink, gold hue range

/**
 * A subtle sparkle trail that follows the cursor (desktop) or touch (mobile).
 * Renders on a fixed canvas, pointer-events disabled. Respects reduced motion.
 */
export default function CursorTrail() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = (x, y) => {
      const now = performance.now();
      if (now - lastSpawnRef.current < 24) return; // throttle
      lastSpawnRef.current = now;
      for (let i = 0; i < 2; i++) {
        particlesRef.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.3,
          life: 1,
          size: Math.random() * 3 + 1.5,
          hue: COLORS_H[Math.floor(Math.random() * COLORS_H.length)],
        });
      }
    };

    const onMove = (e) => spawn(e.clientX, e.clientY);
    window.addEventListener('pointermove', onMove, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.018;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = p.life * 0.6;
        ctx.fillStyle = `hsl(${p.hue}, 80%, 75%)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsl(${p.hue}, 80%, 70%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (particles.length > 0) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
      }
    };

    // Start animation on first move
    const startAnim = () => {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(animate);
    };
    window.addEventListener('pointermove', startAnim, { passive: true, once: false });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointermove', startAnim);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[55] h-full w-full"
    />
  );
}