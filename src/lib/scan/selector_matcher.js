import {log} from '/lib/util/log.js';
import {parseHTML, selectElements} from '/lib/util/html.js';

export const __ = {
  log: (...args) => log(...args),
};

/**
 * Matches html based on selector and returns array of matches.
 *
 * @param {string} html - HTML structure.
 * @param {string} selector - Regex selector (supports classes,
 * ids and indexes).
 *
 * @returns {Array<string>} - Array of matches. If syntax error occurs, array
 *   with original HTML is returned.
 */
export async function matchHtmlWithSelector(html, selector) {
  const dom = parseHTML(html);
  if (!dom) {
    __.log('DOMParser nicht verfügbar, selektorbasierte Prüfung übersprungen.');
    return [html];
  }
  try {
    const matches = selectElements(dom, selector);
    const result = [];
    matches.forEach((element) => result.push(element.outerHTML));
    return result;
  } catch (error) {
    __.log(`Selektor-Fehler, verwende gesamtes HTML: ${error}`);
    return [html];
  }
}
