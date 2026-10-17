'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Translate,
  SpeakerHigh,
  Play,
  ArrowsClockwise,
  CheckCircle,
  WarningCircle,
  Copy,
  VideoCamera,
  Sparkle,
  X,
} from '@phosphor-icons/react';
import {
  INDIC_LANGUAGES,
  INDIC_QUICK_PROMPTS,
  IndicLanguageConfig,
  HonorificRegister,
} from '@/config/indicLanguages';

export default function IndicLanguagePage() {
  const [selectedLang, setSelectedLang] = useState<IndicLanguageConfig>(INDIC_LANGUAGES[0]);
  const [honorificRegister, setHonorificRegister] = useState<HonorificRegister>('respectful');
  const [companionName, setCompanionName] = useState<string>('Prof. Anand Sharma');
  const [inputText, setInputText] = useState<string>(INDIC_QUICK_PROMPTS[0].text);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [translationMode, setTranslationMode] = useState<'LIVE_GEMINI' | 'SYNTHETIC_FALLBACK' | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const boundRaw = localStorage.getItem('paramsathya_bound_companion');
      if (boundRaw) {
        const parsed = JSON.parse(boundRaw);
        if (parsed?.personName) {
          setCompanionName(parsed.personName);
        }
      }
    } catch {
      // Keep default companion name
    }
  }, []);

  const handleTranslate = async (overrideLang?: IndicLanguageConfig, overrideRegister?: HonorificRegister, overrideText?: string) => {
    const langToUse = overrideLang || selectedLang;
    const registerToUse = overrideRegister || honorificRegister;
    const textToUse = overrideText !== undefined ? overrideText : inputText;

    if (!textToUse.trim()) return;
    setIsTranslating(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/indic/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToUse,
          targetLanguage: langToUse.code,
          sourceLanguage: 'en',
          honorificRegister: registerToUse,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Translation failed');
      }

      setTranslatedText(data.translatedText || '');
      setTranslationMode(data.mode || 'LIVE_GEMINI');
      const modeBadge =
        data.mode === 'SYNTHETIC_FALLBACK'
          ? ' • Synthetic Cultural Register (Quota-Safe)'
          : ' • Gemini Live';
      setStatusMessage(
        `Translated into ${langToUse.name} (${langToUse.nativeName}) [${
          registerToUse === 'respectful'
            ? langToUse.honorifics.respectfulLabel
            : langToUse.honorifics.familiarLabel
        }]${modeBadge}`
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred during translation');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = async (textToSpeak?: string) => {
    const text =
      textToSpeak ||
      translatedText ||
      selectedLang.syntheticSamples['1'][honorificRegister] ||
      selectedLang.samplePrompt;
    if (!text) return;

    setIsSpeaking(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/indic/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: selectedLang.code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'TTS generation failed');
      }

      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
        const audio = new Audio(data.audioUrl);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          fallbackBrowserSpeech(text, selectedLang.speechSynthesisTag);
        };
        await audio.play();
        setStatusMessage(`Playing audio via ${selectedLang.name} voice`);
      } else {
        fallbackBrowserSpeech(text, selectedLang.speechSynthesisTag);
        setStatusMessage(`Spoken via browser speech engine (${selectedLang.speechSynthesisTag})`);
      }
    } catch {
      fallbackBrowserSpeech(text, selectedLang.speechSynthesisTag);
      setStatusMessage(`Browser speech fallback active (${selectedLang.speechSynthesisTag})`);
    }
  };

  const fallbackBrowserSpeech = (text: string, langTag: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setErrorMessage('Speech synthesis is not supported on this device/browser.');
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langTag;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang.startsWith(langTag.split('-')[0]));
    if (match) utterance.voice = match;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-4 md:p-8 flex flex-col items-center font-sans relative z-10">
      {/* STUDIO CONTAINER MATCHING SCREENSHOT DESIGN */}
      <div className="w-full max-w-6xl bg-[#0e1015] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* TOP HEADER BAR */}
        <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-white/10 bg-[#12141b]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-950/60 border border-amber-600/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Translate className="text-xl" weight="bold" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  Indic Language &amp; Dialect Studio
                </h1>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-amber-950/70 border border-amber-600/40 text-amber-400">
                  gemini-2.5-flash + synthetic-register
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-600/40 text-emerald-300">
                  {INDIC_LANGUAGES.length} Dialects &amp; Languages
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Translating for <span className="text-slate-200 font-medium">{companionName}</span> with authentic{' '}
                <span className="text-amber-300 font-medium">{selectedLang.name}</span> honorifics and Indic vernacular registers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/playground/sync"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-600/40 text-emerald-300 text-xs font-medium transition"
            >
              <VideoCamera className="text-sm text-emerald-400" />
              <span>Sync 2 Pro Studio</span>
            </Link>
            <Link
              href="/experience/presence"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition"
              title="Return to Presence Companion"
            >
              <ArrowLeft className="text-sm" />
              <span>Back to Presence</span>
            </Link>
            <Link
              href="/experience/presence"
              aria-label="Close Indic Language Studio"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <X className="text-base" />
            </Link>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* SELECT TARGET INDIC LANGUAGE / DIALECT GRID */}
          <div>
            <label className="text-[11px] text-slate-400 uppercase tracking-widest mb-3 block font-bold">
              SELECT TARGET INDIC LANGUAGE / DIALECT
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {INDIC_LANGUAGES.map((lang) => {
                const isSelected = selectedLang.code === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setSelectedLang(lang);
                      setTranslatedText('');
                    }}
                    className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-950/25 border-amber-500/80 shadow-lg shadow-amber-500/10'
                        : 'bg-[#13161f]/90 border-white/10 hover:border-white/25 hover:bg-[#171b26]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span
                        className={`text-sm font-bold ${
                          isSelected ? 'text-white' : 'text-slate-200'
                        }`}
                      >
                        {lang.name}
                      </span>
                      <span className="text-sm font-semibold text-amber-400">
                        {lang.nativeName}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1.5 block">
                      {lang.region}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* HONORIFIC REGISTER BAR */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 rounded-xl bg-[#13161f] border border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <Sparkle className="text-amber-400 text-base" weight="fill" />
              <span className="font-medium">{selectedLang.name} Honorific Register:</span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                ({selectedLang.region} • {selectedLang.script} script)
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#0b0d13] p-1 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setHonorificRegister('respectful');
                  if (translatedText) {
                    handleTranslate(selectedLang, 'respectful', inputText);
                  }
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  honorificRegister === 'respectful'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-600/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {selectedLang.honorifics.respectfulLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setHonorificRegister('familiar');
                  if (translatedText) {
                    handleTranslate(selectedLang, 'familiar', inputText);
                  }
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  honorificRegister === 'familiar'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-600/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {selectedLang.honorifics.familiarLabel}
              </button>
            </div>
          </div>

          {/* ENGLISH QUERY OR MEMORY PROMPT */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-[11px] text-slate-300 uppercase tracking-widest font-bold">
                ENGLISH QUERY OR MEMORY PROMPT
              </label>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Quick Prompts:</span>
                {INDIC_QUICK_PROMPTS.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setInputText(q.text);
                      handleTranslate(selectedLang, honorificRegister, q.text);
                    }}
                    className={`px-2 py-0.5 rounded font-mono text-xs underline underline-offset-4 transition ${
                      inputText === q.text
                        ? 'text-amber-400 font-bold'
                        : 'text-slate-400 hover:text-amber-300'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={4}
              placeholder="Grandfather, do you remember our morning walks near the river?"
              className="w-full bg-[#12151e] border border-white/10 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/70 resize-y font-sans"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-slate-500 font-mono">
                {inputText.length} / 1500 chars • BCP-47 Voice Tag: {selectedLang.speechSynthesisTag}
              </span>
              <button
                type="button"
                onClick={() => handleTranslate()}
                disabled={isTranslating || !inputText.trim()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs md:text-sm flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
              >
                {isTranslating ? (
                  <>
                    <ArrowsClockwise className="text-base animate-spin" />
                    <span>Translating to {selectedLang.name}...</span>
                  </>
                ) : (
                  <>
                    <Sparkle className="text-base" weight="fill" />
                    <span>Translate to {selectedLang.name}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* TRANSLATED OUTPUT & VOICE SYNTHESIS SECTION */}
          <div className="bg-[#12151e] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SpeakerHigh className="text-amber-400 text-lg" />
                <h2 className="text-sm font-bold text-white">
                  {selectedLang.name} ({selectedLang.nativeName}) Vernacular Output &amp; Speech Synthesis
                </h2>
                {translationMode === 'SYNTHETIC_FALLBACK' && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700/50 text-amber-300">
                    Synthetic Cultural Register (Quota-Safe)
                  </span>
                )}
                {translationMode === 'LIVE_GEMINI' && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/50 text-emerald-300">
                    Live Gemini Translation
                  </span>
                )}
              </div>

              {translatedText && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(translatedText);
                    setStatusMessage('Copied translation to clipboard!');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-white/10"
                >
                  <Copy className="text-xs" />
                  <span>Copy</span>
                </button>
              )}
            </div>

            <div className="min-h-[96px] bg-[#0b0d13] border border-white/10 rounded-xl p-4 flex flex-col justify-center">
              {translatedText ? (
                <p className="text-base md:text-lg text-amber-100 leading-relaxed font-medium">
                  {translatedText}
                </p>
              ) : (
                <div className="text-xs text-slate-400 space-y-1">
                  <p className="text-slate-300 font-medium">
                    Sample ({selectedLang.honorifics[honorificRegister === 'respectful' ? 'respectfulLabel' : 'familiarLabel']}):
                  </p>
                  <p className="text-sm text-amber-200/90">
                    {selectedLang.syntheticSamples['1'][honorificRegister]}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                {statusMessage && (
                  <span className="inline-flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle className="text-sm text-emerald-400" />
                    {statusMessage}
                  </span>
                )}
                {errorMessage && (
                  <span className="inline-flex items-center gap-1.5 text-rose-300">
                    <WarningCircle className="text-sm text-rose-400" />
                    {errorMessage}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    handleSpeak(
                      translatedText || selectedLang.syntheticSamples['1'][honorificRegister]
                    )
                  }
                  disabled={isSpeaking}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-200 text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Play className="text-sm" weight="fill" />
                  <span>
                    {isSpeaking
                      ? `Speaking ${selectedLang.name}...`
                      : `Speak in ${selectedLang.name} (${selectedLang.nativeName})`}
                  </span>
                </button>
              </div>
            </div>

            {audioUrl && (
              <div className="pt-2">
                <audio controls src={audioUrl} className="w-full h-8" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
