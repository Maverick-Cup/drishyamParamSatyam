import { NextRequest, NextResponse } from 'next/server';
import { AgentGuardrails } from '@/services/AgentGuardrails';
import { INDIC_LANGUAGES } from '@/config/indicLanguages';

/**
 * POST /api/indic/translate
 * Translates text between English and Indic languages (or across Indic languages)
 * Powered dynamically by Google Gemini (no hardcoded responses).
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = (body.text || '').trim();
    const targetLanguageCode = (body.targetLanguage || 'hi').trim().toLowerCase();
    const sourceLanguageCode = (body.sourceLanguage || 'en').trim().toLowerCase();

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
      INDIC_LANGUAGES.find((l) => l.code === targetLanguageCode) ||
      (targetLanguageCode === 'en'
        ? { name: 'English', nativeName: 'English', code: 'en', speechSynthesisTag: 'en-US' }
        : INDIC_LANGUAGES[0]);

    const apiKey = process.env.GEMINI_API_KEY || '';
    const modelName = process.env.GEMINI_CHAT_MODEL || 'gemini-flash-latest';

    if (!apiKey) {
      return NextResponse.json({
        translatedText: text,
        sourceLanguage: sourceLanguageCode,
        targetLanguage: targetLang.code,
        targetLanguageName: targetLang.name,
        speechSynthesisTag: targetLang.speechSynthesisTag,
        warning: 'Gemini API key is not configured; returning original text.',
      });
    }

    const prompt = `Translate the following text faithfully and with gentle, natural, respectful tone into ${targetLang.name} (${targetLang.nativeName}).
Return ONLY the direct translation. Do not include translator notes, explanations, or quotes.

Source text:
${text}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

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
      const errBody = await response.text();
      return NextResponse.json(
        { error: `Gemini API returned status ${response.status}`, details: errBody },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawCandidate = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    const sanitizedCandidate = AgentGuardrails.sanitizeOutput(rawCandidate.replace(/^["']|["']$/g, ''));

    return NextResponse.json({
      translatedText: sanitizedCandidate || text,
      sourceLanguage: sourceLanguageCode,
      targetLanguage: targetLang.code,
      targetLanguageName: targetLang.name,
      speechSynthesisTag: targetLang.speechSynthesisTag,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Translation failed' }, { status: 500 });
  }
}
