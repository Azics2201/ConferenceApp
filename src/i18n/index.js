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

// Resolves a *content* field (as opposed to a t() dictionary key) to the
// active language. Seed data (src/data/*.js) stores translatable fields as
// { en: '...', cs: '...' } objects; this picks the right one, falling back
// to English then to whatever value exists. A plain string or array passes
// straight through unchanged — that's exactly what a field looks like when
// it was created or edited through an admin form (Manage Program/Speakers/
// Org Info), since those forms only have one text input per field and know
// nothing about translation. There is currently no way for such content to
// become bilingual automatically; see CLAUDE.md's Internationalization
// section for what adding that would take.
export function localizeField(field, language) {
  if (field == null || typeof field === 'string' || Array.isArray(field)) return field;
  if (typeof field === 'object' && (DEFAULT_LANGUAGE in field || language in field)) {
    return field[language] ?? field[DEFAULT_LANGUAGE] ?? Object.values(field)[0];
  }
  return field;
}
