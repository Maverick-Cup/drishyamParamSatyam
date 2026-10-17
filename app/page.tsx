import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none relative z-10">
      <div className="max-w-2xl flex flex-col items-center gap-6 glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl bg-slate-950/40">
        {/* Glowing Logo Mark */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-500 to-amber-400 p-[2px] flex items-center justify-center shadow-lg shadow-purple-500/25">
          <div className="w-full h-full bg-[#080c14]/90 rounded-full flex items-center justify-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-300 font-bold text-3xl leading-none">
              P
            </span>
          </div>
        </div>

        {/* Title & Mission */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-wider text-slate-100 flex items-center justify-center gap-3">
            ParamSathya
            <span className="text-xs font-normal tracking-wide px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300">
              GriefTech Portal
            </span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 font-light leading-relaxed max-w-lg">
            Evidence-grounded memory preservation and calm reflection. Connected with authentic voice synthesis, gentle guidance, and cross-generational remembrance.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2 w-full">
          <Link
            href="/experience/presence"
            className="flex-1 min-w-[200px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-semibold text-sm transition shadow-lg shadow-cyan-500/20 text-center"
          >
            Enter Presence Companion &rarr;
          </Link>
          <Link
            href="/playground/indic"
            className="px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 text-amber-300 border border-amber-600/40 font-medium text-sm transition text-center"
          >
            Indic Language Support
          </Link>
        </div>

        {/* Footer Subtext */}
        <div className="text-[11px] text-slate-400 font-mono tracking-wide pt-2 border-t border-white/5 w-full flex items-center justify-between">
          <span>Enterprise Guardrails Active</span>
          <span>Zero Secret Leakage</span>
        </div>
      </div>
    </div>
  );
}
