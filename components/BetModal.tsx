
import React from 'react';
import { Bet } from '../types';
import { X, AlertTriangle, Trophy, Users, Scale } from 'lucide-react';

interface BetModalProps {
  bet: Bet | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BetModal: React.FC<BetModalProps> = ({ bet, isOpen, onClose }) => {
  if (!isOpen || !bet) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-6xl bg-[#080808] border border-white/10 shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-300">
         
         {/* Close Button */}
         <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-50 p-2 bg-black border border-white/20 text-white hover:text-[#CCFF00] hover:border-[#CCFF00] transition-all rounded-full"
         >
            <X className="w-6 h-6" />
         </button>

         {/* Left: Visual Identity */}
         <div className="hidden md:block md:w-1/3 relative border-r border-white/10 bg-black">
            <div className="absolute inset-0 opacity-50">
               <img 
                 src={bet.heroImage} 
                 className="w-full h-full object-cover grayscale contrast-125" 
                 alt="Hero"
               />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-8 w-full">
               <div className="w-12 h-1 bg-[#CCFF00] mb-6"></div>
               <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-[0.9] text-white mb-4">
                  {bet.title}
               </h2>
               <div className="font-mono text-xs text-gray-500 uppercase tracking-widest">
                  Ref: {bet.slug.split('-')[0].toUpperCase()} // {bet.season}
               </div>
            </div>
         </div>

         {/* Right: Data Dossier */}
         <div className="w-full md:w-2/3 p-8 md:p-12 overflow-y-auto custom-scrollbar">
            
            {/* Header Mobile Only */}
            <div className="md:hidden mb-8">
              <h2 className="text-3xl font-black uppercase italic text-white mb-2">{bet.title}</h2>
              <div className="w-full h-px bg-white/10"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              
              {/* Metric & Criteria */}
              <div className="space-y-6">
                 <div className="flex items-center gap-2 text-[#CCFF00] mb-2">
                    <Scale className="w-5 h-5" />
                    <span className="font-bold font-mono uppercase text-sm">The Terms</span>
                 </div>
                 <div className="border-l-2 border-white/10 pl-4">
                    <p className="text-white text-lg font-bold leading-snug mb-2">
                      {bet.criteria}
                    </p>
                    <p className="text-xs font-mono text-gray-500 uppercase">
                       Metric: {bet.metrics?.label || 'N/A'}
                    </p>
                 </div>
              </div>

              {/* Void Conditions */}
              <div className="space-y-6">
                 <div className="flex items-center gap-2 text-red-500 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-bold font-mono uppercase text-sm">Void Protocols</span>
                 </div>
                 <div className="border-l-2 border-red-500/20 pl-4 bg-red-500/5 p-4">
                    <p className="text-gray-300 text-sm font-mono leading-relaxed">
                      {bet.voidConditions}
                    </p>
                 </div>
              </div>

            </div>

            {/* Participants Grid */}
            <div className="mb-12">
               <div className="flex items-center gap-2 text-white mb-6">
                  <Users className="w-5 h-5" />
                  <span className="font-bold font-mono uppercase text-sm">Syndicate Positions</span>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Side A */}
                  <div className="bg-white/5 border border-white/10 p-6">
                     <div className="text-[#CCFF00] text-xs font-black uppercase tracking-widest mb-4">Side A</div>
                     <div className="text-2xl font-bold text-white mb-1">
                        {bet.entities.filter(e => e.side === 'A').map(e => e.name).join(', ')}
                     </div>
                     <div className="text-sm font-mono text-gray-500">
                        Backed by: {bet.participants.filter(p => p.side === 'A').map(p => p.name).join(' & ')}
                     </div>
                  </div>

                  {/* Side B */}
                  <div className="bg-white/5 border border-white/10 p-6">
                     <div className="text-red-500 text-xs font-black uppercase tracking-widest mb-4">Side B</div>
                     <div className="text-2xl font-bold text-white mb-1">
                        {bet.entities.filter(e => e.side === 'B').map(e => e.name).join(', ') || 'Field'}
                     </div>
                     <div className="text-sm font-mono text-gray-500">
                        Backed by: {bet.participants.filter(p => p.side === 'B').map(p => p.name).join(' & ')}
                     </div>
                  </div>
               </div>
            </div>

            {/* Prize Section */}
            <div className="bg-zinc-900 border border-dashed border-white/20 p-6 flex items-start gap-6">
               <Trophy className="w-8 h-8 text-[#CCFF00] shrink-0" />
               <div>
                  <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Settlement Bounty</h4>
                  <p className="text-xl font-bold text-white uppercase leading-tight">
                     {bet.prize}
                  </p>
               </div>
            </div>

         </div>

      </div>
    </div>
  );
};
