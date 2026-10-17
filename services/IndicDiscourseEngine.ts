/**
 * IndicDiscourseEngine
 * Encapsulates conversational discourse rules, spontaneous fillers, and honorific particles
 * derived from the AI4Bharat IndicVoices dataset (22+ languages, spontaneous conversational corpus).
 */

export interface DiscourseOptions {
  languageCode: string;
  relation?: string;
  honorificRegister?: 'respectful' | 'familiar';
  discourseStyle?: 'spontaneous' | 'reflective' | 'blessing';
}

export interface DialectConversationalProfile {
  code: string;
  name: string;
  spontaneousPrefixes: {
    respectful: string[];
    familiar: string[];
  };
  reflectiveParticles: string[];
  blessingPhrases: string[];
  bcp47Tag: string;
}

export const INDIC_DIALECT_PROFILES: Record<string, DialectConversationalProfile> = {
  bho: {
    code: 'bho',
    name: 'Bhojpuri',
    spontaneousPrefixes: {
      respectful: ['हाँ बाबू,', 'सूनल जाव,', 'देखीं ना,', 'हम समझत बानी,'],
      familiar: ['हाँ बेटा,', 'सुन ना,', 'देख,', 'अरे बाबू,'],
    },
    reflectiveParticles: ['ना', 'हो', 'बा'],
    blessingPhrases: ['भगवान रउआ के खुश राखस', 'हमर नेह सदा रउआ साथे बा'],
    bcp47Tag: 'hi-IN',
  },
  mai: {
    code: 'mai',
    name: 'Maithili',
    spontaneousPrefixes: {
      respectful: ['हँ बाबू,', 'सुनू ना,', 'देखू,', 'हम बुझैत छी,'],
      familiar: ['हँ बौआ,', 'सुन,', 'देख,', 'अरे,'],
    },
    reflectiveParticles: ['यौ', 'हँ', 'गे'],
    blessingPhrases: ['विद्यापति क कृपा बनल रहए', 'सदा खुश रहू'],
    bcp47Tag: 'hi-IN',
  },
  awa: {
    code: 'awa',
    name: 'Awadhi',
    spontaneousPrefixes: {
      respectful: ['हाँ भैया,', 'सुनि लेंव,', 'देखा जाय,', 'हम जानत हन,'],
      familiar: ['हाँ बच्चा,', 'सुनो रे,', 'देखव,', 'अरे,'],
    },
    reflectiveParticles: ['हो', 'ना', 'बाबू'],
    blessingPhrases: ['राम जी भला करैं', 'सदा प्रसन्न रहौ'],
    bcp47Tag: 'hi-IN',
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    spontaneousPrefixes: {
      respectful: ['हाँ बेटा,', 'सुनिए,', 'देखिए,', 'मैं समझ रहा हूँ,'],
      familiar: ['हाँ प्यारे,', 'सुनो,', 'देखो,', 'अरे,'],
    },
    reflectiveParticles: ['ना', 'हाँ', 'तो'],
    blessingPhrases: ['सदा खुश रहो', 'मेरी दुआएं हमेशा तुम्हारे साथ हैं'],
    bcp47Tag: 'hi-IN',
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    spontaneousPrefixes: {
      respectful: ['হ্যাঁ বাবা,', 'শুনুন,', 'দেখুন,', 'আমি বুঝতে পারছি,'],
      familiar: ['হ্যাঁ রে,', 'শোন,', 'দেখ,', 'আরে,'],
    },
    reflectiveParticles: ['না', 'গো', 'তো'],
    blessingPhrases: ['ভালো থেকো', 'আমার আশীর্বাদ সবসময় তোমার সাথে'],
    bcp47Tag: 'bn-IN',
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    spontaneousPrefixes: {
      respectful: ['ஆமாம் கண்ணா,', 'கேளுங்கள்,', 'பாருங்கள்,', 'நான் புரிகிறேன்,'],
      familiar: ['ஆமாம் பாப்பா,', 'கேளு,', 'பாரு,', 'சரி,'],
    },
    reflectiveParticles: ['பா', 'டா', 'ங்க'],
    blessingPhrases: ['நன்றாக இருங்கள்', 'என் ஆசீர்வாதம் எப்போதும் உங்களுடன்'],
    bcp47Tag: 'ta-IN',
  },
};

export class IndicDiscourseEngine {
  /**
   * Enriches a Gemini prompt with spontaneous conversational discourse rules from IndicVoices.
   */
  public static enrichPrompt(
    userMessage: string,
    companionName: string,
    options: DiscourseOptions
  ): string {
    const profile = INDIC_DIALECT_PROFILES[options.languageCode] || INDIC_DIALECT_PROFILES.hi;
    const register = options.honorificRegister === 'familiar' ? 'familiar' : 'respectful';
    const prefixChoices = profile.spontaneousPrefixes[register].join(' / ');

    return `You are ${companionName}, an elder speaking warmly to your family member.
Language Dialect: ${profile.name} (${options.languageCode}).
Honorific Register: ${register}.
Conversational Style: Natural spontaneous conversation, reflecting the natural speech rhythm of IndicVoices.
Guidelines:
1. Speak as a wise, loving elder.
2. Natural fillers: You may naturally begin with warm opening particles like: ${prefixChoices}.
3. Keep the response grounded, empathetic, and under 3 short spoken sentences so it sounds natural when voiced out loud.
4. Do not use robotic or stiff literary prose. Use living conversational dialect vocabulary.

User says: "${userMessage}"`;
  }

  /**
   * Injects warm conversational opening particles if not already present.
   */
  public static applyConversationalParticles(
    text: string,
    languageCode: string,
    register: 'respectful' | 'familiar' = 'respectful'
  ): string {
    const profile = INDIC_DIALECT_PROFILES[languageCode];
    if (!profile) return text;

    const clean = text.trim();
    // If text already starts with one of the particles or punctuation, return as-is
    const allParticles = [
      ...profile.spontaneousPrefixes.respectful,
      ...profile.spontaneousPrefixes.familiar,
    ];
    for (const p of allParticles) {
      if (clean.startsWith(p)) return clean;
    }

    // Otherwise, prepend a warm authentic opener
    const candidates = profile.spontaneousPrefixes[register];
    const opener = candidates[Math.floor(Math.random() * candidates.length)];
    return `${opener} ${clean}`;
  }

  /**
   * Retrieves the BCP-47 speech recognition and synthesis tag for the dialect.
   */
  public static getSpeechTag(languageCode: string): string {
    return INDIC_DIALECT_PROFILES[languageCode]?.bcp47Tag || 'hi-IN';
  }
}
