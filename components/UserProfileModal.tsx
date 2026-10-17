'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  UploadSimple,
  User,
  ShieldCheck,
  CheckCircle,
  Camera,
  Envelope,
  Heart,
  Sparkle,
} from '@phosphor-icons/react';

export interface ActiveUserProfile {
  displayName: string;
  email: string;
  relationship: string;
  avatarUrl: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: ActiveUserProfile;
  onSaveProfile: (updatedProfile: ActiveUserProfile) => void;
}

// Preset photo options representing warm, cross-generational family members
const PRESET_AVATARS: Array<{ id: string; label: string; url: string }> = [
  {
    id: 'preset-maya-1',
    label: 'Maya (Default)',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkM9-qFCcd6h1qbdIM3Uaaj9G2bxYFGZJ-HjNC-BgIiIJchAvfQXV8k3n2_grb8xPKhB1u78Z8gMpe2ifh7AG4fOhu8KwQsyoeS5Z2XDphOqAlVOl1LQX3GtIOFTchjKqUUssFoQcPz1LwklcurbPRP_-OiqJ2Vmg6V89Lmx3K0-0LuJlmoM70g_FTt5dl9b1st9tStS9yOG7OmkCoViQm4D5PpTmxQN4wmh36A0Q',
  },
  {
    id: 'preset-family-daughter',
    label: 'Daughter / Granddaughter',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6fbVph3tU_Lnf2CmAey-RpAGVQcc3iWhsolfT8TojYEo8Jj0EXlqJjnejbsR7-4IdE_Kst-5KagZslhbd7d1JdX9eM88Zgvn2XjsuDr9_1lEE4EDkhacBCI93Q0eODvtNR4P1iPQmclz3SCu7s1-m20AAVym-WPcIjx8pgZiSNngPGA3zO9GAlrB__frJbb9e4Bu1X-Y5zS1XW0c7ap54mmGw-ODLjQ1fKeexk9I',
  },
  {
    id: 'preset-family-son',
    label: 'Son / Grandson',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-elder-kin',
    label: 'Elder Kin',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
  },
];

export function UserProfileModal({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
}: UserProfileModalProps) {
  const [displayName, setDisplayName] = useState(currentProfile.displayName || 'Maya');
  const [relationship, setRelationship] = useState(currentProfile.relationship || 'Granddaughter & Family Owner');
  const [avatarUrl, setAvatarUrl] = useState(currentProfile.avatarUrl);
  const [uploadNotice, setUploadNotice] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    setUploadNotice(`Loaded "${file.name}"`);
    setTimeout(() => setUploadNotice(''), 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      displayName: displayName.trim() || 'Maya',
      email: currentProfile.email || 'hpshahi12@gmail.com',
      relationship: relationship.trim() || 'Family Member',
      avatarUrl: avatarUrl || currentProfile.avatarUrl,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-profile-modal-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="glass-panel max-w-lg w-full rounded-3xl border border-white/15 overflow-hidden shadow-2xl flex flex-col bg-[#0b101b]/95 relative">
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* MODAL HEADER */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/50 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <User className="text-xl" />
            </div>
            <div>
              <h3 id="user-profile-modal-title" className="text-base font-semibold text-slate-100">
                Logged-In Family Account
              </h3>
              <p className="text-xs text-slate-400">
                Update your personal presence avatar, name, and family relationship.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close user profile modal"
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="text-lg" />
          </button>
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSave} className="p-6 space-y-5 relative z-10 overflow-y-auto max-h-[78vh]">
          {/* PROFILE PHOTO SELECTION & PREVIEW */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Camera className="text-cyan-400" />
                <span>Your Profile Photo</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Appears on chats &amp; header</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-cyan-500/50 bg-slate-950 shadow-md">
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PRESET_AVATARS[0].url;
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] text-cyan-200 transition rounded-2xl"
                  title="Upload new photo"
                >
                  <Camera className="text-lg mb-0.5" />
                  <span>Change</span>
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition cursor-pointer"
                >
                  <UploadSimple className="text-sm" />
                  <span>Upload Custom Photo</span>
                </button>
                <p className="text-[11px] text-slate-400">
                  Select a clear photo from your device. JPG, PNG, WebP supported.
                </p>
                {uploadNotice && (
                  <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle weight="fill" className="text-xs" /> {uploadNotice}
                  </p>
                )}
              </div>
            </div>

            {/* CURATED AVATAR PRESETS */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <span className="text-[11px] text-slate-400 block">Or select a family avatar preset:</span>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = avatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAvatarUrl(preset.url)}
                      className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 text-center transition ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/20 ring-1 ring-cyan-400'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                      title={preset.label}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-[10px] text-slate-300 truncate w-full">
                        {preset.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* NAME & RELATIONSHIP FIELDS */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Maya"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Family Relationship / Role
              </label>
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g. Granddaughter &amp; Primary Contributor"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <Envelope className="text-slate-400 text-sm" />
                <span>{currentProfile.email || 'hpshahi12@gmail.com'}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/40 text-emerald-300">
                Session Active
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-semibold transition shadow-lg cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
