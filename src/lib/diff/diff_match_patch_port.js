const DiffOperation = {
  DELETE: -1,
  INSERT: 1,
  EQUAL: 0,
};

const MAX_LCS_CELLS = 4000000;

/**
 * Erstellt einen textbasierten Standard-Diff im Stil von diff-match-patch.
 *
 * @param {string} oldText - Vorheriger Text.
 * @param {string} newText - Neuer Text.
 * @returns {Array<[number, string]>} Diff-Liste.
 */
export function diffMatchPatchText(oldText, newText) {
  return diffMatchPatchTokens(
    tokenizeText(oldText),
    tokenizeText(newText),
  );
}

/**
 * Erstellt einen Diff für Tokenlisten (diff-match-patch-Adapter).
 *
 * @param {string[]} oldTokens - Vorherige Tokens.
 * @param {string[]} newTokens - Neue Tokens.
 * @returns {Array<[number, string]>} Diff-Liste.
 */
export function diffMatchPatchTokens(oldTokens, newTokens) {
  if (oldTokens.length === 0 && newTokens.length === 0) {
    return [];
  }

  if (oldTokens.length === 0) {
    return [[DiffOperation.INSERT, newTokens.join('')]];
  }

  if (newTokens.length === 0) {
    return [[DiffOperation.DELETE, oldTokens.join('')]];
  }

  const maxCells = oldTokens.length * newTokens.length;
  if (maxCells > MAX_LCS_CELLS) {
    return buildSimpleDiff(oldTokens, newTokens);
  }

  return buildLcsDiff(oldTokens, newTokens);
}

/**
 * Teilt Text in Diff-Tokens (Wörter/Whitespace).
 *
 * @param {string} text - Text für Tokens.
 * @returns {string[]} Tokenliste.
 */
function tokenizeText(text) {
  if (!text) {
    return [];
  }
  return text.match(/\s+|[^\s]+/g) ?? [];
}

/**
 * Fallback-Diff mit gemeinsamer Prefix/Suffix-Strategie.
 *
 * @param {string[]} oldTokens - Vorherige Tokens.
 * @param {string[]} newTokens - Neue Tokens.
 * @returns {Array<[number, string]>} Diff-Liste.
 */
function buildSimpleDiff(oldTokens, newTokens) {
  let prefix = 0;
  const maxPrefix = Math.min(oldTokens.length, newTokens.length);
  while (prefix < maxPrefix && oldTokens[prefix] === newTokens[prefix]) {
    prefix += 1;
  }

  let suffix = 0;
  const maxSuffix = Math.min(
    oldTokens.length - prefix,
    newTokens.length - prefix,
  );
  while (
    suffix < maxSuffix &&
    oldTokens[oldTokens.length - 1 - suffix] ===
      newTokens[newTokens.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  const diffs = [];
  if (prefix > 0) {
    diffs.push([DiffOperation.EQUAL, oldTokens.slice(0, prefix).join('')]);
  }

  const oldMiddle = oldTokens.slice(prefix, oldTokens.length - suffix).join('');
  const newMiddle = newTokens.slice(prefix, newTokens.length - suffix).join('');
  if (oldMiddle) {
    diffs.push([DiffOperation.DELETE, oldMiddle]);
  }
  if (newMiddle) {
    diffs.push([DiffOperation.INSERT, newMiddle]);
  }

  if (suffix > 0) {
    diffs.push([
      DiffOperation.EQUAL,
      oldTokens.slice(oldTokens.length - suffix).join(''),
    ]);
  }

  return diffs;
}

/**
 * Ermittelt einen LCS-basierten Diff für Tokenlisten.
 *
 * @param {string[]} oldTokens - Vorherige Tokens.
 * @param {string[]} newTokens - Neue Tokens.
 * @returns {Array<[number, string]>} Diff-Liste.
 */
function buildLcsDiff(oldTokens, newTokens) {
  const table = buildLcsTable(oldTokens, newTokens);
  let i = 0;
  let j = 0;
  const diffs = [];

  while (i < oldTokens.length && j < newTokens.length) {
    if (oldTokens[i] === newTokens[j]) {
      diffs.push([DiffOperation.EQUAL, oldTokens[i]]);
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      diffs.push([DiffOperation.DELETE, oldTokens[i]]);
      i += 1;
    } else {
      diffs.push([DiffOperation.INSERT, newTokens[j]]);
      j += 1;
    }
  }

  while (i < oldTokens.length) {
    diffs.push([DiffOperation.DELETE, oldTokens[i]]);
    i += 1;
  }

  while (j < newTokens.length) {
    diffs.push([DiffOperation.INSERT, newTokens[j]]);
    j += 1;
  }

  return mergeDiffs(diffs);
}

/**
 * Baut die LCS-Tabelle für Tokenlisten.
 *
 * @param {string[]} oldTokens - Vorherige Tokens.
 * @param {string[]} newTokens - Neue Tokens.
 * @returns {number[][]} LCS-Tabelle.
 */
function buildLcsTable(oldTokens, newTokens) {
  const rows = oldTokens.length + 1;
  const cols = newTokens.length + 1;
  const table = Array.from({length: rows}, () => Array(cols).fill(0));

  for (let i = rows - 2; i >= 0; i -= 1) {
    for (let j = cols - 2; j >= 0; j -= 1) {
      if (oldTokens[i] === newTokens[j]) {
        table[i][j] = table[i + 1][j + 1] + 1;
      } else {
        table[i][j] = Math.max(table[i + 1][j], table[i][j + 1]);
      }
    }
  }

  return table;
}

/**
 * Führt aufeinanderfolgende Diff-Blöcke zusammen.
 *
 * @param {Array<[number, string]>} diffs - Roh-Diffs.
 * @returns {Array<[number, string]>} Zusammengeführte Diffs.
 */
function mergeDiffs(diffs) {
  const merged = [];
  diffs.forEach(([operation, text]) => {
    if (!text) {
      return;
    }
    const last = merged[merged.length - 1];
    if (last && last[0] === operation) {
      last[1] += text;
    } else {
      merged.push([operation, text]);
    }
  });
  return merged;
}
