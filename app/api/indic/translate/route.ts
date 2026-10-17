import { NextRequest, NextResponse } from 'next/server';
import { AgentGuardrails } from '@/services/AgentGuardrails';
import {
  INDIC_LANGUAGES,
  HonorificRegister,
  resolveSyntheticIndicTranslation,
} from '@/config/indicLanguages';

/**
 * POST /api/indic/translate
 * Translates text between English and Indic languages/dialects with Honorific Register support.
 * Includes automatic Cultural Synthetic Register fallback when Gemini API hits usage/quota limits (429/502).
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = (body.text || '').trim();
    const targetLanguageCode = (body.targetLanguage || 'bho').trim().toLowerCase();
    const sourceLanguageCode = (body.sourceLanguage || 'en').trim().toLowerCase();
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
    const modelName = process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
      const syntheticText = resolveSyntheticIndicTranslation(text, targetLang, honorificRegister);
      return NextResponse.json({
        translatedText: syntheticText,
        sourceLanguage: sourceLanguageCode,
        targetLanguage: targetLang.code,
        targetLanguageName: targetLang.name,
        honorificRegister,
        speechSynthesisTag: targetLang.speechSynthesisTag,
        mode: 'SYNTHETIC_FALLBACK',
        warning: 'Synthetic vernacular register used (Gemini API key not configured).',
      });
    }

    const prompt = `Translate the following English reflection faithfully into ${targetLang.name} (${targetLang.nativeName} — ${targetLang.region} dialect/register).
${registerInstruction}
Preserve authentic cultural warmth and kinship terms. Return ONLY the direct translation in ${targetLang.script} script. Do not include translator notes, explanations, or quotes.

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
        // Graceful fallback on 429 Quota Exhausted or upstream errors
        const syntheticText = resolveSyntheticIndicTranslation(text, targetLang, honorificRegister);
        return NextResponse.json({
          translatedText: syntheticText,
          sourceLanguage: sourceLanguageCode,
          targetLanguage: targetLang.code,
          targetLanguageName: targetLang.name,
          honorificRegister,
          speechSynthesisTag: targetLang.speechSynthesisTag,
          mode: 'SYNTHETIC_FALLBACK',
          warning: `Synthetic cultural register active (Gemini API status ${response.status} — quota preserved).`,
        });
      }

      const data = await response.json();
      const rawCandidate = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      const sanitizedCandidate = AgentGuardrails.sanitizeOutput(
        rawCandidate.replace(/^["']|["']$/g, '')
      );

      if (!sanitizedCandidate) {
        const syntheticText = resolveSyntheticIndicTranslation(text, targetLang, honorificRegister);
        return NextResponse.json({
          translatedText: syntheticText,
          sourceLanguage: sourceLanguageCode,
          targetLanguage: targetLang.code,
          targetLanguageName: targetLang.name,
          honorificRegister,
          speechSynthesisTag: targetLang.speechSynthesisTag,
          mode: 'SYNTHETIC_FALLBACK',
        });
      }

      return NextResponse.json({
        translatedText: sanitizedCandidate,
        sourceLanguage: sourceLanguageCode,
        targetLanguage: targetLang.code,
        targetLanguageName: targetLang.name,
        honorificRegister,
        speechSynthesisTag: targetLang.speechSynthesisTag,
        mode: 'LIVE_GEMINI',
      });
    } catch {
      const syntheticText = resolveSyntheticIndicTranslation(text, targetLang, honorificRegister);
      return NextResponse.json({
        translatedText: syntheticText,
        sourceLanguage: sourceLanguageCode,
        targetLanguage: targetLang.code,
        targetLanguageName: targetLang.name,
        honorificRegister,
        speechSynthesisTag: targetLang.speechSynthesisTag,
        mode: 'SYNTHETIC_FALLBACK',
        warning: 'Synthetic cultural register active (offline/network fallback).',
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Translation failed' }, { status: 500 });
  }
}
