import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Reveal } from '../Reveal';

export interface Insight {
  icon: LucideIcon;
  text: React.ReactNode;
}

export const Insights: React.FC<{ items: Insight[] }> = ({ items }) => (
  <div className="mt-10">
    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Insights</h3>
    <ul className="mt-4 space-y-3">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <Reveal as="li" key={i} delay={i * 40} className="flex items-start gap-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
            <span className="text-sm leading-relaxed text-ink">{it.text}</span>
          </Reveal>
        );
      })}
    </ul>
  </div>
);
