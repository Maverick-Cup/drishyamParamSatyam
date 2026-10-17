'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, ShieldCheck, Heartbeat } from '@phosphor-icons/react';

interface MobileAppBarProps {
  personName: string;
  portraitUrl?: string;
  userAvatarUrl?: string;
  onOpenCrisis: () => void;
  onOpenVoiceConfig: () => void;
  onOpenUserProfile?: () => void;
}

export function MobileAppBar({
  personName,
  portraitUrl,
  userAvatarUrl,
  onOpenCrisis,
  onOpenVoiceConfig,
  onOpenUserProfile,
}: MobileAppBarProps) {
  return (
    <header className="md:hidden flex items-center justify-between px-4 py-2.5 bg-[#080c14]/90 border-b border-white/10 backdrop-blur-xl shrink-0 z-30 pt-safe">
      {/* Brand & Active Persona Identity */}
      <div className="flex items-center gap-2.5">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
            <Heartbeat className="text-lg group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-serif text-base tracking-tight text-slate-100 font-medium">
            ParamSathya
          </span>
        </Link>
      </div>

      {/* Right Actions: Persona Profile Chip & Urgent Crisis Helpline */}
      <div className="flex items-center gap-2">
        {/* Active Persona Chip Button */}
        <button
          onClick={onOpenVoiceConfig}
          aria-label={`Configure ${personName} presence profile`}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 hover:border-cyan-500/40 transition touch-target-48"
        >
          {portraitUrl ? (
            <img
              src={portraitUrl}
              alt=""
              className="w-5 h-5 rounded-full object-cover border border-slate-600"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30" />
          )}
          <span className="max-w-[85px] truncate font-medium text-[11px] text-slate-300">
            {personName}
          </span>
        </button>

        {/* 1-Tap Urgent Safety & Crisis Helplines Action */}
        <button
          onClick={onOpenCrisis}
          aria-label="Open emergency crisis helplines and safety support"
          className="w-10 h-10 rounded-full bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-600/50 flex items-center justify-center transition shadow-sm touch-target-48"
          title="Crisis support & helplines"
        >
          <Phone className="text-base text-rose-400" />
        </button>

        {/* Logged-In User Profile Photo Action */}
        {onOpenUserProfile && (
          <button
            onClick={onOpenUserProfile}
            aria-label="Open user profile settings and photo"
            className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-700/80 hover:ring-cyan-500/60 transition touch-target-48 flex items-center justify-center"
            title="Update your user profile and photo"
          >
            {userAvatarUrl ? (
              <img
                src={userAvatarUrl}
                alt="Your profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-cyan-900/60 flex items-center justify-center text-cyan-200 text-xs font-semibold">
                U
              </div>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
