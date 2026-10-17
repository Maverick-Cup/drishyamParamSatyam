'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FlowerLotus, Sparkle, ArrowRight } from '@phosphor-icons/react';
import MindfulExpectationModal from '@/components/MindfulExpectationModal';

export default function Home() {
  const router = useRouter();
  const [isExpectationModalOpen, setIsExpectationModalOpen] = useState(false);

  useEffect(() => {
    // Check if user has opted out of seeing the mindful story automatically
    if (typeof window !== 'undefined') {
      const dontShow = localStorage.getItem('param_mindful_story_dont_show');
      if (dontShow !== 'true') {
        // Gentle entrance delay to allow initial backdrop rendering
        const timer = setTimeout(() => {
          setIsExpectationModalOpen(true);
        }, 350);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleEnterPresence = () => {
    setIsExpectationModalOpen(false);
    router.push('/experience/presence');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none relative z-10">
      {/* Mindful Pre-Landing Expectation & Healing Goal Modal */}
      <MindfulExpectationModal
        isOpen={isExpectationModalOpen}
        onClose={() => setIsExpectationModalOpen(false)}
        onEnterPortal={handleEnterPresence}
      />

      <div className="max-w-2xl w-full flex flex-col items-center gap-5 sm:gap-6 glass-panel p-6 sm:p-12 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl bg-slate-950/40">
        {/* Glowing Logo Mark */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-500 to-amber-400 p-[2px] flex items-center justify-center shadow-lg shadow-purple-500/25">
          <div className="w-full h-full bg-[#080c14]/90 rounded-full flex items-center justify-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-300 font-bold text-2xl sm:text-3xl leading-none">
              P
            </span>
          </div>
        </div>

        {/* Sacred Healing Intention Story Badge */}
        <button
          type="button"
          onClick={() => setIsExpectationModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-950/80 via-purple-950/70 to-slate-900/90 hover:from-rose-900 hover:to-purple-900 border border-rose-500/40 text-rose-200 text-xs font-medium transition-all shadow-md shadow-rose-950/40 cursor-pointer active:scale-95 group"
          title="Open our healing intention and story expectation"
          aria-label="Open our healing intention story: The Oxherd Boy and the Rabbit"
        >
          <FlowerLotus className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
          <span>Our Healing Intention &bull; The Ox &amp; The Rabbit</span>
          <Sparkle className="w-3 h-3 text-amber-400 animate-pulse" />
        </button>

        {/* Title & Mission */}
        <div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-wider text-slate-100 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            ParamSathya
            <span className="text-[11px] sm:text-xs font-normal tracking-wide px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300">
              GriefTech Portal
            </span>
          </h1>
          <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-slate-300 font-light leading-relaxed max-w-lg">
            Evidence-grounded memory preservation and calm reflection. Connected with authentic voice synthesis, gentle guidance, and cross-generational remembrance.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-1 w-full">
          <Link
            href="/experience/presence"
            className="w-full sm:flex-1 min-w-[200px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-semibold text-sm transition shadow-lg shadow-cyan-500/20 text-center flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Enter Presence Companion</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </Link>
          <Link
            href="/playground/indic"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 text-amber-300 border border-amber-600/40 font-medium text-sm transition text-center active:scale-95"
          >
            Indic Language Support
          </Link>
        </div>

        {/* Footer Subtext */}
        <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono tracking-wide pt-2 border-t border-white/5 w-full flex items-center justify-between">
          <span>Enterprise Guardrails Active</span>
          <span>Zero Secret Leakage</span>
        </div>
      </div>
    </div>
  );
}
