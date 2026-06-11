import React from 'react';
import { ArrowRight } from 'lucide-react';

// Single full-bleed hero. The looping <video> is a placeholder we'll produce
// together later; until /wc-hero.mp4 exists, the poster image + summer gradient
// scrim carry the visual. The floating navbar sits transparently on top.
export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden">
      {/* Background media (placeholder poster until the looping video lands) */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster="https://picsum.photos/seed/wc2026-stadium/1600/1000"
      >
        <source src="/wc-hero.mp4" type="video/mp4" />
      </video>

      {/* Summer tint + legibility scrim for the white nav and copy */}
      <div className="absolute inset-0 bg-gradient-to-br from-forest/70 via-forest/25 to-coral/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/35" />

      {/* Content — left aligned, vertically centered */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-center px-4 sm:px-6 pt-16">
        <span className="font-mono text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-white/85">
          Diogo · Shiv · Mitch
        </span>
        <h1 className="mt-4 font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-sm">
          World Cup 2026
        </h1>
        <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-white/90">
          Three friends, one tournament. Every bet, prediction and bracket pick, settled when the final whistle blows.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#bets"
            className="inline-flex items-center gap-2 rounded-full bg-stone px-6 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            See the bets <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#predictions"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            Make predictions
          </a>
        </div>
      </div>
    </section>
  );
};
