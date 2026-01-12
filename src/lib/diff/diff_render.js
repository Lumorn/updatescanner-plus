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
      return `<ins class="diff-insert">${markedText}</ins>`;
    }
    if (operation === DiffOperation.DELETE) {
      const markedText = `${options.startMarker}${escapedText}${options.endMarker}`;
      return `<del class="diff-delete">${markedText}</del>`;
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
      body {
        font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
        padding: 20px;
        margin: 0;
        background: #f6f7fb;
        color: #1f2937;
        line-height: 1.6;
      }
      .diff-output {
        ${textStyle}
        background: #ffffff;
        border-radius: 12px;
        padding: 16px 18px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        border: 1px solid #e5e7eb;
      }
      .diff-insert {
        background: ${options.highlightColour};
        color: #0f5132;
        text-decoration: none;
        padding: 0 2px;
        border-radius: 4px;
      }
      .diff-delete {
        background: #ffd6d6;
        color: #7a1f1f;
        text-decoration: line-through;
        padding: 0 2px;
        border-radius: 4px;
      }
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
