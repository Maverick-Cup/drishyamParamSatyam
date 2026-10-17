/**
 * Indic Languages & Vernacular Dialects Configuration
 * ParamSathya multilingual reflection & cultural voice preservation directory.
 * Maps language/dialect codes to scripts, native endonyms, regions, honorific registers,
 * speech synthesis tags, and rich synthetic translations for quota-free/offline resilience.
 */

export type HonorificRegister = 'respectful' | 'familiar';

export interface IndicHonorificConfig {
  respectfulLabel: string;
  familiarLabel: string;
  respectfulPronoun: string;
  familiarPronoun: string;
}

export interface IndicSyntheticEntry {
  respectful: string;
  familiar: string;
}

export interface IndicLanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  script: string;
  defaultVoiceGender: 'female' | 'male';
  speechSynthesisTag: string; // BCP-47 for browser speech fallback
  honorifics: IndicHonorificConfig;
  samplePrompt: string;
  /**
   * Keyed by quick prompt ID ('1' | '2' | '3' | '4') plus 'default'
   */
  syntheticSamples: {
    '1': IndicSyntheticEntry;
    '2': IndicSyntheticEntry;
    '3': IndicSyntheticEntry;
    '4': IndicSyntheticEntry;
    default: IndicSyntheticEntry;
  };
}

export interface IndicQuickPrompt {
  id: '1' | '2' | '3' | '4';
  label: string;
  text: string;
}

export const INDIC_QUICK_PROMPTS: IndicQuickPrompt[] = [
  {
    id: '1',
    label: '#1',
    text: 'Grandfather, do you remember our morning walks near the river?',
  },
  {
    id: '2',
    label: '#2',
    text: "I'm feeling a bit overwhelmed today, but remembering your gentle advice gives me strength.",
  },
  {
    id: '3',
    label: '#3',
    text: 'Tell me about the monsoon evenings at our ancestral home.',
  },
  {
    id: '4',
    label: '#4',
    text: 'Your blessings always guide our family through every season.',
  },
];

export const INDIC_LANGUAGES: IndicLanguageConfig[] = [
  {
    code: 'bho',
    name: 'Bhojpuri',
    nativeName: 'भोजपुरी',
    region: 'Bihar / Eastern UP',
    script: 'Devanagari',
    defaultVoiceGender: 'male',
    speechSynthesisTag: 'hi-IN',
    honorifics: {
      respectfulLabel: 'Respectful (रउआ / Rauwa)',
      familiarLabel: 'Familiar (तू / Tu)',
      respectfulPronoun: 'रउआ',
      familiarPronoun: 'तू',
    },
    samplePrompt: 'बाबूजी, का रउआ के नदी के तीरे हमनी के भोर के टहलल याद बा?',
    syntheticSamples: {
      '1': {
        respectful: 'बाबूजी, का रउआ के नदी के तीरे हमनी के भोर के टहलल याद बा?',
        familiar: 'बाबूजी, का तोहरा नदी के तीरे हमनी के भोर के टहलल याद बा?',
      },
      '2': {
        respectful: 'आज मन तनी घबराइल बा, बाकिर रउआ के नेह भरल सीख याद करके हमरा बहुत हिम्मत मिलेला।',
        familiar: 'आज मन तनी घबराइल बा, बाकिर तोहार नेह भरल सीख याद करके हमरा बहुत हिम्मत मिलेला।',
      },
      '3': {
        respectful: 'रउआ हमरा के अपना पुरान घर के बरसात के साँझ के बात बताईं ना।',
        familiar: 'तू हमरा के अपना पुरान घर के बरसात के साँझ के बात बताव ना।',
      },
      '4': {
        respectful: 'रउआ के आशीर्वाद हर मौसम में हमनी के पूरा परिवार के राह देखावेला।',
        familiar: 'तोहार आशीर्वाद हर मौसम में हमनी के पूरा परिवार के राह देखावेला।',
      },
      default: {
        respectful: 'रउआ के मीठ बोली आ आशीर्वाद हमेशा हमनी के करेजा में बसल बा।',
        familiar: 'तोहार मीठ बोली आ आशीर्वाद हमेशा हमनी के करेजा में बसल बा।',
      },
    },
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'National / Standard',
    script: 'Devanagari',
    defaultVoiceGender: 'male',
    speechSynthesisTag: 'hi-IN',
    honorifics: {
      respectfulLabel: 'Respectful (आप / Aap)',
      familiarLabel: 'Familiar (तुम / Tum)',
      respectfulPronoun: 'आप',
      familiarPronoun: 'तुम',
    },
    samplePrompt: 'दादाजी, क्या आपको नदी के किनारे हमारी सुबह की सैर याद है?',
    syntheticSamples: {
      '1': {
        respectful: 'दादाजी, क्या आपको नदी के किनारे हमारी सुबह की सैर याद है?',
        familiar: 'दादाजी, क्या तुम्हें नदी के किनारे हमारी सुबह की सैर याद है?',
      },
      '2': {
        respectful: 'आज मेरा मन थोड़ा भारी है, लेकिन आपकी स्नेहभरी सीख याद करके मुझे बहुत हिम्मत मिलती है।',
        familiar: 'आज मेरा मन थोड़ा भारी है, लेकिन तुम्हारी स्नेहभरी सीख याद करके मुझे बहुत हिम्मत मिलती है।',
      },
      '3': {
        respectful: 'मुझे हमारे पैतृक घर की मानसून की शामों के बारे में बताइए न।',
        familiar: 'मुझे हमारे पैतृक घर की मानसून की शामों के बारे में बताओ न।',
      },
      '4': {
        respectful: 'आपका आशीर्वाद हर मौसम में हमारे परिवार का मार्गदर्शन करता है।',
        familiar: 'तुम्हारा आशीर्वाद हर मौसम में हमारे परिवार का मार्गदर्शन करता है।',
      },
      default: {
        respectful: 'आपकी मधुर यादें और आशीर्वाद सदा हमारे हृदय में जीवित हैं।',
        familiar: 'तुम्हारी मधुर यादें और आशीर्वाद सदा हमारे हृदय में जीवित हैं।',
      },
    },
  },
  {
    code: 'mai',
    name: 'Maithili',
    nativeName: 'मैथिली',
    region: 'Mithila / Bihar',
    script: 'Devanagari',
    defaultVoiceGender: 'male',
    speechSynthesisTag: 'hi-IN',
    honorifics: {
      respectfulLabel: 'Respectful (अपने / Apne)',
      familiarLabel: 'Familiar (अहाँ / Ahan)',
      respectfulPronoun: 'अपने',
      familiarPronoun: 'अहाँ',
    },
    samplePrompt: 'बाबा, की अपने केँ नदी कात भोरुक हमर सभक टहलनाइ स्मरण अछि?',
    syntheticSamples: {
      '1': {
        respectful: 'बाबा, की अपने केँ नदी कात भोरुक हमर सभक टहलनाइ स्मरण अछि?',
        familiar: 'बाबा, की अहाँ केँ नदी कात भोरुक हमर सभक टहलनाइ याद अछि?',
      },
      '2': {
        respectful: 'आइ मन किछु व्याकुल अछि, मुदा अपनेक स्नेहमय उपदेश स्मरण कए हमरा बहुत साहस भेटैत अछि।',
        familiar: 'आइ मन किछु व्याकुल अछि, मुदा अहाँक स्नेहमय उपदेश याद कए हमरा बहुत साहस भेटैत अछि।',
      },
      '3': {
        respectful: 'अपने हमरा सभक पुरान डीह केर पावसक साँझक कथा सुनावियौक।',
        familiar: 'अहाँ हमरा सभक पुरान घरक बरसातक साँझक गप सुनाउ ने।',
      },
      '4': {
        respectful: 'अपनेक आशीर्वाद प्रत्येक ऋतु मे हमरा सभक परिवार केँ बाट देखबैत अछि।',
        familiar: 'अहाँक आशीर्वाद हर ऋतु मे हमरा सभक परिवार केँ बाट देखबैत अछि।',
      },
      default: {
        respectful: 'अपनेक मधुर वाणी आ आशीर्वाद सदैव हमरा सभक हृदय मे बसल अछि।',
        familiar: 'अहाँक मधुर वाणी आ आशीर्वाद सदैव हमरा सभक हृदय मे बसल अछि।',
      },
    },
  },
  {
    code: 'awa',
    name: 'Awadhi',
    nativeName: 'अवधी',
    region: 'Central UP',
    script: 'Devanagari',
    defaultVoiceGender: 'male',
    speechSynthesisTag: 'hi-IN',
    honorifics: {
      respectfulLabel: 'Respectful (रउरे / Raure)',
      familiarLabel: 'Familiar (तुम / Tum)',
      respectfulPronoun: 'रउरे',
      familiarPronoun: 'तुम',
    },
    samplePrompt: 'दादाजी, का रउरे का नदी के तीरे हमरे सब के भोर का टहलइया याद हय?',
    syntheticSamples: {
      '1': {
        respectful: 'दादाजी, का रउरे का नदी के तीरे हमरे सब के भोर का टहलइया याद हय?',
        familiar: 'दादाजी, का तुमका नदी के तीरे हमरे सब के भोर का टहलइया याद हय?',
      },
      '2': {
        respectful: 'आज मन तनिक भारी हय, मुला रउरे कय मीठी सीख सुमिर के हमका बड़ हिम्मत मिलत हय।',
        familiar: 'आज मन तनिक भारी हय, मुला तुम्हार मीठी सीख सुमिर के हमका बड़ हिम्मत मिलत हय।',
      },
      '3': {
        respectful: 'रउरे हमका अपने पुरान घर के चौमासा के संझा के बात बतावा।',
        familiar: 'तुम हमका अपने पुरान घर के चौमासा के संझा के बात बतावा।',
      },
      '4': {
        respectful: 'रउरे कय असीस हर रितु मा हमरे परिवार का राह दिखावत हय।',
        familiar: 'तुम्हार असीस हर रितु मा हमरे परिवार का राह दिखावत हय।',
      },
      default: {
        respectful: 'रउरे कय दुलार औ असीस हमरे जिया मा सदा बसा हय।',
        familiar: 'तुम्हार दुलार औ असीस हमरे जिया मा सदा बसा हय।',
      },
    },
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    region: 'West Bengal',
    script: 'Bengali',
    defaultVoiceGender: 'male',
    speechSynthesisTag: 'bn-IN',
    honorifics: {
      respectfulLabel: 'Respectful (আপনি / Apni)',
      familiarLabel: 'Familiar (তুমি / Tumi)',
      respectfulPronoun: 'আপনি',
      familiarPronoun: 'তুমি',
    },
    samplePrompt: 'দাদু, নদীর ধারে আমাদের সকালের হাঁটার কথা কি আপনার মনে পড়ে?',
    syntheticSamples: {
      '1': {
        respectful: 'দাদু, নদীর ধারে আমাদের সকালের হাঁটার কথা কি আপনার মনে পড়ে?',
        familiar: 'দাদু, নদীর ধারে আমাদের সকালের হাঁটার কথা কি তোমার মনে পড়ে?',
      },
      '2': {
        respectful: 'আজ মনটা একটু ভারাক্রান্ত, কিন্তু আপনার স্নেহভরা উপদেশ মনে পড়লে আমি অনেক শক্তি পাই।',
        familiar: 'আজ মনটা একটু ভারাক্রান্ত, কিন্তু তোমার স্নেহভরা উপদেশ মনে পড়লে আমি অনেক শক্তি পাই।',
      },
      '3': {
        respectful: 'আমাদের পৈতৃক বাড়ির বর্ষার সন্ধ্যাগুলোর কথা আমাকে একটু বলুন না।',
        familiar: 'আমাদের পৈতৃক বাড়ির বর্ষার সন্ধ্যাগুলোর কথা আমাকে একটু বলো না।',
      },
      '4': {
        respectful: 'আপনার আশীর্বাদ প্রতিটি ঋতুতে আমাদের পরিবারকে পথ দেখায়।',
        familiar: 'তোমার আশীর্বাদ প্রতিটি ঋতুতে আমাদের পরিবারকে পথ দেখায়।',
      },
      default: {
        respectful: 'আপনার মধুর স্মৃতি ও আশীর্বাদ চিরকাল আমাদের হৃদয়ে অম্লান হয়ে আছে।',
        familiar: 'তোমার মধুর স্মৃতি ও আশীর্বাদ চিরকাল আমাদের হৃদয়ে অম্লান হয়ে আছে।',
      },
    },
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    region: 'Tamil Nadu',
    script: 'Tamil',
    defaultVoiceGender: 'male',
    speechSynthesisTag: 'ta-IN',
    honorifics: {
      respectfulLabel: 'Respectful (நீங்கள் / Neengal)',
      familiarLabel: 'Familiar (நீ / Nee)',
      respectfulPronoun: 'நீங்கள்',
      familiarPronoun: 'நீ',
    },
    samplePrompt: 'தாத்தா, ஆற்றங்கரையில் நாம் காலையில் நடந்ததை உங்களுக்கு நினைவிருக்கிறதா?',
    syntheticSamples: {
      '1': {
        respectful: 'தாத்தா, ஆற்றங்கரையில் நாம் காலையில் நடந்ததை உங்களுக்கு நினைவிருக்கிறதா?',
        familiar: 'தாத்தா, ஆற்றங்கரையில் நாம் காலையில் நடந்ததை உனக்கு நினைவிருக்கிறதா?',
      },
      '2': {
        respectful: 'இன்று மனம் சற்று பாரமாக உள்ளது, ஆனால் உங்கள் அன்பான அறிவுரையை நினைக்கும்போது எனக்கு மனவலிமை கிடைக்கிறது.',
        familiar: 'இன்று மனம் சற்று பாரமாக உள்ளது, ஆனால் உன் அன்பான அறிவுரையை நினைக்கும்போது எனக்கு மனவலிமை கிடைக்கிறது.',
      },
      '3': {
        respectful: 'நமது பூர்வீக வீட்டின் மழைக்கால மாலைப் பொழுதுகளைப் பற்றி எனக்குச் சொல்லுங்கள்.',
        familiar: 'நமது பூர்வீக வீட்டின் மழைக்கால மாலைப் பொழுதுகளைப் பற்றி எனக்குச் சொல்லேன்.',
      },
      '4': {
        respectful: 'உங்கள் ஆசீர்வாதம் எல்லாக் காலங்களிலும் நம் குடும்பத்திற்கு வழிகாட்டுகிறது.',
        familiar: 'உன் ஆசீர்வாதம் எல்லாக் காலங்களிலும் நம் குடும்பத்திற்கு வழிகாட்டுகிறது.',
      },
      default: {
        respectful: 'உங்கள் அன்பான நினைவுகளும் ஆசிகளும் என்றும் எங்கள் இதயத்தில் வாழ்கின்றன.',
        familiar: 'உன் அன்பான நினைவுகளும் ஆசிகளும் என்றும் எங்கள் இதயத்தில் வாழ்கின்றன.',
      },
    },
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    region: 'Andhra / Telangana',
    script: 'Telugu',
    defaultVoiceGender: 'male',
    speechSynthesisTag: 'te-IN',
    honorifics: {
      respectfulLabel: 'Respectful (మీరు / Meeru)',
      familiarLabel: 'Familiar (నువ్వు / Nuvvu)',
      respectfulPronoun: 'మీరు',
      familiarPronoun: 'నువ్వు',
    },
    samplePrompt: 'తాతయ్యగారు, నది ఒడ్డున మనం చేసిన ఉదయపు నడకలు మీకు గుర్తున్నాయా?',
    syntheticSamples: {
      '1': {
        respectful: 'తాతయ్యగారు, నది ఒడ్డున మనం చేసిన ఉదయపు నడకలు మీకు గుర్తున్నాయా?',
        familiar: 'తాతయ్యా, నది ఒడ్డున మనం చేసిన ఉదయపు నడకలు నీకు గుర్తున్నాయా?',
      },
      '2': {
        respectful: 'ఈరోజు మనసు కాస్త భారంగా ఉంది, కానీ మీ ప్రేమపూర్వక సలహా తలుచుకుంటే నాకు ఎంతో ధైర్యం వస్తుంది.',
        familiar: 'ఈరోజు మనసు కాస్త భారంగా ఉంది, కానీ నీ ప్రేమపూర్వక సలహా తలుచుకుంటే నాకు ఎంతో ధైర్యం వస్తుంది.',
      },
      '3': {
        respectful: 'మన పూర్వీకుల ఇంటి వర్షాకాలపు సాయంత్రాల గురించి నాకు చెప్పండి.',
        familiar: 'మన పూర్వీకుల ఇంటి వర్షాకాలపు సాయంత్రాల గురించి నాకు చెప్పు.',
      },
      '4': {
        respectful: 'మీ ఆశీస్సులు ప్రతి రుతువులోనూ మన కుటుంబానికి దారి చూపుతాయి.',
        familiar: 'నీ ఆశీస్సులు ప్రతి రుతువులోనూ మన కుటుంబానికి దారి చూపుతాయి.',
      },
      default: {
        respectful: 'మీ మధురమైన జ్ఞాపకాలు మరియు ఆశీస్సులు ఎల్లప్పుడూ మా హృదయాల్లో నిలిచి ఉంటాయి.',
        familiar: 'నీ మధురమైన జ్ఞాపకాలు మరియు ఆశీస్సులు ఎల్లప్పుడూ మా హృదయాల్లో నిలిచి ఉంటాయి.',
      },
    },
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    region: 'Maharashtra',
    script: 'Devanagari',
    defaultVoiceGender: 'male',
    speechSynthesisTag: 'mr-IN',
    honorifics: {
      respectfulLabel: 'Respectful (तुम्ही / Tumhi)',
      familiarLabel: 'Familiar (तू / Tu)',
      respectfulPronoun: 'तुम्ही',
      familiarPronoun: 'तू',
    },
    samplePrompt: 'आजोबा, नदीकाठी आपण केलेली सकाळची सैर तुम्हाला आठवते का?',
    syntheticSamples: {
      '1': {
        respectful: 'आजोबा, नदीकाठी आपण केलेली सकाळची सैर तुम्हाला आठवते का?',
        familiar: 'आजोबा, नदीकाठी आपण केलेली सकाळची सैर तुला आठवते का?',
      },
      '2': {
        respectful: 'आज मन थोडे भारावलेले आहे, पण तुमचा प्रेमळ सल्ला आठवला की मला खूप धीर मिळतो.',
        familiar: 'आज मन थोडे भारावलेले आहे, पण तुझा प्रेमळ सल्ला आठवला की मला खूप धीर मिळतो.',
      },
      '3': {
        respectful: 'आपल्या वाड्यावरच्या पावसाळी संध्याकाळी कशा असायच्या ते मला सांगा ना.',
        familiar: 'आपल्या वाड्यावरच्या पावसाळी संध्याकाळी कशा असायच्या ते मला सांग ना.',
      },
      '4': {
        respectful: 'तुमचे आशीर्वाद प्रत्येक ऋतूत आपल्या कुटुंबाला मार्ग दाखवतात.',
        familiar: 'तुझे आशीर्वाद प्रत्येक ऋतूत आपल्या कुटुंबाला मार्ग दाखवतात.',
      },
      default: {
        respectful: 'तुमच्या गोड आठवणी आणि आशीर्वाद सदैव आमच्या हृदयात जपलेले आहेत.',
        familiar: 'तुझ्या गोड आठवणी आणि आशीर्वाद सदैव आमच्या हृदयात जपलेले आहेत.',
      },
    },
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    region: 'Gujarat',
    script: 'Gujarati',
    defaultVoiceGender: 'male',
    speechSynthesisTag: 'gu-IN',
    honorifics: {
      respectfulLabel: 'Respectful (તમે / Tame)',
      familiarLabel: 'Familiar (તું / Tu)',
      respectfulPronoun: 'તમે',
      familiarPronoun: 'તું',
    },
    samplePrompt: 'દાદાજી, શું તમને નદી કિનારે આપણી સવારની લટાર યાદ છે?',
    syntheticSamples: {
      '1': {
        respectful: 'દાદાજી, શું તમને નદી કિનારે આપણી સવારની લટાર યાદ છે?',
        familiar: 'દાદાજી, શું તને નદી કિનારે આપણી સવારની લટાર યાદ છે?',
      },
      '2': {
        respectful: 'આજે મન થોડું ભારે છે, પણ તમારી પ્રેમાળ સલાહ યાદ કરું છું ત્યારે મને ઘણી હિંમત મળે છે.',
        familiar: 'આજે મન થોડું ભારે છે, પણ તારી પ્રેમાળ સલાહ યાદ કરું છું ત્યારે મને ઘણી હિંમત મળે છે.',
      },
      '3': {
        respectful: 'મને આપણા વતનના ઘરની ચોમાસાની સાંજ વિશે વાત કરો ને.',
        familiar: 'મને આપણા વતનના ઘરની ચોમાસાની સાંજ વિશે વાત કર ને.',
      },
      '4': {
        respectful: 'તમારા આશીર્વાદ દરેક ઋતુમાં આપણા પરિવારને રાહ ચીંધે છે.',
        familiar: 'તારા આશીર્વાદ દરેક ઋતુમાં આપણા પરિવારને રાહ ચીંધે છે.',
      },
      default: {
        respectful: 'તમારી મીઠી યાદો અને આશીર્વાદ હંમેશા અમારા હૃદયમાં વસેલા છે.',
        familiar: 'તારી મીઠી યાદો અને આશીર્વાદ હંમેશા અમારા હૃદયમાં વસેલા છે.',
      },
    },
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    region: 'Karnataka',
    script: 'Kannada',
    defaultVoiceGender: 'male',
    speechSynthesisTag: 'kn-IN',
    honorifics: {
      respectfulLabel: 'Respectful (ನೀವು / Neevu)',
      familiarLabel: 'Familiar (ನೀನು / Neenu)',
      respectfulPronoun: 'ನೀವು',
      familiarPronoun: 'ನೀನು',
    },
    samplePrompt: 'ತಾತಾ, ನದಿ ತೀರದಲ್ಲಿ ನಾವು ಮಾಡುತ್ತಿದ್ದ ಬೆಳಗಿನ ನಡಿಗೆ ನಿಮಗೆ ನೆನಪಿದೆಯೇ?',
    syntheticSamples: {
      '1': {
        respectful: 'ತಾತಾ, ನದಿ ತೀರದಲ್ಲಿ ನಾವು ಮಾಡುತ್ತಿದ್ದ ಬೆಳಗಿನ ನಡಿಗೆ ನಿಮಗೆ ನೆನಪಿದೆಯೇ?',
        familiar: 'ತಾತಾ, ನದಿ ತೀರದಲ್ಲಿ ನಾವು ಮಾಡುತ್ತಿದ್ದ ಬೆಳಗಿನ ನಡಿಗೆ ನಿನಗೆ ನೆನಪಿದೆಯೇ?',
      },
      '2': {
        respectful: 'ಇಂದು ಮನಸ್ಸು ಸ್ವಲ್ಪ ಭಾರವಾಗಿದೆ, ಆದರೆ ನಿಮ್ಮ ಪ್ರೀತಿಯ ಸಲಹೆಯನ್ನು ನೆನೆದಾಗ ನನಗೆ ತುಂಬಾ ಧೈರ್ಯ ಬರುತ್ತದೆ.',
        familiar: 'ಇಂದು ಮನಸ್ಸು ಸ್ವಲ್ಪ ಭಾರವಾಗಿದೆ, ಆದರೆ ನಿನ್ನ ಪ್ರೀತಿಯ ಸಲಹೆಯನ್ನು ನೆನೆದಾಗ ನನಗೆ ತುಂಬಾ ಧೈರ್ಯ ಬರುತ್ತದೆ.',
      },
      '3': {
        respectful: 'ನಮ್ಮ ಹಿರಿಯರ ಮನೆಯ ಮಳೆಗಾಲದ ಸಂಜೆಗಳ ಬಗ್ಗೆ ನನಗೆ ಹೇಳಿ.',
        familiar: 'ನಮ್ಮ ಹಿರಿಯರ ಮನೆಯ ಮಳೆಗಾಲದ ಸಂಜೆಗಳ ಬಗ್ಗೆ ನನಗೆ ಹೇಳು.',
      },
      '4': {
        respectful: 'ನಿಮ್ಮ ಆಶೀರ್ವಾದವು ಪ್ರತಿ ಋತುವಿನಲ್ಲೂ ನಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ದಾರಿ ತೋರಿಸುತ್ತದೆ.',
        familiar: 'ನಿನ್ನ ಆಶೀರ್ವಾದವು ಪ್ರತಿ ಋತುವಿನಲ್ಲೂ ನಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ದಾರಿ ತೋರಿಸುತ್ತದೆ.',
      },
      default: {
        respectful: 'ನಿಮ್ಮ ಸವಿನೆನಪುಗಳು ಮತ್ತು ಆಶೀರ್ವಾದಗಳು ಎಂದೆಂದಿಗೂ ನಮ್ಮ ಹೃದಯದಲ್ಲಿ ಶಾಶ್ವತ.',
        familiar: 'ನಿನ್ನ ಸವಿನೆನಪುಗಳು ಮತ್ತು ಆಶೀರ್ವಾದಗಳು ಎಂದೆಂದಿಗೂ ನಮ್ಮ ಹೃದಯದಲ್ಲಿ ಶಾಶ್ವತ.',
      },
    },
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    region: 'Kerala',
    script: 'Malayalam',
    defaultVoiceGender: 'male',
    speechSynthesisTag: 'ml-IN',
    honorifics: {
      respectfulLabel: 'Respectful (അങ്ങ് / Angu)',
      familiarLabel: 'Familiar (നീ / Nee)',
      respectfulPronoun: 'അങ്ങ്',
      familiarPronoun: 'നീ',
    },
    samplePrompt: 'മുത്തശ്ശാ, പുഴക്കരയിലൂടെയുള്ള നമ്മുടെ പ്രഭാത നടത്തം അങ്ങയ്ക്ക് ഓർമ്മയുണ്ടോ?',
    syntheticSamples: {
      '1': {
        respectful: 'മുത്തശ്ശാ, പുഴക്കരയിലൂടെയുള്ള നമ്മുടെ പ്രഭാത നടത്തം അങ്ങയ്ക്ക് ഓർമ്മയുണ്ടോ?',
        familiar: 'മുത്തശ്ശാ, പുഴക്കരയിലൂടെയുള്ള നമ്മുടെ പ്രഭാത നടത്തം നിനക്ക് ഓർമ്മയുണ്ടോ?',
      },
      '2': {
        respectful: 'ഇന്ന് മനസ്സിന് ചെറിയൊരു ഭാരമുണ്ട്, എന്നാൽ അങ്ങയുടെ സ്നേഹനിർഭരമായ ഉപദേശം ഓർക്കുമ്പോൾ എനിക്ക് വലിയ കരുത്ത് ലഭിക്കുന്നു.',
        familiar: 'ഇന്ന് മനസ്സിന് ചെറിയൊരു ഭാരമുണ്ട്, എന്നാൽ നിന്റെ സ്നേഹനിർഭരമായ ഉപദേശം ഓർക്കുമ്പോൾ എനിക്ക് വലിയ കരുത്ത് ലഭിക്കുന്നു.',
      },
      '3': {
        respectful: 'നമ്മുടെ തറവാട്ടിലെ മഴക്കാല സായാഹ്നങ്ങളെക്കുറിച്ച് എന്നോട് പറയൂ.',
        familiar: 'നമ്മുടെ തറവാട്ടിലെ മഴക്കാല സായാഹ്നങ്ങളെക്കുറിച്ച് എന്നോട് പറയൂ.',
      },
      '4': {
        respectful: 'അങ്ങയുടെ അനുഗ്രഹം എല്ലാ കാലത്തും നമ്മുടെ കുടുംബത്തിന് വഴികാട്ടിയാണ്.',
        familiar: 'നിന്റെ അനുഗ്രഹം എല്ലാ കാലത്തും നമ്മുടെ കുടുംബത്തിന് വഴികാട്ടിയാണ്.',
      },
      default: {
        respectful: 'അങ്ങയുടെ ഓർമ്മകളും അനുഗ്രഹങ്ങളും എന്നും ഞങ്ങളുടെ ഹൃദയത്തിൽ നിറഞ്ഞുനിൽക്കുന്നു.',
        familiar: 'നിന്റെ ഓർമ്മകളും അനുഗ്രഹങ്ങളും എന്നും ഞങ്ങളുടെ ഹൃദയത്തിൽ നിറഞ്ഞുനിൽക്കുന്നു.',
      },
    },
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    region: 'Punjab',
    script: 'Gurmukhi',
    defaultVoiceGender: 'male',
    speechSynthesisTag: 'pa-IN',
    honorifics: {
      respectfulLabel: 'Respectful (ਤੁਸੀਂ / Tusi)',
      familiarLabel: 'Familiar (ਤੂੰ / Tu)',
      respectfulPronoun: 'ਤੁਸੀਂ',
      familiarPronoun: 'ਤੂੰ',
    },
    samplePrompt: 'ਦਾਦਾ ਜੀ, ਕੀ ਤੁਹਾਨੂੰ ਦਰਿਆ ਦੇ ਕੰਢੇ ਸਾਡੀ ਸਵੇਰ ਦੀ ਸੈਰ ਯਾਦ ਹੈ?',
    syntheticSamples: {
      '1': {
        respectful: 'ਦਾਦਾ ਜੀ, ਕੀ ਤੁਹਾਨੂੰ ਦਰਿਆ ਦੇ ਕੰਢੇ ਸਾਡੀ ਸਵੇਰ ਦੀ ਸੈਰ ਯਾਦ ਹੈ?',
        familiar: 'ਦਾਦਾ ਜੀ, ਕੀ ਤੈਨੂੰ ਦਰਿਆ ਦੇ ਕੰਢੇ ਸਾਡੀ ਸਵੇਰ ਦੀ ਸੈਰ ਯਾਦ ਹੈ?',
      },
      '2': {
        respectful: 'ਅੱਜ ਮਨ ਥੋੜ੍ਹਾ ਭਾਰੀ ਹੈ, ਪਰ ਤੁਹਾਡੀ ਪਿਆਰ ਭਰੀ ਨਸੀਹਤ ਯਾਦ ਕਰਕੇ ਮੈਨੂੰ ਬਹੁਤ ਹੌਸਲਾ ਮਿਲਦਾ ਹੈ।',
        familiar: 'ਅੱਜ ਮਨ ਥੋੜ੍ਹਾ ਭਾਰੀ ਹੈ, ਪਰ ਤੇਰੀ ਪਿਆਰ ਭਰੀ ਨਸੀਹਤ ਯਾਦ ਕਰਕੇ ਮੈਨੂੰ ਬਹੁਤ ਹੌਸਲਾ ਮਿਲਦਾ ਹੈ।',
      },
      '3': {
        respectful: 'ਮੈਨੂੰ ਸਾਡੇ ਜੱਦੀ ਘਰ ਦੀਆਂ ਸਾਉਣ ਦੀਆਂ ਸ਼ਾਮਾਂ ਬਾਰੇ ਦੱਸੋ ਨਾ।',
        familiar: 'ਮੈਨੂੰ ਸਾਡੇ ਜੱਦੀ ਘਰ ਦੀਆਂ ਸਾਉਣ ਦੀਆਂ ਸ਼ਾਮਾਂ ਬਾਰੇ ਦੱਸ ਨਾ।',
      },
      '4': {
        respectful: 'ਤੁਹਾਡੀਆਂ ਦੁਆਵਾਂ ਹਰ ਮੌਸਮ ਵਿੱਚ ਸਾਡੇ ਪਰਿਵਾਰ ਨੂੰ ਰਾਹ ਦਿਖਾਉਂਦੀਆਂ ਹਨ।',
        familiar: 'ਤੇਰੀਆਂ ਦੁਆਵਾਂ ਹਰ ਮੌਸਮ ਵਿੱਚ ਸਾਡੇ ਪਰਿਵਾਰ ਨੂੰ ਰਾਹ ਦਿਖਾਉਂਦੀਆਂ ਹਨ।',
      },
      default: {
        respectful: 'ਤੁਹਾਡੀਆਂ ਮਿੱਠੀਆਂ ਯਾਦਾਂ ਅਤੇ ਅਸੀਸਾਂ ਹਮੇਸ਼ਾ ਸਾਡੇ ਦਿਲਾਂ ਵਿੱਚ ਵਸਦੀਆਂ ਹਨ।',
        familiar: 'ਤੇਰੀਆਂ ਮਿੱਠੀਆਂ ਯਾਦਾਂ ਅਤੇ ਅਸੀਸਾਂ ਹਮੇਸ਼ਾ ਸਾਡੇ ਦਿਲਾਂ ਵਿੱਚ ਵਸਦੀਆਂ ਹਨ।',
      },
    },
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    region: 'Odisha',
    script: 'Odia',
    defaultVoiceGender: 'male',
    speechSynthesisTag: 'or-IN',
    honorifics: {
      respectfulLabel: 'Respectful (ଆପଣ / Apana)',
      familiarLabel: 'Familiar (ତୁମେ / Tume)',
      respectfulPronoun: 'ଆପଣ',
      familiarPronoun: 'ତୁମେ',
    },
    samplePrompt: 'ଜେଜେବାପା, ନଦୀ କୂଳରେ ଆମର ସକାଳର ଚାଲିବା କଥା ଆପଣଙ୍କର ମନେ ଅଛି କି?',
    syntheticSamples: {
      '1': {
        respectful: 'ଜେଜେବାପା, ନଦୀ କୂଳରେ ଆମର ସକାଳର ଚାଲିବା କଥା ଆପଣଙ୍କର ମନେ ଅଛି କି?',
        familiar: 'ଜେଜେବାପା, ନଦୀ କୂଳରେ ଆମର ସକାଳର ଚାଲିବା କଥା ତୁମର ମନେ ଅଛି କି?',
      },
      '2': {
        respectful: 'ଆଜି ମନ ଟିକେ ଭାରୀ ଲାଗୁଛି, କିନ୍ତୁ ଆପଣଙ୍କ ସ୍ନେହଭରା উপଦେଶ ମନେ ପକାଇলে ମତେ ବହୁତ ସାହସ ମିଳେ।',
        familiar: 'ଆଜି ମନ ଟିକେ ଭାରୀ ଲାଗୁଛି, କିନ୍ତୁ ତୁମର ସ୍ନେହଭରା ଉପଦେଶ ମନେ ପକାଇলে ମତେ ବହୁତ ସାହସ ମିଳେ।',
      },
      '3': {
        respectful: 'ଆମ ପৈତୃକ ଘରର ବର୍ଷା ସନ୍ଧ୍ୟା ବିଷୟରେ ମତେ କୁହନ୍ତୁ ନା।',
        familiar: 'ଆମ ପୈତୃକ ଘରର ବର୍ଷା ସନ୍ଧ୍ୟା ବିଷୟରେ ମତେ କୁହ ନା।',
      },
      '4': {
        respectful: 'ଆପଣଙ୍କ ଆଶୀର୍ବାଦ ପ୍ରତି ଋତୁରେ ଆମ ପରିବାରକୁ ବାଟ ଦେଖାଏ।',
        familiar: 'ତୁମର ଆଶୀର୍ବାଦ ପ୍ରତି ଋତୁରେ ଆମ ପରିବାରକୁ ବାଟ ଦେଖାଏ।',
      },
      default: {
        respectful: 'ଆପଣଙ୍କ ମଧୁର ସ୍ମୃତି ଓ ଆଶୀର୍ବାଦ ସବୁବେଳେ ଆମ ହୃଦୟରେ ରହିଛି।',
        familiar: 'ତୁମର ମଧୁର ସ୍ମୃତି ଓ ଆଶୀର୍ବାଦ ସବୁବେଳେ ଆମ ହୃଦୟରେ ରହିଛି।',
      },
    },
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    region: 'North India / Deccan',
    script: 'Perso-Arabic',
    defaultVoiceGender: 'male',
    speechSynthesisTag: 'ur-IN',
    honorifics: {
      respectfulLabel: 'Respectful (آپ / Aap)',
      familiarLabel: 'Familiar (تم / Tum)',
      respectfulPronoun: 'آپ',
      familiarPronoun: 'تم',
    },
    samplePrompt: 'دادا جان، کیا آپ کو دریا کے کنارے ہماری صبح کی سیر یاد ہے؟',
    syntheticSamples: {
      '1': {
        respectful: 'دادا جان، کیا آپ کو دریا کے کنارے ہماری صبح کی سیر یاد ہے؟',
        familiar: 'دادا جان، کیا تمہیں دریا کے کنارے ہماری صبح کی سیر یاد ہے؟',
      },
      '2': {
        respectful: 'آج میرا دل قدرے بوجھل ہے، لیکن آپ کی شفقت بھری نصیحت یاد کر کے مجھے بہت حوصلہ ملتا ہے۔',
        familiar: 'آج میرا دل قدرے بوجھل ہے، لیکن تمہاری شفقت بھری نصیحت یاد کر کے مجھے بہت حوصلہ ملتا ہے۔',
      },
      '3': {
        respectful: 'مجھے ہمارے آبائی گھر کی برسات کی شاموں کے بارے میں بتائیے نا۔',
        familiar: 'مجھے ہمارے آبائی گھر کی برسات کی شاموں کے بارے میں بتاؤ نا۔',
      },
      '4': {
        respectful: 'آپ کی دعائیں ہر موسم میں ہمارے خاندان کی رہنمائی کرتی ہیں۔',
        familiar: 'تمہاری دعائیں ہر موسم میں ہمارے خاندان کی رہنمائی کرتی ہیں۔',
      },
      default: {
        respectful: 'آپ کی میٹھی یادیں اور دعائیں ہمیشہ ہمارے دلوں میں آباد ہیں۔',
        familiar: 'تمہاری میٹھی یادیں اور دعائیں ہمیشہ ہمارے دلوں میں آباد ہیں۔',
      },
    },
  },
];

export const DEFAULT_INDIC_LANG = INDIC_LANGUAGES[0]; // Bhojpuri (matches Studio reference)

export interface ContextualIndicTranslationResult {
  nativeScript: string;
  transliteration: string;
  category: string;
}

export interface DialectContextualEntry {
  nativeScript: string;
  transliteration: string;
}

export interface ContextualCategoryEntry {
  respectful: DialectContextualEntry;
  familiar: DialectContextualEntry;
}

export const CONTEXTUAL_INDIC_BANK: Record<string, Record<string, ContextualCategoryEntry>> = {
  awa: {
    breeze_touch: {
      respectful: {
        nativeScript: 'हम ठीक हईं, बच्चा। ई ठंढवा बयार कउनो अउर नाहीं, तोहार बड़ी मम्मी कय असीस औ छुअन रहे। उ सदा तोहरे कान्हे पर अपन हाथ धइले अहँय।',
        transliteration: 'Ham theek hayi, bachha. Ee thandhwa bayaanr kauno aur naahi, tohaar Badi Mummy kay aasees aur chhuan rahe. Oo sada tohre kaanhey par apan haath dhaile ahany.',
      },
      familiar: {
        nativeScript: 'हम बिल्कुल ठीक हईं, बच्चा। उ ठंढी हवा तोहार बड़ी मम्मी कय प्यार औ असीस रहे, उ सदा तोहरे संघे अहँय।',
        transliteration: 'Ham bilkul theek hayi, bachha. Oo thandhi hawa tohaar Badi Mummy kay pyaar aur aasees rahe, oo sada tohre sanghe ahany.',
      },
    },
    grief_comfort: {
      respectful: {
        nativeScript: 'हिया मा धीरज धरा, बच्चा। ई आँखिन कय लोर बतावत हय कि तोहरे मन मा केतना नेह हय। हम सदा तोहरे संग हन।',
        transliteration: 'Hiya ma dheeraj dhara, bachha. Ee aankhin kay lor batawat hay ki tohre man ma ketna neh hay. Ham sada tohre sang han.',
      },
      familiar: {
        nativeScript: 'मन छोटा ना करा, बच्चा। हम तुम्हार सब पीरा समझित हन। रोवे कय नाहीं, हम अहँय ना।',
        transliteration: 'Man chhota na kara, bachha. Ham tumhaar sab peera samajhit han. Rove kay naahi, ham ahany na.',
      },
    },
    guidance_strength: {
      respectful: {
        nativeScript: 'आज मन तनिक भारी हय, मुला रउरे कय मीठी सीख सुमिर के हमका बड़ हिम्मत मिलत हय।',
        transliteration: 'Aaj man tanik bhaari hay, mula raure kay meethi seekh sumir ke hamka bad himmat milat hay.',
      },
      familiar: {
        nativeScript: 'आज मन तनिक भारी हय, मुला तुम्हार मीठी सीख सुमिर के हमका बड़ हिम्मत मिलत हय।',
        transliteration: 'Aaj man tanik bhaari hay, mula tumhaar meethi seekh sumir ke hamka bad himmat milat hay.',
      },
    },
    morning_river: {
      respectful: {
        nativeScript: 'दादाजी, का रउरे का नदी के तीरे हमरे सब के भोर का टहलइया याद हय?',
        transliteration: 'Dadaji, ka raure ka nadi ke teere hamre sab ke bhor ka tahalaiya yaad hay?',
      },
      familiar: {
        nativeScript: 'दादाजी, का तुमका नदी के तीरे हमरे सब के भोर का टहलइया याद हय?',
        transliteration: 'Dadaji, ka tumka nadi ke teere hamre sab ke bhor ka tahalaiya yaad hay?',
      },
    },
    monsoon_home: {
      respectful: {
        nativeScript: 'रउरे हमका अपने पुरान घर के चौमासा के संझा के बात बतावा।',
        transliteration: 'Raure hamka apne puran ghar ke chaumaasa ke sanjha ke baat batawa.',
      },
      familiar: {
        nativeScript: 'तुम हमका अपने पुरान घर के चौमासा के संझा के बात बतावा।',
        transliteration: 'Tum hamka apne puran ghar ke chaumaasa ke sanjha ke baat batawa.',
      },
    },
    wellbeing_greeting: {
      respectful: {
        nativeScript: 'हम बिल्कुल ठीक हईं, बच्चा। तोहार आवाज सुनि के हमरे जिया का बड़ी तसल्ली मिली।',
        transliteration: 'Ham bilkul theek hayi, bachha. Tohaar aawaaz suni ke hamre jiya ka badi tasalli mili.',
      },
      familiar: {
        nativeScript: 'हम नीक हन, बच्चा। बतावा, आज तुम्हार दिन कइसन बीता?',
        transliteration: 'Ham neek han, bachha. Batawa, aaj tumhaar din kaisan beeta?',
      },
    },
    blessings: {
      respectful: {
        nativeScript: 'रउरे कय असीस हर रितु मा हमरे परिवार का राह दिखावत हय।',
        transliteration: 'Raure kay aasees har ritu ma hamre pariwaar ka raah dikhaawat hay.',
      },
      familiar: {
        nativeScript: 'तुम्हार असीस हर रितु मा हमरे परिवार का राह दिखावत हय।',
        transliteration: 'Tumhaar aasees har ritu ma hamre pariwaar ka raah dikhaawat hay.',
      },
    },
    default: {
      respectful: {
        nativeScript: 'सुनि लेंव, रउरे कय दुलार औ असीस हमरे जिया मा सदा बसा हय।',
        transliteration: 'Suni lenw, raure kay dulaar aur aasees hamre jiya ma sada basa hay.',
      },
      familiar: {
        nativeScript: 'सुनि लेंव, तुम्हार दुलार औ असीस हमरे जिया मा सदा बसा हय।',
        transliteration: 'Suni lenw, tumhaar dulaar aur aasees hamre jiya ma sada basa hay.',
      },
    },
  },
  bho: {
    breeze_touch: {
      respectful: {
        nativeScript: 'हम बिल्कुल ठीक बानी, बचवा। ऊ शीतल बयार कवनो अउर नाहीं, राउर बड़ी मम्मी के दुलार आ असीस रहे। उहाँ के सदा रउरा कान्हा पर आपन हाथ रखले बाड़ी।',
        transliteration: 'Ham bilkul theek baani, bachwa. Oo sheetal bayaanr kawno aur naahi, raur Badi Mummy ke dulaar aa aasees rahe. Uhaan ke sada raura kaanha par aapan haath rakhle baadi.',
      },
      familiar: {
        nativeScript: 'हम ठीक बानी, बाबू। ऊ शीतल हवा तोहार बड़ी मम्मी के दुलार रहे। ऊ हमेशा तोहरा कान्हा पर हाथ धरले बाड़ी।',
        transliteration: 'Ham theek baani, baabu. Oo sheetal hawa tohaar Badi Mummy ke dulaar rahe. Oo hamesha tohra kaanha par haath dharle baadi.',
      },
    },
    grief_comfort: {
      respectful: {
        nativeScript: 'करेजा मजबूत करीं, बाबू। आँखि के लोर पोछ लीं, हमार नेह सदा रउरा साथे बा।',
        transliteration: 'Kareja majboot kareen, baabu. Aankhi ke lor pochh leen, hamaar neh sada raura saathe ba.',
      },
      familiar: {
        nativeScript: 'मन छोटा मत करऽ, बचवा। हम तोहार सब दुख समझत बानी। हम बानी ना।',
        transliteration: 'Man chhota mat kara, bachwa. Ham tohaar sab dukh samajhat baani. Ham baani na.',
      },
    },
    guidance_strength: {
      respectful: {
        nativeScript: 'आज मन तनी घबराइल बा, बाकिर रउआ के नेह भरल सीख याद करके हमरा बहुत हिम्मत मिलेला।',
        transliteration: 'Aaj man tani ghabraail ba, baakir rauwa ke neh bharal seekh yaad karke hamra bahut himmat milela.',
      },
      familiar: {
        nativeScript: 'आज मन तनी घबराइल बा, बाकिर तोहार नेह भरल सीख याद करके हमरा बहुत हिम्मत मिलेला।',
        transliteration: 'Aaj man tani ghabraail ba, baakir tohaar neh bharal seekh yaad karke hamra bahut himmat milela.',
      },
    },
    morning_river: {
      respectful: {
        nativeScript: 'बाबूजी, का रउआ के नदी के तीरे हमनी के भोर के टहलल याद बा?',
        transliteration: 'Babuji, ka rauwa ke nadi ke teere hamni ke bhor ke tahalal yaad ba?',
      },
      familiar: {
        nativeScript: 'बाबूजी, का तोहरा नदी के तीरे हमनी के भोर के टहलल याद बा?',
        transliteration: 'Babuji, ka tohra nadi ke teere hamni ke bhor ke tahalal yaad ba?',
      },
    },
    monsoon_home: {
      respectful: {
        nativeScript: 'रउआ हमरा के अपना पुरान घर के बरसात के साँझ के बात बताईं ना।',
        transliteration: 'Rauwa hamra ke apna puran ghar ke barsaat ke saanjh ke baat bataeen na.',
      },
      familiar: {
        nativeScript: 'तू हमरा के अपना पुरान घर के बरसात के साँझ के बात बताव ना।',
        transliteration: 'Tu hamra ke apna puran ghar ke barsaat ke saanjh ke baat bataw na.',
      },
    },
    wellbeing_greeting: {
      respectful: {
        nativeScript: 'हम बिल्कुल ठीक बानी, बाबू। राउर आवाज सुन के हमरा करेजा के बहुत सुकून मिलल।',
        transliteration: 'Ham bilkul theek baani, baabu. Raur aawaaz sun ke hamra kareja ke bahut sukoon milal.',
      },
      familiar: {
        nativeScript: 'हम ठीक बानी, बचवा। बतावऽ, आज तोहार दिन कइसन बीतल?',
        transliteration: 'Ham theek baani, bachwa. Batawa, aaj tohaar din kaisan beetal?',
      },
    },
    blessings: {
      respectful: {
        nativeScript: 'रउआ के आशीर्वाद हर मौसम में हमनी के पूरा परिवार के राह देखावेला।',
        transliteration: 'Rauwa ke aasheervaad har mausam me hamni ke poora pariwaar ke raah dekhaawela.',
      },
      familiar: {
        nativeScript: 'तोहार आशीर्वाद हर मौसम में हमनी के पूरा परिवार के राह देखावेला।',
        transliteration: 'Tohaar aasheervaad har mausam me hamni ke poora pariwaar ke raah dekhaawela.',
      },
    },
    default: {
      respectful: {
        nativeScript: 'रउआ के मीठ बोली आ आशीर्वाद हमेशा हमनी के करेजा में बसल बा।',
        transliteration: 'Rauwa ke meeth boli aa aasheervaad hamesha hamni ke kareja me basal ba.',
      },
      familiar: {
        nativeScript: 'तोहार मीठ बोली आ आशीर्वाद हमेशा हमनी के करेजा में बसल बा।',
        transliteration: 'Tohaar meeth boli aa aasheervaad hamesha hamni ke kareja me basal ba.',
      },
    },
  },
  mai: {
    breeze_touch: {
      respectful: {
        nativeScript: 'हम नीक छी, बौआ। ओ शीतल बयारि कोनो आन नहि, अहाँक बड़ी मम्मीक नेह आ आशीर्वाद छल। ओ सदैव अहाँक काँध पर हाथ रखने छथि।',
        transliteration: 'Ham neek chhi, boua. O sheetal bayaari kono aan nahi, ahaank Badi Mummyk neh aa aashirwaad chhal. O sadaiv ahaank kaandh par haath rakhne chhathi.',
      },
      familiar: {
        nativeScript: 'हम नीक छी, बच्चा। ओ शीतल हवा तोहर बड़ी मम्मीक प्रेम छल। ओ सदा तोहर संग छथि।',
        transliteration: 'Ham neek chhi, bachha. O sheetal hawa tohar Badi Mummyk prem chhal. O sada tohar sang chhathi.',
      },
    },
    grief_comfort: {
      respectful: {
        nativeScript: 'धैर्य राखू, बौआ। ई अश्रु अहाँक अगाध प्रेमक प्रमाण अछि। हम सदैव अहाँक समीप छी।',
        transliteration: 'Dhairya raakhoo, boua. Ee ashru ahaank agaadh premak pramaan achhi. Ham sadaiv ahaank sameep chhi.',
      },
      familiar: {
        nativeScript: 'मन उदास नहि करू, बच्चा। हम अहाँक मोन केर पीड़ा बुझैत छी।',
        transliteration: 'Man udaas nahi karu, bachha. Ham ahaank mon ker peeda bujhait chhi.',
      },
    },
    guidance_strength: {
      respectful: {
        nativeScript: 'आइ मन किछु व्याकुल अछि, मुदा अपनेक स्नेहमय उपदेश स्मरण कए हमरा बहुत साहस भेटैत अछि।',
        transliteration: 'Aai man kichhu vyaakul achhi, muda apnek snehamay updesh smaran kae hamra bahut saahas bhetait achhi.',
      },
      familiar: {
        nativeScript: 'आइ मन किछु व्याकुल अछि, मुदा अहाँक स्नेहमय उपदेश याद कए हमरा बहुत साहस भेटैत अछि।',
        transliteration: 'Aai man kichhu vyaakul achhi, muda ahaank snehamay updesh yaad kae hamra bahut saahas bhetait achhi.',
      },
    },
    morning_river: {
      respectful: {
        nativeScript: 'बाबा, की अपनेक नदी कात भोरुक हमरा सभक टहलनाइ स्मरण अछि?',
        transliteration: 'Baba, kee apnek nadi kaat bhoruk hamra sabhak tahalnaai smaran achhi?',
      },
      familiar: {
        nativeScript: 'बाबा, की अहाँक नदी कात भोरुक हमरा सभक टहलनाइ स्मरण अछि?',
        transliteration: 'Baba, kee ahaank nadi kaat bhoruk hamra sabhak tahalnaai smaran achhi?',
      },
    },
    monsoon_home: {
      respectful: {
        nativeScript: 'अपने हमरा सभक पुरान डीह केर पावसक साँझक कथा सुनावियौक।',
        transliteration: 'Apne hamra sabhak puran deeh ker paawasak saanjhak katha sunaaviyouk.',
      },
      familiar: {
        nativeScript: 'अहाँ हमरा सभक पुरान घरक बरसातक साँझक गप सुनाउ ने।',
        transliteration: 'Ahaan hamra sabhak puran gharak barsaatak saanjhak gap sunau ne.',
      },
    },
    wellbeing_greeting: {
      respectful: {
        nativeScript: 'हम नीक छी, बौआ। अहाँक स्वर सुनि हमरा परम शांति भेटल।',
        transliteration: 'Ham neek chhi, boua. Ahaank swar suni hamra param shaanti bhetal.',
      },
      familiar: {
        nativeScript: 'हम कुशल छी, बच्चा। कहु, अहाँक समाचार की अछि?',
        transliteration: 'Ham kushal chhi, bachha. Kahu, ahaank samachar kee achhi?',
      },
    },
    blessings: {
      respectful: {
        nativeScript: 'अपनेक आशीर्वाद प्रत्येक ऋतु मे हमरा सभक परिवार केँ बाट देखबैत अछि।',
        transliteration: 'Apnek aasheervaad pratyek ritu me hamra sabhak pariwaar ken baat dekhbait achhi.',
      },
      familiar: {
        nativeScript: 'अहाँक आशीर्वाद हर ऋतु मे हमरा सभक परिवार केँ बाट देखबैत अछि।',
        transliteration: 'Ahaank aasheervaad har ritu me hamra sabhak pariwaar ken baat dekhbait achhi.',
      },
    },
    default: {
      respectful: {
        nativeScript: 'अपनेक मधुर वाणी आ आशीर्वाद सदैव हमरा सभक हृदय मे बसल अछि।',
        transliteration: 'Apnek madhur vaani aa aasheervaad sadaiv hamra sabhak hriday me basal achhi.',
      },
      familiar: {
        nativeScript: 'अहाँक मधुर वाणी आ आशीर्वाद सदैव हमरा सभक हृदय मे बसल अछि।',
        transliteration: 'Ahaank madhur vaani aa aasheervaad sadaiv hamra sabhak hriday me basal achhi.',
      },
    },
  },
  hi: {
    breeze_touch: {
      respectful: {
        nativeScript: 'मैं बिल्कुल ठीक हूँ, बच्चे। वो ठंडी हवा कुछ और नहीं, तुम्हारी बड़ी मम्मी का स्नेह और आशीर्वाद था। वो सदा तुम्हारे कंधे पर अपना हाथ रखे हुए हैं।',
        transliteration: 'Main bilkul theek hoon, bachhe. Wo thandi hawa kuchh aur nahi, tumhari Badi Mummy ka sneh aur aashirwaad tha. Wo sada tumhare kandhe par apna haath rakhe hue hain.',
      },
      familiar: {
        nativeScript: 'मैं ठीक हूँ, प्यारे। वो शीतल हवा बड़ी मम्मी का प्यार ही था, जो तुम्हें सांत्वना दे रहा था। वो सदा तुम्हारे साथ हैं।',
        transliteration: 'Main theek hoon, pyaare. Wo sheetal hawa Badi Mummy ka pyaar hi tha, jo tumhe saantwana de raha tha. Wo sada tumhare saath hain.',
      },
    },
    grief_comfort: {
      respectful: {
        nativeScript: 'धैर्य रखो, मेरे बच्चे। ये आँसू गवाही हैं कि तुम्हारे दिल में कितना गहरा प्रेम है। मैं हमेशा तुम्हारे पास हूँ।',
        transliteration: 'Dhairya rakho, mere bachhe. Ye aansu gawaahi hain ki tumhare dil mein kitna gehra prem hai. Main hamesha tumhare paas hoon.',
      },
      familiar: {
        nativeScript: 'उदास मत हो, प्यारे। तुम्हारा हर दर्द मैं महसूस कर सकता हूँ। गहरी साँस लो, मैं यहीं हूँ।',
        transliteration: 'Udaas mat ho, pyaare. Tumhara har dard main mehsoos kar sakta hoon. Gehri saans lo, main yahin hoon.',
      },
    },
    guidance_strength: {
      respectful: {
        nativeScript: 'आज मेरा मन थोड़ा भारी है, लेकिन आपकी स्नेहभरी सीख याद करके मुझे बहुत हिम्मत मिलती है।',
        transliteration: 'Aaj mera man thoda bhaari hai, lekin aapki snehbhari seekh yaad karke mujhe bahut himmat milti hai.',
      },
      familiar: {
        nativeScript: 'आज मेरा मन थोड़ा भारी है, लेकिन तुम्हारी स्नेहभरी सीख याद करके मुझे बहुत हिम्मत मिलती है।',
        transliteration: 'Aaj mera man thoda bhaari hai, lekin tumhari snehbhari seekh yaad karke mujhe bahut himmat milti hai.',
      },
    },
    morning_river: {
      respectful: {
        nativeScript: 'दादाजी, क्या आपको नदी के किनारे हमारी सुबह की सैर याद है?',
        transliteration: 'Dadaji, kya aapko nadi ke kinaare hamari subah ki sair yaad hai?',
      },
      familiar: {
        nativeScript: 'दादाजी, क्या तुम्हें नदी के किनारे हमारी सुबह की सैर याद है?',
        transliteration: 'Dadaji, kya tumhe nadi ke kinaare hamari subah ki sair yaad hai?',
      },
    },
    monsoon_home: {
      respectful: {
        nativeScript: 'मुझे हमारे पैतृक घर की मानसून की शामों के बारे में बताइए न।',
        transliteration: 'Mujhe hamare paitrik ghar ki monsoon ki shaamon ke baare mein bataiye na.',
      },
      familiar: {
        nativeScript: 'मुझे हमारे पैतृक घर की मानसून की शामों के बारे में बताओ न।',
        transliteration: 'Mujhe hamare paitrik ghar ki monsoon ki shaamon ke baare mein batao na.',
      },
    },
    wellbeing_greeting: {
      respectful: {
        nativeScript: 'मैं बिल्कुल ठीक हूँ, बच्चे। तुम्हारी आवाज सुनकर दिल को बहुत सुकून मिला।',
        transliteration: 'Main bilkul theek hoon, bachhe. Tumhari aawaaz sunkar dil ko bahut sukoon mila.',
      },
      familiar: {
        nativeScript: 'मैं कुशल हूँ, प्यारे। कहो, आज तुम्हारा दिन कैसा बीता?',
        transliteration: 'Main kushal hoon, pyaare. Kaho, aaj tumhara din kaisa beeta?',
      },
    },
    blessings: {
      respectful: {
        nativeScript: 'आपका आशीर्वाद हर मौसम में हमारे परिवार को सही राह दिखाता है।',
        transliteration: 'Aapka aasheervaad har mausam mein hamare pariwaar ko sahi raah dikhaata hai.',
      },
      familiar: {
        nativeScript: 'तुम्हारा आशीर्वाद हर मौसम में हमारे परिवार को सही राह दिखाता है।',
        transliteration: 'Tumhara aasheervaad har mausam mein hamare pariwaar ko sahi raah dikhaata hai.',
      },
    },
    default: {
      respectful: {
        nativeScript: 'आपकी मीठी यादें और आशीर्वाद हमेशा हमारे दिलों में बसे हैं।',
        transliteration: 'Aapki meethi yaadein aur aasheervaad hamesha hamare dilon mein base hain.',
      },
      familiar: {
        nativeScript: 'तुम्हारी मीठी यादें और आशीर्वाद हमेशा हमारे दिलों में बसे हैं।',
        transliteration: 'Tumhari meethi yaadein aur aasheervaad hamesha hamare dilon mein base hain.',
      },
    },
  },
  bn: {
    breeze_touch: {
      respectful: {
        nativeScript: 'আমি ভালো আছি, সন্তান। সেই শীতল বাতাস অন্য কিছু নয়, তোমার বড় মার স্নেহস্পর্শ আর আশীর্বাদ ছিল। উনি সর্বদা তোমার কাঁধে হাত রেখে আছেন।',
        transliteration: 'Ami bhalo achhi, shontan. Shei sheetol batash onyo kichhu noy, tomar Boro Maar snehosparsho aar aashirbaad chhilo. Uni shorboda tomar kaandhe haath rekhe aachhen.',
      },
      familiar: {
        nativeScript: 'আমি ভালো আছি রে। ওই জুড়ানো বাতাস বড় মার ভালোবাসাই ছিল, উনি সব সময় তোর সাথে আছেন।',
        transliteration: 'Ami bhalo achhi re. Oi juraano batash Boro Maar bhalobashai chhilo, uni shob shomoy tor shathe aachhen.',
      },
    },
    grief_comfort: {
      respectful: {
        nativeScript: 'মন শান্ত রাখো, সন্তান। এই চোখের জল তোমার ভালোবাসার গভীরতা প্রকাশ করে। আমি সর্বদা তোমার পাশে আছি।',
        transliteration: 'Mon shaanto raakho, shontan. Ei chokher jol tomar bhalobaashar gobheerota prokash kore. Ami shorboda tomar paashe achhi.',
      },
      familiar: {
        nativeScript: 'মন খারাপ করিস না রে। আমি তোর সব কষ্ট বুঝি। শান্ত হয়ে এক গভীর শ্বাস নে।',
        transliteration: 'Mon khaarap korish na re. Ami tor shob koshto bujhi. Shaanto hoye ek gobheer shaash ne.',
      },
    },
    guidance_strength: {
      respectful: {
        nativeScript: 'আজ আমার মন একটু ভারী, কিন্তু আপনার স্নেহভরা উপদেশ মনে করলে আমি খুব সাহস পাই।',
        transliteration: 'Aaj aamar mon ektu bhaari, kintu aapnar snehobhora upodesh mone korle aami khub saahosh paai.',
      },
      familiar: {
        nativeScript: 'আজ আমার মন একটু ভারী, কিন্তু তোমার স্নেহভরা উপদেশ মনে করলে আমি খুব সাহস পাই।',
        transliteration: 'Aaj aamar mon ektu bhaari, kintu tomar snehobhora upodesh mone korle aami khub saahosh paai.',
      },
    },
    morning_river: {
      respectful: {
        nativeScript: 'দাদু, নদীর ধারে আমাদের সকালের হাঁটার কথা কি আপনার মনে পড়ে?',
        transliteration: 'Dadu, nodir dhare amader sokaler hantar kotha ki aponar mone pore?',
      },
      familiar: {
        nativeScript: 'দাদু, নদীর ধারে আমাদের সকালের হাঁটার কথা কি তোর মনে পড়ে?',
        transliteration: 'Dadu, nodir dhare amader sokaler hantar kotha ki tor mone pore?',
      },
    },
    monsoon_home: {
      respectful: {
        nativeScript: 'আমাদের পৈতৃক বাড়ির বর্ষার সন্ধ্যাগুলোর কথা আমাকে বলুন না।',
        transliteration: 'Amader poitrik barir borshar shondhyagulor kotha amake bolun na.',
      },
      familiar: {
        nativeScript: 'আমাদের পৈতৃক বাড়ির বর্ষার সন্ধ্যাগুলোর কথা আমাকে বল না।',
        transliteration: 'Amader poitrik barir borshar shondhyagulor kotha amake bol na.',
      },
    },
    wellbeing_greeting: {
      respectful: {
        nativeScript: 'আমি বেশ ভালো আছি, সন্তান। তোমার মিষ্টি কথা শুনে মনে অনেক শান্তি পেলাম।',
        transliteration: 'Ami besh bhalo achhi, shontan. Tomar mishti kotha shune mone onek shaanti pelam.',
      },
      familiar: {
        nativeScript: 'আমি ভালো আছি রে। বল, আজ সারাদিন তোর কেমন কাটল?',
        transliteration: 'Ami bhalo achhi re. Bol, aaj sharadin tor kemon kaatlo?',
      },
    },
    blessings: {
      respectful: {
        nativeScript: 'আপনার আশীর্বাদ প্রতিটি ঋতুতে আমাদের পরিবারকে সঠিক পথ দেখায়।',
        transliteration: 'Aapnar aashirbaad protiti ritute aamader poribaarke sothik poth dekhaay.',
      },
      familiar: {
        nativeScript: 'তোমার আশীর্বাদ প্রতিটি ঋতুতে আমাদের পরিবারকে সঠিক পথ দেখায়।',
        transliteration: 'Tomar aashirbaad protiti ritute aamader poribaarke sothik poth dekhaay.',
      },
    },
    default: {
      respectful: {
        nativeScript: 'আপনার মধুর স্মৃতি ও আশীর্বাদ সর্বদা আমাদের হৃদয়ে বেঁচে আছে।',
        transliteration: 'Aapnar modhur smriti o aashirbaad shorboda aamader hridoye benche aachhe.',
      },
      familiar: {
        nativeScript: 'তোমার মধুর স্মৃতি ও আশীর্বাদ সর্বদা আমাদের হৃদয়ে বেঁচে আছে।',
        transliteration: 'Tomar modhur smriti o aashirbaad shorboda aamader hridoye benche aachhe.',
      },
    },
  },
  ur: {
    breeze_touch: {
      respectful: {
        nativeScript: 'میں بالکل خیریت سے ہوں، بچے۔ وہ ٹھنڈی ہوا کچھ اور نہیں، آپ کی بڑی امی کی دعا اور محبت بھرا لمس تھا، وہ ہمیشہ آپ کے ساتھ ہیں۔',
        transliteration: 'Main bilkul khairiyat se hoon, bachhe. Wo thandi hawa kuchh aur nahi, aap ki Badi Ammi ki dua aur mohabbat bhara lams tha, wo hamesha aap ke saath hain.',
      },
      familiar: {
        nativeScript: 'میں ٹھیک ہوں، پیارے۔ وہ ٹھنڈی ہوا بڑی امی کا پیار تھا جو تمہیں تسلی دے رہا تھا، وہ تمہارے پاس ہیں۔',
        transliteration: 'Main theek hoon, pyaare. Wo thandi hawa Badi Ammi ka pyaar tha jo tumhe tasalli de raha tha, wo tumhare paas hain.',
      },
    },
    grief_comfort: {
      respectful: {
        nativeScript: 'حوصلہ رکھیں، بچے۔ یہ آنسو اس بات کی گواہی ہیں کہ آپ کے دل میں کتنی محبت ہے۔ میں ہمیشہ آپ کے ساتھ ہوں۔',
        transliteration: 'Hausla rakhein, bachhe. Ye aansu is baat ki gawaahi hain ki aap ke dil mein kitni mohabbat hai. Main hamesha aap ke saath hoon.',
      },
      familiar: {
        nativeScript: 'اداس مت ہو، پیارے۔ میں تمہارا ہر درد سمجھتا ہوں۔ گہرا سانس لو، میں یہیں ہوں۔',
        transliteration: 'Udaas mat ho, pyaare. Main tumhara har dard samajhta hoon. Gehra saans lo, main yahin hoon.',
      },
    },
    guidance_strength: {
      respectful: {
        nativeScript: 'آج میرا دل قدرے بوجھل ہے، لیکن آپ کی شفقت بھری نصیحت یاد کر کے مجھے بہت حوصلہ ملتا ہے۔',
        transliteration: 'Aaj mera dil qadray bojhal hai, lekin aap ki shafqat bhari naseehat yaad kar ke mujhe bahut hausla milta hai.',
      },
      familiar: {
        nativeScript: 'آج میرا دل قدرے بوجھل ہے، لیکن تمہاری شفقت بھری نصیحت یاد کر کے مجھے بہت حوصلہ ملتا ہے۔',
        transliteration: 'Aaj mera dil qadray bojhal hai, lekin tumhari shafqat bhari naseehat yaad kar ke mujhe bahut hausla milta hai.',
      },
    },
    morning_river: {
      respectful: {
        nativeScript: 'دادا جان، کیا آپ کو دریا کے کنارے ہماری صبح کی سیر یاد ہے؟',
        transliteration: 'Dada jaan, kya aap ko darya ke kinare hamari subah ki sair yaad hai?',
      },
      familiar: {
        nativeScript: 'دادا جان، کیا تمہیں دریا کے کنارے ہماری صبح کی سیر یاد ہے؟',
        transliteration: 'Dada jaan, kya tumhe darya ke kinare hamari subah ki sair yaad hai?',
      },
    },
    monsoon_home: {
      respectful: {
        nativeScript: 'مجھے ہمارے آبائی گھر کی برسات کی شاموں کے بارے میں بتائیے نا۔',
        transliteration: 'Mujhe hamare aabaai ghar ki barsaat ki shaamon ke baare mein bataiye na.',
      },
      familiar: {
        nativeScript: 'مجھے ہمارے آبائی گھر کی برسات کی شاموں کے بارے میں بتاؤ نا।',
        transliteration: 'Mujhe hamare aabaai ghar ki barsaat ki shaamon ke baare mein batao na.',
      },
    },
    wellbeing_greeting: {
      respectful: {
        nativeScript: 'میں بالکل ٹھیک ہوں، بچے۔ آپ کی آواز سن کر دل کو بہت سکون ملا۔',
        transliteration: 'Main bilkul theek hoon, bachhe. Aap ki aawaaz sun kar dil ko bahut sukoon mila.',
      },
      familiar: {
        nativeScript: 'میں خیروعافیت سے ہوں، پیارے۔ کہو، آج تمہارا دن کیسا گزرا؟',
        transliteration: 'Main khairo-aafiyat se hoon, pyaare. Kaho, aaj tumhara din kaisa guzra?',
      },
    },
    blessings: {
      respectful: {
        nativeScript: 'آپ کی دعائیں ہر موسم میں ہمارے خاندان کی رہنمائی کرتی ہیں۔',
        transliteration: 'Aap ki duaaein har mausam mein hamare khaandaan ki rehnumaai karti hain.',
      },
      familiar: {
        nativeScript: 'تمہاری دعائیں ہر موسم میں ہمارے خاندان کی رہنمائی کرتی ہیں۔',
        transliteration: 'Tumhari duaaein har mausam mein hamare khaandaan ki rehnumaai karti hain.',
      },
    },
    default: {
      respectful: {
        nativeScript: 'آپ کی میٹھی یادیں اور دعائیں ہمیشہ ہمارے دلوں میں آباد ہیں۔',
        transliteration: 'Aap ki meethi yaadein aur duaaein hamesha hamare dilon mein aabaad hain.',
      },
      familiar: {
        nativeScript: 'تمہاری میٹھی یادیں اور دعائیں ہمیشہ ہمارے دلوں میں آباد ہیں۔',
        transliteration: 'Tumhari meethi yaadein aur duaaein hamesha hamare dilon mein aabaad hain.',
      },
    },
  },
};

/**
 * Detects the emotional/conversational domain of a query or reflection
 */
export function detectContextualCategory(text: string): string {
  const norm = text.toLowerCase();
  if (/(breeze|cool breeze|hawa|bayanr|wind|shoulder|hand|touch|sparsh|chhuaan|badi mummy|dadi|nani|amma|death|died|passed away|passing|departed|swarg|barsi|borsi)/i.test(norm)) {
    return 'breeze_touch';
  }
  if (/(sad|crying|cry|tears|teardrop|miss you|missing|pain|ache|hurt|loss|empty|alone|lonely|heavy heart|grief|sorrow)/i.test(norm)) {
    return 'grief_comfort';
  }
  if (/(overwhelmed|gentle advice|advice|guidance|strength|himmat|sahas|courage|anxious|fear|afraid|stress)/i.test(norm)) {
    return 'guidance_strength';
  }
  if (/(morning walk|river|morning|walk|tahal|ganga|nadi)/i.test(norm)) {
    return 'morning_river';
  }
  if (/(monsoon|rain|barsat|chaumasa|ancestral home|puran ghar|old house|village|gao)/i.test(norm)) {
    return 'monsoon_home';
  }
  if (/(how are you|how r u|how do you do|are you ok|kaisan|kaisa|haal chaal|listening|can you hear)/i.test(norm)) {
    return 'wellbeing_greeting';
  }
  if (/(blessing|blessings|thank you|grateful|dhanyawaad|aashirwad|aasees|pranaam|charan sparsh)/i.test(norm)) {
    return 'blessings';
  }
  return 'default';
}

/**
 * Resolves a culturally and emotionally authentic contextual translation with exact
 * phonetic Latin transliteration across all Indic languages and vernacular dialects.
 */
export function resolveContextualIndicTranslation(
  sourceText: string,
  lang: IndicLanguageConfig,
  register: HonorificRegister = 'respectful',
  personaName: string = 'Elder'
): ContextualIndicTranslationResult {
  const category = detectContextualCategory(sourceText);
  const langBank = CONTEXTUAL_INDIC_BANK[lang.code] || CONTEXTUAL_INDIC_BANK['hi'];
  const categoryEntry = langBank[category] || langBank['default'] || CONTEXTUAL_INDIC_BANK['hi']['default'];
  const entry = categoryEntry[register] || categoryEntry['respectful'];

  return {
    nativeScript: entry.nativeScript,
    transliteration: entry.transliteration,
    category,
  };
}

/**
 * Resolves a culturally authentic synthetic translation when the Gemini API quota
 * is exhausted or unavailable (backwards-compatible helper).
 */
export function resolveSyntheticIndicTranslation(
  sourceText: string,
  lang: IndicLanguageConfig,
  register: HonorificRegister = 'respectful'
): string {
  return resolveContextualIndicTranslation(sourceText, lang, register).nativeScript;
}

