/**
 * Indic Languages Configuration
 * ParamSathya multilingual reflection & cultural voice preservation directory.
 * Maps language codes to scripts, native endonyms, regions, and synthesis speech tags.
 */

export interface IndicLanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  defaultVoiceGender: 'female' | 'male';
  speechSynthesisTag: string; // BCP-47 for browser speech fallback
  samplePrompt: string;
}

export const INDIC_LANGUAGES: IndicLanguageConfig[] = [
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    defaultVoiceGender: 'female',
    speechSynthesisTag: 'hi-IN',
    samplePrompt: 'नमस्ते, आज आपका मन कैसा महसूस कर रहा है? मैं यहाँ आपके साथ हूँ।',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    script: 'Bengali',
    defaultVoiceGender: 'female',
    speechSynthesisTag: 'bn-IN',
    samplePrompt: 'নমস্কার, আজ আপনার মন কেমন লাগছে? আমি আপনার কথা শুনতে এখানে আছি।',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    script: 'Telugu',
    defaultVoiceGender: 'female',
    speechSynthesisTag: 'te-IN',
    samplePrompt: 'నమస్కారం, ఈ రోజు మీ మనస్సు ఎలా ఉంది? నేను మీతోనే ఉన్నాను.',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    script: 'Tamil',
    defaultVoiceGender: 'female',
    speechSynthesisTag: 'ta-IN',
    samplePrompt: 'வணக்கம், இன்று உங்கள் மனம் எப்படி உணர்கிறது? நான் உங்களுடன் இருக்கிறேன்.',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    script: 'Devanagari',
    defaultVoiceGender: 'female',
    speechSynthesisTag: 'mr-IN',
    samplePrompt: 'नमस्कार, आज तुमचे मन कसे वाटत आहे? मी शांतपणे तुमचे ऐकण्यासाठी येथे आहे.',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    script: 'Gujarati',
    defaultVoiceGender: 'female',
    speechSynthesisTag: 'gu-IN',
    samplePrompt: 'નમસ્તે, આજે તમારું મન કેવું અનુભવે છે? હું તમારી સાથે છું.',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    script: 'Kannada',
    defaultVoiceGender: 'female',
    speechSynthesisTag: 'kn-IN',
    samplePrompt: 'ನಮಸ್ಕಾರ, ಇಂದು ನಿಮ್ಮ ಮನಸ್ಸು ಹೇಗನಿಸುತ್ತಿದೆ? ನಾನು ನಿಮ್ಮೊಂದಿಗೆ ಇದ್ದೇನೆ.',
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    script: 'Malayalam',
    defaultVoiceGender: 'female',
    speechSynthesisTag: 'ml-IN',
    samplePrompt: 'നമസ്കാരം, ഇന്ന് നിങ്ങളുടെ മനസ്സിന് എന്തുതോന്നുന്നു? ഞാൻ കൂടെയുണ്ട്.',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    script: 'Gurmukhi',
    defaultVoiceGender: 'female',
    speechSynthesisTag: 'pa-IN',
    samplePrompt: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਅੱਜ ਤੁਹਾਡਾ ਮਨ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰ ਰਿਹਾ ਹੈ? ਮੈਂ ਤੁਹਾਡੇ ਨਾਲ ਹਾਂ।',
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    script: 'Perso-Arabic',
    defaultVoiceGender: 'female',
    speechSynthesisTag: 'ur-IN',
    samplePrompt: 'آداب، آج آپ کا دل کیسا محسوس کر رہا ہے؟ میں یہاں آپ کو سننے کے لیے ہوں۔',
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    script: 'Odia',
    defaultVoiceGender: 'female',
    speechSynthesisTag: 'or-IN',
    samplePrompt: 'ନମସ୍କାର, ଆଜି ଆପଣଙ୍କ ମନ କିପରି ଅଛି? ମୁଁ ଆପଣଙ୍କ ସହିତ ଅଛି।',
  },
];

export const DEFAULT_INDIC_LANG = INDIC_LANGUAGES[0]; // Hindi
