/**
 * Globale Referenz für Umgebungen mit und ohne DOM.
 *
 * @type {typeof globalThis}
 */
export const g = globalThis;

/**
 * Prüft, ob eine DOM-Umgebung verfügbar ist.
 *
 * @returns {boolean} True, wenn document vorhanden ist.
 */
export function hasDOM() {
  return typeof document !== 'undefined';
}

/**
 * Verzögert die Ausführung um die angegebene Zeit.
 *
 * @param {number} ms - Wartezeit in Millisekunden.
 * @returns {Promise<void>} Promise, die nach Ablauf erfüllt wird.
 */
export function delay(ms) {
  return new Promise((resolve) => g.setTimeout(resolve, ms));
}

/**
 * Liefert die passende Action-API für MV2/MV3.
 *
 * @param {object} browserInstance - Browser-API.
 * @returns {object} Action-API-Objekt.
 */
export function getActionApi(browserInstance) {
  return browserInstance.action || browserInstance.browserAction;
}
