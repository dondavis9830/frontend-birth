import { useEffect, useRef } from 'react';

/**
 * Ambient floating starfield rendered on a fixed canvas behind all content.
 * Very lightweight — caps particle count. Respects reduced motion.
 */
export default function AmbientField() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 18000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vy: Math.random() * 0.15 + 0.03,
        size: Math.random() * 1.6 + 0.4,
        opacity: Math.random() * 0.5 + 0.15,
        twinkle: Math.random() * Math.PI * 2,
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.y += s.vy;
        if (s.y > canvas.height + 5) {
          s.y = -5;
          s.x = Math.random() * canvas.width;
        }
        const tw = Math.sin(frame * 0.02 + s.twinkle) * 0.3 + 0.7;
        ctx.save();
        ctx.globalAlpha = s.opacity * tw;
        ctx.fillStyle = '#A78BFA';
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#A78BFA';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-60"
    />
  );
}