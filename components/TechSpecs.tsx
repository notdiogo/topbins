import React from 'react';
import { TECH_SPECS } from '../constants';
import { Target, Zap, Activity, Crosshair, Smartphone, Layers } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  target: <Target className="w-6 h-6" />,
  zap: <Zap className="w-6 h-6" />,
  activity: <Activity className="w-6 h-6" />,
};

export const TechSpecs: React.FC = () => {
  return (
    <section className="py-32 bg-[#080808] text-white relative overflow-hidden">
      
      {/* Technical Grid Background */}
      <div className="absolute inset-0" style={{ 
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-white/10 pb-8">
          <div>
            <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter text-transparent text-stroke">
              Schematics
            </h2>
            <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter text-white -mt-4 md:-mt-8 mix-blend-overlay">
              Schematics
            </h2>
          </div>
          <div className="text-right font-mono text-xs mt-8 md:mt-0 text-gray-500 uppercase tracking-widest">
            <p>Spec Sheet: 009-B</p>
            <p>Status: <span className="text-[#CCFF00] animate-pulse">Optimized</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          
          {TECH_SPECS.map((spec, index) => (
            <div 
              key={index} 
              className={`
                group relative bg-zinc-900/40 backdrop-blur-sm border border-white/5 p-10
                hover:bg-zinc-900/80 transition-all duration-500
                ${spec.gridArea === 'col-span-2 row-span-2' ? 'md:col-span-2 md:row-span-2' : ''}
              `}
            >
              <div className="absolute top-4 right-4 font-mono text-[10px] text-gray-600 group-hover:text-[#CCFF00]">
                 Ref: 0{index + 1}
              </div>

              <div className="flex justify-between items-start mb-12">
                <div className="p-3 bg-white/5 rounded-sm text-gray-400 group-hover:text-[#CCFF00] transition-colors">
                     {iconMap[spec.icon]}
                </div>
              </div>
              
              <h3 className="text-3xl font-black uppercase mb-4 font-tech tracking-wide group-hover:translate-x-2 transition-transform duration-300">
                {spec.title}
              </h3>
              <p className="text-gray-500 font-mono text-sm leading-relaxed max-w-md">
                {spec.description}
              </p>

              {/* Corner Markers */}
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/10 group-hover:border-[#CCFF00] transition-colors"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/10 group-hover:border-[#CCFF00] transition-colors"></div>
            </div>
          ))}

          {/* Interactive AR Module */}
          <div className="relative group min-h-[400px] border border-white/10 overflow-hidden bg-black">
            <div className="absolute inset-0 bg-[url('https://picsum.photos/800/800?grayscale')] bg-cover bg-center opacity-40 mix-blend-luminosity group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            
            {/* Scanner UI */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <Layers className="w-12 h-12 text-white/20 mb-4" />
               <div className="w-full h-[1px] bg-[#CCFF00] shadow-[0_0_10px_#CCFF00] animate-[scan_2s_ease-in-out_infinite]"></div>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-8">
                <div className="flex items-center gap-2 text-[#CCFF00] text-xs font-mono uppercase tracking-widest mb-2">
                    <Smartphone className="w-4 h-4" />
                    Scan For 3D View
                </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};