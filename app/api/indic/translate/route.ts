import { NextRequest, NextResponse } from 'next/server';
import { AgentGuardrails } from '@/services/AgentGuardrails';
import {
  INDIC_LANGUAGES,
  HonorificRegister,
  resolveContextualIndicTranslation,
} from '@/config/indicLanguages';

/**
 * POST /api/indic/translate
 * Translates text between English and Indic languages/dialects with Honorific Register support.
 * Returns both nativeScript and phonetic Latin transliteration.
 * Includes resilient Contextual Synthetic Vernacular Register fallback when Gemini API
 * hits credit/quota limits (402/429) or offline conditions.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = (body.text || '').trim();
    const targetLanguageCode = (body.targetLanguage || 'bho').trim().toLowerCase();
    const sourceLanguageCode = (body.sourceLanguage || 'en').trim().toLowerCase();
    const personName = (body.personName || 'Elder').trim();
    const honorificRegister: HonorificRegister =
      body.honorificRegister === 'familiar' ? 'familiar' : 'respectful';

    if (!text) {
      return NextResponse.json({ error: 'Text cannot be empty' }, { status: 400 });
    }

    if (text.length > 1500) {
      return NextResponse.json(
        { error: 'Text exceeds maximum length of 1500 characters' },
        { status: 400 }
      );
    }

    // Adversarial guardrail scan
    const guardrailCheck = AgentGuardrails.validateInput(text);
    if (!guardrailCheck.isSafe) {
      return NextResponse.json(
        { error: guardrailCheck.rejectionReason, threatType: guardrailCheck.threatType },
        { status: 400 }
      );
    }

    const targetLang =
      INDIC_LANGUAGES.find((l) => l.code === targetLanguageCode) || INDIC_LANGUAGES[0];

    const registerInstruction =
      honorificRegister === 'respectful'
        ? `Use the RESPECTFUL elder honorific register (${targetLang.honorifics.respectfulLabel}, pronoun "${targetLang.honorifics.respectfulPronoun}").`
        : `Use the FAMILIAR / intimate family honorific register (${targetLang.honorifics.familiarLabel}, pronoun "${targetLang.honorifics.familiarPronoun}").`;

    const apiKey = process.env.GEMINI_API_KEY || '';
    const modelName = process.env.GEMINI_CHAT_MODEL || 'gemini-flash-latest';

    if (!apiKey) {
      const contextual = resolveContextualIndicTranslation(text, targetLang, honorificRegister, personName);
      return NextResponse.json({
        translatedText: contextual.nativeScript,
        transliteration: contextual.transliteration,
        sourceLanguage: sourceLanguageCode,
        targetLanguage: targetLang.code,
        targetLanguageName: targetLang.name,
        honorificRegister,
        speechSynthesisTag: targetLang.speechSynthesisTag,
        mode: 'CONTEXTUAL_SYNTHETIC_REGISTER',
        category: contextual.category,
        warning: 'Contextual vernacular register active (Gemini API key not configured).',
      });
    }

    const prompt = `Translate the following English companion reflection into authentic spoken ${targetLang.name} (${targetLang.nativeName} — ${targetLang.region} regional register).
${registerInstruction}
Context/Kinship: The elder (${personName}) is speaking warmly to their family member about memories, grief, and presence.

You MUST respond in valid JSON format with exactly these two fields:
{
  "translatedText": "Direct translation in ${targetLang.script} script ONLY. Preserve authentic vernacular dialect words.",
  "transliteration": "Phonetic Roman/Latin transliteration of the translated text so it can be read and pronounced naturally by non-native speakers and English text-to-speech."
}
Do not include markdown fences or any other text outside the JSON.

Source text:
${text}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          },
        }),
      });

      if (!response.ok) {
        // Graceful fallback on 402 Prepayment Required, 429 Quota Exhausted or upstream errors
        const contextual = resolveContextualIndicTranslation(text, targetLang, honorificRegister, personName);
        return NextResponse.json({
          translatedText: contextual.nativeScript,
          transliteration: contextual.transliteration,
          sourceLanguage: sourceLanguageCode,
          targetLanguage: targetLang.code,
          targetLanguageName: targetLang.name,
          honorificRegister,
          speechSynthesisTag: targetLang.speechSynthesisTag,
          mode: 'CONTEXTUAL_SYNTHETIC_REGISTER',
          category: contextual.category,
          warning: `Contextual cultural register active (Gemini API status ${response.status} — quota preserved).`,
        });
      }

      const data = await response.json();
      const rawCandidate = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      let translatedText = '';
      let transliteration = '';

      try {
        const jsonMatch = rawCandidate.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          translatedText = parsed.translatedText || '';
          transliteration = parsed.transliteration || '';
        }
      } catch {
        // Fallback to raw text extraction
      }

      if (!translatedText) {
        translatedText = AgentGuardrails.sanitizeOutput(
          rawCandidate.replace(/^["']|["']$/g, '')
        );
      }

      if (!translatedText) {
        const contextual = resolveContextualIndicTranslation(text, targetLang, honorificRegister, personName);
        return NextResponse.json({
          translatedText: contextual.nativeScript,
          transliteration: contextual.transliteration,
          sourceLanguage: sourceLanguageCode,
          targetLanguage: targetLang.code,
          targetLanguageName: targetLang.name,
          honorificRegister,
          speechSynthesisTag: targetLang.speechSynthesisTag,
          mode: 'CONTEXTUAL_SYNTHETIC_REGISTER',
          category: contextual.category,
        });
      }

      if (!transliteration) {
        const contextual = resolveContextualIndicTranslation(text, targetLang, honorificRegister, personName);
        transliteration = contextual.transliteration;
      }

      return NextResponse.json({
        translatedText,
        transliteration,
        sourceLanguage: sourceLanguageCode,
        targetLanguage: targetLang.code,
        targetLanguageName: targetLang.name,
        honorificRegister,
        speechSynthesisTag: targetLang.speechSynthesisTag,
        mode: 'LIVE_GEMINI',
      });
    } catch {
      const contextual = resolveContextualIndicTranslation(text, targetLang, honorificRegister, personName);
      return NextResponse.json({
        translatedText: contextual.nativeScript,
        transliteration: contextual.transliteration,
        sourceLanguage: sourceLanguageCode,
        targetLanguage: targetLang.code,
        targetLanguageName: targetLang.name,
        honorificRegister,
        speechSynthesisTag: targetLang.speechSynthesisTag,
        mode: 'CONTEXTUAL_SYNTHETIC_REGISTER',
        category: contextual.category,
        warning: 'Contextual cultural register active (offline/network fallback).',
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Translation failed' }, { status: 500 });
  }
}
