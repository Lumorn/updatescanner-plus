import {diffMatchPatchTokens} from './diff_match_patch_port.js';

/**
 * Erstellt einen HTML-Diff im Stil von html-diff-js.
 *
 * @param {string} oldHtml - Vorheriges HTML.
 * @param {string} newHtml - Neues HTML.
 * @returns {Array<[number, string]>} Diff-Liste.
 */
export function diffHtml(oldHtml, newHtml) {
  return diffMatchPatchTokens(
    tokenizeHtml(oldHtml),
    tokenizeHtml(newHtml),
  );
}

/**
 * Teilt HTML in Tag- und Text-Tokens.
 *
 * @param {string} html - HTML für Tokens.
 * @returns {string[]} Tokenliste.
 */
function tokenizeHtml(html) {
  if (!html) {
    return [];
  }
  return html.match(/<[^>]+>|[^<]+/g) ?? [];
}
