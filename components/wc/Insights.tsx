import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Reveal } from '../Reveal';

export interface Insight {
  icon: LucideIcon;
  text: React.ReactNode;
}

export const Insights: React.FC<{ items: Insight[] }> = ({ items }) => (
  <div className="mt-12">
    <h3 className="text-sm font-black uppercase tracking-[0.18em] text-forest">Insights</h3>
    <ul className="mt-5 space-y-4">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <Reveal as="li" key={i} delay={i * 40} className="flex items-start gap-3.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-forest-light text-forest">
              <Icon className="h-4 w-4" />
            </span>
            <span className="pt-1 text-base leading-relaxed text-ink md:text-lg">{it.text}</span>
          </Reveal>
        );
      })}
    </ul>
  </div>
);
