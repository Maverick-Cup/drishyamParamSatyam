'use client';

import React from 'react';
import Link from 'next/link';
import {
  HandHeart,
  FlowerLotus,
  Compass,
  Database,
  X,
  Wind,
  Heartbeat,
} from '@phosphor-icons/react';

interface MobileReflectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  personName: string;
  onOpenBreathing: () => void;
}

export function MobileReflectionSheet({
  isOpen,
  onClose,
  personName,
  onOpenBreathing,
}: MobileReflectionSheetProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Reflection & Handoff Sheet"
      className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end"
    >
      {/* Tap backdrop to dismiss */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container */}
      <div className="bg-[#0b0f17] border-t border-purple-500/30 rounded-t-3xl p-5 pb-safe max-h-[85dvh] overflow-y-auto shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-purple-300">
            <HandHeart className="text-xl" />
            <h2 className="text-base font-serif font-semibold text-slate-100">
              Reflection &amp; Handoff
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close reflection sheet"
            className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center touch-target-48"
          >
            <X className="text-lg" />
          </button>
        </div>

        {/* Gentle Reflection Card */}
        <div className="glass-card-interactive p-4 rounded-2xl relative overflow-hidden space-y-2 border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 text-xs">
                <FlowerLotus className="text-base" />
              </span>
              <h3 className="text-sm font-medium text-slate-100">Gentle Reflection</h3>
            </div>
            <span className="text-[10px] text-purple-300 font-mono bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded-full">
              Empathetic AI
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            You are revisiting peaceful family memories. Holding onto {personName}&apos;s appreciation for quiet, grounding
            moments can anchor your own week.
          </p>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span className="text-[11px]">
              Emotional Tone: <strong className="text-cyan-300 font-normal">Nostalgic &amp; Soothing</strong>
            </span>
            <Link
              href={`/experience/journal?context=${encodeURIComponent(
                `Quiet family memories and values learned from ${personName}`
              )}`}
              onClick={onClose}
              className="text-purple-300 hover:text-purple-200 text-xs underline flex items-center gap-1 touch-target-48 py-1"
            >
              <span>Log to Journal →</span>
            </Link>
          </div>
        </div>

        {/* Suggested Next Steps */}
        <div className="glass-card-interactive p-4 rounded-2xl border-amber-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300">
              <Compass className="text-base" />
              <h3 className="text-sm font-medium text-slate-100">Suggested Steps</h3>
            </div>
            <span className="text-[10px] text-amber-300 font-mono bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
              Gentle
            </span>
          </div>

          <div className="space-y-2">
            <label className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-700 text-amber-500 focus:ring-0 mt-0.5" />
              <span className="text-xs text-slate-300">Preserve this cedar tree memory in the family shared scrapbook</span>
            </label>
            <label className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-700 text-amber-500 focus:ring-0 mt-0.5" />
              <span className="text-xs text-slate-300">Invite trusted family members to listen to the original 2018 voicemails</span>
            </label>
          </div>
        </div>

        {/* Referenced Evidence Artifacts */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Database className="text-cyan-400" /> Referenced Vault Artifacts
          </span>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 text-slate-300">
              <span className="truncate pr-2 font-mono text-[11px]">• VM_July2018_Trailhead.wav</span>
              <span className="text-[10px] text-cyan-400 font-mono shrink-0">1.8 MB</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 text-slate-300">
              <span className="truncate pr-2 font-mono text-[11px]">• Olympic_Park_Journal_Entry.pdf</span>
              <span className="text-[10px] text-purple-400 font-mono shrink-0">pg 42</span>
            </div>
          </div>
        </div>

        {/* 1-Minute Breath Pause Safety Callout */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/50 border border-cyan-500/30 text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-cyan-400/10 flex items-center justify-center text-cyan-300">
              <Heartbeat className="text-lg" />
            </div>
          </div>
          <p className="text-xs text-slate-200 font-medium">Remember to take a breath and connect with loved ones.</p>
          <p className="text-[11px] text-slate-400">
            ParamSathya is designed to cherish memories without replacing real-world human presence.
          </p>
          <button
            onClick={() => {
              onOpenBreathing();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 border border-cyan-500/30 transition flex items-center justify-center gap-2 touch-target-48"
          >
            <Wind /> Start 1-Minute Breath Pause
          </button>
        </div>
      </div>
    </div>
  );
}
