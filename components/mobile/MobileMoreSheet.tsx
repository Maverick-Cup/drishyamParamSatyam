'use client';

import React from 'react';
import Link from 'next/link';
import {
  Microphone,
  ImagesSquare,
  Translate,
  ShieldCheck,
  Wind,
  SpeakerHigh,
  SpeakerSlash,
  Palette,
  X,
  CaretRight,
  UserGear,
  BookOpen,
} from '@phosphor-icons/react';

interface MobileMoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabKey: 'audio' | 'photos' | 'indic' | 'family') => void;
  onOpenBreathing: () => void;
  onOpenVoiceProfile: () => void;
  onOpenThemeSelector: () => void;
  onOpenUserProfile?: () => void;
  userDisplayName?: string;
  userAvatarUrl?: string;
  isAmbientMuted: boolean;
  onToggleAmbient: () => void;
  audioVaultCount: number;
  photoVaultCount: number;
}

export function MobileMoreSheet({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenBreathing,
  onOpenVoiceProfile,
  onOpenThemeSelector,
  onOpenUserProfile,
  userDisplayName,
  userAvatarUrl,
  isAmbientMuted,
  onToggleAmbient,
  audioVaultCount,
  photoVaultCount,
}: MobileMoreSheetProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="More Features and Settings"
      className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end"
    >
      {/* Backdrop tap dismiss */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Card */}
      <div className="bg-[#0f172a] border-t border-slate-700/80 rounded-t-3xl p-5 pb-safe max-h-[85dvh] overflow-y-auto shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h2 className="text-base font-serif font-semibold text-slate-100">
              More Capabilities
            </h2>
            <p className="text-xs text-slate-400">
              Vault assets, language synthesis &amp; quiet spaces
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close more options sheet"
            className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center touch-target-48"
          >
            <X className="text-lg" />
          </button>
        </div>

        {/* Primary Secondary Feature Trays */}
        <div className="space-y-2">
          {/* Active Logged-In User Profile */}
          {onOpenUserProfile && (
            <button
              onClick={() => {
                onOpenUserProfile();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-500/60 transition text-left touch-target-48"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-cyan-500/50 bg-slate-900 shrink-0">
                  {userAvatarUrl ? (
                    <img src={userAvatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-cyan-300 font-bold">U</div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-100 flex items-center gap-1.5">
                    <span>{userDisplayName || 'Maya'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">You</span>
                  </p>
                  <p className="text-xs text-slate-400">Manage account photo &amp; name</p>
                </div>
              </div>
              <CaretRight className="text-cyan-400 text-base" />
            </button>
          )}
          {/* Audio Voice Vault */}
          <button
            onClick={() => {
              onNavigateTab('audio');
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 transition text-left touch-target-48"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Microphone className="text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">Audio Voice Vault</p>
                <p className="text-xs text-slate-400">{audioVaultCount} Verified voice clips</p>
              </div>
            </div>
            <CaretRight className="text-slate-500 text-base" />
          </button>

          {/* Photos and Keepsakes */}
          <button
            onClick={() => {
              onNavigateTab('photos');
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/30 transition text-left touch-target-48"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <ImagesSquare className="text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">Photos &amp; Keepsakes</p>
                <p className="text-xs text-slate-400">{photoVaultCount} Visual moments</p>
              </div>
            </div>
            <CaretRight className="text-slate-500 text-base" />
          </button>

          {/* Indic Language Studio */}
          <button
            onClick={() => {
              onNavigateTab('indic');
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition text-left touch-target-48"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Translate className="text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">Indic Language Studio</p>
                <p className="text-xs text-slate-400">Hindi, Urdu, Tamil, Telugu, Bengali &amp; 14 Indic dialects</p>
              </div>
            </div>
            <CaretRight className="text-slate-500 text-base" />
          </button>

          {/* Personal Remembrance Journal */}
          <Link
            href="/experience/journal"
            onClick={onClose}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/30 transition text-left touch-target-48"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <BookOpen className="text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">Personal Remembrance Journal</p>
                <p className="text-xs text-slate-400">Reflective journaling &amp; values</p>
              </div>
            </div>
            <CaretRight className="text-slate-500 text-base" />
          </Link>
        </div>

        {/* Ambient & Sanctuary Quick Tools */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
            Sanctuary &amp; Experience Controls
          </p>

          <div className="grid grid-cols-2 gap-2">
            {/* Ambient Sound Toggle */}
            <button
              onClick={onToggleAmbient}
              className={`p-3 rounded-2xl border text-left transition touch-target-48 ${
                isAmbientMuted
                  ? 'bg-slate-900 border-slate-800 text-slate-400'
                  : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {isAmbientMuted ? <SpeakerSlash /> : <SpeakerHigh className="animate-pulse" />}
                <span className="text-xs font-semibold">Soundscape</span>
              </div>
              <p className="text-[11px] opacity-80">
                {isAmbientMuted ? 'Ambience Muted' : 'Ambience Playing'}
              </p>
            </button>

            {/* Breathing Pause */}
            <button
              onClick={() => {
                onOpenBreathing();
                onClose();
              }}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-left text-slate-300 transition touch-target-48"
            >
              <div className="flex items-center gap-2 mb-1 text-cyan-400">
                <Wind />
                <span className="text-xs font-semibold text-slate-200">Breath Pause</span>
              </div>
              <p className="text-[11px] text-slate-400">60-second breathing</p>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Theme Selector */}
            <button
              onClick={() => {
                onOpenThemeSelector();
                onClose();
              }}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/30 text-left text-slate-300 transition touch-target-48"
            >
              <div className="flex items-center gap-2 mb-1 text-purple-400">
                <Palette />
                <span className="text-xs font-semibold text-slate-200">Atmosphere</span>
              </div>
              <p className="text-[11px] text-slate-400">Seasonal soundscapes</p>
            </button>

            {/* Voice & Persona Config */}
            <button
              onClick={() => {
                onOpenVoiceProfile();
                onClose();
              }}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 text-left text-slate-300 transition touch-target-48"
            >
              <div className="flex items-center gap-2 mb-1 text-amber-400">
                <UserGear />
                <span className="text-xs font-semibold text-slate-200">Presence Voice</span>
              </div>
              <p className="text-[11px] text-slate-400">Select active timbre</p>
            </button>
          </div>
        </div>

        {/* Security & Integrity Note */}
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-400">
          <ShieldCheck className="text-cyan-400 text-base shrink-0" />
          <span>Grounded in authentic family evidence. Zero private recordings leave your vault without explicit permission.</span>
        </div>
      </div>
    </div>
  );
}
