'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookBookmark,
  Heart,
  FlowerLotus,
  Sparkle,
  Plus,
  Trash,
  CheckCircle,
  DownloadSimple,
} from '@phosphor-icons/react';

interface JournalEntry {
  id: string;
  createdAt: string;
  mood: 'PEACEFUL' | 'NOSTALGIC' | 'GRATEFUL' | 'OVERWHELMED';
  memoryContext: string;
  personalThoughts: string;
  healingTakeaway: string;
  companionName: string;
}

const DEFAULT_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-1',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    mood: 'NOSTALGIC',
    companionName: 'Prof. Anand Sharma',
    memoryContext: 'Monsoon 1998 Audio Diary & Cedar Tree Walks',
    personalThoughts:
      'Listening to his voice reminded me that his patience during family disagreements came from genuine quietude, not indifference.',
    healingTakeaway:
      'Practice making evening tea and taking ten silent breaths before reacting to workplace tension.',
  },
];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [companionName, setCompanionName] = useState<string>('Prof. Anand Sharma');
  const [mood, setMood] = useState<JournalEntry['mood']>('NOSTALGIC');
  const [memoryContext, setMemoryContext] = useState<string>('');
  const [personalThoughts, setPersonalThoughts] = useState<string>('');
  const [healingTakeaway, setHealingTakeaway] = useState<string>('');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedCompanion = localStorage.getItem('paramsathya_persona_profile_v1');
      if (savedCompanion) {
        const parsed = JSON.parse(savedCompanion);
        if (parsed.fullName) setCompanionName(parsed.fullName);
      }

      const savedEntries = localStorage.getItem('paramsathya_journal_entries_v1');
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      } else {
        setEntries(DEFAULT_ENTRIES);
      }

      // Check if routed from Presence "Log to Journal" button with URL search param
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const contextParam = urlParams.get('context');
        if (contextParam) {
          setMemoryContext(decodeURIComponent(contextParam));
        } else {
          setMemoryContext('Holding onto quiet, grounding moments with family');
        }
      }
    } catch {
      setEntries(DEFAULT_ENTRIES);
    }
  }, []);

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalThoughts.trim()) return;

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      createdAt: new Date().toISOString(),
      mood,
      companionName,
      memoryContext: memoryContext.trim() || 'Reflection on gentle remembrance',
      personalThoughts: personalThoughts.trim(),
      healingTakeaway: healingTakeaway.trim() || 'Peace in small mindful steps.',
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    try {
      localStorage.setItem('paramsathya_journal_entries_v1', JSON.stringify(updated));
    } catch {}

    setPersonalThoughts('');
    setHealingTakeaway('');
    setSaveNotice('Journal entry preserved to your private mental health vault.');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleDelete = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    try {
      localStorage.setItem('paramsathya_journal_entries_v1', JSON.stringify(updated));
    } catch {}
  };

  const handleExportJournal = () => {
    const textData = entries
      .map(
        (e) =>
          `[${new Date(e.createdAt).toLocaleDateString()}] ${e.companionName} (${e.mood})\nContext: ${
            e.memoryContext
          }\nThoughts: ${e.personalThoughts}\nTakeaway: ${e.healingTakeaway}\n-----------------------------------\n`
      )
      .join('\n');
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ParamSathya_Journal_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-200 p-4 md:p-8 flex flex-col items-center font-sans relative z-10">
      <div className="w-full max-w-5xl space-y-6">
        {/* HEADER BAR */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/experience/presence"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs text-slate-300 hover:text-white transition"
            >
              <ArrowLeft className="text-sm" />
              <span>Back to Presence-Blessings Intact</span>
            </Link>
            <div className="h-4 w-px bg-slate-800"></div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <BookBookmark className="text-purple-400" />
                Remembrance &amp; Mental Health Journal
              </h1>
              <p className="text-xs text-slate-400">
                A private sanctuary to process memories of {companionName}, ground emotional well-being, and track personal healing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportJournal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition"
            >
              <DownloadSimple className="text-sm" />
              <span>Export Reflections</span>
            </button>
          </div>
        </header>

        {/* PURPOSE NOTICE CARD */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-cyan-950/30 to-slate-900 border border-purple-500/30 flex items-start gap-3">
          <FlowerLotus className="text-2xl text-purple-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-purple-300 block mb-0.5">Mindful Grounding Core:</strong>
            ParamSathya is designed to support healthy emotional resolution, not permanent digital attachment.
            Use this journal after every session to capture positive takeaways, celebrate values learned from elders,
            and reinforce clarity in your everyday life.
          </div>
        </div>

        {/* TWO-COLUMN WORKSPACE: NEW ENTRY FORM & SAVED ENTRIES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* NEW ENTRY CARD */}
          <div className="lg:col-span-5 bg-[#0e111a] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkle className="text-amber-400" />
                Jot Down Reflections
              </h2>
              <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-800/40">
                Stage 2: Integration
              </span>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4">
              <div>
                <label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                  Emotional Tone
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(['NOSTALGIC', 'PEACEFUL', 'GRATEFUL', 'OVERWHELMED'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`py-1.5 px-2 rounded-lg text-center font-medium transition border ${
                        mood === m
                          ? 'bg-purple-950 text-purple-300 border-purple-500/70 shadow-sm'
                          : 'bg-slate-900/60 text-slate-400 border-white/5 hover:border-slate-700'
                      }`}
                    >
                      {m === 'NOSTALGIC' && '🍂 Nostalgic'}
                      {m === 'PEACEFUL' && '🕊️ Peaceful'}
                      {m === 'GRATEFUL' && '🙏 Grateful'}
                      {m === 'OVERWHELMED' && '🌊 Overwhelmed'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                  Revisited Memory Context
                </label>
                <input
                  type="text"
                  value={memoryContext}
                  onChange={(e) => setMemoryContext(e.target.value)}
                  placeholder="e.g. Quiet afternoon tea or morning river walks"
                  className="w-full bg-[#141724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                  Personal Thoughts &amp; Feelings
                </label>
                <textarea
                  value={personalThoughts}
                  onChange={(e) => setPersonalThoughts(e.target.value)}
                  rows={4}
                  required
                  placeholder="How did revisiting this memory make you feel? What thoughts are surfacing today?"
                  className="w-full bg-[#141724] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 resize-none font-sans"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                  Healing Takeaway &amp; Coping Improvement
                </label>
                <input
                  type="text"
                  value={healingTakeaway}
                  onChange={(e) => setHealingTakeaway(e.target.value)}
                  placeholder="One healthy habit, boundary, or reminder to carry forward"
                  className="w-full bg-[#141724] border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {saveNotice ? (
                  <span className="text-xs text-emerald-300 flex items-center gap-1 font-medium">
                    <CheckCircle className="text-sm text-emerald-400" />
                    {saveNotice}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">Stored privately in browser storage</span>
                )}

                <button
                  type="submit"
                  disabled={!personalThoughts.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50 shadow-md shadow-purple-600/20"
                >
                  <Plus className="text-sm" />
                  <span>Save Entry</span>
                </button>
              </div>
            </form>
          </div>

          {/* PREVIOUS SAVED ENTRIES LIST */}
          <div className="lg:col-span-7 bg-[#0e111a] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Heart className="text-rose-400" />
                Journal Entries ({entries.length})
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">Confidential &amp; Grounded</span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
              {entries.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No journal entries yet. Use the form on the left to capture your first reflection.
                </div>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-xl bg-[#141724] border border-white/10 space-y-2.5 relative group hover:border-purple-500/40 transition"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{entry.companionName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800/40 text-purple-300">
                          {entry.mood}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(entry.createdAt).toLocaleDateString()} at{' '}
                          {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          aria-label="Delete entry"
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash className="text-xs" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-amber-300/90 font-medium bg-black/30 px-2.5 py-1 rounded-md border border-white/5">
                      Memory Anchor: {entry.memoryContext}
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {entry.personalThoughts}
                    </p>

                    {entry.healingTakeaway && (
                      <div className="pt-2 border-t border-white/5 text-[11px] text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle className="text-emerald-400 shrink-0" />
                        <span>Takeaway: {entry.healingTakeaway}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
