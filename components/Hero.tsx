import React, { useState, useEffect } from 'react';
import { Bet } from '../types';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export const Hero: React.FC<{ onNavigate: (id: string) => void; bets: Bet[] }> = ({ onNavigate, bets }) => {
  const featuredBets = bets.slice(0, 4);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % featuredBets.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredBets.length]);

  const go = (index: number) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 400);
  };

  const next = () => go((current + 1) % featuredBets.length);
  const prev = () => go(current === 0 ? featuredBets.length - 1 : current - 1);

  const bet = featuredBets[current];
  if (!bet) return null;

  const entityA = bet.entities.find(e => e.side === 'A');
  const entityB = bet.entities.find(e => e.side === 'B');
  const isPvP = bet.type === 'PLAYER_VS_PLAYER';

  const valueA = bet.metrics?.valueA ?? 0;
  const valueB = bet.metrics?.valueB ?? 0;
  const isInverse = bet.metrics?.isInverse;
  const aLeads = isInverse ? valueA < valueB : valueA > valueB;
  const bLeads = isInverse ? valueB < valueA : valueB > valueA;
  const leader = aLeads ? entityA : bLeads ? entityB : null;

  return (
    <div className="bg-beige border-b border-warm-border overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row min-h-[48vh] md:min-h-[52vh]">

          {/* LEFT: Text content */}
          <div className="flex-1 px-6 py-8 md:px-10 md:py-12 flex flex-col justify-center gap-5">

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-forest bg-forest-light border border-forest/20 px-2.5 py-1 rounded-full uppercase tracking-wide">
                {bet.league}
              </span>
              <span className="text-xs text-muted">{bet.season}</span>
            </div>

            {/* Title */}
            {isPvP && entityA && entityB ? (
              <div>
                {/* Mobile: compact avatars + names */}
                <div className="flex md:hidden items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <img src={entityA.image} alt={entityA.name} className="w-10 h-10 rounded-full object-cover border-2 border-warm-border" />
                    <span className="text-sm font-semibold text-ink">{entityA.name.split(' ').pop()}</span>
                  </div>
                  <span className="text-xs font-bold text-muted px-2">vs</span>
                  <div className="flex items-center gap-2">
                    <img src={entityB.image} alt={entityB.name} className="w-10 h-10 rounded-full object-cover border-2 border-warm-border" />
                    <span className="text-sm font-semibold text-ink">{entityB.name.split(' ').pop()}</span>
                  </div>
                </div>
                {/* Desktop: large serif headline */}
                <h1 className="hidden md:block font-serif text-5xl lg:text-6xl font-bold text-ink leading-tight">
                  {entityA.name.split(' ').pop()}
                  <span className="text-muted font-normal italic text-4xl mx-3">vs</span>
                  {entityB.name.split(' ').pop()}
                </h1>
                {/* Mobile title */}
                <h1 className="md:hidden font-serif text-3xl font-bold text-ink leading-snug">
                  {bet.title}
                </h1>
              </div>
            ) : (
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-ink leading-tight">
                {bet.title}
              </h1>
            )}

            {/* Metric / score summary */}
            {bet.metrics && (
              <div className="flex items-center gap-3 flex-wrap">
                {leader && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest bg-forest-light border border-forest/20 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest inline-block" />
                    {leader.name.split(' ').pop()} leads
                  </span>
                )}
                {!leader && <span className="text-sm font-semibold text-muted bg-beige border border-warm-border px-3 py-1 rounded-full">Tied</span>}
                {bet.metrics.valueB !== undefined && (
                  <span className="text-sm text-muted font-tabular">
                    {valueA} – {valueB} {bet.metrics.label}
                  </span>
                )}
                {bet.metrics.target !== undefined && (
                  <span className="text-sm text-muted font-tabular">
                    {valueA} / {bet.metrics.target} {bet.metrics.label}
                  </span>
                )}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={() => onNavigate('dashboard')}
              className="self-start inline-flex items-center gap-2 bg-forest text-stone text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-forest-mid transition-colors"
            >
              View all bets
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Carousel dots */}
            <div className="flex items-center gap-2 mt-2">
              {featuredBets.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? 'w-6 h-2 bg-forest'
                      : 'w-2 h-2 bg-warm-border hover:bg-muted'
                  }`}
                />
              ))}
              {/* Desktop prev/next */}
              <div className="hidden md:flex items-center gap-1 ml-auto">
                <button onClick={prev} className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-parchment transition-colors border border-warm-border">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={next} className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-parchment transition-colors border border-warm-border">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Entity images (desktop only) */}
          {isPvP && entityA && entityB && !bet.useCustomHero && (
            <div className="hidden md:flex w-2/5 relative overflow-hidden bg-parchment">
              {/* Gradient blend left edge */}
              <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-beige to-transparent z-10 pointer-events-none" />
              {featuredBets.map((b, i) => {
                const pA = b.entities.find(e => e.side === 'A');
                const pB = b.entities.find(e => e.side === 'B');
                if (!pA || !pB || b.type !== 'PLAYER_VS_PLAYER' || b.useCustomHero) return null;
                return (
                  <div
                    key={b.id}
                    className={`absolute inset-0 flex transition-opacity duration-500 ${i === current ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <div className="flex-1 relative overflow-hidden">
                      <img
                        src={pA.image}
                        alt={pA.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="flex-1 relative overflow-hidden border-l border-parchment/30">
                      <img
                        src={pB.image}
                        alt={pB.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  </div>
                );
              })}
              {/* For custom hero or non-pvp, show heroImage */}
              {(bet.useCustomHero || !isPvP) && (
                <img src={bet.heroImage} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          )}
          {/* Custom hero image on desktop */}
          {bet.useCustomHero && (
            <div className="hidden md:block w-2/5 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-beige to-transparent z-10 pointer-events-none" />
              <img src={bet.heroImage} alt="" className="w-full h-full object-cover" />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
