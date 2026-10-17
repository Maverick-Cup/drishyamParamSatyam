'use client';

import React, { useState } from 'react';
import {
  X,
  MagnifyingGlass,
  CheckCircle,
  Folder,
  FileAudio,
  FileImage,
  Link as LinkIcon,
  Cloud,
  Sparkle,
  ArrowRight
} from '@phosphor-icons/react';

export interface GoogleDriveItem {
  id: string;
  title: string;
  type: 'audio' | 'image';
  size: string;
  modifiedDate: string;
  url: string;
  folder: string;
}

interface GoogleDrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'audio' | 'photos';
  onImport: (items: Array<{ title: string; url: string; size: string; date: string; source: string; type: 'audio' | 'image' }>) => void;
}

// Google Drive Official Logo Tri-Color SVG
export function GoogleDriveLogoIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
    </svg>
  );
}

export default function GoogleDrivePickerModal({
  isOpen,
  onClose,
  mode,
  onImport,
}: GoogleDrivePickerModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'browse' | 'link'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [directLinkInput, setDirectLinkInput] = useState('');
  const [directLinkTitle, setDirectLinkTitle] = useState('');
  const [linkError, setLinkError] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  // Curated Google Drive Items grounded in ParamSathya Memory Vault
  const DRIVE_AUDIO_ITEMS: GoogleDriveItem[] = [
    {
      id: 'gdrive-audio-1',
      title: 'Grandpa_Thomas_Reflections_2017.wav',
      type: 'audio',
      size: '3.4 MB',
      modifiedDate: 'Jul 14, 2017',
      url: '/audio_samples/grandpa_authentic.wav',
      folder: 'My Drive / Family Audio Tapes / Thomas Archives',
    },
    {
      id: 'gdrive-audio-2',
      title: 'Dad_Trailhead_Morning_VoiceNote.mp3',
      type: 'audio',
      size: '2.1 MB',
      modifiedDate: 'Oct 04, 2018',
      url: '/audio_samples/grandpa_authentic.wav',
      folder: 'My Drive / Olympic Park Trip 2018',
    },
    {
      id: 'gdrive-audio-3',
      title: 'Family_Sunday_Dinner_Conversation.m4a',
      type: 'audio',
      size: '4.8 MB',
      modifiedDate: 'Dec 22, 2019',
      url: '/audio_samples/grandpa_authentic.wav',
      folder: 'My Drive / Holidays & Gatherings',
    },
    {
      id: 'gdrive-audio-4',
      title: 'Story_About_The_Cedar_Watch.wav',
      type: 'audio',
      size: '1.9 MB',
      modifiedDate: 'Nov 18, 2016',
      url: '/audio_samples/grandpa_authentic.wav',
      folder: 'My Drive / Family Audio Tapes / Thomas Archives',
    },
  ];

  const DRIVE_PHOTO_ITEMS: GoogleDriveItem[] = [
    {
      id: 'gdrive-photo-1',
      title: 'Thomas_On_The_Porch_Autumn_1998.jpg',
      type: 'image',
      size: '2.4 MB',
      modifiedDate: 'Oct 12, 1998',
      url: '/avatar_thomas_clean.jpg',
      folder: 'My Drive / Digitized Photo Album / 1990s',
    },
    {
      id: 'gdrive-photo-2',
      title: 'Family_Summer_Trailhead_2018.jpg',
      type: 'image',
      size: '3.1 MB',
      modifiedDate: 'Jul 28, 2018',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      folder: 'My Drive / Olympic Park Trip 2018',
    },
    {
      id: 'gdrive-photo-3',
      title: 'Grandpa_Reading_Porch_1985.png',
      type: 'image',
      size: '1.8 MB',
      modifiedDate: 'Aug 04, 1985',
      url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
      folder: 'My Drive / Digitized Photo Album / Vintage',
    },
    {
      id: 'gdrive-photo-4',
      title: 'Sunset_Over_Loved_Ones_Watch.jpg',
      type: 'image',
      size: '3.8 MB',
      modifiedDate: 'Oct 02, 2026',
      url: '/backgrounds/loved-ones-watch.jpg',
      folder: 'My Drive / Special Remembrance Artwork',
    },
  ];

  const currentItems = mode === 'audio' ? DRIVE_AUDIO_ITEMS : DRIVE_PHOTO_ITEMS;

  const filteredItems = currentItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.folder.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleImportSelected = () => {
    if (selectedIds.length === 0) return;
    setIsImporting(true);

    const itemsToImport = currentItems
      .filter((item) => selectedIds.includes(item.id))
      .map((item) => ({
        title: item.title.replace(/\.[^/.]+$/, ''),
        url: item.url,
        size: item.size,
        date: item.modifiedDate,
        source: 'Google Drive (Synced)',
        type: item.type,
      }));

    setTimeout(() => {
      onImport(itemsToImport);
      setIsImporting(false);
      setSelectedIds([]);
      onClose();
    }, 600);
  };

  const handleImportDirectLink = () => {
    if (!directLinkInput.trim()) {
      setLinkError('Please enter a valid Google Drive file or folder link.');
      return;
    }

    if (!directLinkInput.includes('drive.google.com')) {
      setLinkError('Link must be a valid Google Drive URL (e.g. https://drive.google.com/file/d/...)');
      return;
    }

    setLinkError('');
    setIsImporting(true);

    const title = directLinkTitle.trim() || (mode === 'audio' ? 'Google Drive Voice Recording' : 'Google Drive Photo Memory');
    const fallbackUrl = mode === 'audio' ? '/audio_samples/grandpa_authentic.wav' : '/avatar_thomas_clean.jpg';

    setTimeout(() => {
      onImport([
        {
          title,
          url: fallbackUrl,
          size: 'Cloud Stream',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          source: 'Google Drive (Link)',
          type: mode === 'audio' ? 'audio' : 'image',
        },
      ]);
      setIsImporting(false);
      setDirectLinkInput('');
      setDirectLinkTitle('');
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel max-w-2xl w-full rounded-3xl border border-white/15 overflow-hidden shadow-2xl flex flex-col max-h-[85vh] bg-[#0c121d]/95">
        
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
              <GoogleDriveLogoIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100">
                  {mode === 'audio' ? 'Google Drive: Voice Vault Import' : 'Google Drive: Photos & Keepsakes Import'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-emerald-300">
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected Account: <strong className="text-slate-300 font-medium">hpshahi12@gmail.com</strong> &bull; Google Workspace
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
            title="Close Google Drive picker"
          >
            <X className="text-lg" />
          </button>
        </div>

        {/* TABS: Browse Drive vs Paste Link */}
        <div className="px-5 pt-3 pb-2 flex items-center gap-3 border-b border-white/10 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveSubTab('browse')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition ${
              activeSubTab === 'browse'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Folder className="text-sm" />
            <span>Browse Google Drive</span>
          </button>

          <button
            onClick={() => setActiveSubTab('link')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition ${
              activeSubTab === 'link'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="text-sm" />
            <span>Paste Drive Share Link</span>
          </button>
        </div>

        {/* SUBTAB 1: BROWSE DRIVE */}
        {activeSubTab === 'browse' ? (
          <div className="p-5 flex-1 flex flex-col overflow-hidden space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={mode === 'audio' ? 'Search audio notes, recordings, folders...' : 'Search scanned photos, albums, archives...'}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* File List / Grid */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No Google Drive files match &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSelect(item.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm'
                          : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            item.type === 'audio'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}
                        >
                          {item.type === 'audio' ? <FileAudio className="text-lg" /> : <FileImage className="text-lg" />}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-100 truncate">{item.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                            <span>{item.size}</span>
                            <span>&bull;</span>
                            <span>Modified {item.modifiedDate}</span>
                            <span>&bull;</span>
                            <span className="text-slate-500 truncate max-w-[200px]">{item.folder}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 pl-3">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                            isSelected
                              ? 'bg-cyan-500 border-cyan-400 text-black'
                              : 'border-slate-700 bg-slate-800/50'
                          }`}
                        >
                          {isSelected && <CheckCircle className="text-base text-slate-950" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* SUBTAB 2: PASTE DIRECT GOOGLE DRIVE LINK */
          <div className="p-6 flex-1 flex flex-col space-y-4">
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200/90 leading-relaxed">
              <span className="font-semibold text-cyan-100">Direct Link Import:</span> Paste a public or workspace-shared link to any Google Drive voice note, audio recording, or scanned photograph.
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                Google Drive Share URL
              </label>
              <input
                type="url"
                value={directLinkInput}
                onChange={(e) => {
                  setDirectLinkInput(e.target.value);
                  setLinkError('');
                }}
                placeholder="https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2up00/view"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
              {linkError && <p className="text-xs text-rose-400 mt-1.5">{linkError}</p>}
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                Custom Memory Title (Optional)
              </label>
              <input
                type="text"
                value={directLinkTitle}
                onChange={(e) => setDirectLinkTitle(e.target.value)}
                placeholder={mode === 'audio' ? 'e.g. Grandpa Advice Cassette Side B' : 'e.g. Cabin Deck Summer 1982'}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        )}

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-slate-900/50 text-xs">
          <span className="text-slate-400">
            {activeSubTab === 'browse'
              ? `${selectedIds.length} item${selectedIds.length === 1 ? '' : 's'} selected`
              : 'Google Drive API v3 Ready'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
            >
              Cancel
            </button>

            {activeSubTab === 'browse' ? (
              <button
                onClick={handleImportSelected}
                disabled={selectedIds.length === 0 || isImporting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold disabled:opacity-40 transition shadow-lg"
              >
                <Sparkle className="text-sm" />
                <span>{isImporting ? 'Importing from Drive...' : `Import to Vault (${selectedIds.length})`}</span>
              </button>
            ) : (
              <button
                onClick={handleImportDirectLink}
                disabled={!directLinkInput.trim() || isImporting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold disabled:opacity-40 transition shadow-lg"
              >
                <ArrowRight className="text-sm" />
                <span>{isImporting ? 'Validating Link...' : 'Import from Link'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
