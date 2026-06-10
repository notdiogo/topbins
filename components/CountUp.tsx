import React, { useEffect, useRef } from 'react';

interface CountUpProps {
  value: number;
  durationMs?: number;
  className?: string;
}

// Animates a number from 0 → value when it scrolls into view. Writes directly
// to the node's text content via rAF (no per-frame React re-render) and honors
// prefers-reduced-motion by jumping straight to the final value.
export const CountUp: React.FC<CountUpProps> = ({ value, durationMs = 900, className }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || value === 0) {
      el.textContent = String(value);
      return;
    }

    let raf = 0;
    let start = 0;
    const run = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(run);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          raf = requestAnimationFrame(run);
          io.unobserve(el);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [value, durationMs]);

  return <span ref={ref} className={className}>0</span>;
};
