import {buildHtmlDiffOutput, buildStandardDiffOutput} from './diff_render.js';
import {stripHtml} from '/lib/scan/scan_content.js';
import {Page} from '/lib/page/page.js';

/**
 * Perform a diff between two HTML strings, returning highlighted HTML.
 *
 * @param {Page} page - Page object to diff.
 * @param {string} oldHtml - Old HTML string to use for comparison.
 * @param {string} newHtml - New HTML string to use for comparison.
 *
 * @returns {string} Highlighted HTML string.
 */
export function diff(page, oldHtml, newHtml) {
  const highlightColour = page.highlightColour || '#ffff66';
  const startMarker = page.markChanges ? '<<' : '';
  const endMarker = page.markChanges ? '>>' : '';

  if (page.highlightChanges === false) {
    return newHtml || 'Neue Version ohne Hervorhebung';
  }

  const diffType = page.diffType ||
    (page.textDiffMode ? Page.diffTypeEnum.TEXT : Page.diffTypeEnum.HTML);

  if (diffType === Page.diffTypeEnum.TEXT) {
    const strippedOld = stripHtml(
      oldHtml ?? '',
      page.ignoreNumbers,
      true,
      page.filterRegexList,
    ) ?? '';
    const strippedNew = stripHtml(
      newHtml ?? '',
      page.ignoreNumbers,
      true,
      page.filterRegexList,
    ) ?? '';
    return buildStandardDiffOutput(strippedOld, strippedNew, {
      highlightColour,
      startMarker,
      endMarker,
    });
  }

  return buildHtmlDiffOutput(oldHtml ?? '', newHtml ?? '', {
    highlightColour,
    startMarker,
    endMarker,
  });
}
