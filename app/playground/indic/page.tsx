'use client';

import React, { useState } from 'react';
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
  Microphone,
  SlidersHorizontal,
  Sparkle
} from '@phosphor-icons/react';
import { INDIC_LANGUAGES, IndicLanguageConfig } from '@/config/indicLanguages';

export default function IndicLanguagePage() {
  const [selectedLang, setSelectedLang] = useState<IndicLanguageConfig>(INDIC_LANGUAGES[0]);
  const [inputText, setInputText] = useState<string>(
    "I'm feeling a bit overwhelmed today, but remembering your gentle advice gives me strength."
  );
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/indic/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          targetLanguage: selectedLang.code,
          sourceLanguage: 'en',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Translation failed');
      }

      setTranslatedText(data.translatedText || '');
      setStatusMessage(`Translated into ${selectedLang.name} (${selectedLang.nativeName})`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred during translation');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = async (textToSpeak: string) => {
    const text = textToSpeak || translatedText || selectedLang.samplePrompt;
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
        // Fallback to browser Web Speech API
        fallbackBrowserSpeech(text, selectedLang.speechSynthesisTag);
        setStatusMessage(`Spoken via browser speech engine (${selectedLang.speechSynthesisTag})`);
      }
    } catch (err: any) {
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
    <div className="min-h-screen bg-[#070b12]/85 text-slate-200 p-6 flex flex-col font-sans relative z-10">
      {/* HEADER WITH BACK TO PRESENCE & TOGGLE BACK TO MUSETALK */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
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
              Indic Language Support &amp; Neural TTS
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-700/50 text-amber-300">
                11 Regional Languages
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Live translation and culturally attuned voice synthesis for cross-generational remembrance.
            </p>
          </div>
        </div>

        {/* TOGGLE BUTTON: Takes user to MuseTalk 1.5 playground */}
        <div className="flex items-center gap-3">
          <Link
            href="/playground/musetalk"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-850 border border-purple-500/40 text-purple-300 hover:text-purple-200 text-xs font-medium transition shadow-sm"
          >
            <SlidersHorizontal className="text-sm text-purple-400" />
            <span>Switch to MuseTalk 1.5</span>
          </Link>
        </div>
      </header>

      {/* LANGUAGE SELECTOR PILLS */}
      <div className="mb-6">
        <label className="text-xs text-slate-400 uppercase tracking-wider mb-2.5 block font-semibold">
          Select Target Indic Language:
        </label>
        <div className="flex flex-wrap gap-2">
          {INDIC_LANGUAGES.map((lang) => {
            const isSelected = selectedLang.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLang(lang);
                  setTranslatedText('');
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="font-semibold">{lang.nativeName}</span>
                <span className="text-[11px] opacity-75 font-mono">({lang.name})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TWO-COLUMN TRANSLATE & TTS WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* SOURCE INPUT CARD */}
        <div className="lg:col-span-6 flex flex-col gap-4 bg-slate-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Translate className="text-amber-400 text-base" />
              <h2 className="text-sm font-semibold text-slate-200">Source Reflection / Memory (English)</h2>
            </div>
            <button
              onClick={() => setInputText(selectedLang.samplePrompt)}
              className="text-[11px] text-amber-300/80 hover:text-amber-300 underline underline-offset-2"
            >
              Load Sample Phrase
            </button>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={6}
            placeholder="Type a loving memory, reflection, or question in English..."
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 resize-none font-sans"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500 font-mono">
              {inputText.length} / 1500 chars
            </span>
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !inputText.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
            >
              {isTranslating ? (
                <>
                  <ArrowsClockwise className="text-sm animate-spin" />
                  <span>Translating via Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkle className="text-sm" />
                  <span>Translate to {selectedLang.name}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* TRANSLATED OUTPUT & TTS SYNTHESIS CARD */}
        <div className="lg:col-span-6 flex flex-col gap-4 bg-slate-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SpeakerHigh className="text-cyan-400 text-base" />
              <h2 className="text-sm font-semibold text-slate-200">
                {selectedLang.name} Output &amp; Voice Synthesis
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              BCP-47: {selectedLang.speechSynthesisTag}
            </span>
          </div>

          <textarea
            value={translatedText || selectedLang.samplePrompt}
            onChange={(e) => setTranslatedText(e.target.value)}
            rows={6}
            placeholder={`Translation in ${selectedLang.name} will appear here...`}
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 resize-none font-sans"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => {
                if (translatedText) navigator.clipboard.writeText(translatedText);
              }}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
            >
              <Copy className="text-sm" />
              <span>Copy Text</span>
            </button>

            <button
              onClick={() => handleSpeak(translatedText || selectedLang.samplePrompt)}
              disabled={isSpeaking}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-semibold text-xs flex items-center gap-2 transition disabled:opacity-50 shadow-md shadow-cyan-500/20"
            >
              {isSpeaking ? (
                <>
                  <SpeakerHigh className="text-sm animate-pulse text-slate-950" />
                  <span>Synthesizing Voice...</span>
                </>
              ) : (
                <>
                  <Play className="text-sm" />
                  <span>Speak in {selectedLang.name}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* FEEDBACK STATUS BANNER */}
      {(statusMessage || errorMessage) && (
        <div className="mt-6">
          {statusMessage && (
            <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 p-3 rounded-xl">
              <CheckCircle className="text-sm text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/50 p-3 rounded-xl mt-2">
              <WarningCircle className="text-sm text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
