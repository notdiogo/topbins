import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { BetList } from '../components/BetList';
import { Reveal } from '../components/Reveal';
import { PredictionsTable } from '../components/wc/PredictionsTable';
import { BracketBoard } from '../components/wc/BracketBoard';
import { WORLD_CUP_2026 } from '../constants';

const Section: React.FC<{
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  tinted?: boolean;
}> = ({ id, title, subtitle, children, tinted }) => (
  <section id={id} className={`scroll-mt-20 py-16 md:py-24 ${tinted ? 'bg-beige/50' : ''}`}>
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <Reveal>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-muted">{subtitle}</p>}
      </Reveal>
      <div className="mt-8">{children}</div>
    </div>
  </section>
);

export const HomePage: React.FC = () => {
  const { bets, predictions, bracketEntries, bracketActual, teams } = useData();
  const wcBets = useMemo(
    () => bets.filter((b) => b.group.slug === WORLD_CUP_2026.slug),
    [bets],
  );
  const wcPredictions = useMemo(
    () => predictions.filter((p) => p.groupSlug === WORLD_CUP_2026.slug),
    [predictions],
  );

  return (
    <>

      <Section
        id="bets"
        title="World Cup 2026 Bets"
        subtitle="Head-to-head wagers running through the tournament."
      >
        <BetList bets={wcBets} emptyMessage="No World Cup bets yet. Add them from the admin page." />
      </Section>

      <Section
        id="predictions"
        title="World Cup 2026 Predictions"
        subtitle="One point per correct call. Diogo, Mitch and Shiv each lock in a pick per category."
        tinted
      >
        <PredictionsTable predictions={wcPredictions} />
      </Section>

      <Section
        id="brackets"
        title="World Cup 2026 Brackets"
        subtitle="Each of us fills a full bracket: group stages and the knockout run to the final."
      >
        <BracketBoard entries={bracketEntries} actual={bracketActual} teams={teams} />
      </Section>
    </>
  );
};
