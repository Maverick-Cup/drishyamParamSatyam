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

/**
 * Resolves a culturally authentic synthetic translation when the Gemini API quota
 * is exhausted or unavailable.
 */
export function resolveSyntheticIndicTranslation(
  sourceText: string,
  lang: IndicLanguageConfig,
  register: HonorificRegister = 'respectful'
): string {
  const normalized = sourceText.trim().toLowerCase();

  if (normalized.includes('morning walks') || normalized.includes('river')) {
    return lang.syntheticSamples['1'][register];
  }
  if (normalized.includes('overwhelmed') || normalized.includes('gentle advice')) {
    return lang.syntheticSamples['2'][register];
  }
  if (normalized.includes('monsoon') || normalized.includes('ancestral home')) {
    return lang.syntheticSamples['3'][register];
  }
  if (normalized.includes('blessings') || normalized.includes('every season')) {
    return lang.syntheticSamples['4'][register];
  }

  return `${lang.syntheticSamples.default[register]} (${lang.honorifics[register === 'respectful' ? 'respectfulPronoun' : 'familiarPronoun']} • ${lang.nativeName})`;
}
