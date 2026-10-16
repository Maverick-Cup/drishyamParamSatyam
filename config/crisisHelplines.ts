/**
 * Multi-Region Emergency & Crisis Support Directory
 * Verified Government and Major Active NGO Helplines
 * Regions: India, Turkey, Canada, Sweden, United Kingdom, United States, Brazil
 */

export interface CrisisContact {
  name: string;
  type: 'GOVERNMENT' | 'NGO';
  number: string;
  displayNumber: string;
  availableHours: string;
  description: string;
  website?: string;
}

export interface RegionCrisisDirectory {
  countryCode: string;
  countryName: string;
  flag: string;
  emergencyNumber: string;
  contacts: CrisisContact[];
}

export const CRISIS_DIRECTORIES: Record<string, RegionCrisisDirectory> = {
  IN: {
    countryCode: 'IN',
    countryName: 'India',
    flag: '🇮🇳',
    emergencyNumber: '112',
    contacts: [
      {
        name: 'Tele-MANAS (Govt of India)',
        type: 'GOVERNMENT',
        number: '14416',
        displayNumber: '14416 / 1800-891-4416',
        availableHours: '24/7 (Free, Multi-lingual)',
        description: 'National tele-mental health programme providing comprehensive mental health care services.',
        website: 'https://telemanas.mohfw.gov.in',
      },
      {
        name: 'KIRAN Mental Health Helpline',
        type: 'GOVERNMENT',
        number: '18005990019',
        displayNumber: '1800-599-0019',
        availableHours: '24/7 (Free)',
        description: 'Ministry of Social Justice helpline for psychological first-aid and crisis management.',
      },
      {
        name: 'Vandrevala Foundation',
        type: 'NGO',
        number: '+919999666555',
        displayNumber: '+91 9999 666 555',
        availableHours: '24/7',
        description: 'Free, confidential psychological counseling and emotional crisis intervention.',
        website: 'https://www.vandrevalafoundation.com',
      },
    ],
  },
  TR: {
    countryCode: 'TR',
    countryName: 'Turkey',
    flag: '🇹🇷',
    emergencyNumber: '112',
    contacts: [
      {
        name: 'Alo 182 / MHRS & Sağlık Bakanlığı',
        type: 'GOVERNMENT',
        number: '182',
        displayNumber: '182',
        availableHours: '24/7',
        description: 'T.C. Sağlık Bakanlığı Merkezi Hekim Randevu ve Psikiyatri Danışma Hattı.',
      },
      {
        name: '112 Acil Çağrı Merkezi',
        type: 'GOVERNMENT',
        number: '112',
        displayNumber: '112',
        availableHours: '24/7',
        description: 'Türkiye geneli birleşik acil durum ve ruh sağlığı acil kriz müdahale hattı.',
      },
      {
        name: 'Hayat Sırdaşı İntihar Önleme Hattı',
        type: 'NGO',
        number: '08504550022',
        displayNumber: '0850 455 00 22',
        availableHours: '09:00 - 21:00',
        description: 'Ruh sağlığı ve krizdeki bireylere yönelik gizli destek ve psikososyal yardım hattı.',
      },
    ],
  },
  CA: {
    countryCode: 'CA',
    countryName: 'Canada',
    flag: '🇨🇦',
    emergencyNumber: '911',
    contacts: [
      {
        name: '988 Suicide Crisis Helpline',
        type: 'GOVERNMENT',
        number: '988',
        displayNumber: 'Call or Text 988',
        availableHours: '24/7 (Bilingual: English & French)',
        description: 'National suicide prevention service funded by the Public Health Agency of Canada.',
        website: 'https://988.ca',
      },
      {
        name: 'Hope for Wellness Helpline',
        type: 'GOVERNMENT',
        number: '18552423310',
        displayNumber: '1-855-242-3310',
        availableHours: '24/7',
        description: 'Immediate mental health counseling and crisis intervention to all Indigenous peoples across Canada.',
      },
      {
        name: 'Kids Help Phone',
        type: 'NGO',
        number: '18006686868',
        displayNumber: '1-800-668-6868 (or text 686868)',
        availableHours: '24/7',
        description: "Canada's national 24/7 bilingual mental health service for young people and families.",
      },
    ],
  },
  SE: {
    countryCode: 'SE',
    countryName: 'Sweden',
    flag: '🇸🇪',
    emergencyNumber: '112',
    contacts: [
      {
        name: 'Mind Självmordslinjen',
        type: 'NGO',
        number: '90101',
        displayNumber: '90101 (Tel & Chat)',
        availableHours: '24/7',
        description: 'Sveriges nationella stödlinje för personer som känner att de inte orkar leva.',
        website: 'https://mind.se/hitta-hjalp/sjalvmordslinjen/',
      },
      {
        name: '1177 Vårdguiden Psykiatri',
        type: 'GOVERNMENT',
        number: '1177',
        displayNumber: '1177',
        availableHours: '24/7',
        description: 'Sjukvårdsrådgivning och bedömning av psykiatriskt vårdbehov dygnet runt.',
        website: 'https://www.1177.se',
      },
      {
        name: 'Jourhavande Medmänniska',
        type: 'NGO',
        number: '087021680',
        displayNumber: '08-702 16 80',
        availableHours: '21:00 - 06:00 alla nätter',
        description: 'Nattlig telefonjour för emotionellt stöd och samtal.',
      },
    ],
  },
  GB: {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    flag: '🇬🇧',
    emergencyNumber: '999',
    contacts: [
      {
        name: 'Samaritans',
        type: 'NGO',
        number: '116123',
        displayNumber: '116 123 (Freephone)',
        availableHours: '24/7',
        description: 'Confidential emotional support for anyone in distress, struggling to cope, or at risk of suicide.',
        website: 'https://www.samaritans.org',
      },
      {
        name: 'NHS 111 Mental Health Services',
        type: 'GOVERNMENT',
        number: '111',
        displayNumber: '111 (Select mental health)',
        availableHours: '24/7',
        description: 'Direct assessment and connection to urgent NHS mental health services.',
      },
      {
        name: 'Shout Crisis Text Line',
        type: 'NGO',
        number: '85258',
        displayNumber: 'Text SHOUT to 85258',
        availableHours: '24/7',
        description: 'Free, confidential, 24/7 text messaging support service.',
      },
    ],
  },
  US: {
    countryCode: 'US',
    countryName: 'United States',
    flag: '🇺🇸',
    emergencyNumber: '911',
    contacts: [
      {
        name: '988 Suicide & Crisis Lifeline',
        type: 'GOVERNMENT',
        number: '988',
        displayNumber: 'Call or Text 988',
        availableHours: '24/7 (Free, English & Spanish)',
        description: 'National network of local crisis centers providing free and confidential emotional support.',
        website: 'https://988lifeline.org',
      },
      {
        name: 'Crisis Text Line',
        type: 'NGO',
        number: '741741',
        displayNumber: 'Text HOME to 741741',
        availableHours: '24/7',
        description: 'Free 24/7 support for people in crisis, connecting texters with trained volunteer counselors.',
      },
      {
        name: 'Veterans Crisis Line',
        type: 'GOVERNMENT',
        number: '988',
        displayNumber: '988, then Press 1',
        availableHours: '24/7',
        description: 'Confidential crisis support for Veterans, service members, and their families.',
      },
    ],
  },
  BR: {
    countryCode: 'BR',
    countryName: 'Brazil',
    flag: '🇧🇷',
    emergencyNumber: '192',
    contacts: [
      {
        name: 'CVV - Centro de Valorização da Vida',
        type: 'NGO',
        number: '188',
        displayNumber: '188 (Ligação gratuita)',
        availableHours: '24/7',
        description: 'Apoio emocional e prevenção do suicídio, atendendo voluntária e gratuitamente.',
        website: 'https://www.cvv.org.br',
      },
      {
        name: 'SAMU - Serviço de Atendimento Móvel de Urgência',
        type: 'GOVERNMENT',
        number: '192',
        displayNumber: '192',
        availableHours: '24/7',
        description: 'Atendimento móvel pré-hospitalar para urgências e emergências psiquiátricas.',
      },
      {
        name: 'CAPS - Centro de Atenção Psicossocial (SUS)',
        type: 'GOVERNMENT',
        number: '136',
        displayNumber: 'Disque Saúde 136',
        availableHours: '24/7',
        description: 'Rede pública especializada de atenção à saúde mental do Ministério da Saúde.',
      },
    ],
  },
};
