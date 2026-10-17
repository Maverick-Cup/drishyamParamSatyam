'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Sparkle } from '@phosphor-icons/react';
import GuardrailInspector from '@/app/components/GuardrailInspector';

export default function DeveloperGuardrailsPage() {
  return (
    <div className="min-h-screen bg-[#070b12]/85 text-slate-200 p-6 flex flex-col font-sans relative z-10">
      {/* HEADER */}
      <header className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/experience/presence"
            className="text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5 text-xs bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800"
          >
            <ArrowLeft className="text-sm" />
            <span>Back to Presence</span>
          </Link>
          <div className="h-4 w-px bg-slate-800"></div>
          <div>
            <h1 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              ParamSathya &bull; Policy &amp; Guardrails Engine
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-700/50 text-emerald-300">
                Active Audit
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Runtime verification, evidence bounds, and memory provenance analysis.
            </p>
          </div>
        </div>
      </header>

      {/* INSPECTOR BODY */}
      <main className="flex-1 flex flex-col justify-start">
        <GuardrailInspector />
      </main>
    </div>
  );
}
