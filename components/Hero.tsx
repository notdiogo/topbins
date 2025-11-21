
import React, { useState, useEffect } from 'react';
import { MOCK_BETS } from '../constants';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export const Hero: React.FC<{ onNavigate: (id: string) => void }> = ({ onNavigate }) => {
  const featuredBets = MOCK_BETS.slice(0, 4); // Show top 4
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredBets.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredBets.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredBets.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredBets.length - 1 : prev - 1));
  };

  const currentBet = featuredBets[currentIndex];
  const isPvP = currentBet.type === 'PLAYER_VS_PLAYER';
  const entityA = currentBet.entities.find(e => e.side === 'A');
  const entityB = currentBet.entities.find(e => e.side === 'B');

  return (
    <div className="relative h-[80vh] sm:h-[95vh] w-full bg-[#050505] overflow-hidden group">
      
      {/* Background Texture Layer */}
      {featuredBets.map((bet, index) => (
        <div
          key={`bg-${bet.id}`}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* The Texture Background */}
          <img
            src={bet.heroImage}
            alt="Atmosphere"
            className="w-full h-full object-cover opacity-100"
          />
          {/* Removed overlays for all slides */}
          <div className="hidden"></div>
          <div className="hidden"></div>
        </div>
      ))}

      {/* Player Images Layer - Only render for PvP and if NOT using custom hero */}
      {isPvP && entityA && entityB && (
        <div className="hidden md:block">
        {featuredBets.map((bet, index) => {
         // Skip rendering split players if this bet uses a custom hero image
         if (bet.useCustomHero) return null;

         const pA = bet.entities.find(e => e.side === 'A');
         const pB = bet.entities.find(e => e.side === 'B');
         
         return (
          <div 
            key={`players-${bet.id}`}
            className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            {/* Player A - Left */}
            <div className="absolute bottom-0 -left-10 md:left-0 h-[60%] md:h-[85%] w-[50%] md:w-[40%] z-10 animate-in slide-in-from-left-10 duration-1000">
              <img 
                src={pA?.image} 
                alt={pA?.name}
                className="w-full h-full object-cover object-top opacity-80 mask-image-gradient-r"
                style={{ 
                  maskImage: 'linear-gradient(to right, black 50%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, black 50%, transparent 100%)',
                  filter: 'grayscale(100%) contrast(120%) brightness(90%)'
                }}
              />
            </div>

            {/* Player B - Right */}
            <div className="absolute bottom-0 -right-10 md:right-0 h-[60%] md:h-[85%] w-[50%] md:w-[40%] z-10 animate-in slide-in-from-right-10 duration-1000">
              <img 
                src={pB?.image} 
                alt={pB?.name}
                className="w-full h-full object-cover object-top opacity-80"
                style={{ 
                  maskImage: 'linear-gradient(to left, black 50%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to left, black 50%, transparent 100%)',
                  filter: 'grayscale(100%) contrast(120%) brightness(90%)'
                }}
              />
            </div>
          </div>
         )
        })}
        </div>
      )}

      {/* Controls */}
      <div className="hidden md:flex absolute bottom-6 right-12 z-50 gap-2">
        <button onClick={prevSlide} className="p-3 border border-white/20 bg-black/60 hover:bg-[#CCFF00] hover:text-black transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={nextSlide} className="p-3 border border-white/20 bg-black/60 hover:bg-[#CCFF00] hover:text-black transition-all">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-50">
        <div 
            key={currentIndex}
            className="h-full bg-[#CCFF00] animate-[width_6s_linear]" 
            style={{ width: '100%' }}
        ></div>
      </div>

      {/* Main Text Content - Centered */}
      <div className="absolute inset-0 z-40 flex flex-col justify-center items-center px-4 mt-32 sm:mt-48 md:mt-56 pointer-events-none">
        
           <div className="animate-in slide-in-from-bottom-10 duration-700 fade-in flex flex-col items-center text-center max-w-4xl">
              
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <span className="bg-[#CCFF00] text-black px-3 py-1 text-xs font-black uppercase font-tech tracking-widest transform -skew-x-12 shadow-[0_0_15px_#CCFF00]">
                  {currentBet.league}
                </span>
                <span className="text-white/70 font-mono text-xs uppercase tracking-widest border-l border-white/30 pl-4">
                  Season {currentBet.season}
                </span>
              </div>

              {isPvP && entityA && entityB ? (
                <div className="flex flex-col items-center relative">
                  {/* Names with massive stroke effect */}
                  <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase italic leading-[0.85] tracking-tighter text-white mb-2 mix-blend-overlay drop-shadow-2xl">
                    {entityA.name.split(' ').pop()}
                  </h1>
                  
                  <div className="flex items-center gap-6 my-4">
                    <div className="h-[2px] w-12 bg-[#CCFF00]"></div>
                    <div className="text-4xl md:text-6xl font-black italic text-transparent text-stroke">VS</div>
                    <div className="h-[2px] w-12 bg-[#CCFF00]"></div>
                  </div>

                  <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase italic leading-[0.85] tracking-tighter text-white mb-8 text-stroke drop-shadow-2xl">
                    {entityB.name.split(' ').pop()}
                  </h1>
                </div>
              ) : (
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase italic leading-[0.85] tracking-tighter text-white mb-8 text-center">
                  {currentBet.title}
                </h1>
              )}

              {/* Metric Card */}
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mt-4 bg-black/60 backdrop-blur-md border border-white/10 p-6 md:skew-x-[-2deg] pointer-events-auto w-full max-w-3xl">
                 <div className="text-center md:text-left w-full md:w-auto">
                    <div className="text-gray-400 font-mono text-[10px] uppercase tracking-widest mb-1">Active Metric</div>
                    <div className="text-xl font-tech font-bold uppercase text-white">
                      {currentBet.metrics?.label}
                    </div>
                 </div>
                 
                 <div className="hidden md:block h-8 w-px bg-white/20"></div>

                 <div className="text-center md:text-left w-full md:w-auto">
                    <div className="text-gray-400 font-mono text-[10px] uppercase tracking-widest mb-1">Current Stakes</div>
                    <div className="text-lg font-mono text-[#CCFF00] truncate max-w-[200px]">
                      {currentBet.prize}
                    </div>
                 </div>
                 
                 <button 
                    onClick={() => onNavigate('dashboard')}
                    className="w-full md:w-auto md:ml-4 group flex items-center justify-center gap-2 text-black font-bold uppercase tracking-wider bg-[#CCFF00] px-6 py-3 hover:bg-white transition-colors"
                 >
                    <span>View</span>
                    <ArrowRight className="w-4 h-4" />
                 </button>
              </div>

           </div>

      </div>
    </div>
  );
};
