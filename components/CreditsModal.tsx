"use client"

import React from 'react';
import { X, Palette, ExternalLink, PartyPopper } from 'lucide-react';

/* XPlay Credits Component - Enhanced Stylized Version
  Matches the dark glassmorphism aesthetic.
*/

const CreditsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden border bg-[#1a1a1e] border-purple-500/30 rounded-2xl shadow-2xl flex flex-col font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-transparent">
          <div className="flex items-center gap-3 text-purple-400">
            <PartyPopper size={24} />
            <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">Project Appreciation</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 transition-colors rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto text-gray-300 scroll-smooth leading-relaxed">
          <div className="space-y-8">
            <h3 className="text-xl font-semibold text-gray">XPlay wouldn&apos;t look as charming without the help of talented artists.</h3>
            
            <section className="p-4 border rounded-xl border-purple-500/10 bg-purple-500/5 transition-all hover:border-purple-500/30">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/5 rounded-full border border-purple-500/20 text-purple-400">
                  <Palette size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white mb-1">Illustration pets (Vector Art)</h4>
                  <p className="text-sm mb-2">The lovable pets was crafted by:</p>
                  
                  {/* Clickable Author Handle */}
                  <a
                    href="https://www.freepik.com/author/catalyststuff"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 group p-3 pr-4 font-mono text-sm rounded bg-black/40 text-purple-300 border border-purple-500/20 transition-all hover:bg-purple-900/20 hover:border-purple-400"
                    title="Catalyststuff Author Portfolio | Freepik"
                  >
                    <span>@catalyststuff</span>
                    <ExternalLink size={14} className="opacity-60 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer (simple separator matching legal) */}
        <div className="flex items-center justify-center p-4 border-t border-white/10 bg-black/40">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">XPlay © 2026</p>
        </div>
      </div>
    </div>
  );
};

export default CreditsModal;
