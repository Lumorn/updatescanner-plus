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
 * Normalisiert Text, um instabile Whitespace-Änderungen zu reduzieren.
 *
 * @param {string} text - Rohtext.
 * @returns {string} Normalisierter Text.
 */
export function normalizeTextContent(text) {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * Wendet Regex-Filter auf Text an.
 *
 * @param {string} text - Ausgangstext.
 * @param {Array<RegExp>} regexFilters - Regex-Filter.
 * @returns {string} Bereinigter Text.
 */
function applyRegexListToText(text, regexFilters) {
  if (!text || !regexFilters || regexFilters.length === 0) {
    return text ?? '';
  }
  return regexFilters.reduce(
    (result, regex) => result.replace(regex, ''),
    text,
  );
}

/**
 * Extrahiert einen JSON-Pfad aus Datenstrukturen.
 *
 * @param {any} data - JSON-Daten.
 * @param {string} jsonPath - JSONPath-Ausdruck (z. B. $.foo.bar[0]).
 * @returns {any} Extrahierter Wert oder undefined.
 */
function resolveJsonPath(data, jsonPath) {
  if (!jsonPath) {
    return data;
  }
  let path = jsonPath.trim();
  if (path.startsWith('$')) {
    path = path.slice(1);
  }
  if (path.startsWith('.')) {
    path = path.slice(1);
  }
  if (!path) {
    return data;
  }
  const tokens = [];
  const tokenRegex = /(?:^|\.)([^.[\]]+)|\[(\d+|"(?:[^"\\]|\\.)+"|'(?:[^'\\]|\\.)+')\]/g;
  let match;
  while ((match = tokenRegex.exec(path)) !== null) {
    const [, dotToken, bracketToken] = match;
    if (dotToken) {
      tokens.push(dotToken);
    } else if (bracketToken != null) {
      const trimmed = bracketToken.trim();
      if (trimmed.startsWith('"') || trimmed.startsWith('\'')) {
        tokens.push(trimmed.slice(1, -1));
      } else {
        tokens.push(Number.parseInt(trimmed, 10));
      }
    }
  }
  return tokens.reduce((current, token) => {
    if (current == null) {
      return undefined;
    }
    return current[token];
  }, data);
}

/**
 * Normalisiert HTML in stabilen Text, optional mit Selektor/Regex/JSONPath.
 *
 * @param {?string} html - HTML- oder JSON-Text.
 * @param {{
 *   selectors?: ?string,
 *   regexFilters?: Array<RegExp>,
 *   jsonPath?: ?string,
 * }} options - Optionen für die Normalisierung.
 * @returns {{text: string, parts: ?Array<string>, normalizedContent: string}}
 *   Normalisierter Text und optional Teile.
 */
export function normalizeHtmlToText(html, options = {}) {
  const {selectors = null, regexFilters = [], jsonPath = null} = options;
  if (!html) {
    return {text: '', parts: selectors ? [''] : null, normalizedContent: ''};
  }

  const trimmed = String(html).trim();
  if (jsonPath && (trimmed.startsWith('{') || trimmed.startsWith('['))) {
    try {
      const parsed = JSON.parse(trimmed);
      const extracted = resolveJsonPath(parsed, jsonPath);
      const normalizedValue = normalizeTextContent(
        applyRegexListToText(
          extracted == null ? '' : JSON.stringify(extracted),
          regexFilters,
        ),
      );
      return {
        text: normalizedValue,
        parts: selectors ? [normalizedValue] : null,
        normalizedContent: normalizedValue,
      };
    } catch (error) {
      // Falls JSON ungültig ist, weiter mit HTML-Parsing.
    }
  }

  const dom = parseHTML(html);
  if (!dom) {
    const fallbackText = normalizeTextContent(
      applyRegexListToText(html, regexFilters),
    );
    return {
      text: fallbackText,
      parts: selectors ? [fallbackText] : null,
      normalizedContent: fallbackText,
    };
  }

  const root = dom.body ?? dom.documentElement;
  const fullText = normalizeTextContent(
    applyRegexListToText(root?.textContent ?? '', regexFilters),
  );

  if (!selectors) {
    return {text: fullText, parts: null, normalizedContent: fullText};
  }

  try {
    const matches = selectElements(dom, selectors);
    const parts = [];
    matches.forEach((element) => {
      parts.push(
        normalizeTextContent(
          applyRegexListToText(element.textContent ?? '', regexFilters),
        ),
      );
    });
    const joinedText = parts.join('\n');
    return {text: joinedText, parts: parts, normalizedContent: fullText};
  } catch (error) {
    return {text: fullText, parts: [fullText], normalizedContent: fullText};
  }
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
