'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  VideoCamera,
  Microphone,
  Play,
  ArrowsClockwise,
  SlidersHorizontal,
  Translate,
  LockKey,
  LockKeyOpen,
  Sparkle,
  Database,
  FilmStrip,
  UploadSimple,
  UserCirclePlus,
  Image as ImageIcon
} from '@phosphor-icons/react';

interface SyncConfigState {
  baseUrl: string;
  hasApiKey: boolean;
  voiceId: string;
  hasBaseVideoAssetId: boolean;
  baseVideoAssetId: string | null;
  ttsEnabled: boolean;
  demoGenerationEnabled: boolean;
  hasCommitToken: boolean;
  model: string;
  ttsProvider: string;
  ttsStability: number;
  ttsSimilarityBoost: number;
  maxScriptChars: number;
  maxAudioSeconds: number;
}

interface VerifiedAssetInfo {
  id: string;
  name: string;
  type: string;
  format: string;
  size: number;
  durationSeconds: number | null;
  visibility: string;
  createdAt: string;
}

export default function SyncLipSyncProPage() {
  const router = useRouter();
  const [config, setConfig] = useState<SyncConfigState | null>(null);
  const [verifiedAsset, setVerifiedAsset] = useState<VerifiedAssetInfo | null>(null);
  const [isVerifyingAsset, setIsVerifyingAsset] = useState<boolean>(false);

  // Person Binding & Custom Upload State
  const [personName, setPersonName] = useState<string>('Rajesh Bade Papa');
  const [personRelation, setPersonRelation] = useState<string>('Beloved Elder • Warm Persona');
  const [customPortraitUrl, setCustomPortraitUrl] = useState<string>('/avatar_RajeshBadePapa_clean.jpg');
  const [customPortraitName, setCustomPortraitName] = useState<string>('avatar_RajeshBadePapa_clean.jpg');
  const [customVideoUrl, setCustomVideoUrl] = useState<string>('/sample_reference.mp4');
  const [activeMediaMode, setActiveMediaMode] = useState<'video' | 'image'>('video');
  const [attachSuccessNotice, setAttachSuccessNotice] = useState<string>('');

  // Generation & Safety Gate State
  const [scriptText, setScriptText] = useState<string>(
    'I remember sitting on the porch watching the rain with you. Those quiet afternoons meant everything.'
  );
  const [executionMode, setExecutionMode] = useState<'simulation' | 'cloud'>('simulation');
  const [unlockSafetyGate, setUnlockSafetyGate] = useState<boolean>(true);
  const [commitTokenInput, setCommitTokenInput] = useState<string>('');
  const [status, setStatus] = useState<string>('READY');
  const [logs, setLogs] = useState<string[]>([
    'Sync Lip-Sync 2 Pro Studio (Reusable Base Video Asset Route) initialized.',
    'Zero-Quota mode active: Asset verification, custom image/video uploads, and Demo Asset Renders consume 0 credits.',
  ]);
  const [payloadPreview, setPayloadPreview] = useState<any>(null);
  const [generationId, setGenerationId] = useState<string>('');
  const [outputVideoUrl, setOutputVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    fetchConfigStatus();
    if (typeof window !== 'undefined') {
      const savedCompanion = localStorage.getItem('paramsathya_bound_companion');
      if (savedCompanion) {
        try {
          const parsed = JSON.parse(savedCompanion);
          if (parsed.personName) setPersonName(parsed.personName);
          if (parsed.personRelation) setPersonRelation(parsed.personRelation);
          if (parsed.portraitUrl) setCustomPortraitUrl(parsed.portraitUrl);
          if (parsed.videoUrl) setCustomVideoUrl(parsed.videoUrl);
        } catch {}
      }
    }

    // Cleanup: ensure video audio stops immediately on component unmount / page navigation
    return () => {
      if (videoPreviewRef.current) {
        videoPreviewRef.current.pause();
        videoPreviewRef.current.muted = true;
        videoPreviewRef.current.src = '';
      }
    };
  }, []);

  const fetchConfigStatus = async () => {
    try {
      const res = await fetch('/api/sync?action=status');
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        setLogs((prev) => [
          ...prev,
          `[Config] Loaded contract: model=${data.config.model}, baseAsset=${data.config.baseVideoAssetId || 'UNSET'}`,
        ]);
      }
    } catch (err: any) {
      setLogs((prev) => [...prev, `[Error] Failed loading Sync status: ${err.message}`]);
    }
  };

  const handlePortraitImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCustomPortraitUrl(dataUrl);
      setCustomPortraitName(file.name);
      setActiveMediaMode('image');
      setLogs((prev) => [
        ...prev,
        `✓ [Upload] Custom portrait image loaded: ${file.name} (${Math.round(file.size / 1024)} KB)`,
      ]);
    };
    reader.readAsDataURL(file);
  };

  const handleCustomVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setCustomVideoUrl(objectUrl);
    setOutputVideoUrl(objectUrl);
    setActiveMediaMode('video');
    setLogs((prev) => [
      ...prev,
      `✓ [Upload] Custom video loaded: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
    ]);
  };

  const handleAttachToMainPage = (navigateImmediately: boolean = false) => {
    const videoToAttach = outputVideoUrl || customVideoUrl || '/sample_reference.mp4';
    const resolvedName = personName.trim() || 'Rajesh Bade Papa';
    const existingVoiceId =
      typeof window !== 'undefined'
        ? localStorage.getItem('paramsathya_cloned_voice_id') || 'EXAVITQu4vr4xnSDxMaL'
        : 'EXAVITQu4vr4xnSDxMaL';
    const existingVoiceName =
      typeof window !== 'undefined'
        ? localStorage.getItem('paramsathya_cloned_voice_name') || `${resolvedName} (Attached Voice)`
        : `${resolvedName} (Attached Voice)`;
    const companionPayload = {
      personName: resolvedName,
      personRelation: personRelation.trim() || 'Beloved Elder • Warm Persona',
      portraitUrl: customPortraitUrl || '/avatar_RajeshBadePapa_clean.jpg',
      videoUrl: videoToAttach,
      preferredDisplay: activeMediaMode,
      voiceId: existingVoiceId,
      voiceName: existingVoiceName,
      assetId: config?.baseVideoAssetId || '4cbdd689-1c05-4076-9255-da146ce18f13',
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('paramsathya_bound_companion', JSON.stringify(companionPayload));
      window.dispatchEvent(new CustomEvent('paramsathya-companion-updated', { detail: companionPayload }));
    }

    setAttachSuccessNotice(
      `Attached "${companionPayload.personName}" (${activeMediaMode === 'video' ? 'Living Video' : 'Portrait Image'}) to Main Presence Page!`
    );
    setLogs((prev) => [
      ...prev,
      `✓ Bound "${companionPayload.personName}" with ${activeMediaMode === 'video' ? 'Video (' + videoToAttach + ')' : 'Portrait Image'} to Main Presence Page.`,
    ]);

    if (navigateImmediately) {
      router.push('/experience/presence');
    }
  };

  const handleVerifyBaseAsset = async () => {
    setIsVerifyingAsset(true);
    setStatus('VERIFYING_ASSET');
    setLogs((prev) => [...prev, '>>> Calling GET /v2/assets/{id} to verify reusable base video (0 Quota)...']);

    try {
      const res = await fetch('/api/sync?action=verify-asset');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Asset verification failed');
      }

      setVerifiedAsset(data.asset);
      setStatus('ASSET_VERIFIED');
      setLogs((prev) => [
        ...prev,
        `✓ Base VIDEO Asset verified on Sync Cloud!`,
        `  • Asset ID: ${data.asset.id}`,
        `  • File Name: ${data.asset.name} (${(data.asset.size / (1024 * 1024)).toFixed(2)} MB)`,
        `  • Quota Spent: 0 credits`,
      ]);
    } catch (err: any) {
      setStatus('VERIFY_ERROR');
      setLogs((prev) => [...prev, `✗ Verification Error: ${err.message}`]);
    } finally {
      setIsVerifyingAsset(false);
    }
  };

  const handleRunPreflight = async () => {
    setIsProcessing(true);
    setStatus('PREFLIGHT');
    setLogs((prev) => [...prev, '>>> Running Zero-Quota Payload & Guardrail Preflight...']);

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync-preflight',
          script: scriptText,
        }),
      });

      const data = await res.json();
      if (data.logs) {
        setLogs((prev) => [...prev, ...data.logs]);
      }
      if (data.inputPreview) {
        setPayloadPreview(data.inputPreview);
      }
      setStatus(data.success ? 'PREFLIGHT_PASSED' : 'PREFLIGHT_FAILED');
    } catch (err: any) {
      setLogs((prev) => [...prev, `Preflight Error: ${err.message}`]);
      setStatus('ERROR');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTriggerGeneration = async () => {
    setIsProcessing(true);
    setStatus('GENERATING');
    setLogs((prev) => [
      ...prev,
      `>>> Executing Lip-Sync 2 Pro (${executionMode === 'simulation' ? 'Demo Reusable Asset Render - 0 Quota' : 'Live Sync Cloud API'})...`,
    ]);

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sync-commit-token': commitTokenInput,
        },
        body: JSON.stringify({
          action: 'sync-generate',
          script: scriptText,
          executionMode,
          unlockSafetyGate,
          commitToken: commitTokenInput,
        }),
      });

      const data = await res.json();
      if (data.logs) {
        setLogs((prev) => [...prev, ...data.logs]);
      }

      if (!res.ok || !data.success) {
        setLogs((prev) => [...prev, `🔒 API Response: ${data.error}`]);
        setStatus(data.status || 'BLOCKED');
        return;
      }

      setGenerationId(data.generationId);
      setStatus(data.status || 'COMPLETED');
      if (data.outputUrl) {
        setOutputVideoUrl(data.outputUrl);
        setActiveMediaMode('video');
      }
    } catch (err: any) {
      setLogs((prev) => [...prev, `Submission Error: ${err.message}`]);
      setStatus('ERROR');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePollStatus = async () => {
    if (!generationId) return;
    setIsProcessing(true);
    setLogs((prev) => [...prev, `>>> Polling GET /v2/generate/${generationId}...`]);

    try {
      const res = await fetch(`/api/sync?action=poll&id=${encodeURIComponent(generationId)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Polling failed');
      }

      const gen = data.generation;
      setStatus(gen.status);
      setLogs((prev) => [...prev, `[Poll] ID ${gen.id} -> Status: ${gen.status}`]);
      if (gen.outputUrl) {
        setOutputVideoUrl(gen.outputUrl);
        setActiveMediaMode('video');
        setLogs((prev) => [...prev, `✓ Output video ready: ${gen.outputUrl}`]);
      }
    } catch (err: any) {
      setLogs((prev) => [...prev, `Poll Error: ${err.message}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  const maxChars = config?.maxScriptChars || 180;

  return (
    <div className="min-h-screen bg-[#070b12]/85 text-slate-200 p-6 flex flex-col font-sans relative z-10">
      {/* HEADER WITH PARALLEL SUBSECTION NAVIGATION */}
      <header className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/experience/presence"
            className="text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5 text-xs bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800"
          >
            <ArrowLeft className="text-sm" />
            <span>Back to Presence</span>
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                Sync Lip-Sync 2 Pro Studio
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                Reusable Asset + Custom Upload
              </span>
              <Link
                href="/playground/indic"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 hover:bg-amber-900/80 border border-amber-600/50 text-amber-300 text-xs font-medium transition"
              >
                <Translate className="text-sm text-amber-400" />
                <span>Indic Language</span>
              </Link>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Upload a portrait image or bind the reusable VIDEO asset (<code className="text-cyan-300">input[].assetId</code>) directly to the loved one on the Main Page.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleAttachToMainPage(true)}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg transition"
          >
            <UserCirclePlus className="text-base" />
            <span>Attach to Person &amp; View on Main Page</span>
          </button>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Pipeline Status</span>
            <span
              className={`text-xs font-mono font-semibold ${
                status === 'ASSET_VERIFIED' || status === 'PREFLIGHT_PASSED' || status === 'COMPLETED'
                  ? 'text-emerald-400'
                  : status.includes('ERROR') || status.includes('BLOCKED')
                  ? 'text-amber-400'
                  : 'text-cyan-400'
              }`}
            >
              {status}
            </span>
          </div>
        </div>
      </header>

      {attachSuccessNotice && (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-lg text-emerald-400 shrink-0" />
            <span>{attachSuccessNotice}</span>
          </div>
          <Link
            href="/experience/presence"
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
          >
            Go to Main Presence Page →
          </Link>
        </div>
      )}

      {/* MAIN TWO-COLUMN STUDIO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* LEFT COLUMN: PERSON BINDING, IMAGE/VIDEO UPLOAD, ASSET VERIFICATION & SCRIPT */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* CARD 1: PERSON PROFILE & CUSTOM IMAGE / VIDEO UPLOAD */}
          <div className="bg-slate-900/70 border border-emerald-500/30 rounded-2xl p-5 flex flex-col gap-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkle className="text-emerald-400 text-lg" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  1. Person Identity &amp; Portrait / Video Upload
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                Main Page Companion Binding
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Person Name</label>
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  placeholder="e.g., Rajesh Bade Papa"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Relation / Persona Tagline</label>
                <input
                  type="text"
                  value={personRelation}
                  onChange={(e) => setPersonRelation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  placeholder="e.g., Beloved Elder • Warm Persona"
                />
              </div>
            </div>

            {/* IMAGE UPLOAD & VIDEO UPLOAD CONTROLS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Upload Portrait Image */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-cyan-500/40 shrink-0 bg-black">
                  <img
                    src={customPortraitUrl}
                    alt={personName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition">
                    <ImageIcon className="text-cyan-400 text-sm" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePortraitImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-500 truncate mt-1">{customPortraitName}</p>
                </div>
              </div>

              {/* Upload Custom Video or Use Registered Asset */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col justify-center">
                <div className="flex items-center justify-between gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition">
                    <UploadSimple className="text-purple-400 text-sm" />
                    <span>Upload Video (MP4/MOV)</span>
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime,video/*"
                      onChange={handleCustomVideoUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomVideoUrl('/sample_reference.mp4');
                      setOutputVideoUrl('/sample_reference.mp4');
                      setActiveMediaMode('video');
                    }}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    Reset to Base Asset
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Or use pre-registered Sync Asset (<code className="text-cyan-400">{config?.baseVideoAssetId?.slice(0, 8) || '4cbdd689'}...</code>)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleAttachToMainPage(false)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <CheckCircle className="text-emerald-400 text-sm" />
                <span>Save &amp; Bind to Main Page Companion</span>
              </button>
              <button
                type="button"
                onClick={handleVerifyBaseAsset}
                disabled={isVerifyingAsset}
                className="py-2 px-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Database className="text-cyan-400 text-sm" />
                <span>{isVerifyingAsset ? 'Verifying...' : 'Verify Sync Asset (0 Quota)'}</span>
              </button>
            </div>

            {verifiedAsset && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                  <CheckCircle className="text-emerald-400" />
                  Verified Sync Asset: <code className="font-mono">{verifiedAsset.id.slice(0, 12)}...</code>
                </span>
                <span className="font-mono text-[11px] text-slate-300">
                  {(verifiedAsset.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            )}
          </div>

          {/* CARD 2: SCRIPT & UNBLOCKED GENERATION CONTROLS */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Microphone className="text-purple-400 text-sm" />
                2. Lip-Sync Script &amp; Execution Mode
              </label>
              <span
                className={`text-[11px] font-mono ${
                  scriptText.length > maxChars ? 'text-rose-400 font-bold' : 'text-slate-400'
                }`}
              >
                {scriptText.length} / {maxChars} chars (Max {config?.maxAudioSeconds || 8.5}s)
              </span>
            </div>

            <textarea
              rows={3}
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              maxLength={maxChars}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
              placeholder="Enter short spoken phrase (max 180 chars)..."
            />

            {/* EXECUTION MODE SELECTOR (SOLVES BLOCKED_BY_SAFETY_LOCK) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setExecutionMode('simulation')}
                className={`py-2 px-3 rounded-lg text-xs font-medium flex flex-col items-start gap-0.5 border transition ${
                  executionMode === 'simulation'
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-semibold flex items-center gap-1.5">
                  <Sparkle className="text-emerald-400" />
                  Demo Asset Render (0 Quota)
                </span>
                <span className="text-[10px] text-slate-400">
                  Instant render using bound video asset (Never blocks)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setExecutionMode('cloud')}
                className={`py-2 px-3 rounded-lg text-xs font-medium flex flex-col items-start gap-0.5 border transition ${
                  executionMode === 'cloud'
                    ? 'bg-purple-950/70 border-purple-500/50 text-purple-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-semibold flex items-center gap-1.5">
                  <VideoCamera className="text-purple-400" />
                  Live Sync Cloud API (1 Credit)
                </span>
                <span className="text-[10px] text-slate-400">
                  Calls POST /v2/generate with lipsync-2-pro
                </span>
              </button>
            </div>

            {executionMode === 'cloud' && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs">
                <div className="flex items-center gap-2">
                  {unlockSafetyGate ? (
                    <LockKeyOpen className="text-emerald-400 text-base" />
                  ) : (
                    <LockKey className="text-amber-400 text-base" />
                  )}
                  <span className="text-slate-200">
                    Safety Gate: <strong>{unlockSafetyGate ? 'Unlocked for Live Generation' : 'Locked (Protected)'}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUnlockSafetyGate(!unlockSafetyGate)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    unlockSafetyGate
                      ? 'bg-emerald-800/80 text-emerald-200'
                      : 'bg-amber-800/80 text-amber-200'
                  }`}
                >
                  {unlockSafetyGate ? 'Lock Gate' : 'Unlock Gate'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleRunPreflight}
                disabled={isProcessing}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <CheckCircle className="text-emerald-400 text-sm" />
                <span>1. Run Preflight (0 Quota)</span>
              </button>

              <button
                onClick={handleTriggerGeneration}
                disabled={isProcessing}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-lg disabled:opacity-50"
              >
                <Play weight="fill" className="text-sm" />
                <span>2. Commit Lip-Sync 2 Pro</span>
              </button>
            </div>

            {generationId && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-slate-300 truncate">
                  Job ID: <strong className="text-cyan-300">{generationId}</strong>
                </span>
                <button
                  onClick={handlePollStatus}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs flex items-center gap-1.5 transition"
                >
                  <ArrowsClockwise className="text-sm" />
                  <span>Poll GET /v2/generate/{'{id}'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW (VIDEO OR UPLOADED IMAGE) & TELEMETRY */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* MEDIA MONITOR WITH MODE SWITCHER */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center relative min-h-[320px]">
            <div className="w-full flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FilmStrip className="text-cyan-400 text-sm" />
                  Preview: {personName}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveMediaMode('video')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    activeMediaMode === 'video'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🎥 Video Asset
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaMode('image')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    activeMediaMode === 'image'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🖼️ Portrait Image
                </button>
              </div>
            </div>

            {activeMediaMode === 'video' ? (
              <div className="w-full max-w-md rounded-xl overflow-hidden border border-cyan-500/30 bg-black shadow-2xl">
                <video
                  ref={videoPreviewRef}
                  key={outputVideoUrl || customVideoUrl}
                  src={outputVideoUrl || customVideoUrl}
                  controls
                  loop
                  playsInline
                  className="w-full h-auto max-h-[260px] object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="w-56 h-56 rounded-full overflow-hidden border-2 border-emerald-500/50 bg-black shadow-2xl relative">
                <img
                  src={customPortraitUrl}
                  alt={personName}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            )}

            <div className="mt-4 w-full flex items-center justify-between text-xs text-slate-400 px-2">
              <span>
                Active Asset ID: <code className="text-cyan-300 font-mono">{config?.baseVideoAssetId || '4cbdd689-1c05-4076-9255-da146ce18f13'}</code>
              </span>
              <button
                type="button"
                onClick={() => handleAttachToMainPage(true)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <span>Open in Main Presence Page →</span>
              </button>
            </div>
          </div>

          {/* TELEMETRY & JSON PAYLOAD INSPECTOR */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex-1 flex flex-col font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                Sync API v2 Telemetry &amp; Payload Contract
              </span>
              <button
                onClick={() => setLogs(['Logs cleared.'])}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            </div>

            {payloadPreview && (
              <div className="mb-3 p-2.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-[11px] text-cyan-200 overflow-x-auto">
                <div className="text-[10px] text-slate-400 mb-1">Exact Generation Payload Preview:</div>
                <pre>{JSON.stringify(payloadPreview, null, 2)}</pre>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-1.5 text-xs text-slate-300 max-h-48">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`${
                    log.includes('✓')
                      ? 'text-emerald-400'
                      : log.includes('⚠') || log.includes('🔒') || log.includes('✗')
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
