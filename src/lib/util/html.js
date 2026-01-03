/**
 * Parst HTML in ein Dokument, falls DOMParser verfügbar ist.
 *
 * @param {string} htmlText - HTML-Text.
 * @returns {?Document} Dokument oder null, wenn DOMParser fehlt.
 */
export function parseHTML(htmlText) {
  if (typeof DOMParser === 'undefined') {
    return null;
  }

  const parser = new DOMParser();
  return parser.parseFromString(htmlText, 'text/html');
}
