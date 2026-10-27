import React, { useCallback, useEffect, useRef } from 'react';

const COLORS = ['#A78BFA', '#F0ABFC', '#F4D58D', '#C4B5FD', '#FAF7FF'];

/**
 * Lightweight canvas confetti. Renders nothing visible until `trigger` changes.
 */
export default function Confetti({ trigger, count = 140, durationMs = 4200 }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const endAtRef = useRef(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = performance.now();
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += 0.12; // gravity
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRotation;
      if (now > endAtRef.current - 1200) p.life -= 0.02;
      if (p.y > canvas.height + 30 || p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      if (p.shape === 0) {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else if (p.shape === 1) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -p.size / 2);
        ctx.lineTo(p.size / 2, p.size / 2);
        ctx.lineTo(-p.size / 2, p.size / 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    if (particles.length > 0 && now < endAtRef.current) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rafRef.current = null;
    }
  }, []);

  const spawn = useCallback((n) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const originX = w / 2;
    const originY = h * 0.35;
    const batch = [];
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 3;
      batch.push({
        x: originX + (Math.random() - 0.5) * 120,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 7 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI,
        vRotation: (Math.random() - 0.5) * 0.3,
        shape: Math.floor(Math.random() * 3),
        life: 1,
      });
    }
    particlesRef.current.push(...batch);
    endAtRef.current = Math.max(endAtRef.current, performance.now() + durationMs);
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [durationMs, animate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (trigger > 0) spawn(count);
  }, [trigger, count, spawn]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
    />
  );
}