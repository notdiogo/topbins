import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { BetList } from '../components/BetList';
import { Reveal } from '../components/Reveal';
import { PredictionsTable } from '../components/wc/PredictionsTable';
import { BracketBoard } from '../components/wc/BracketBoard';
import { Insights, Insight } from '../components/wc/Insights';
import { WORLD_CUP_2026 } from '../constants';
import { Handshake, Flame, Crown, Glasses, Goal, ShieldHalf, Equal, Trophy, Sparkles, Plane } from 'lucide-react';

const PREDICTION_INSIGHTS: Insight[] = [
  { icon: Handshake, text: <>Across 30 categories the trio agrees unanimously on exactly <strong>one</strong> thing: Argentina take the most cards.</> },
  { icon: Flame, text: <>Mbappé is the awards magnet — picked on 5 of 6 Golden Ball &amp; Golden Boot ballots.</> },
  { icon: Plane, text: <>Nobody trusts England: each card has them as the bottler, the flop, or the penalty heartbreak.</> },
  { icon: Crown, text: <>It's France vs. Portugal for the crown — Diogo and Mitch back France, Shiv stands alone on Portugal.</> },
  { icon: Glasses, text: <>Maignan is the consensus Golden Glove and Romero the favourite for the first red card.</> },
  { icon: Goal, text: <>Brazil v Haiti is the popular shout for the highest-scoring match of the tournament.</> },
];

const BRACKET_INSIGHTS: Insight[] = [
  { icon: Equal, text: <>Groups C, F and I are filled identically by all three — total agreement on 12 teams.</> },
  { icon: Trophy, text: <>Two Portugals to one France: Shiv and Diogo crown Portugal, only Mitch keeps France.</> },
  { icon: ShieldHalf, text: <>Spain reach the semi-finals on every single bracket — the most trusted deep run.</> },
  { icon: Sparkles, text: <>Diogo is the lone Morocco believer, sending them to the QF while the others exit in R32.</> },
  { icon: Goal, text: <>All three pick France to knock Sweden out instantly in the Round of 32.</> },
  { icon: Flame, text: <>Brazil splits the room: a semi-final for Shiv, an early R16 exit to Norway for the others.</> },
];

const Section: React.FC<{
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  tinted?: boolean;
}> = ({ id, title, subtitle, children, tinted }) => (
  <section id={id} className={`scroll-mt-20 py-16 md:py-28 ${tinted ? 'bg-beige' : ''}`}>
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <Reveal>
        <h2 className="font-display text-4xl font-black tracking-tight text-ink md:text-6xl">
          {title}
        </h2>
        {subtitle && <p className="mt-3 max-w-2xl text-lg text-muted md:text-xl">{subtitle}</p>}
      </Reveal>
      <div className="mt-10">{children}</div>
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

      <Section id="bets" title="World Cup 2026 Bets">
        <BetList bets={wcBets} emptyMessage="No World Cup bets yet. Add them from the admin page." />
      </Section>

      <Section id="predictions" title="World Cup 2026 Predictions" tinted>
        <PredictionsTable predictions={wcPredictions} />
        <Insights items={PREDICTION_INSIGHTS} />
      </Section>

      <Section id="brackets" title="World Cup 2026 Brackets">
        <BracketBoard entries={bracketEntries} actual={bracketActual} teams={teams} />
        <Insights items={BRACKET_INSIGHTS} />
      </Section>
    </>
  );
};
