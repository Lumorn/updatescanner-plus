/**
 * Heuristiken zur Bewertung kleiner Änderungen.
 *
 * @param {string} prevText - Vorheriger Text.
 * @param {string} nextText - Neuer Text.
 * @param {object} options - Heuristik-Optionen.
 * @param {?number} options.minChangeChars - Minimale Änderung in Zeichen.
 * @param {?number} options.minChangeWords - Minimale Änderung in Wörtern.
 * @param {?number} options.levenshteinThreshold - Relative Levenshtein-Schwelle (0-1).
 * @returns {boolean} True, wenn die Änderung ignoriert werden soll.
 */
export function shouldIgnoreChange(prevText, nextText, options = {}) {
  const minChangeChars = normalizeNonNegative(options.minChangeChars);
  const minChangeWords = normalizeNonNegative(options.minChangeWords);
  const levenshteinThreshold = normalizeRatio(options.levenshteinThreshold);

  if (minChangeChars === 0 && minChangeWords === 0 && levenshteinThreshold === 0) {
    return false;
  }

  const safePrevText = String(prevText ?? '');
  const safeNextText = String(nextText ?? '');
  if (safePrevText === safeNextText) {
    return true;
  }

  const maxLength = Math.max(safePrevText.length, safeNextText.length);
  const maxDistanceForRatio = levenshteinThreshold > 0
    ? Math.ceil(maxLength * levenshteinThreshold)
    : 0;
  const maxCharDistance = Math.max(minChangeChars, maxDistanceForRatio);
  const charDistance = maxCharDistance > 0
    ? getLevenshteinDistance(safePrevText, safeNextText, maxCharDistance)
    : null;

  if (minChangeChars > 0 && charDistance !== null && charDistance <= minChangeChars) {
    return true;
  }

  if (levenshteinThreshold > 0 && charDistance !== null &&
    charDistance <= maxDistanceForRatio) {
    return true;
  }

  if (minChangeWords > 0) {
    const prevWords = extractWords(safePrevText);
    const nextWords = extractWords(safeNextText);
    const wordDistance = getLevenshteinDistance(prevWords, nextWords, minChangeWords);
    if (wordDistance <= minChangeWords) {
      return true;
    }
  }

  return false;
}

/**
 * Normalisiert Zahlenwerte auf >= 0.
 *
 * @param {?number} value - Eingabewert.
 * @returns {number} Normalisierter Wert.
 */
function normalizeNonNegative(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }
  return Math.max(0, parsed);
}

/**
 * Normalisiert eine Ratio in den Bereich 0..1.
 *
 * @param {?number} value - Eingabewert.
 * @returns {number} Normalisierte Ratio.
 */
function normalizeRatio(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, parsed));
}

/**
 * Ermittelt die Levenshtein-Distanz mit optionalem Abbruch.
 *
 * @param {string|Array} first - Erste Sequenz.
 * @param {string|Array} second - Zweite Sequenz.
 * @param {?number} maxDistance - Optionaler Maximalwert für Early-Exit.
 * @returns {number} Levenshtein-Distanz.
 */
function getLevenshteinDistance(first, second, maxDistance = null) {
  const seqA = toSequence(first);
  const seqB = toSequence(second);
  const lenA = seqA.length;
  const lenB = seqB.length;

  if (lenA === 0) {
    return lenB;
  }
  if (lenB === 0) {
    return lenA;
  }
  if (maxDistance !== null && Math.abs(lenA - lenB) > maxDistance) {
    return maxDistance + 1;
  }

  let prevRow = new Array(lenB + 1);
  let nextRow = new Array(lenB + 1);
  for (let j = 0; j <= lenB; j += 1) {
    prevRow[j] = j;
  }

  for (let i = 1; i <= lenA; i += 1) {
    nextRow[0] = i;
    let minInRow = nextRow[0];
    for (let j = 1; j <= lenB; j += 1) {
      const cost = seqA[i - 1] === seqB[j - 1] ? 0 : 1;
      const deletion = prevRow[j] + 1;
      const insertion = nextRow[j - 1] + 1;
      const substitution = prevRow[j - 1] + cost;
      const value = Math.min(deletion, insertion, substitution);
      nextRow[j] = value;
      if (value < minInRow) {
        minInRow = value;
      }
    }
    if (maxDistance !== null && minInRow > maxDistance) {
      return maxDistance + 1;
    }
    const swap = prevRow;
    prevRow = nextRow;
    nextRow = swap;
  }

  return prevRow[lenB];
}

/**
 * Liefert eine Sequenz für die Distanzberechnung.
 *
 * @param {string|Array} value - Eingabewert.
 * @returns {Array} Sequenz.
 */
function toSequence(value) {
  if (Array.isArray(value)) {
    return value;
  }
  return Array.from(String(value ?? ''));
}

/**
 * Extrahiert Wörter aus dem Text.
 *
 * @param {string} text - Eingabetext.
 * @returns {Array<string>} Liste von Wörtern.
 */
function extractWords(text) {
  const matches = String(text ?? '').match(/[\p{L}\p{N}]+/gu);
  return matches ? matches : [];
}
