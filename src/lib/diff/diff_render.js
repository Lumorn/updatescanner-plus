import {diffMatchPatchText} from './diff_match_patch_port.js';
import {diffHtml} from './html_diff_port.js';

const DiffOperation = {
  DELETE: -1,
  INSERT: 1,
  EQUAL: 0,
};

/**
 * Erstellt die Standard-Diff-Ausgabe für Text mit <ins>/<del>.
 *
 * @param {string} oldText - Vorheriger Text.
 * @param {string} newText - Neuer Text.
 * @param {{highlightColour: string, startMarker: string, endMarker: string}} options - Optionen.
 * @returns {string} HTML-Ausgabe.
 */
export function buildStandardDiffOutput(oldText, newText, options) {
  const diffs = diffMatchPatchText(oldText, newText);
  const markup = renderDiffMarkup(diffs, {
    escapeHtml: true,
    startMarker: options.startMarker,
    endMarker: options.endMarker,
  });
  return wrapDiffMarkup(markup, {
    highlightColour: options.highlightColour,
    preserveWhitespace: true,
  });
}

/**
 * Erstellt die HTML-Diff-Ausgabe mit <ins>/<del>.
 *
 * @param {string} oldHtml - Vorheriges HTML.
 * @param {string} newHtml - Neues HTML.
 * @param {{highlightColour: string, startMarker: string, endMarker: string}} options - Optionen.
 * @returns {string} HTML-Ausgabe.
 */
export function buildHtmlDiffOutput(oldHtml, newHtml, options) {
  const diffs = diffHtml(oldHtml, newHtml);
  const markup = renderDiffMarkup(diffs, {
    escapeHtml: false,
    startMarker: options.startMarker,
    endMarker: options.endMarker,
  });
  return wrapDiffMarkup(markup, {
    highlightColour: options.highlightColour,
    preserveWhitespace: false,
  });
}


/**
 * Rendert Diffs zu HTML mit <ins>/<del>.
 *
 * @param {Array<[number, string]>} diffs - Diff-Liste.
 * @param {{escapeHtml: boolean, startMarker: string, endMarker: string}} options - Optionen.
 * @returns {string} HTML-String.
 */
function renderDiffMarkup(diffs, options) {
  return diffs.map(([operation, text]) => {
    if (!text) {
      return '';
    }
    const escapedText = options.escapeHtml ? escapeHtml(text) : text;
    if (operation === DiffOperation.INSERT) {
      const markedText = `${options.startMarker}${escapedText}${options.endMarker}`;
      return `<ins>${markedText}</ins>`;
    }
    if (operation === DiffOperation.DELETE) {
      const markedText = `${options.startMarker}${escapedText}${options.endMarker}`;
      return `<del>${markedText}</del>`;
    }
    return escapedText;
  }).join('');
}

/**
 * Wrappt die Diff-Ausgabe mit Styles und Container.
 *
 * @param {string} markup - HTML-Markup.
 * @param {{highlightColour: string, preserveWhitespace: boolean}} options - Optionen.
 * @returns {string} HTML-Ausgabe.
 */
function wrapDiffMarkup(markup, options) {
  const textStyle = options.preserveWhitespace ? 'white-space: pre-wrap;' : '';
  return `
    <style>
      body { font-family: sans-serif; padding: 16px; }
      .diff-output { ${textStyle} }
      ins { background: ${options.highlightColour}; text-decoration: none; }
      del { background: #ffb6b6; text-decoration: line-through; }
    </style>
    <div class="diff-output">${markup}</div>
  `;
}

/**
 * Escapt Text für HTML-Ausgabe.
 *
 * @param {string} text - Text.
 * @returns {string} Escapter Text.
 */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
