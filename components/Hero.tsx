import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="relative h-[50vh] w-full overflow-hidden">
      <img
        src="/WC-Banner.jpg"
        alt="World Cup 2026"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </section>
  );
};
