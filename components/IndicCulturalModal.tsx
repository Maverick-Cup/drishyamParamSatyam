'use client';

import React from 'react';
import {
  X,
  Translate,
  SpeakerHigh,
  Check,
  Sparkle,
  SlidersHorizontal,
  Info,
} from '@phosphor-icons/react';
import {
  INDIC_LANGUAGES,
  IndicLanguageConfig,
  HonorificRegister,
} from '@/config/indicLanguages';
import { INDIC_DIALECT_PROFILES } from '@/services/IndicDiscourseEngine';

export interface UnifiedIndicConfig {
  isEnabled: boolean;
  languageCode: string;
  honorificRegister: HonorificRegister;
  conversationalCadence: boolean;
}

interface IndicCulturalModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: UnifiedIndicConfig;
  onChangeConfig: (newConfig: UnifiedIndicConfig) => void;
  companionName: string;
  onPreviewVoiceSample?: (text: string, langCode: string) => void;
}

export function IndicCulturalModal({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  companionName,
  onPreviewVoiceSample,
}: IndicCulturalModalProps) {
  if (!isOpen) return null;

  const currentLang =
    INDIC_LANGUAGES.find((l) => l.code === config.languageCode) || INDIC_LANGUAGES[0];

  const handleSelectLanguage = (code: string) => {
    onChangeConfig({
      ...config,
      languageCode: code,
      isEnabled: true,
    });
  };

  const handleToggleHonorific = (reg: HonorificRegister) => {
    onChangeConfig({
      ...config,
      honorificRegister: reg,
    });
  };

  const handleToggleCadence = () => {
    onChangeConfig({
      ...config,
      conversationalCadence: !config.conversationalCadence,
    });
  };

  const handleToggleEnabled = () => {
    onChangeConfig({
      ...config,
      isEnabled: !config.isEnabled,
    });
  };

  const handlePlayPreview = () => {
    const sample =
      currentLang.syntheticSamples?.['1']?.[config.honorificRegister] ||
      currentLang.samplePrompt ||
      'नमस्ते';
    if (onPreviewVoiceSample) {
      onPreviewVoiceSample(sample, currentLang.code);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0b101b] border border-amber-500/30 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-amber-950/40 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-purple-950/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Translate className="text-xl" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <span>Indic Cultural &amp; Dialect Studio</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  AI4Bharat IndicVoices
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Grounding {companionName}&apos;s presence in authentic vernacular cadence &amp; kinship respect
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="text-lg" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
          {/* Master Enablement Toggle */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-100">Indic Socio-Linguistic Mode</p>
              <p className="text-xs text-slate-400">
                Dynamically translates companion reflections and voices them in your regional mother tongue.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleEnabled}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition border ${
                config.isEnabled
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {config.isEnabled ? 'Active' : 'Disabled'}
            </button>
          </div>

          {/* Dialect Selector Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2.5 uppercase tracking-wider">
              Select Regional Dialect
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {INDIC_LANGUAGES.slice(0, 9).map((lang) => {
                const isSelected = config.languageCode === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`p-3 rounded-2xl text-left transition border relative flex flex-col justify-between h-20 ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-500/70 shadow-md shadow-amber-950/50'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold text-xs ${isSelected ? 'text-amber-200' : 'text-slate-200'}`}>
                        {lang.name}
                      </span>
                      <span className="text-[11px] font-sans text-amber-400/90 font-medium">
                        {lang.nativeName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="truncate">{lang.region}</span>
                      {isSelected && <Check className="text-amber-400 shrink-0 text-xs ml-1" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Honorific Register Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Kinship Honorific Register
              </label>
              <span className="text-[11px] text-amber-400 font-mono">
                {currentLang.name}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleToggleHonorific('respectful')}
                className={`p-3 rounded-2xl text-left border transition ${
                  config.honorificRegister === 'respectful'
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-100 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-100">
                    {currentLang.honorifics?.respectfulLabel || 'Respectful'}
                  </span>
                  {config.honorificRegister === 'respectful' && <Check className="text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Reverent elder address ({currentLang.honorifics?.respectfulPronoun || 'आप'}). Traditional family dignity.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleToggleHonorific('familiar')}
                className={`p-3 rounded-2xl text-left border transition ${
                  config.honorificRegister === 'familiar'
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-100 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-100">
                    {currentLang.honorifics?.familiarLabel || 'Familiar'}
                  </span>
                  {config.honorificRegister === 'familiar' && <Check className="text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Intimate warmth ({currentLang.honorifics?.familiarPronoun || 'तू / तुम'}). For grandchildren and close circle.
                </p>
              </button>
            </div>
          </div>

          {/* AI4Bharat Spontaneous Cadence Toggle */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Sparkle className="text-amber-400 text-sm" />
                <span className="font-semibold text-xs text-amber-200">
                  IndicVoices Spontaneous Cadence
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Injects natural conversational particles (&ldquo;हाँ बाबू&rdquo;, &ldquo;सूनल जाव&rdquo;) for fluid, lifelike elder speech.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleCadence}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                config.conversationalCadence
                  ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {config.conversationalCadence ? 'Enabled' : 'Formal'}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-slate-950/70">
          <button
            type="button"
            onClick={handlePlayPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs transition"
          >
            <SpeakerHigh className="text-sm" />
            <span>Test Dialect Voice Sample</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs shadow-md shadow-amber-950/40 transition"
          >
            Apply &amp; Continue Conversation
          </button>
        </div>
      </div>
    </div>
  );
}
