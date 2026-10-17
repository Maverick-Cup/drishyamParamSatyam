'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  UploadSimple,
  Microphone,
  Play,
  CheckCircle,
  WarningCircle,
  FileText,
  SlidersHorizontal,
  Sparkle,
  FilmStrip,
  ArrowsClockwise,
  Translate
} from '@phosphor-icons/react';

export default function MuseTalkPlaygroundPage() {
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [facePreview, setFacePreview] = useState<string>(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCPrQZI86P-lCAqlJIQq834CG5Uw4YDsSat59s4pB003oUoGeCWd0n4JR4hbsKz_hgBzz9iol0TwRbldMKGbCQWct5gEjxoYMEdqxzEzJZ6egWSNiQf6KMJaE9Scd4tcg2OXEtKD1_Y3wXWcMWhbITSjrzx_GxKsfoG-s4ognBOH8hS6BtRwF1fHh1etk5Hw3DJaphLSdD15XMvtECGDQVG_qEsFfQC6v6hXv8I5Sg'
  );
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewName, setAudioPreviewName] = useState<string>('sample_voice_snippet.wav');
  const [textFallback, setTextFallback] = useState<string>(
    'I remember sitting on the porch watching the rain with you. Those quiet afternoons meant everything.'
  );
  const [bboxShift, setBboxShift] = useState<number>(0);
  const [status, setStatus] = useState<string>('IDLE');
  const [logs, setLogs] = useState<string[]>([
    'MuseTalk 1.5 Local Synthetic Playground ready.',
    'Awaiting Face Image and Voice/Audio input...',
  ]);
  const [outputVideoUrl, setOutputVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFaceImage(file);
      setFacePreview(URL.createObjectURL(file));
      setLogs((prev) => [...prev, `[Upload] Loaded face image: ${file.name}`]);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      setAudioPreviewName(file.name);
      setLogs((prev) => [...prev, `[Upload] Loaded audio file: ${file.name} (${Math.round(file.size / 1024)} KB)`]);
    }
  };

  const handleRunPreflight = async () => {
    setIsProcessing(true);
    setStatus('CHECKING_PREFLIGHT');
    setLogs((prev) => [...prev, '>>> Running Preflight Diagnostics...']);

    try {
      const formData = new FormData();
      formData.append('action', 'preflight');
      if (faceImage) formData.append('faceImage', faceImage);
      if (audioFile) formData.append('audioFile', audioFile);
      formData.append('textFallback', textFallback);
      formData.append('bboxShift', bboxShift.toString());

      const res = await fetch('/api/musetalk', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.logs) {
        setLogs((prev) => [...prev, ...data.logs]);
      }
      setStatus(data.status);
    } catch (err: any) {
      setLogs((prev) => [...prev, `Error: ${err.message}`]);
      setStatus('ERROR');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateLipSync = async () => {
    setIsProcessing(true);
    setStatus('GENERATING');
    setLogs((prev) => [...prev, '>>> Initiating MuseTalk 1.5 Video Synthesis...']);

    try {
      const formData = new FormData();
      formData.append('action', 'render');
      if (faceImage) formData.append('faceImage', faceImage);
      if (audioFile) formData.append('audioFile', audioFile);
      formData.append('textFallback', textFallback);
      formData.append('bboxShift', bboxShift.toString());

      let attempts = 0;
      const MAX_RETRIES = 3;
      let success = false;

      while (attempts < MAX_RETRIES && !success) {
        attempts++;
        try {
          if (attempts > 1) {
            setLogs((prev) => [...prev, `[Network Retry] Reconnecting to model (attempt ${attempts}/${MAX_RETRIES})...`]);
          }

          const res = await fetch('/api/musetalk', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            throw new Error(`Inference returned status ${res.status}`);
          }

          const data = await res.json();
          if (data.logs) {
            setLogs((prev) => [...prev, ...data.logs]);
          }
          if (data.outputVideoUrl) {
            setOutputVideoUrl(data.outputVideoUrl);
            setLogs((prev) => [
              ...prev,
              `✓ Video output ready! Render latency: ${data.inferenceTimeMs}ms at ${data.fps} FPS.`,
            ]);
          }
          setStatus(data.status);
          success = true;
        } catch (attemptErr: any) {
          if (attempts >= MAX_RETRIES) {
            throw attemptErr;
          }
          const backoffDelay = 800 * attempts;
          setLogs((prev) => [...prev, `Network drop detected (${attemptErr.message}). Retrying in ${backoffDelay}ms...`]);
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        }
      }
    } catch (err: any) {
      setLogs((prev) => [...prev, `Render Error (connection exhausted): ${err.message}`]);
      setStatus('FAILED');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200 p-6 flex flex-col font-sans">
      {/* HEADER */}
      <header className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/experience/presence"
            className="text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5 text-xs bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800"
          >
            <ArrowLeft className="text-sm" />
            <span>Back to Presence</span>
          </Link>
          <div className="h-4 w-px bg-slate-800"></div>
          <div>
            <h1 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              MuseTalk Playground
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-purple-950/70 border border-purple-700/50 text-purple-300">
                1.5 Synthetic Localhost
              </span>
              <Link
                href="/playground/indic"
                className="ml-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 hover:bg-amber-900/80 border border-amber-600/50 text-amber-300 text-xs font-sans font-medium transition shadow-sm"
                title="Toggle to Indic Language Support & Neural TTS"
              >
                <Translate className="text-sm text-amber-400" />
                <span>Indic Language Support</span>
              </Link>
            </h1>
            <p className="text-xs text-slate-400">
              Interactive test bench for MuseTalk 1.5 face alignment, audio chunking, and lip-sync rendering.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Status</span>
            <span
              className={`text-xs font-mono font-semibold ${
                status === 'COMPLETED'
                  ? 'text-emerald-400'
                  : status === 'GENERATING' || status === 'CHECKING_PREFLIGHT'
                  ? 'text-amber-400 animate-pulse'
                  : 'text-cyan-400'
              }`}
            >
              {status}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN TWO-COLUMN PLAYGROUND GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* LEFT COLUMN: INPUTS & CONTROLS */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* FACE IMAGE INPUT */}
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkle className="text-cyan-400 text-sm" />
                Face Image (Target Portrait)
              </label>
              <span className="text-[11px] text-slate-500">256x256 crop region</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-cyan-500/30 bg-black/40 shrink-0 relative group">
                <img src={facePreview} alt="Target face" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <span className="text-[10px] text-white">Preview</span>
                </div>
              </div>

              <div className="flex-1">
                <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition bg-slate-950/40">
                  <UploadSimple className="text-xl text-slate-400 mb-1" />
                  <span className="text-xs text-slate-300 font-medium">Click to upload face image</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">JPEG, PNG, or WEBP</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* AUDIO INPUT */}
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Microphone className="text-purple-400 text-sm" />
                Audio File (Speech Track)
              </label>
              <span className="text-[11px] text-slate-500">Target &lt; 15 seconds</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex-1 border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition bg-slate-950/40">
                <UploadSimple className="text-xl text-slate-400 mb-1" />
                <span className="text-xs text-slate-300 font-medium truncate max-w-xs">{audioPreviewName}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">WAV or MP3 (speech sample)</span>
                <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
              </label>
            </div>

            {/* TEXT FALLBACK SYNTHESIS PROMPT */}
            <div className="mt-1">
              <label className="text-[11px] text-slate-400 block mb-1">Or Synthesize from Grounded Text Prompt:</label>
              <textarea
                value={textFallback}
                onChange={(e) => setTextFallback(e.target.value)}
                rows={2}
                className="w-full text-xs bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-purple-500/50"
                placeholder="Type a short sentence for synthetic speech test..."
              />
            </div>
          </div>

          {/* TUNING PARAMETERS (BBOX SHIFT) */}
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <SlidersHorizontal className="text-amber-400 text-sm" />
                Bounding Box Upper Boundary Shift
              </label>
              <span className="text-xs font-mono text-amber-300">{bboxShift} px</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Shift the upper boundary of the mouth crop box upward (negative) or downward (positive) for optimal facial alignment.
            </p>
            <input
              type="range"
              min="-15"
              max="15"
              value={bboxShift}
              onChange={(e) => setBboxShift(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={handleRunPreflight}
              disabled={isProcessing}
              className="flex-1 py-2.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ArrowsClockwise className={`text-sm ${isProcessing ? 'animate-spin' : ''}`} />
              Run Preflight Check
            </button>

            <button
              onClick={handleGenerateLipSync}
              disabled={isProcessing}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-xs font-semibold text-white shadow-lg shadow-purple-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="text-sm fill-current" />
              Generate Lip-Sync Video
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: OUTPUT VIDEO & EXECUTION LOGS */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* VIDEO OUTPUT CARD */}
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <FilmStrip className="text-cyan-400 text-sm" />
                Output Video Result
              </label>
              {outputVideoUrl && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="text-sm" /> Muxed MP4 Ready
                </span>
              )}
            </div>

            <div className="w-full aspect-video bg-black/60 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden relative">
              {outputVideoUrl ? (
                <video src={outputVideoUrl} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                <div className="text-center p-6 text-slate-500 flex flex-col items-center">
                  <FilmStrip className="text-4xl text-slate-700 mb-2" />
                  <p className="text-xs">No video generated yet.</p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    Upload your face image & speech audio, then click Generate.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* REAL-TIME EXECUTION LOGS */}
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <FileText className="text-slate-400 text-sm" />
                Pipeline Execution Logs
              </label>
              <span className="text-[10px] font-mono text-slate-500">{logs.length} events logged</span>
            </div>

            <div className="bg-black/70 rounded-lg p-3 text-[11px] font-mono text-slate-300 flex-1 overflow-y-auto max-h-[320px] flex flex-col gap-1 border border-slate-800/80">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    log.includes('✓')
                      ? 'text-emerald-400'
                      : log.includes('⚠')
                      ? 'text-amber-400'
                      : log.includes('Error') || log.includes('FAILED')
                      ? 'text-rose-400'
                      : log.includes('>>>')
                      ? 'text-cyan-300 font-semibold'
                      : 'text-slate-400'
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
