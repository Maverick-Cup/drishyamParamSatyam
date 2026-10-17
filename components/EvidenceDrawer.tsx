'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Waveform,
  FileText,
  ImagesSquare,
  Play,
  Pause,
  ShieldCheck,
  Sparkle,
  Lock,
  Microphone,
  Keyboard,
  VideoCamera,
  PaperPlaneRight,
  Warning,
  CheckCircle,
  Compass,
  Clock,
  MapPin,
  User,
  Trash,
} from '@phosphor-icons/react';
import { MemoryRecord, AudioEvidenceAnchor, TextEvidenceAnchor } from '@/domain/models';
import {
  MemoryGraph,
  DrawerState,
  ReflectionState,
  AudioPlaybackState,
  CapabilityStatus,
  ConversationScope,
} from '@/services/memoryGraphBuilder';
import { TemporalTranscriptionService } from '@/services/TemporalTranscriptionService';

export interface EvidenceDrawerProps {
  drawerState: DrawerState;
  graph: MemoryGraph;
  representedPersonName: string;
  reflectionState: ReflectionState;
  audioPlaybackState: AudioPlaybackState;
  micCapability: CapabilityStatus;
  videoCapability: CapabilityStatus;
  isRecordingMic: boolean;
  onClose: () => void;
  onSelectMemory: (memoryId: string) => void;
  onPlayAudioAnchor: (memoryId: string, anchor: AudioEvidenceAnchor) => void;
  onPauseAudioAnchor: () => void;
  onStartConversation: (scope: ConversationScope, customPrompt?: string) => void;
  onToggleMicRecording: () => void;
  onSwitchToAvatarSession?: () => void;
  onDeleteMemory?: (memoryId: string, title?: string) => void;
}

export default function EvidenceDrawer({
  drawerState,
  graph,
  representedPersonName,
  reflectionState,
  audioPlaybackState,
  micCapability,
  videoCapability,
  isRecordingMic,
  onClose,
  onSelectMemory,
  onPlayAudioAnchor,
  onPauseAudioAnchor,
  onStartConversation,
  onToggleMicRecording,
  onSwitchToAvatarSession,
  onDeleteMemory,
}: EvidenceDrawerProps) {
  const [showKeyboardInput, setShowKeyboardInput] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (showKeyboardInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showKeyboardInput]);

  if (drawerState.status === 'CLOSED') {
    return null;
  }

  const activeMemory: MemoryRecord | undefined =
    drawerState.status === 'EVIDENCE'
      ? graph.recordsById[drawerState.memoryId]
      : drawerState.status === 'CONVERSATION' &&
          drawerState.scope.kind === 'MEMORY' &&
          drawerState.scope.memoryIds[0]
        ? graph.recordsById[drawerState.scope.memoryIds[0]]
        : undefined;

  const activeCategoryMemories: MemoryRecord[] =
    drawerState.status === 'CATEGORY_INSPECT'
      ? Object.values(graph.recordsById).filter((r) =>
          (r.categoryIds || ['identity']).includes(drawerState.categoryId)
        )
      : [];

  const scopeMemoryCount =
    drawerState.status === 'CONVERSATION'
      ? drawerState.scope.memoryIds.length
      : drawerState.status === 'CATEGORY_INSPECT'
        ? activeCategoryMemories.length
        : activeMemory
          ? 1
          : graph.uniqueApprovedMemoryCount;

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    const scope: ConversationScope =
      drawerState.status === 'CONVERSATION'
        ? drawerState.scope
        : activeMemory
          ? { kind: 'MEMORY', memoryIds: [activeMemory.id] }
          : drawerState.status === 'CATEGORY_INSPECT'
            ? {
                kind: 'CATEGORY',
                categoryId: drawerState.categoryId,
                memoryIds: activeCategoryMemories.map((m) => m.id),
              }
            : { kind: 'ALL_APPROVED', memoryIds: graph.approvedMemoryIds };

    onStartConversation(scope, promptInput.trim());
    setPromptInput('');
  };

  const renderProvenanceBadge = (record: MemoryRecord) => {
    const tier = record.provenanceTier ?? record.provenance;
    if (tier === 'VERIFIED_FIRST_PERSON') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/90 text-emerald-300 border border-emerald-500/40">
          <ShieldCheck className="text-xs text-emerald-400" weight="fill" />
          <span>Verified First-Person Evidence</span>
        </span>
      );
    }
    if (tier === 'ATTRIBUTED_RECOLLECTION') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-950/90 text-sky-300 border border-sky-500/40 border-dashed">
          <User className="text-xs text-sky-400" />
          <span>Attributed Family Recollection</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-950/90 text-amber-300 border border-amber-500/40">
        <Compass className="text-xs text-amber-400" />
        <span>Contextual Archive Note</span>
      </span>
    );
  };

  return (
    <aside
      role="dialog"
      aria-label="Talk on the map and evidence inspector"
      className="w-full md:w-[390px] xl:w-[410px] border-t md:border-t-0 md:border-l border-white/10 bg-[#070a12]/95 backdrop-blur-xl flex flex-col justify-between shrink-0 z-30 max-h-[78vh] md:max-h-none overflow-hidden shadow-2xl"
    >
      {/* DRAWER HEADER */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-lg font-serif text-slate-100 tracking-wide">
            {drawerState.status === 'CONVERSATION'
              ? 'Talk on the map'
              : drawerState.status === 'CATEGORY_INSPECT'
                ? `Cluster: ${drawerState.categoryId.charAt(0).toUpperCase() + drawerState.categoryId.slice(1)}`
                : 'Talk on the map'}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {graph.uniqueApprovedMemoryCount}{' '}
            {graph.uniqueApprovedMemoryCount === 1 ? 'memory' : 'memories'} •{' '}
            <span className="text-emerald-400">{scopeMemoryCount} in active scope</span>
          </p>
        </div>

        <button
          onClick={onClose}
          aria-label="Close map drawer"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition"
        >
          <X className="text-base" />
        </button>
      </div>

      {/* DRAWER BODY */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* 1. SELECTED MEMORY PROVENANCE & EXACT EVIDENCE ANCHOR */}
        {activeMemory && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {renderProvenanceBadge(activeMemory)}
              {activeMemory.restrictedScope && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                  <Lock className="text-xs" />
                  <span>Restricted Scope</span>
                </span>
              )}
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-slate-100">
                  {activeMemory.title || 'Verified Memory Record'}
                </h4>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                  <span>
                    Speaker:{' '}
                    <strong className="text-slate-200 font-medium">
                      {activeMemory.recordedSpeakerDisplayName || 'Speaker unknown'}
                    </strong>
                  </span>
                  <span>
                    Contributor:{' '}
                    <strong className="text-slate-200 font-medium">
                      {activeMemory.contributorDisplayName || 'Contributor unknown'}
                    </strong>
                  </span>
                  {activeMemory.verifiedLocation && (
                    <span className="inline-flex items-center gap-1 text-cyan-300">
                      <MapPin className="text-xs" />
                      {activeMemory.verifiedLocation}
                    </span>
                  )}
                </div>
              </div>

              {onDeleteMemory && (
                <button
                  type="button"
                  onClick={() => onDeleteMemory(activeMemory.id, activeMemory.title)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition shrink-0 cursor-pointer"
                  title="Delete memory record from constellation"
                  aria-label={`Delete memory record ${activeMemory.title || ''}`}
                >
                  <Trash className="text-base" />
                </button>
              )}
            </div>

            {/* SERIF REFLECTION / VERIFIED STORY TEXT (Point 4 from Snip, strictly grounded in MemoryRecord) */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3">
              <p className="font-serif text-[16px] leading-relaxed text-slate-100">
                {activeMemory.reviewedText}
              </p>
              <p className="font-serif text-[14px] leading-relaxed text-slate-300 border-t border-white/5 pt-3">
                {(activeMemory.provenanceTier ?? activeMemory.provenance) === 'VERIFIED_FIRST_PERSON'
                  ? `How does revisiting this preserved memory of ${representedPersonName} resonate with what you are carrying today?`
                  : `This recollection was contributed by ${activeMemory.contributorDisplayName || 'a family member'}. Would you like to reflect on how this perspective connects to your own memories?`}
              </p>
            </div>

            {/* EVIDENCE ANCHORS (AUDIO SEEKER / TEXT EXCERPT) */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Original Evidence Anchors</span>
                <span className="font-mono text-slate-500">
                  {(activeMemory.evidenceAnchors || []).length || activeMemory.sourceRefs.length}{' '}
                  linked
                </span>
              </div>

              {activeMemory.evidenceAnchors && activeMemory.evidenceAnchors.length > 0 ? (
                activeMemory.evidenceAnchors.map((anchor, idx) => {
                  if (anchor.kind === 'AUDIO') {
                    const audioAnchor = anchor as AudioEvidenceAnchor;
                    const isPlayingThis =
                      audioPlaybackState.status === 'PLAYING' &&
                      audioPlaybackState.memoryId === activeMemory.id;
                    const currentMs =
                      (audioPlaybackState.status === 'PLAYING' ||
                        audioPlaybackState.status === 'PAUSED') &&
                      audioPlaybackState.memoryId === activeMemory.id
                        ? audioPlaybackState.currentMs
                        : audioAnchor.startMs;
                    const durationMs = Math.max(1, audioAnchor.endMs - audioAnchor.startMs);
                    const progressPct = Math.min(
                      100,
                      Math.max(0, ((currentMs - audioAnchor.startMs) / durationMs) * 100)
                    );

                    return (
                      <div
                        key={`${audioAnchor.sourceId}-${idx}`}
                        className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Waveform className="text-emerald-400 text-base shrink-0" />
                            <span className="text-xs font-medium text-slate-200 truncate">
                              {audioAnchor.sourceTitle}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 shrink-0">
                            {TemporalTranscriptionService.formatMsToTimecode(audioAnchor.startMs)} →{' '}
                            {TemporalTranscriptionService.formatMsToTimecode(audioAnchor.endMs)}
                          </span>
                        </div>

                        {audioAnchor.quotedText && (
                          <p className="text-xs text-slate-300 italic border-l-2 border-emerald-500/50 pl-2.5">
                            &ldquo;{audioAnchor.quotedText}&rdquo;
                          </p>
                        )}

                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={() =>
                              isPlayingThis
                                ? onPauseAudioAnchor()
                                : onPlayAudioAnchor(activeMemory.id, audioAnchor)
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shrink-0"
                          >
                            {isPlayingThis ? (
                              <>
                                <Pause className="text-xs" weight="fill" />
                                <span>Pause Segment</span>
                              </>
                            ) : (
                              <>
                                <Play className="text-xs" weight="fill" />
                                <span>Seek &amp; Play Segment</span>
                              </>
                            )}
                          </button>

                          <div className="flex-1">
                            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-emerald-400 transition-all duration-100"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                              <span>
                                {TemporalTranscriptionService.formatMsToTimecode(currentMs)}
                              </span>
                              <span>
                                {TemporalTranscriptionService.formatMsToTimecode(audioAnchor.endMs)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const textAnchor = anchor as TextEvidenceAnchor;
                  return (
                    <div
                      key={`${textAnchor.sourceId}-${idx}`}
                      className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {textAnchor.kind === 'PHOTO' ? (
                            <ImagesSquare className="text-cyan-400 text-base shrink-0" />
                          ) : (
                            <FileText className="text-amber-400 text-base shrink-0" />
                          )}
                          <span className="text-xs font-medium text-slate-200 truncate">
                            {textAnchor.sourceTitle}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 shrink-0">
                          {textAnchor.pageNumber
                            ? `Page ${textAnchor.pageNumber}`
                            : textAnchor.paragraphId
                              ? `Para ${textAnchor.paragraphId}`
                              : 'Verified Source'}
                        </span>
                      </div>
                      {textAnchor.quotedText && (
                        <p className="text-xs text-slate-300 italic border-l-2 border-cyan-500/40 pl-2.5">
                          &ldquo;{textAnchor.quotedText}&rdquo;
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                  Source references: {activeMemory.sourceRefs.join(', ') || 'None'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. CATEGORY CLUSTER INSPECTOR */}
        {drawerState.status === 'CATEGORY_INSPECT' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              Showing <strong>{activeCategoryMemories.length}</strong> approved{' '}
              {activeCategoryMemories.length === 1 ? 'memory' : 'memories'} in this constellation
              cluster. Click any memory satellite or card below to inspect its original evidence
              anchor.
            </p>
            <div className="space-y-2">
              {activeCategoryMemories.map((mem) => (
                <div
                  key={mem.id}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-white/10 transition gap-2 group"
                >
                  <button
                    type="button"
                    onClick={() => onSelectMemory(mem.id)}
                    className="flex-1 text-left space-y-1 focus:outline-none"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {mem.title || 'Memory Record'}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {(mem.provenanceTier ?? mem.provenance) === 'VERIFIED_FIRST_PERSON'
                          ? '1st-Person'
                          : 'Attributed'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 font-serif">
                      {mem.reviewedText}
                    </p>
                  </button>

                  {onDeleteMemory && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMemory(mem.id, mem.title);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition shrink-0 cursor-pointer"
                      title="Delete memory record"
                      aria-label={`Delete ${mem.title || 'memory'}`}
                    >
                      <Trash className="text-sm" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. GROUNDED MAP REFLECTION OUTPUT */}
        {reflectionState.status === 'LOADING' && (
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center gap-3 text-xs text-indigo-200">
            <Sparkle className="text-base text-indigo-400 animate-spin shrink-0" />
            <span>Verifying evidence anchors and synthesizing grounded reflection...</span>
          </div>
        )}

        {reflectionState.status === 'READY' && (
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              reflectionState.response.mode === 'GUIDE'
                ? 'bg-amber-950/25 border-amber-500/40'
                : 'bg-indigo-950/30 border-indigo-500/35'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  reflectionState.response.mode === 'GUIDE'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {reflectionState.response.mode === 'GUIDE' ? (
                  <>
                    <Warning className="text-xs text-amber-400" />
                    <span>Neutral Guide Mode (Fail-Closed)</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="text-xs text-emerald-400" weight="fill" />
                    <span>Grounded in Direct Evidence</span>
                  </>
                )}
              </span>

              <span className="text-[10px] font-mono text-slate-400">
                {reflectionState.response.renderAllowed ? 'Voice Allowed' : 'Voice Blocked'}
              </span>
            </div>

            <p className="font-serif text-[15px] leading-relaxed text-slate-100">
              {reflectionState.response.text}
            </p>

            <div className="text-[11px] text-slate-400 border-t border-white/10 pt-2 flex items-center justify-between">
              <span>{reflectionState.response.reasoningNote}</span>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM CONVERSATION DOCK (Keyboard / Mic / Video + Prompt Form matching Snip 4 with real state gates) */}
      <div className="p-4 border-t border-white/10 bg-[#05070d]/95 space-y-3 shrink-0">
        {showKeyboardInput && (
          <form onSubmit={handlePromptSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Ask about the selected memory or cluster..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              aria-label="Send grounded map question"
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition"
            >
              <PaperPlaneRight className="text-sm" weight="fill" />
            </button>
          </form>
        )}

        <div className="flex items-center justify-center gap-5">
          {/* Keyboard Toggle */}
          <button
            type="button"
            onClick={() => setShowKeyboardInput((prev) => !prev)}
            aria-label="Toggle keyboard prompt input"
            aria-pressed={showKeyboardInput}
            className={`w-10 h-10 rounded-full flex items-center justify-center border transition ${
              showKeyboardInput
                ? 'bg-slate-800 border-indigo-400 text-white'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title="Type a question on the map"
          >
            <Keyboard className="text-base" />
          </button>

          {/* Primary Center Microphone Button */}
          <button
            type="button"
            disabled={
              micCapability === 'UNAVAILABLE' || micCapability === 'BLOCKED_BY_POLICY'
            }
            onClick={onToggleMicRecording}
            aria-label={
              isRecordingMic ? 'Stop voice input on the map' : 'Speak on the map'
            }
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition ${
              micCapability === 'UNAVAILABLE' || micCapability === 'BLOCKED_BY_POLICY'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : isRecordingMic
                  ? 'bg-rose-600 hover:bg-rose-500 text-white ring-4 ring-rose-500/30 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/60'
            }`}
            title={
              micCapability === 'BLOCKED_BY_POLICY'
                ? 'Voice synthesis blocked by grounding policy'
                : isRecordingMic
                  ? 'Listening... Click to finish'
                  : 'Talk on the map'
            }
          >
            <Microphone className="text-xl" weight="fill" />
          </button>

          {/* Video / Avatar Session Handoff */}
          <button
            type="button"
            disabled={
              videoCapability === 'UNAVAILABLE' ||
              videoCapability === 'BLOCKED_BY_POLICY' ||
              (reflectionState.status === 'READY' && !reflectionState.response.renderAllowed)
            }
            onClick={() => {
              if (onSwitchToAvatarSession) onSwitchToAvatarSession();
            }}
            aria-label="Switch to living portrait companion view"
            className={`w-10 h-10 rounded-full flex items-center justify-center border transition ${
              videoCapability === 'UNAVAILABLE' ||
              videoCapability === 'BLOCKED_BY_POLICY' ||
              (reflectionState.status === 'READY' && !reflectionState.response.renderAllowed)
                ? 'bg-slate-900/40 border-slate-800/60 text-slate-600 cursor-not-allowed'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title={
              reflectionState.status === 'READY' && !reflectionState.response.renderAllowed
                ? 'Avatar video disabled in Neutral Guide mode'
                : 'Open Living Portrait Session'
            }
          >
            <VideoCamera className="text-base" />
          </button>
        </div>
      </div>
    </aside>
  );
}
