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

/**
 * Prüft, ob ein Selektor als XPath behandelt werden soll.
 *
 * @param {string} selectorText - Selektor-Text.
 * @returns {boolean} True, wenn XPath angenommen wird.
 */
function isXPathSelector(selectorText) {
  const trimmed = selectorText.trim();
  return trimmed.startsWith('xpath:') ||
    trimmed.startsWith('xpath=') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('(');
}

/**
 * Normalisiert einen Selektor-Eintrag und erkennt CSS/XPath.
 *
 * @param {string} selectorText - Selektor-Text.
 * @returns {{type: 'css'|'xpath', selector: string}} Normalisierte Definition.
 */
export function parseSelectorEntry(selectorText) {
  const trimmed = selectorText.trim();
  if (trimmed.startsWith('xpath:') || trimmed.startsWith('xpath=')) {
    return {type: 'xpath', selector: trimmed.slice(6).trim()};
  }
  if (trimmed.startsWith('css:') || trimmed.startsWith('css=')) {
    return {type: 'css', selector: trimmed.slice(4).trim()};
  }
  if (isXPathSelector(trimmed)) {
    return {type: 'xpath', selector: trimmed};
  }
  return {type: 'css', selector: trimmed};
}

/**
 * Zerlegt eine Selektorliste in Einträge (Zeilenumbruch und optional Komma).
 *
 * @param {?string} rawSelectors - Rohdaten der Selektoren.
 * @param {{splitOnComma?: boolean}} options - Split-Optionen.
 * @returns {Array<string>} Bereinigte Selektoren.
 */
export function splitSelectorList(rawSelectors, {splitOnComma = false} = {}) {
  if (!rawSelectors) {
    return [];
  }
  const lines = rawSelectors
    .split(/\n+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (!splitOnComma || lines.length > 1) {
    return lines;
  }
  const firstLine = lines[0];
  if (isXPathSelector(firstLine)) {
    return [firstLine];
  }
  return firstLine
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * Wählt Elemente per CSS oder XPath aus einem Dokument aus.
 *
 * @param {Document} dom - DOM-Dokument.
 * @param {string} selectorText - Selektor-Text.
 * @param {{splitOnComma?: boolean}} options - Split-Optionen.
 * @returns {Array<Element>} Gefundene Elemente.
 */
export function selectElements(dom, selectorText, {splitOnComma = false} = {}) {
  if (!dom) {
    return [];
  }
  const entries = splitSelectorList(selectorText, {splitOnComma});
  if (entries.length === 0) {
    return [];
  }
  const result = [];
  const seen = new Set();
  entries.forEach((entry) => {
    const parsed = parseSelectorEntry(entry);
    if (!parsed.selector) {
      return;
    }
    if (parsed.type === 'xpath') {
      if (typeof dom.evaluate !== 'function') {
        throw new Error('XPath-Auswertung nicht verfügbar.');
      }
      const xpathResultType = typeof XPathResult !== 'undefined' ?
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE :
        dom.defaultView?.XPathResult?.ORDERED_NODE_SNAPSHOT_TYPE;
      if (!xpathResultType) {
        throw new Error('XPathResult nicht verfügbar.');
      }
      const snapshot = dom.evaluate(
        parsed.selector,
        dom,
        null,
        xpathResultType,
        null,
      );
      for (let i = 0; i < snapshot.snapshotLength; i++) {
        const node = snapshot.snapshotItem(i);
        const element = node?.nodeType === 1 ? node : node?.parentElement;
        if (element && !seen.has(element)) {
          seen.add(element);
          result.push(element);
        }
      }
      return;
    }
    dom.querySelectorAll(parsed.selector).forEach((element) => {
      if (!seen.has(element)) {
        seen.add(element);
        result.push(element);
      }
    });
  });
  return result;
}
