import React from 'react';
import { SlidersHorizontal, ShieldCheck, CheckCircle } from '@phosphor-icons/react';

export interface RepresentedPersonProfileData {
  id: string;
  fullName: string;
  relationship: string;
  birthYear: number | string;
  passedYear: number | string;
  portraitUrl: string;
  consentVersion: string;
  isSynced: boolean;
}

interface RepresentedPersonProfileCardProps {
  profile: RepresentedPersonProfileData;
  onConfigure: () => void;
}

export const RepresentedPersonProfileCard: React.FC<RepresentedPersonProfileCardProps> = ({
  profile,
  onConfigure,
}) => {
  return (
    <div className="bg-[#12141c] border border-amber-600/30 rounded-xl p-3 shadow-lg flex items-center justify-between gap-3 text-left">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-500/60 bg-black shadow-md">
            <img
              src={profile.portraitUrl || '/avatar_RajeshBadePapa_clean.jpg'}
              alt={profile.fullName}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                // Fallback to placeholder if image fails
                (e.target as HTMLImageElement).src = '/avatar_RajeshBadePapa_clean.jpg';
              }}
            />
          </div>
          <span
            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#12141c]"
            title="Profile Active & Grounded"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm font-bold text-white truncate max-w-[150px]">
              {profile.fullName}
            </h3>
          </div>

          <p className="text-[11px] text-slate-400 truncate">
            {profile.relationship} • {profile.birthYear}–{profile.passedYear}
          </p>

          <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-400/90 font-mono">
            <ShieldCheck className="text-xs text-amber-400 shrink-0" />
            <span className="truncate max-w-[140px]">{profile.consentVersion}</span>
            <span className="text-emerald-400 flex items-center gap-0.5 ml-1">
              <CheckCircle className="text-[10px]" weight="fill" /> Synced
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onConfigure}
        className="px-2.5 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900/80 border border-amber-600/50 text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition shrink-0 shadow-sm"
        title="Configure Custom Remembrance Persona (Snip P2)"
      >
        <SlidersHorizontal className="text-xs text-amber-400" />
        <span>Configure</span>
      </button>
    </div>
  );
};
