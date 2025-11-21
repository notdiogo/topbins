import React from 'react';
import { MOCK_IMAGES } from '../constants';
import { ArrowUpRight, User, Globe, Hash } from 'lucide-react';

export const CultureGrid: React.FC = () => {
  return (
    <section className="py-24 bg-[#f4f4f5] text-black relative overflow-hidden">
      
      {/* Background "Paper" Texture */}
      <div className="absolute inset-0 opacity-50 pointer-events-none" style={{ filter: 'contrast(120%) brightness(100%) noise(10%)' }}></div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Brutalist Header */}
        <div className="flex flex-col lg:flex-row justify-between items-end border-b-[3px] border-black pb-8 mb-12">
          <div>
             <div className="inline-block bg-black text-white text-sm font-bold uppercase px-2 py-1 mb-4 rotate-1">
                /// Archive 2002-2025
             </div>
             <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85]">
                Public <br/> Casting
             </h2>
          </div>
          
          <div className="flex flex-col items-end mt-8 lg:mt-0">
            <div className="w-32 h-32 bg-[#CCFF00] rounded-full flex items-center justify-center border-2 border-black mb-4 animate-[spin_10s_linear_infinite]">
                <Globe className="w-16 h-16 stroke-1" />
            </div>
            <p className="font-mono text-sm font-bold uppercase text-right max-w-xs">
               Documenting the global adoption of technical sportswear in urban environments.
            </p>
          </div>
        </div>

        {/* Asymmetric Grid - "Zine" Style */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 auto-rows-[minmax(200px,auto)]">
          
          {/* Item 1: Large Lookbook Shot */}
          <div className="col-span-1 md:col-span-6 lg:col-span-5 row-span-2 relative group border-2 border-black bg-black overflow-hidden">
            <img 
              src={MOCK_IMAGES.STREET_1} 
              alt="Street Style 1" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
            />
            <div className="absolute top-4 left-4 bg-white border border-black px-3 py-1 text-xs font-bold font-mono uppercase z-10">
               Fig. 01 — London
            </div>
            <div className="absolute bottom-0 left-0 w-full bg-[#CCFF00] p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 border-t-2 border-black">
               <div className="flex justify-between items-center">
                  <span className="font-black uppercase text-xl">Full Kit</span>
                  <ArrowUpRight className="w-6 h-6" />
               </div>
            </div>
          </div>

          {/* Item 2: Text Block */}
          <div className="col-span-1 md:col-span-6 lg:col-span-4 bg-white border-2 border-black p-8 flex flex-col justify-between relative hover:bg-black hover:text-white transition-colors duration-300 group">
             <Hash className="w-12 h-12 mb-4 group-hover:text-[#CCFF00]" />
             <h3 className="text-4xl font-black uppercase italic leading-none mb-4">
                Uniform <br/> for the <br/> Streets
             </h3>
             <p className="font-mono text-xs uppercase leading-relaxed opacity-70">
                The silhouette defined by oversized drills, technical nylons, and the unmistakable circle 90. A badge of belonging.
             </p>
             <div className="absolute top-4 right-4 w-3 h-3 bg-black rounded-full group-hover:bg-[#CCFF00]"></div>
          </div>

          {/* Item 3: Detail Shot */}
          <div className="col-span-1 md:col-span-6 lg:col-span-3 relative border-2 border-black bg-zinc-200 overflow-hidden group">
             <img 
              src={MOCK_IMAGES.STREET_2} 
              alt="Detail" 
              className="w-full h-full object-cover mix-blend-multiply contrast-125"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="bg-black text-[#CCFF00] px-4 py-2 font-black uppercase text-xl transform -rotate-12 border border-[#CCFF00]">
                  Rare Find
               </div>
            </div>
          </div>

          {/* Item 4: Data List */}
          <div className="col-span-1 md:col-span-6 lg:col-span-3 bg-black text-white border-2 border-black p-6 font-mono text-xs">
             <div className="border-b border-zinc-800 pb-2 mb-4 text-[#CCFF00] font-bold uppercase">
                /// Top Locations
             </div>
             <ul className="space-y-3">
                {['Shibuya Crossing', 'Peckham Rye', 'Le Marais', 'Lower East Side', 'Kreuzberg'].map((loc, i) => (
                   <li key={i} className="flex justify-between group cursor-pointer hover:text-[#CCFF00]">
                      <span>0{i+1} {loc}</span>
                      <span className="opacity-50">↗</span>
                   </li>
                ))}
             </ul>
          </div>

          {/* Item 5: Wide Horizontal Shot */}
          <div className="col-span-1 md:col-span-12 lg:col-span-4 relative border-2 border-black h-64 bg-zinc-900 group overflow-hidden">
             <img 
                src={MOCK_IMAGES.TEXTURE_METALLIC} 
                alt="Texture" 
                className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity"
             />
             <div className="absolute inset-0 flex flex-col justify-center items-center p-8 text-center">
                <User className="w-8 h-8 text-white mb-2" />
                <h4 className="text-2xl font-bold text-white uppercase">Join the Crew</h4>
                <button className="mt-4 bg-[#CCFF00] text-black px-6 py-2 font-bold uppercase hover:bg-white transition-colors">
                   Upload Look
                </button>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};