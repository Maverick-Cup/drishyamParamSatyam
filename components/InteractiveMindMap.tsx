'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MagnifyingGlass,
  List as ListIcon,
  Graph,
  Microphone,
  Plus,
  Minus,
  Target,
  ShieldCheck,
  Waveform,
  FileText,
  ImagesSquare,
  Lock,
  Sparkle,
  X,
  Play,
  ArrowRight,
  Compass,
  User,
  MapPin,
  Trash,
} from '@phosphor-icons/react';
import { AudioEvidenceAnchor } from '@/domain/models';
import {
  MemoryGraph,
  MemoryGraphNode,
  MindMapViewMode,
  DrawerState,
  ReflectionState,
  AudioPlaybackState,
  CapabilityStatus,
  ConversationScope,
  filterMemoryGraphByQuery,
  synthesizeGroundedMapReflection,
} from '@/services/memoryGraphBuilder';
import { TemporalTranscriptionService } from '@/services/TemporalTranscriptionService';
import EvidenceDrawer from './EvidenceDrawer';

export interface InteractiveMindMapProps {
  graph: MemoryGraph;
  representedPersonName: string;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  selectedCategoryId: string | null;
  onSelectCategoryId: (catId: string | null) => void;
  onSwitchToAvatarSession?: () => void;
  onSpeakText?: (text: string) => void;
  onDeleteMemory?: (memoryId: string, title?: string) => void;
}

export default function InteractiveMindMap({
  graph,
  representedPersonName,
  searchQuery,
  onSearchQueryChange,
  selectedCategoryId,
  onSelectCategoryId,
  onSwitchToAvatarSession,
  onSpeakText,
  onDeleteMemory,
}: InteractiveMindMapProps) {
  const [subMode, setSubMode] = useState<MindMapViewMode>('MAP');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // Discriminated-union states
  const [drawerState, setDrawerState] = useState<DrawerState>({ status: 'CLOSED' });
  const [reflectionState, setReflectionState] = useState<ReflectionState>({ status: 'IDLE' });
  const [audioPlaybackState, setAudioPlaybackState] = useState<AudioPlaybackState>({
    status: 'IDLE',
  });
  const [isRecordingMic, setIsRecordingMic] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  // Monotonic requestId & cleanup refs
  const requestIdCounterRef = useRef<number>(0);
  const activeRequestIdRef = useRef<string | null>(null);
  const audioCleanupRef = useRef<(() => void) | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const synthOscillatorCleanupRef = useRef<(() => void) | null>(null);
  const lastFocusedNodeIdRef = useRef<string | null>(null);
  const nodeElementMapRef = useRef<Map<string, SVGGElement | HTMLButtonElement>>(new Map());

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  // Mandatory unmount cleanup for audio & timers
  useEffect(() => {
    return () => {
      if (audioCleanupRef.current) {
        audioCleanupRef.current();
        audioCleanupRef.current = null;
      }
      if (synthOscillatorCleanupRef.current) {
        synthOscillatorCleanupRef.current();
        synthOscillatorCleanupRef.current = null;
      }
      if (audioElementRef.current) {
        try {
          audioElementRef.current.pause();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const filterResult = useMemo(
    () => filterMemoryGraphByQuery(graph, searchQuery, selectedCategoryId),
    [graph, searchQuery, selectedCategoryId]
  );

  const nodesById = useMemo(() => {
    const map = new Map<string, MemoryGraphNode>();
    for (const n of graph.nodes) {
      map.set(n.id, n);
    }
    return map;
  }, [graph.nodes]);

  const invalidateInFlightReflection = () => {
    requestIdCounterRef.current += 1;
    activeRequestIdRef.current = null;
  };

  const stopActiveAudio = () => {
    if (audioCleanupRef.current) {
      audioCleanupRef.current();
      audioCleanupRef.current = null;
    }
    if (synthOscillatorCleanupRef.current) {
      synthOscillatorCleanupRef.current();
      synthOscillatorCleanupRef.current = null;
    }
    setAudioPlaybackState({ status: 'IDLE' });
  };

  const handleCloseDrawer = () => {
    invalidateInFlightReflection();
    stopActiveAudio();
    setIsRecordingMic(false);
    setDrawerState({ status: 'CLOSED' });
    setReflectionState({ status: 'IDLE' });
    setLiveAnnouncement('Closed map drawer.');

    // Restore keyboard focus to the node that opened the drawer (WCAG 2.1 AA)
    if (lastFocusedNodeIdRef.current) {
      const el = nodeElementMapRef.current.get(lastFocusedNodeIdRef.current);
      if (el) {
        setTimeout(() => el.focus(), 0);
      }
    }
  };

  const handleSelectMemoryNode = (memoryId: string, nodeDomId?: string) => {
    invalidateInFlightReflection();
    stopActiveAudio();
    if (nodeDomId) {
      lastFocusedNodeIdRef.current = nodeDomId;
    }
    const rec = graph.recordsById[memoryId];
    if (!rec) return;

    setDrawerState({ status: 'EVIDENCE', memoryId });
    setReflectionState({ status: 'IDLE' });
    setLiveAnnouncement(
      `Opened memory ${rec.title || memoryId}. Speaker: ${rec.recordedSpeakerDisplayName || 'Speaker unknown'}.`
    );
  };

  const handleSelectCategoryNode = (categoryId: string, nodeDomId?: string) => {
    invalidateInFlightReflection();
    stopActiveAudio();
    if (nodeDomId) {
      lastFocusedNodeIdRef.current = nodeDomId;
    }
    const nextCat = selectedCategoryId === categoryId ? null : categoryId;
    onSelectCategoryId(nextCat);
    setDrawerState({ status: 'CATEGORY_INSPECT', categoryId });
    setReflectionState({ status: 'IDLE' });
    setLiveAnnouncement(`Inspecting category cluster ${categoryId}.`);
  };

  const handleStartConversation = (scope: ConversationScope, customPrompt?: string) => {
    requestIdCounterRef.current += 1;
    const reqId = `req-${requestIdCounterRef.current}`;
    activeRequestIdRef.current = reqId;

    setDrawerState({
      status: 'CONVERSATION',
      scope,
      sessionNonce: reqId,
    });
    setReflectionState({ status: 'LOADING', requestId: reqId, scope });

    const effectivePrompt =
      customPrompt ||
      (scope.kind === 'MEMORY'
        ? `Reflect on memory ${scope.memoryIds[0]}`
        : scope.kind === 'CATEGORY'
          ? `Reflect on the ${scope.categoryId} memories`
          : 'Reflect on these connected memories on the map');

    // Deterministic grounded synthesis with stale-requestId guard (MAP-012)
    setTimeout(() => {
      if (activeRequestIdRef.current !== reqId) {
        return; // Stale request discarded
      }
      const reflection = synthesizeGroundedMapReflection(
        effectivePrompt,
        scope,
        graph,
        representedPersonName
      );
      setReflectionState({
        status: 'READY',
        requestId: reqId,
        response: reflection,
      });
      setLiveAnnouncement(
        `Reflection ready in ${reflection.mode} mode. ${reflection.reasoningNote}`
      );
      if (reflection.renderAllowed && onSpeakText) {
        onSpeakText(reflection.text);
      }
    }, 120);
  };

  const handleHeaderTalkOnMap = () => {
    const scope: ConversationScope =
      drawerState.status === 'EVIDENCE'
        ? { kind: 'MEMORY', memoryIds: [drawerState.memoryId] }
        : selectedCategoryId
          ? {
              kind: 'CATEGORY',
              categoryId: selectedCategoryId,
              memoryIds: Array.from(filterResult.matchedMemoryIds),
            }
          : searchQuery.trim()
            ? {
                kind: 'SEARCH_RESULT',
                query: searchQuery.trim(),
                memoryIds: Array.from(filterResult.matchedMemoryIds),
              }
            : {
                kind: 'ALL_APPROVED',
                memoryIds: graph.approvedMemoryIds,
              };

    handleStartConversation(scope);
  };

  const handlePlayAudioAnchor = (memoryId: string, anchor: AudioEvidenceAnchor) => {
    stopActiveAudio();
    const durationMs = Math.max(500, anchor.endMs - anchor.startMs);

    // If a real audio file URL is present, use TemporalTranscriptionService.playAudioSegment
    if (anchor.sourceUrl && typeof window !== 'undefined') {
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio();
      }
      setAudioPlaybackState({
        status: 'PLAYING',
        memoryId,
        currentMs: anchor.startMs,
        startMs: anchor.startMs,
        endMs: anchor.endMs,
      });
      audioCleanupRef.current = TemporalTranscriptionService.playAudioSegment(
        audioElementRef.current,
        anchor.sourceUrl,
        anchor.startMs,
        anchor.endMs,
        (currentMs, isPlaying) => {
          setAudioPlaybackState({
            status: isPlaying ? 'PLAYING' : 'PAUSED',
            memoryId,
            currentMs,
            startMs: anchor.startMs,
            endMs: anchor.endMs,
          });
        },
        () => {
          setAudioPlaybackState({
            status: 'PAUSED',
            memoryId,
            currentMs: anchor.endMs,
            startMs: anchor.startMs,
            endMs: anchor.endMs,
          });
        }
      );
      return;
    }

    // Quota-safe bounded timecode progression + speech preview for local vault records without external URL
    let elapsed = 0;
    const stepMs = 80;
    setAudioPlaybackState({
      status: 'PLAYING',
      memoryId,
      currentMs: anchor.startMs,
      startMs: anchor.startMs,
      endMs: anchor.endMs,
    });
    if (anchor.quotedText && onSpeakText) {
      onSpeakText(anchor.quotedText);
    }

    const timer = setInterval(() => {
      elapsed += stepMs;
      const nextMs = Math.min(anchor.endMs, anchor.startMs + elapsed);
      if (nextMs >= anchor.endMs) {
        clearInterval(timer);
        setAudioPlaybackState({
          status: 'PAUSED',
          memoryId,
          currentMs: anchor.endMs,
          startMs: anchor.startMs,
          endMs: anchor.endMs,
        });
      } else {
        setAudioPlaybackState({
          status: 'PLAYING',
          memoryId,
          currentMs: nextMs,
          startMs: anchor.startMs,
          endMs: anchor.endMs,
        });
      }
    }, stepMs);

    synthOscillatorCleanupRef.current = () => {
      clearInterval(timer);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  };

  const handlePauseAudioAnchor = () => {
    stopActiveAudio();
  };

  const handleToggleMicRecording = () => {
    if (isRecordingMic) {
      setIsRecordingMic(false);
      // Trigger grounded reflection on current scope when mic finishes
      handleHeaderTalkOnMap();
    } else {
      setIsRecordingMic(true);
      setLiveAnnouncement('Listening for your voice reflection on the map...');
    }
  };

  // Zoom & Pan controls
  const handleZoomIn = () => setZoom((z) => Math.min(2.4, Number((z + 0.2).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.55, Number((z - 0.2).toFixed(2))));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    onSelectCategoryId(null);
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if ((e.target as HTMLElement).closest('[data-node-interactive="true"]')) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const activeSelectedMemoryId =
    drawerState.status === 'EVIDENCE'
      ? drawerState.memoryId
      : drawerState.status === 'CONVERSATION' && drawerState.scope.kind === 'MEMORY'
        ? drawerState.scope.memoryIds[0]
        : null;

  const micCapability: CapabilityStatus =
    graph.uniqueApprovedMemoryCount === 0
      ? 'BLOCKED_BY_POLICY'
      : isRecordingMic
        ? 'ACTIVE'
        : 'AVAILABLE';

  const videoCapability: CapabilityStatus =
    graph.uniqueApprovedMemoryCount === 0 ||
    (reflectionState.status === 'READY' && !reflectionState.response.renderAllowed)
      ? 'BLOCKED_BY_POLICY'
      : 'AVAILABLE';

  const allMemoryRecordsSorted = useMemo(() => {
    return Object.values(graph.recordsById).sort((a, b) => a.id.localeCompare(b.id));
  }, [graph.recordsById]);

  return (
    <div className="flex-1 flex flex-col md:flex-row min-w-0 overflow-hidden relative bg-[#070a12]">
      {/* Screen-reader live region (WCAG 2.1 AA) */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* CENTER MAP OR LIST REGION */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* TOP HEADER BAR (Matches Points 1 & 2 from Snip with live deduplicated count) */}
        <header className="px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 z-20 bg-[#070a12]/90 backdrop-blur-md shrink-0">
          <div>
            <h2 className="text-2xl font-serif text-slate-100 tracking-wide font-normal">
              Mind Map
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5" data-testid="mindmap-header-count">
              {graph.uniqueApprovedMemoryCount}{' '}
              {graph.uniqueApprovedMemoryCount === 1 ? 'memory' : 'memories'}
              {filterResult.hasActiveFilter && (
                <span className="text-cyan-400 ml-2">
                  ({filterResult.matchedMemoryIds.size} matching filter)
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search input */}
            <div className="relative">
              <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Search your memories"
                aria-label="Search your memories"
                className="bg-slate-900/90 border border-slate-800 rounded-full pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-48 sm:w-60 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchQueryChange('')}
                  aria-label="Clear memory search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="text-xs" />
                </button>
              )}
            </div>

            {/* Map / List sub-mode toggle (stays inside Mind Map!) */}
            <button
              type="button"
              onClick={() => setSubMode((m) => (m === 'MAP' ? 'LIST' : 'MAP'))}
              aria-label={subMode === 'MAP' ? 'Switch to List view' : 'Switch to Constellation Map view'}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white text-xs font-medium transition"
            >
              {subMode === 'MAP' ? (
                <>
                  <ListIcon className="text-sm" />
                  <span>List</span>
                </>
              ) : (
                <>
                  <Graph className="text-sm text-cyan-400" />
                  <span>Map</span>
                </>
              )}
            </button>

            {/* Talk on the map button (Opens right drawer in-place without leaving Mind Map) */}
            <button
              type="button"
              disabled={graph.uniqueApprovedMemoryCount === 0}
              onClick={handleHeaderTalkOnMap}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition shadow-lg ${
                graph.uniqueApprovedMemoryCount === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border border-indigo-500/40 shadow-indigo-950/40'
              }`}
            >
              <Microphone className="text-sm text-indigo-400" weight="fill" />
              <span>Talk on the map</span>
            </button>
          </div>
        </header>

        {/* ZERO APPROVED MEMORIES STATE (MAP-001) */}
        {graph.uniqueApprovedMemoryCount === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-4">
              <Compass className="text-2xl" />
            </div>
            <h3 className="text-lg font-serif text-slate-200 mb-1">
              0 approved memories in this archive
            </h3>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              The constellation map renders only verified, approved memory records for{' '}
              <strong>{representedPersonName}</strong>. Add or approve a voice recording, note, or
              family recollection to populate the constellation.
            </p>
          </div>
        ) : subMode === 'LIST' ? (
          /* SEMANTIC ACCESSIBLE LIST VIEW (MAP-004, MAP-017) */
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Showing {filterResult.matchedMemoryIds.size} of {graph.uniqueApprovedMemoryCount}{' '}
                unique approved memories
              </p>
              {selectedCategoryId && (
                <button
                  type="button"
                  onClick={() => onSelectCategoryId(null)}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  Clear category filter ({selectedCategoryId})
                </button>
              )}
            </div>

            {filterResult.matchedMemoryIds.size === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
                <p className="text-sm text-slate-200">
                  No memories match &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onSearchQueryChange('');
                    onSelectCategoryId(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 transition"
                >
                  Clear search filter
                </button>
              </div>
            ) : (
              <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3" role="list">
                {allMemoryRecordsSorted
                  .filter((rec) => filterResult.matchedMemoryIds.has(rec.id))
                  .map((rec) => {
                    const tier = rec.provenanceTier ?? rec.provenance;
                    const isSelected = activeSelectedMemoryId === rec.id;
                    return (
                      <li key={rec.id}>
                        <button
                          type="button"
                          ref={(el) => {
                            if (el) nodeElementMapRef.current.set(`list:${rec.id}`, el);
                          }}
                          onClick={() => handleSelectMemoryNode(rec.id, `list:${rec.id}`)}
                          className={`w-full text-left p-4 rounded-2xl border transition space-y-2 ${
                            isSelected
                              ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg'
                              : 'bg-slate-900/60 hover:bg-slate-900 border-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-100">
                              {rec.title || 'Verified Memory'}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                tier === 'VERIFIED_FIRST_PERSON'
                                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                                  : 'bg-sky-950/90 text-sky-300 border-sky-500/40 border-dashed'
                              }`}
                            >
                              {tier === 'VERIFIED_FIRST_PERSON'
                                ? 'Verified 1st-Person'
                                : 'Attributed Recollection'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 font-serif line-clamp-2 leading-relaxed">
                            {rec.reviewedText}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
                            <span>
                              Speaker:{' '}
                              <strong className="text-slate-200">
                                {rec.recordedSpeakerDisplayName || 'Speaker unknown'}
                              </strong>
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-indigo-300 font-medium">
                                <span>Inspect Evidence</span>
                                <ArrowRight className="text-xs" />
                              </span>
                              {onDeleteMemory && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteMemory(rec.id, rec.title);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                                  title="Delete memory record"
                                  aria-label={`Delete ${rec.title || 'memory'}`}
                                >
                                  <Trash className="text-sm" />
                                </button>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        ) : (
          /* INTERACTIVE 2.5D CONSTELLATION SVG VIEWPORT (Point 3 from Snip + Provenance Rings) */
          <div className="flex-1 relative overflow-hidden select-none">
            {/* No-Result Search Overlay preserving dimmed spatial context (MAP-006) */}
            {filterResult.hasActiveFilter && filterResult.matchedMemoryIds.size === 0 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2.5 rounded-full bg-slate-900/95 border border-amber-500/40 shadow-xl flex items-center gap-3">
                <span className="text-xs text-amber-200">
                  No memories match &ldquo;{searchQuery}&rdquo;
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSearchQueryChange('');
                    onSelectCategoryId(null);
                  }}
                  className="text-xs font-semibold text-cyan-300 hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}

            <svg
              viewBox="0 0 1000 1000"
              role="region"
              aria-label={`Memory Constellation Map for ${representedPersonName}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`w-full h-full block ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              <defs>
                {/* Nebula soft radial gradients per category color */}
                {graph.nodes
                  .filter((n) => n.kind === 'CATEGORY')
                  .map((catNode) => (
                    <radialGradient
                      key={`nebula-${catNode.id}`}
                      id={`nebula-${catNode.categoryId}`}
                      cx="50%"
                      cy="50%"
                      r="50%"
                    >
                      <stop offset="0%" stopColor={catNode.color} stopOpacity="0.22" />
                      <stop offset="55%" stopColor={catNode.color} stopOpacity="0.07" />
                      <stop offset="100%" stopColor={catNode.color} stopOpacity="0" />
                    </radialGradient>
                  ))}

                {/* 3D Specular Highlight Gradient for Memory Spheres (Point 3 from Snip) */}
                {graph.nodes
                  .filter((n) => n.kind !== 'CENTER')
                  .map((node) => (
                    <radialGradient
                      key={`sphere-${node.id}`}
                      id={`sphere-${node.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`}
                      cx="35%"
                      cy="30%"
                      r="65%"
                    >
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
                      <stop offset="35%" stopColor={node.color} stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#090d16" stopOpacity="0.95" />
                    </radialGradient>
                  ))}
              </defs>

              <g
                transform={`translate(${pan.x}, ${pan.y}) translate(500, 500) scale(${zoom}) translate(-500, -500)`}
              >
                {/* Subtle deterministic background starfield */}
                {Array.from({ length: 42 }).map((_, i) => {
                  const sx = ((i * 197) % 940) + 30;
                  const sy = ((i * 313) % 940) + 30;
                  const sr = (i % 2) + 0.8;
                  return (
                    <circle
                      key={`star-${i}`}
                      cx={sx}
                      cy={sy}
                      r={sr}
                      fill="#cbd5e1"
                      fillOpacity={0.18}
                    />
                  );
                })}

                {/* 1. ATMOSPHERIC NEBULA CLOUDS BEHIND ACTIVE CATEGORY CLUSTERS */}
                {graph.nodes
                  .filter((n) => n.kind === 'CATEGORY')
                  .map((catNode) => {
                    const isCatMatched =
                      !filterResult.hasActiveFilter ||
                      filterResult.matchedCategoryIds.has(catNode.categoryId || '');
                    return (
                      <circle
                        key={`cloud-${catNode.id}`}
                        cx={catNode.x}
                        cy={catNode.y}
                        r={125}
                        fill={`url(#nebula-${catNode.categoryId})`}
                        opacity={isCatMatched ? 1 : 0.18}
                      />
                    );
                  })}

                {/* 2. CONSTELLATION EDGES (Solid = Verified 1st-Person; Dashed = Attributed; Dotted = Category Hub) */}
                {graph.edges.map((edge) => {
                  const source = nodesById.get(edge.sourceId);
                  const target = nodesById.get(edge.targetId);
                  if (!source || !target) return null;

                  const isSelectedEdge =
                    (target.memoryId && target.memoryId === activeSelectedMemoryId) ||
                    (source.categoryId && source.categoryId === selectedCategoryId);

                  const isMatched =
                    !filterResult.hasActiveFilter ||
                    (target.kind === 'MEMORY' &&
                      target.memoryId &&
                      filterResult.matchedMemoryIds.has(target.memoryId)) ||
                    (target.kind === 'CATEGORY' &&
                      target.categoryId &&
                      filterResult.matchedCategoryIds.has(target.categoryId));

                  return (
                    <line
                      key={edge.id}
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isSelectedEdge ? target.color : '#94a3b8'}
                      strokeOpacity={isSelectedEdge ? 0.85 : isMatched ? 0.28 : 0.07}
                      strokeWidth={isSelectedEdge ? 2.2 : 1.1}
                      strokeDasharray={
                        edge.edgeStyle === 'DASHED_ATTRIBUTED'
                          ? '5,4'
                          : edge.edgeStyle === 'DOTTED_CATEGORY'
                            ? '2,5'
                            : undefined
                      }
                    />
                  );
                })}

                {/* 3. CONSTELLATION NODES (CENTER, CATEGORY HUBS, SATELLITE MEMORY SPHERES) */}
                {graph.nodes.map((node) => {
                  const safeGradId = `sphere-${node.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

                  if (node.kind === 'CENTER') {
                    return (
                      <g
                        key={node.id}
                        data-node-interactive="true"
                        role="button"
                        tabIndex={0}
                        aria-label={node.ariaLabel}
                        onClick={() => handleResetView()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleResetView();
                          }
                        }}
                        className="cursor-pointer focus:outline-none"
                      >
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.radius + 14}
                          fill="#f8fafc"
                          fillOpacity={0.06}
                        />
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.radius}
                          fill="#0f172a"
                          stroke="#e2e8f0"
                          strokeWidth={2}
                        />
                        <text
                          x={node.x}
                          y={node.y + 5}
                          textAnchor="middle"
                          fill="#f8fafc"
                          fontSize="16"
                          fontFamily="Newsreader, Georgia, serif"
                          fontWeight="600"
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  }

                  if (node.kind === 'CATEGORY') {
                    const isCatSelected = selectedCategoryId === node.categoryId;
                    const isCatMatched =
                      !filterResult.hasActiveFilter ||
                      filterResult.matchedCategoryIds.has(node.categoryId || '');

                    return (
                      <g
                        key={node.id}
                        ref={(el) => {
                          if (el) nodeElementMapRef.current.set(node.id, el);
                        }}
                        data-node-interactive="true"
                        role="button"
                        tabIndex={0}
                        aria-label={node.ariaLabel}
                        onClick={() =>
                          node.categoryId && handleSelectCategoryNode(node.categoryId, node.id)
                        }
                        onKeyDown={(e) => {
                          if ((e.key === 'Enter' || e.key === ' ') && node.categoryId) {
                            e.preventDefault();
                            handleSelectCategoryNode(node.categoryId, node.id);
                          }
                        }}
                        opacity={isCatMatched ? 1 : 0.2}
                        className="cursor-pointer focus:outline-none"
                      >
                        {/* Outer halo ring matching Snip 3 */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.radius + (isCatSelected ? 9 : 6)}
                          fill="none"
                          stroke={node.color}
                          strokeOpacity={isCatSelected ? 0.9 : 0.45}
                          strokeWidth={isCatSelected ? 2 : 1.2}
                        />
                        {/* 2.5D Shaded Sphere */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.radius}
                          fill={`url(#${safeGradId})`}
                        />
                        {/* Category Title + Count Badge */}
                        <text
                          x={node.x}
                          y={node.y + node.radius + 20}
                          textAnchor="middle"
                          fill="#e2e8f0"
                          fontSize="13"
                          fontFamily="Newsreader, Georgia, serif"
                        >
                          {node.label}{' '}
                          <tspan fill="#94a3b8" fontSize="11" fontFamily="monospace">
                            {node.categoryMemoryCount}
                          </tspan>
                        </text>
                      </g>
                    );
                  }

                  // MEMORY SATELLITE NODE
                  const isMemSelected = activeSelectedMemoryId === node.memoryId;
                  const isPlayingAudio =
                    audioPlaybackState.status === 'PLAYING' &&
                    audioPlaybackState.memoryId === node.memoryId;
                  const isMemMatched =
                    !filterResult.hasActiveFilter ||
                    (node.memoryId ? filterResult.matchedMemoryIds.has(node.memoryId) : false);

                  return (
                    <g
                      key={node.id}
                      ref={(el) => {
                        if (el) nodeElementMapRef.current.set(node.id, el);
                      }}
                      data-node-interactive="true"
                      role="button"
                      tabIndex={0}
                      aria-label={node.ariaLabel}
                      onClick={() =>
                        node.memoryId && handleSelectMemoryNode(node.memoryId, node.id)
                      }
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && node.memoryId) {
                          e.preventDefault();
                          handleSelectMemoryNode(node.memoryId, node.id);
                        }
                      }}
                      opacity={isMemMatched ? 1 : 0.16}
                      className="cursor-pointer focus:outline-none"
                    >
                      {/* Active Audio Segment Playback Pulse Ring */}
                      {isPlayingAudio && !reducedMotion && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.radius + 12}
                          fill="none"
                          stroke="#34d399"
                          strokeWidth={2}
                          strokeOpacity={0.85}
                        />
                      )}

                      {/* Provenance Ring: Solid Emerald = 1st-Person; Dashed Sky = Attributed */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.radius + (isMemSelected ? 6 : 3.5)}
                        fill="none"
                        stroke={
                          isMemSelected
                            ? '#ffffff'
                            : node.provenanceTier === 'VERIFIED_FIRST_PERSON'
                              ? '#10b981'
                              : '#38bdf8'
                        }
                        strokeWidth={isMemSelected ? 2.2 : 1.4}
                        strokeDasharray={
                          node.provenanceTier === 'ATTRIBUTED_RECOLLECTION' ? '3,2' : undefined
                        }
                        strokeOpacity={isMemSelected ? 1 : 0.8}
                      />

                      {/* 2.5D Shaded Memory Orb */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.radius}
                        fill={`url(#${safeGradId})`}
                      />

                      {/* Selected or hovered label */}
                      {(isMemSelected || zoom >= 1.35) && (
                        <text
                          x={node.x}
                          y={node.y - node.radius - 10}
                          textAnchor="middle"
                          fill="#f8fafc"
                          fontSize="11"
                          fontWeight="600"
                        >
                          {node.label.length > 28 ? `${node.label.slice(0, 26)}…` : node.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* ON-CANVAS PROVENANCE LEGEND (Bottom-Left) */}
            <div className="absolute bottom-5 left-5 hidden sm:flex items-center gap-4 px-3.5 py-2 rounded-xl bg-slate-950/85 border border-white/10 backdrop-blur-md text-[11px] text-slate-300 pointer-events-none">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-400 bg-emerald-500/30" />
                <span>Verified 1st-Person</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-sky-400 bg-sky-500/30" />
                <span>Attributed Recollection</span>
              </span>
              <span className="text-slate-400">Click any orb to inspect evidence</span>
            </div>

            {/* FUNCTIONAL ZOOM & RESET CONTROLS (Bottom-Right) */}
            <div className="absolute bottom-5 right-5 flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-slate-300 z-20">
              <button
                type="button"
                onClick={handleZoomIn}
                aria-label="Zoom in constellation"
                className="p-2.5 hover:bg-slate-800 hover:text-white border-b border-slate-800 text-xs transition"
                title="Zoom in"
              >
                <Plus />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                aria-label="Zoom out constellation"
                className="p-2.5 hover:bg-slate-800 hover:text-white border-b border-slate-800 text-xs transition"
                title="Zoom out"
              >
                <Minus />
              </button>
              <button
                type="button"
                onClick={handleResetView}
                aria-label="Reset constellation view"
                className="p-2.5 hover:bg-slate-800 hover:text-white text-xs transition"
                title="Reset view"
              >
                <Target />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* INTEGRATED EVIDENCE & CONVERSATION RIGHT DRAWER (Point 4 from Snip) */}
      <EvidenceDrawer
        drawerState={drawerState}
        graph={graph}
        representedPersonName={representedPersonName}
        reflectionState={reflectionState}
        audioPlaybackState={audioPlaybackState}
        micCapability={micCapability}
        videoCapability={videoCapability}
        isRecordingMic={isRecordingMic}
        onClose={handleCloseDrawer}
        onSelectMemory={(memId) => handleSelectMemoryNode(memId)}
        onPlayAudioAnchor={handlePlayAudioAnchor}
        onPauseAudioAnchor={handlePauseAudioAnchor}
        onStartConversation={handleStartConversation}
        onToggleMicRecording={handleToggleMicRecording}
        onSwitchToAvatarSession={onSwitchToAvatarSession}
        onDeleteMemory={onDeleteMemory}
      />
    </div>
  );
}
