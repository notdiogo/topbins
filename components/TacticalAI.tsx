import React, { useState } from 'react';
import { Button } from './Button';
import { generateTacticalBrief } from '../services/geminiService';
import { GenerationResult } from '../types';
import { Terminal, Loader2, Cpu, Play, Database } from 'lucide-react';

export const TacticalAI: React.FC = () => {
  const [opponent, setOpponent] = useState('');
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const handleGenerate = async () => {
    if (!opponent || !mood) return;
    setLoading(true);
    setResult(null);
    
    try {
      const data = await generateTacticalBrief(opponent, mood);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-32 bg-[#0a0a0a] text-white relative border-t border-white/10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <div className="w-2 h-2 bg-[#CCFF00] animate-pulse"></div>
               <span className="text-xs font-mono text-[#CCFF00] tracking-widest">SYSTEM ONLINE</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white">
              Tactical <span className="text-transparent text-stroke">OS</span>
            </h2>
          </div>
          <div className="max-w-md text-right mt-8 md:mt-0">
             <p className="font-mono text-gray-500 text-sm">
               Using generative AI to calculate optimal win conditions based on live variables.
             </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 border border-white/10 bg-white/10">
          
          {/* Controls */}
          <div className="lg:col-span-4 bg-[#111] p-8 md:p-12">
            <div className="flex items-center gap-3 mb-12 text-[#CCFF00]">
              <Database className="w-5 h-5" />
              <span className="font-mono text-sm font-bold uppercase">Match Configuration</span>
            </div>

            <div className="space-y-10">
              <div>
                <label className="block text-xs font-mono uppercase font-bold tracking-widest text-gray-500 mb-4">01. Opponent Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Defensive', 'High Press', 'Counter', 'Possession'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setOpponent(opt)}
                      className={`p-4 text-xs font-bold uppercase font-tech text-center transition-all border ${
                        opponent === opt 
                          ? 'bg-white text-black border-white' 
                          : 'bg-transparent border-white/10 text-gray-500 hover:border-[#CCFF00] hover:text-[#CCFF00]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold tracking-widest text-gray-500 mb-4">02. Team Mentality</label>
                <div className="grid grid-cols-2 gap-2">
                   {['Underdogs', 'Confident', 'Hostile', 'Nervous'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setMood(opt)}
                      className={`p-4 text-xs font-bold uppercase font-tech text-center transition-all border ${
                        mood === opt 
                          ? 'bg-[#CCFF00] text-black border-[#CCFF00]' 
                          : 'bg-transparent border-white/10 text-gray-500 hover:border-[#CCFF00] hover:text-[#CCFF00]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={!opponent || !mood || loading}
                className="w-full mt-8"
                variant="primary"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <span className="flex items-center gap-2">Initialize <Play className="w-3 h-3 fill-current"/></span>}
              </Button>
            </div>
          </div>

          {/* Output Interface */}
          <div className="lg:col-span-8 bg-black relative min-h-[500px] flex flex-col">
            
            {/* Screen Effects */}
            <div className="absolute inset-0 scanlines opacity-10 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(204,255,0,0.05),transparent_40%)]"></div>

            <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col">
              
              <div className="flex justify-between border-b border-white/10 pb-4 mb-8 text-[10px] text-gray-600 font-mono uppercase">
                <span>CPU: 4.2GHz // Mem: 64TB</span>
                <span>Net: Connected</span>
              </div>

              {!result && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-800">
                  <Cpu className="w-24 h-24 mb-6 opacity-20" />
                  <p className="font-tech text-xl uppercase tracking-widest">Awaiting Data Stream</p>
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                   <div className="font-mono text-[#CCFF00] text-xs mb-2">{'>> '}Processing Algorithms...</div>
                   <div className="w-full h-1 bg-zinc-900 mb-4">
                      <div className="h-full bg-[#CCFF00] animate-[width_2s_ease-in-out_infinite]" style={{ width: '0%' }}></div>
                   </div>
                   <div className="space-y-1 font-mono text-[10px] text-gray-600">
                      <div>Optimizing spatial data...</div>
                      <div>Reviewing historical matches...</div>
                      <div>Simulating 10,000 outcomes...</div>
                   </div>
                </div>
              )}

              {result && (
                <div className="animate-in slide-in-from-bottom-4 duration-700">
                  <div className="mb-12">
                     <span className="bg-[#CCFF00] text-black text-[10px] font-bold uppercase px-2 py-1 mb-4 inline-block">Directives</span>
                     <h3 className="text-3xl md:text-5xl font-bold uppercase leading-tight text-white">
                       "{result.strategy}"
                     </h3>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                     {result.focusPoints.map((point, i) => (
                       <div key={i} className="border border-white/20 p-4 hover:border-[#CCFF00] transition-colors group">
                         <span className="text-gray-600 text-xs font-mono mb-2 block group-hover:text-[#CCFF00]">00{i + 1}</span>
                         <span className="text-white font-tech font-bold uppercase text-lg">{point}</span>
                       </div>
                     ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};