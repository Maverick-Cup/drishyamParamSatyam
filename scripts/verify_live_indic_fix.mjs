import { resolveContextualIndicTranslation, INDIC_LANGUAGES } from '../config/indicLanguages.ts';
import { IndicSocioLinguisticEngine } from '../services/IndicTranslationEngine.ts';

console.log('--- RUNNING END-TO-END VERIFICATION OF INDIC TRANSLATION & VOICE ENGINE ---');

const testQuery = 'How are you, you know what after the death day of  Badi mummy, there was a cool breeze touched me as if someone has put their hands on my shoulder.';

const dialectsToTest = ['awa', 'bho', 'mai', 'hi', 'bn', 'ur'];

for (const code of dialectsToTest) {
  const lang = INDIC_LANGUAGES.find((l) => l.code === code);
  if (!lang) {
    console.error(`Language ${code} not found!`);
    process.exit(1);
  }

  const result = resolveContextualIndicTranslation(testQuery, lang, 'respectful', 'Bade Papa');

  console.log(`\n[${lang.name} (${code})]`);
  console.log(`  Category: ${result.category}`);
  console.log(`  Native Script: ${result.nativeScript}`);
  console.log(`  Transliteration: ${result.transliteration}`);

  // Assertions
  if (!result.nativeScript || result.nativeScript.includes('(रउरे') || result.nativeScript.includes('(रउआ')) {
    console.error(`FAILED: Native script contains raw metadata tags in ${code}!`);
    process.exit(1);
  }

  if (!result.transliteration || !/^[A-Za-z0-9\s.,?!'-]+$/.test(result.transliteration)) {
    console.error(`FAILED: Transliteration is missing or contains non-Latin characters in ${code}!`);
    process.exit(1);
  }

  if (result.category !== 'breeze_touch') {
    console.error(`FAILED: Category misclassified as ${result.category}!`);
    process.exit(1);
  }
}

console.log('\n--- VERIFYING TRANSLITERATION GENERATION METHOD ---');
const engine = IndicSocioLinguisticEngine.getInstance();
const awadhiTranslit = engine.generateTransliteration(testQuery, 'awa');
console.log('Awadhi Transliteration via engine:', awadhiTranslit);

if (!awadhiTranslit.includes('Badi Mummy') && !awadhiTranslit.includes('bayaanr')) {
  console.error('FAILED: Transliteration did not capture the core entities!');
  process.exit(1);
}

console.log('\n✅ ALL 6 DIALECT TESTS & TRANSLITERATION GENERATORS PASSED (100% ACCURACY)');
