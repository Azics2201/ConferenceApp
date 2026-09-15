// Normalizes a content field into a { en, cs } pair for editing. Handles
// three shapes: already-bilingual seed data ({en, cs}), a legacy plain
// string from before dual-language input was mandatory (pre-fills both
// boxes with the same text as a starting point — the admin then edits the
// Czech box to actually translate it), and nothing yet (new item).
export function toBilingual(field) {
  if (field && typeof field === 'object' && !Array.isArray(field)) {
    return { en: field.en || '', cs: field.cs || '' };
  }
  return { en: field || '', cs: field || '' };
}

export function isBilingualFilled(field) {
  return !!(field && field.en && field.en.trim() && field.cs && field.cs.trim());
}
