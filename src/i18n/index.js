import en from './en';
import cs from './cs';

export const DEFAULT_LANGUAGE = 'en';

// nativeName is always shown in its own language, regardless of the
// currently active UI language, so people can find their language even if
// they can't read the one currently selected.
export const LANGUAGES = [
  { code: 'en', nativeName: 'English', flag: '🇬🇧' },
  { code: 'cs', nativeName: 'Čeština', flag: '🇨🇿' },
];

const TRANSLATIONS = { en, cs };

function getNested(dict, key) {
  return key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), dict);
}

export function translate(language, key, vars) {
  const dict = TRANSLATIONS[language] || TRANSLATIONS[DEFAULT_LANGUAGE];
  const template = getNested(dict, key) ?? getNested(TRANSLATIONS[DEFAULT_LANGUAGE], key) ?? key;
  if (typeof template !== 'string' || !vars) return template;
  return Object.keys(vars).reduce((str, k) => str.split(`{{${k}}}`).join(vars[k]), template);
}
