// Comprehensive Profanity and Obscenity Filter for Russian & English
// Designed for school environment (ClassMate AI)

// Common character replacements to evade filters
const CHAR_MAP = {
  'a': 'а', 'e': 'е', 'o': 'о', 'p': 'р', 'c': 'с', 'y': 'у', 'x': 'х', 'k': 'к', 't': 'т',
  'b': 'б', 'm': 'м', 'h': 'н',
  '@': 'а', '0': 'о', '1': 'и', '3': 'з', '4': 'ч', '6': 'б', '$': 'с'
};

function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .split('')
    .map(ch => CHAR_MAP[ch] || ch)
    .join('')
    // Remove repeated punctuation / symbols between letters (e.g. х.у.й, п*з*д*а)
    .replace(/[^а-яёa-z0-9\s]/gi, '');
}

// Regex patterns for Russian and English profanities, obscenities and slurs
const FORBIDDEN_PATTERNS = [
  // Russian core obscenity roots (мат)
  /\bх[уеёюя][йяеию]/i,
  /х[уеёю]й[лояе]/i,
  /\bпизд[аеыуио]/i,
  /\bп[еи]зд[ео]/i,
  /\bеб[аеёиоут]/i,
  /\b[её]б[а-я]/i,
  /\b[взпд]ъ?[её]б/i,
  /\b[взпд]ы[её]б/i,
  /\bбля[дт]/i,
  /\bсук[аеиой]/i,
  /\bсуч[а-я]/i,
  /\bмуд[аоеи]/i,
  /\bгандон[а-я]*/i,
  /\bгондон[а-я]*/i,
  /\bзалуп[аеыу]/i,
  /\bшлюх[аеиу]/i,
  /\bчлен[а-я]*/i,
  /\bдроч[а-я]*/i,
  /\bсперм[а-я]*/i,
  /\bпорн[оа-я]*/i,
  /\bанал[ьн]*/i,
  /\bговно\b/i,
  /\bговн[аеуы]/i,
  /\bдерьм[оа-я]*/i,
  /\bсос[иу] [а-я]*/i,
  /\bотсос[а-я]*/i,
  /\bпидор[а-я]*/i,
  /\bпидар[а-я]*/i,
  /\bпедик[а-я]*/i,
  /\bдолбо[её]б[а-я]*/i,
  /\bу[её]б[а-я]*/i,
  /\bшмар[а-я]*/i,

  // English profanities
  /\bfuck/i,
  /\bshit/i,
  /\bbitch/i,
  /\basshole/i,
  /\bdick/i,
  /\bcunt/i,
  /\bpussy/i,
  /\bwhore/i,
  /\bslut/i,
  /\bporn/i
];

/**
 * Checks if the text contains any forbidden or obscene words.
 * @param {string} text 
 * @returns {boolean}
 */
export function containsProfanity(text) {
  if (!text || typeof text !== 'string') return false;

  const normalized = normalizeText(text);

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(text) || pattern.test(normalized)) {
      return true;
    }
  }

  // Also check single token words without spaces
  const noSpaces = normalized.replace(/\s+/g, '');
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(noSpaces)) {
      return true;
    }
  }

  return false;
}

/**
 * Validates text for reviews or user input.
 * Returns { isValid: boolean, error?: string }
 */
export function validateReviewText(text) {
  if (!text || !text.trim()) {
    return { isValid: false, error: 'Пожалуйста, напишите текст отзыва.' };
  }

  const clean = text.trim();
  if (clean.length < 10) {
    return { isValid: false, error: 'Текст отзыва слишком короткий (минимум 10 символов).' };
  }

  if (clean.length > 1500) {
    return { isValid: false, error: 'Текст отзыва слишком длинный (максимум 1500 символов).' };
  }

  if (containsProfanity(clean)) {
    return {
      isValid: false,
      error: 'Отзыв содержит нецензурные или непристойные выражения. Пожалуйста, соблюдайте правила школьного сервиса.'
    };
  }

  // Check for meaningless repeated spam letters (e.g. "аааааааааааааа" or "ыыыыыыы")
  if (/(.)\1{6,}/i.test(clean)) {
    return { isValid: false, error: 'Отзыв содержит повторяющиеся символы (похоже на спам).' };
  }

  return { isValid: true };
}

/**
 * Replaces offensive words with asterisks.
 */
export function censorProfanity(text) {
  if (!text || typeof text !== 'string') return text;
  let censored = text;
  for (const pattern of FORBIDDEN_PATTERNS) {
    censored = censored.replace(new RegExp(pattern.source, 'gi'), '***');
  }
  return censored;
}
