import {$on, qs} from '/lib/util/view_helpers.js';
import {waitForMs} from '/lib/util/promise.js';
import {translate} from '/lib/util/i18n.js';

/**
 * @param {object} handlers - Object containing the following keys
 * downloadOldHandler - Called when the Old HTML Download button is clicked
 * downloadNewHandler - Called when the New HTML Download button is clicked.
 */
export function bind({downloadOldHandler, downloadNewHandler}) {
  $on(qs('#download-old'), 'click', downloadOldHandler);
  $on(qs('#download-new'), 'click', downloadNewHandler);
}

/**
 * Show the debug info from the specified page.
 *
 * @param {Page} page - Page object to display.
 * @param {string} oldHtml - Old HTML data to display.
 * @param {string} newHtml - New HTML data to display.
 */
export function update(page, oldHtml, newHtml) {
  qs('#title').textContent = translate('debugInfo.titleWithPage', {
    title: page.title,
  });
  qs('#details').textContent = formatDetails(page);
  qs('#html-old').textContent = oldHtml;
  qs('#html-new').textContent = newHtml;
}

/**
 * Returns a string containing preformatted Page attributes.
 *
 * @param {Page} page - Page object to format.
 *
 * @returns {string} String containing preformatted Page attributes.
 */
function formatDetails(page) {
  const lastAutoscanTime = page.lastAutoscanTime ?
    new Date(page.lastAutoscanTime).toString() : null;
  const oldScanTime = page.oldScanTime ?
    new Date(page.oldScanTime).toString() : null;
  const newScanTime = page.newScanTime ?
    new Date(page.newScanTime).toString() : null;

  return `${translate('debugInfo.details.url')}: ${page.url}
${translate('debugInfo.details.scanRateMinutes')}:  ${page.scanRateMinutes}
${translate('debugInfo.details.changeThreshold')}:  ${page.changeThreshold}
${translate('debugInfo.details.ignoreNumbers')}:    ${page.ignoreNumbers}
${translate('debugInfo.details.encoding')}:         ${page.encoding}
${translate('debugInfo.details.highlightChanges')}: ${page.highlightChanges}
${translate('debugInfo.details.highlightColour')}:  ${page.highlightColour}
${translate('debugInfo.details.markChanges')}:      ${page.markChanges}
${translate('debugInfo.details.doPost')}:           ${page.doPost}
${translate('debugInfo.details.postParams')}:       ${page.postParams}
${translate('debugInfo.details.sendCredentials')}:  ${page.sendCredentials}
${translate('debugInfo.details.state')}:            ${page.state}
${translate('debugInfo.details.lastAutoscanTime')}: ${lastAutoscanTime}
${translate('debugInfo.details.oldScanTime')}:      ${oldScanTime}
${translate('debugInfo.details.newScanTime')}:      ${newScanTime}`;
}

/**
 * Download a Url object. Awaits until the click event has fired, so it's safe
 * to release the ObjectURL.
 *
 * @param {Url} url - Url object to download.
 * @param {string} filename - Default filename for the download.
 */
export async function downloadUrl(url, filename) {
  const link = qs('#download-link');
  link.href = url;
  link.download = filename;
  link.click();

  await waitForMs(0);
}
