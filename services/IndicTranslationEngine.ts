/**
 * IndicSocioLinguisticEngine
 * Ported from python_research/translate_indic.py and live_bhojpuri_agent.py.
 * Provides OOP socio-linguistic translation models, honorific register rules,
 * phonetic transliteration, and cultural nuances across Indic dialects.
 */

import {
  INDIC_LANGUAGES,
  IndicLanguageConfig,
  HonorificRegister,
  resolveContextualIndicTranslation,
  resolveSyntheticIndicTranslation,
} from '@/config/indicLanguages';

export interface IndicTranslationOutput {
  sourceEnglish: string;
  targetLanguage: string;
  targetLanguageCode: string;
  nativeScript: string;
  transliteration: string;
  formalityRegister: string;
  culturalNuances: string;
  pronunciationGuide: string;
  speechSynthesisTag: string;
  mode: 'LIVE_GEMINI' | 'SYNTHETIC_CULTURAL_REGISTER';
}

export class IndicSocioLinguisticEngine {
  private static instance: IndicSocioLinguisticEngine;

  private constructor() {}

  public static getInstance(): IndicSocioLinguisticEngine {
    if (!IndicSocioLinguisticEngine.instance) {
      IndicSocioLinguisticEngine.instance = new IndicSocioLinguisticEngine();
    }
    return IndicSocioLinguisticEngine.instance;
  }

  /**
   * Generates phonetic Latin transliteration from Devanagari/native script
   * to ensure family members who cannot read scripts can pronounce phrases accurately.
   */
  public generateTransliteration(text: string, langCode: string): string {
    const lang = INDIC_LANGUAGES.find((l) => l.code === langCode) || INDIC_LANGUAGES[0];
    const contextual = resolveContextualIndicTranslation(text, lang, 'respectful');
    return contextual.transliteration;
  }

  /**
   * Translates an English query or companion response into an authentic Indic regional dialect.
   * If invoked on the browser (client), routes via /api/indic/translate to preserve API keys.
   */
  public async translate(
    text: string,
    targetLanguageCode: string = 'bho',
    register: HonorificRegister = 'respectful',
    personaName: string = 'Prof. Anand Sharma'
  ): Promise<IndicTranslationOutput> {
    const lang =
      INDIC_LANGUAGES.find((l) => l.code === targetLanguageCode) || INDIC_LANGUAGES[0];

    // BROWSER EXECUTION PATH: Delegate to /api/indic/translate route
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/indic/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            targetLanguage: targetLanguageCode,
            honorificRegister: register,
            personName: personaName,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.translatedText) {
            return {
              sourceEnglish: text,
              targetLanguage: data.targetLanguageName || lang.name,
              targetLanguageCode: data.targetLanguage || lang.code,
              nativeScript: data.translatedText,
              transliteration: data.transliteration || this.generateTransliteration(data.translatedText, lang.code),
              formalityRegister:
                register === 'respectful'
                  ? lang.honorifics.respectfulLabel
                  : lang.honorifics.familiarLabel,
              culturalNuances: `Authentic ${lang.region} kinship register with respectful elder address.`,
              pronunciationGuide: 'Warm conversational inflection suitable for family remembrance.',
              speechSynthesisTag: data.speechSynthesisTag || lang.speechSynthesisTag,
              mode: data.mode === 'LIVE_GEMINI' ? 'LIVE_GEMINI' : 'SYNTHETIC_CULTURAL_REGISTER',
            };
          }
        }
      } catch (err) {
        console.warn('Browser Indic translation route fetch error:', err);
      }
    }

    // SERVER / OFFLINE / RESILIENT FALLBACK PATH
    const contextual = resolveContextualIndicTranslation(text, lang, register, personaName);
    return {
      sourceEnglish: text,
      targetLanguage: lang.name,
      targetLanguageCode: lang.code,
      nativeScript: contextual.nativeScript,
      transliteration: contextual.transliteration,
      formalityRegister:
        register === 'respectful'
          ? lang.honorifics.respectfulLabel
          : lang.honorifics.familiarLabel,
      culturalNuances: `Curated socio-linguistic dictionary for ${lang.region} (${lang.honorifics.respectfulPronoun}).`,
      pronunciationGuide: 'Warm conversational inflection suitable for family remembrance.',
      speechSynthesisTag: lang.speechSynthesisTag,
      mode: 'SYNTHETIC_CULTURAL_REGISTER',
    };
  }
}

export const indicEngine = IndicSocioLinguisticEngine.getInstance();
