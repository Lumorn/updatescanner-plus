import {log} from '/lib/util/log.js';
import {isMajorChange} from './fuzzy.js';
import {Page} from '../page/page.js';

/**
 * Enumeration indicating the similarity of two HTML strings.
 *
 * @readonly
 * @enum {string}
 */
export const changeEnum = {
  NEW_CONTENT: 'new_content',
  NO_CHANGE: 'no_change',
  MAJOR_CHANGE: 'major_change',
  MINOR_CHANGE: 'minor_change',
};

/**
 * Enumeration für den gewählten Diff-Modus.
 *
 * @readonly
 * @enum {string}
 */
export const diffModeEnum = {
  HTML: 'html',
  TEXT: 'text',
  DOM: 'dom',
};

export const __ = {
  log: (...args) => log(...args),
  isMajorChange: (...args) => isMajorChange(...args),
  changeEnum: changeEnum,
  stripHtml: stripHtml,
  getChanges: getChanges,
  getDiffResult: getDiffResult,
  resolveDiffMode: resolveDiffMode,
  getIteratorFunction: getIteratorFunction,
};

/**
 * Content data with previously prepared and chopped HTML.
 *
 * @property {string} html - Page HTML.
 * @property {?Array} parts - HTML split.
 */
export class ContentData {
  /**
   * @param {string} html - Page HTML.
   * @param {?Array} parts - HTML split.
   */
  constructor(html, parts = null) {
    this.html = html || '';
    this.parts = parts || null;
  }

}

/**
 * Liefert den bevorzugten Diff-Modus für eine Seite.
 *
 * @param {Page} page - Page.
 * @returns {diffModeEnum} Aufgelöster Diff-Modus.
 */
export function resolveDiffMode(page) {
  if (page?.domDiffMode) {
    return diffModeEnum.DOM;
  }
  if (page?.textDiffMode) {
    return diffModeEnum.TEXT;
  }
  return diffModeEnum.HTML;
}

/**
 * Detects changes based on two HTML data and page.
 *
 * @param {ContentData} prevData - Data for previous HTML.
 * @param {ContentData} scannedData - Data for scanned HTML.
 * @param {Page} page - Page.
 *
 * @returns {string|changeEnum} ChangeEnum string indicating how similar the
 * two HTML strings are.
 */
export function getChanges(prevData, scannedData, page) {
  if (prevData.html == null || prevData.html === '') {
    return changeEnum.NEW_CONTENT;
  }

  if (page.requireExactMatchCount) {
    const countChange = getCountChange(prevData, scannedData);
    if (countChange === changeEnum.MAJOR_CHANGE) {
      return countChange;
    }
  }

  if (prevData.html === scannedData.html) {
    return changeEnum.NO_CHANGE;
  }

  const contentModeEnum = Page.contentModeEnum;
  const contentMode = page.contentMode || contentModeEnum.TEXT;
  if (contentMode === contentModeEnum.IGNORE) {
    return changeEnum.NO_CHANGE;
  }

  const prevParts = prevData.parts || [prevData.html];
  const scannedParts = scannedData.parts || [scannedData.html];

  const ignoreTags = contentMode !== contentModeEnum.HTML;

  const htmlChange = getHTMLChange(page, prevParts, scannedParts, ignoreTags);

  // If no change was detected in parts, just return minor change because we
  // already know there was a change somewhere in the html
  if (htmlChange === changeEnum.NO_CHANGE) {
    return getChangeInStrippedHtml(page, prevData.html, scannedData.html);
  } else {
    return htmlChange;
  }
}

/**
 * Liefert das Diff-Ergebnis inklusive strukturierter Change-Liste.
 *
 * @param {ContentData} prevData - Data for previous HTML.
 * @param {ContentData} scannedData - Data for scanned HTML.
 * @param {Page} page - Page.
 * @param {{mode?: string, changes?: Array}} diffOptions - Optionales Diff-Objekt.
 * @returns {{changeType: changeEnum, diffResult: object}} Ergebnis.
 */
export function getDiffResult(prevData, scannedData, page, diffOptions = {}) {
  const resolvedMode = diffOptions.mode || resolveDiffMode(page);
  if (prevData?.html == null || prevData.html === '') {
    const initialChanges = Array.isArray(diffOptions.changes) ?
      diffOptions.changes :
      [];
    return {
      changeType: changeEnum.NEW_CONTENT,
      diffResult: {
        mode: resolvedMode,
        changes: initialChanges,
        summary: summarizeChanges(initialChanges),
      },
    };
  }
  if (resolvedMode === diffModeEnum.DOM) {
    const domChanges = Array.isArray(diffOptions.changes) ?
      diffOptions.changes :
      [];
    const changeType = getDomChangeType(prevData, scannedData, page, domChanges);
    return {
      changeType: changeType,
      diffResult: {
        mode: resolvedMode,
        changes: domChanges,
        summary: summarizeChanges(domChanges),
      },
    };
  }

  const changeType = getChanges(prevData, scannedData, page);
  const ignoreTags = page?.contentMode !== Page.contentModeEnum.HTML;
  const changes = buildTextHtmlChanges(
    prevData,
    scannedData,
    page,
    ignoreTags,
  );
  return {
    changeType: changeType,
    diffResult: {
      mode: resolvedMode,
      changes: changes,
      summary: summarizeChanges(changes),
    },
  };
}

/**
 * Ermittelt den Change-Typ für DOM-Diffs.
 *
 * @param {ContentData} prevData - Data for previous HTML.
 * @param {ContentData} scannedData - Data for scanned HTML.
 * @param {Page} page - Page.
 * @param {Array} domChanges - DOM-Change-Liste.
 * @returns {changeEnum} Change-Typ.
 */
function getDomChangeType(prevData, scannedData, page, domChanges) {
  if (!domChanges || domChanges.length === 0) {
    return changeEnum.NO_CHANGE;
  }

  const ignoreTags = page?.contentMode !== Page.contentModeEnum.HTML;
  const prevStrip = stripHtml(
    prevData?.html ?? '',
    page.ignoreNumbers,
    ignoreTags,
    page.filterRegexList,
  );
  const scanStrip = stripHtml(
    scannedData?.html ?? '',
    page.ignoreNumbers,
    ignoreTags,
    page.filterRegexList,
  );

  if (prevStrip === scanStrip) {
    return changeEnum.MINOR_CHANGE;
  }
  return __.isMajorChange(prevStrip, scanStrip, page.changeThreshold) ?
    changeEnum.MAJOR_CHANGE :
    changeEnum.MINOR_CHANGE;
}

/**
 * Erstellt eine einfache Change-Liste für Text/HTML-Diffs.
 *
 * @param {ContentData} prevData - Data for previous HTML.
 * @param {ContentData} scannedData - Data for scanned HTML.
 * @param {Page} page - Page.
 * @param {boolean} ignoreTags - True if tags should be stripped.
 * @returns {Array} Change-Liste.
 */
function buildTextHtmlChanges(prevData, scannedData, page, ignoreTags) {
  const prevParts = prevData.parts || [prevData.html || ''];
  const scannedParts = scannedData.parts || [scannedData.html || ''];
  const maxLength = Math.max(prevParts.length, scannedParts.length);
  const changes = [];

  for (let i = 0; i < maxLength; i++) {
    const prevPart = prevParts[i];
    const scannedPart = scannedParts[i];
    if (prevPart == null && scannedPart != null) {
      changes.push({
        type: 'added',
        partIndex: i,
      });
      continue;
    }
    if (prevPart != null && scannedPart == null) {
      changes.push({
        type: 'removed',
        partIndex: i,
      });
      continue;
    }

    const prevStrip = stripHtml(
      prevPart,
      page.ignoreNumbers,
      ignoreTags,
      page.filterRegexList,
    ) ?? '';
    const scanStrip = stripHtml(
      scannedPart,
      page.ignoreNumbers,
      ignoreTags,
      page.filterRegexList,
    ) ?? '';
    if (prevStrip !== scanStrip) {
      changes.push({
        type: 'modified',
        partIndex: i,
        changeLength: Math.abs(prevStrip.length - scanStrip.length),
      });
    }
  }

  return changes;
}

/**
 * Erstellt eine einfache Zusammenfassung für Change-Listen.
 *
 * @param {Array} changes - Change-Liste.
 * @returns {{total: number, byType: object}} Zusammenfassung.
 */
function summarizeChanges(changes) {
  const summary = {
    total: changes.length,
    byType: {},
  };
  changes.forEach((change) => {
    const type = change?.type || 'unknown';
    summary.byType[type] = (summary.byType[type] || 0) + 1;
  });
  return summary;
}

/**
 * Returns true if prev and scanned HTML are not equal after stripping.
 *
 * @param {Page} page - Page.
 * @param {string} prevHtml - Previous HTML.
 * @param {string} scannedHtml - Scanned HTML.
 * @returns {changeEnum} True if change is detected.
 */
function getChangeInStrippedHtml(page, prevHtml, scannedHtml) {
  const ignoreTags = page.contentMode !== Page.contentModeEnum.HTML;
  const prevStrip = stripHtml(
    prevHtml,
    page.ignoreNumbers,
    ignoreTags,
    page.filterRegexList,
  );
  const scanStrip = stripHtml(
    scannedHtml,
    page.ignoreNumbers,
    ignoreTags,
    page.filterRegexList,
  );

  return prevStrip !== scanStrip ?
    changeEnum.MINOR_CHANGE :
    changeEnum.NO_CHANGE;
}

/**
 * Detects change in data part count.
 *
 * @param {ContentData} prevData - Data for previous HTML.
 * @param {ContentData} scannedData - Data for scanned HTML.
 * @returns {changeEnum} - ChangeEnum string indicating how similar the
 * two HTML strings are.
 */
function getCountChange(prevData, scannedData) {
  const prevParts = prevData.parts;
  const scannedParts = scannedData.parts;
  if (prevParts == null) {
    return (scannedParts != null) ?
      changeEnum.MAJOR_CHANGE :
      changeEnum.NO_CHANGE;
  } else if (scannedParts == null) {
    return changeEnum.MAJOR_CHANGE;
  } else {
    return (scannedParts.length !== prevParts.length) ?
      changeEnum.MAJOR_CHANGE :
      changeEnum.NO_CHANGE;
  }
}

/**
 * Detects change in HTML content.
 *
 * @param {Page} page - Page.
 *
 * @param {string[]} prevParts - Parts for previous HTML.
 * @param {string[]} scannedParts - Parts for scanned HTML.
 * @param {boolean} ignoreTags - Ignore tags.
 * @returns {changeEnum} - ChangeEnum string indicating how similar the
 * two HTML strings are.
 */
function getHTMLChange(page, prevParts, scannedParts, ignoreTags) {
  let maxChangeDetected = changeEnum.NO_CHANGE;
  const iterator = getIteratorFunction(page, prevParts, scannedParts);

  for (const it of iterator) {
    const prevStrip = stripHtml(
      prevParts[it.prevIndex],
      page.ignoreNumbers,
      ignoreTags,
      page.filterRegexList,
    );
    const scanStrip = stripHtml(
      scannedParts[it.scannedIndex],
      page.ignoreNumbers,
      ignoreTags,
      page.filterRegexList,
    );

    if (prevStrip !== scanStrip) {
      if (__.isMajorChange(prevStrip, scanStrip, page.changeThreshold)) {
        maxChangeDetected = changeEnum.MAJOR_CHANGE;
        break;
      } else {
        maxChangeDetected = changeEnum.MINOR_CHANGE;
      }
    }
  }

  return maxChangeDetected;
}

/**
 * Returns iterator function as specified by pages setting of match mode.
 *
 * @param {Page} page - Page.
 * @param {Array} prevParts - Parts from previous scan.
 * @param {Array} scannedParts - Parts from this scan.
 * @returns {Generator} Function for iterating over
 *   parts.
 */
function getIteratorFunction(page, prevParts, scannedParts) {
  const iteratorFunction = function* (prevParts, scannedParts) {
    const length = Math.min(prevParts.length, scannedParts.length);
    for (let i = 0; i < length; i++) {
      yield {
        prevIndex: i,
        scannedIndex: i,
      };
    }
  };

  /**
   * This callback is displayed as part of the Requester class.
   *
   * @generator
   * @function iteratorFunction
   *
   * @param {Array} prevParts - Previous parts.
   * @param {Array} scannedParts - Scanned parts.
   * @param {number} length - Integer representing length.
   * @yields {{prevIndex: number, scannedIndex: number}}
   */
  return iteratorFunction(prevParts, scannedParts);
}

/**
 * Strips whitespace, (most) scripts, tags and (optionally) numbers from the
 * input HTML.
 *
 * @param {?string} inHtml - HTML to strip.
 * @param {boolean} ignoreNumbers - True if numbers should be stripped.
 * @param {boolean} ignoreTags - True if tags should be stripped.
 *
 * @returns {object} Object containing the updated prevHtml and scannedHtml.
 */
function stripHtml(inHtml, ignoreNumbers, ignoreTags, filterRegexList = null) {
  let html = inHtml;
  if (html == null) return null;

  // for proper number stripping, whitespaces need to be intact.
  if (ignoreNumbers) {
    html = stripNumbers(html);
  }

  html = stripScript(stripWhitespace(html));

  if (ignoreTags) {
    html = stripTags(html);
  }
  return applyTextFilters(html, filterRegexList);
}

/**
 * @param {string} html - HTML to process.
 *
 * @returns {string} HTML with whitespace removed.
 */
function stripWhitespace(html) {
  return html.replace(/\s+/g, '');
}

/**
 * @param {string} html - HTML to process.
 *
 * @returns {string} HTML with (most) scripts removed.
 */
function stripScript(html) {
  return html.replace(/<script.*?>.*?<\/script>/gi, '');
}

/**
 * @param {string} html - HTML to process.
 *
 * @returns {string} HTML with tags removed.
 */
function stripTags(html) {
  return html.replace(/(<([^<]+)>)/g, '');
}

/**
 * @param {string} html - HTML to process.
 *
 * @returns {string} HTML with numbers, commas and full stops removed.
 */
function stripNumbers(html) {
  return html.replace(/([0-9]+([,.]?[0-9])?)*/g, '');
}

/**
 * Entfernt Textanteile anhand der Regex-Filterliste.
 *
 * @param {string} text - Text für Filter.
 * @param {?string} filterRegexList - Rohdaten für die Regex-Liste.
 * @returns {string} Bereinigter Text.
 */
function applyTextFilters(text, filterRegexList) {
  if (!filterRegexList) {
    return text;
  }
  const regexFilters = parseFilterRegexList(filterRegexList);
  if (regexFilters.length === 0) {
    return text;
  }
  return regexFilters.reduce((result, regex) => result.replace(regex, ''), text);
}

/**
 * Zerlegt Regex-Listen in RegExp-Objekte.
 *
 * @param {?string} rawList - Regex-Liste.
 * @returns {Array<RegExp>} Regex-Objekte.
 */
function parseFilterRegexList(rawList) {
  if (!rawList) {
    return [];
  }
  return rawList
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const isSlashWrapped = entry.startsWith('/') && entry.lastIndexOf('/') > 0;
      try {
        if (isSlashWrapped) {
          const lastSlashIndex = entry.lastIndexOf('/');
          const pattern = entry.slice(1, lastSlashIndex);
          const flags = entry.slice(lastSlashIndex + 1);
          return new RegExp(pattern, flags);
        }
        return new RegExp(entry, 'g');
      } catch (error) {
        __.log(`Regex-Filter ignoriert (ungültig): ${entry}`);
        return null;
      }
    })
    .filter(Boolean);
}
