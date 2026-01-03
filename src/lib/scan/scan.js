import {PageStore} from '/lib/page/page_store.js';
import {Page} from '/lib/page/page.js';
import {isUpToDate} from '/lib/update/update.js';
import {log} from '/lib/util/log.js';
import {waitForMs} from '/lib/util/promise.js';
import {applyEncoding, detectEncoding} from '/lib/util/encoding.js';
import {matchHtmlWithSelector} from './selector_matcher.js';
import {getChanges, ContentData, changeEnum} from './scan_content.js';
import {isMajorChange} from './fuzzy.js';


// Allow function mocking
export const __ = {
  log: (...args) => log(...args),
  detectEncoding: (...args) => detectEncoding(...args),
  applyEncoding: (...args) => applyEncoding(...args),
  waitForMs: (...args) => waitForMs(...args),
  isUpToDate: (...args) => isUpToDate(...args),
  isMajorChange: (...args) => isMajorChange(...args),
  matchHtmlWithSelector: (...args) => matchHtmlWithSelector(...args),
  computeHtmlHash: (html) => computeHtmlHash(html),

  // Allow private functions to be tested
  updatePageState: updatePageState,
  getHtmlFromResponse: getHtmlFromResponse,
};

// Wait between scanning pages
const SCAN_IDLE_MS = 2000;
const TAB_LOAD_TIMEOUT_MS = 20000;

/**
 * Start scanning the pages one at a time. HTML is checked for updates and
 * saved to the PageStore, and the Page objects updated and saved accordingly.
 *
 * @param {Array.<Page>} pageList - Array of pages to scan.
 *
 * @returns {number} The number of new major changes detected.
 */
export async function scan(pageList) {
  let newMajorChangeCount = 0;
  for (const page of pageList) {
    if (await scanPage(page)) {
      newMajorChangeCount++;
    }

    await __.waitForMs(SCAN_IDLE_MS);
  }
  return newMajorChangeCount;
}

/**
 * Scan a single page, check for updates, then save the HTML to the PageStore
 * and updating and save the Page object accordingly. Errors are logged and
 * ignored.
 *
 * @param {Page} page - Page to scan.
 *
 * @returns {boolean} True if a new major change is detected.
 */
export async function scanPage(page) {
  // Don't scan if the data structures aren't yet updated to the latest version
  if (!(await __.isUpToDate())) {
    return false;
  }
  if (!page) {
    return false;
  }
  __.log(`Scanning "${page.title}"...`);
  try {
    const html = page.useHiddenTabScan
      ? await getHtmlFromHiddenTab(page)
      : await getHtmlFromFetch(page);
    return processHtml(page, html);
  } catch (error) {
    __.log(`Could not scan "${page.title}": ${error}`);
    // Only save if the page still exists
    if (await page.existsInStorage()) {
      const updatedPage = await Page.load(page.id);
      updatedPage.state = Page.stateEnum.ERROR;
      updatedPage.save();
    }
  }
  return false;
}

/**
 * Lädt HTML per fetch (Standardpfad).
 *
 * @param {Page} page - Page object associated with the scan.
 * @returns {string} HTML page content.
 */
async function getHtmlFromFetch(page) {
  const response = await fetch(page.url);
  if (!response.ok) {
    throw Error(`[${response.status}] ${response.statusText}`);
  }

  return await getHtmlFromResponse(response, page);
}

/**
 * Lädt HTML über einen versteckten Tab und einen DOM-Snapshot.
 *
 * @param {Page} page - Page object associated with the scan.
 * @returns {string} HTML page content.
 */
async function getHtmlFromHiddenTab(page) {
  const tab = await browser.tabs.create({
    url: page.url,
    active: false,
  });

  try {
    await waitForTabReady(tab.id);
    return await getHtmlFromTab(tab.id);
  } finally {
    await browser.tabs.remove(tab.id).catch(() => {
      __.log(`Konnte Tab nicht schließen: ${page.url}`);
    });
  }
}

/**
 * Wartet, bis der Tab fertig geladen ist.
 *
 * @param {number} tabId - Tab-ID.
 */
async function waitForTabReady(tabId) {
  const tab = await browser.tabs.get(tabId);
  if (tab.status === 'complete') {
    return;
  }

  await new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout beim Laden des versteckten Tabs.'));
    }, TAB_LOAD_TIMEOUT_MS);

    const handleUpdated = (updatedTabId, changeInfo) => {
      if (updatedTabId !== tabId) {
        return;
      }
      if (changeInfo.status === 'complete') {
        cleanup();
        resolve();
      }
    };

    const cleanup = () => {
      clearTimeout(timeoutId);
      browser.tabs.onUpdated.removeListener(handleUpdated);
    };

    browser.tabs.onUpdated.addListener(handleUpdated);
  });
}

/**
 * Liefert den DOM-Snapshot aus dem Tab über executeScript.
 *
 * @param {number} tabId - Tab-ID.
 * @returns {string} HTML page content.
 */
async function getHtmlFromTab(tabId) {
  if (browser.scripting && browser.scripting.executeScript) {
    const [{result}] = await browser.scripting.executeScript({
      target: {tabId},
      func: () => document.documentElement.outerHTML,
    });
    return result ?? '';
  }

  const [result] = await browser.tabs.executeScript(tabId, {
    code: 'document.documentElement.outerHTML',
  });
  return result ?? '';
}

/**
 * Given an HTTP Response, extract the HTML and apply character encoding.
 * If the page encoding attribute is not set, autodetect it and update the page.
 *
 * @param {Response} response - HTTP response.
 * @param {Page} page - Page object associated with the scan.
 *
 * @returns {string} HTML page content.
 */
async function getHtmlFromResponse(response, page) {
  // This is probably faster for the most common case (utf-8)
  if (page.encoding === 'utf-8') {
    return await response.text();
  }

  const buffer = await response.arrayBuffer();
  let encodingToUse = page.encoding;

  if (page.encoding == null || page.encoding === 'auto') {
    const rawHtml = __.applyEncoding(buffer, 'utf-8');
    const updatedPage = await Page.load(page.id);
    const detectedEncoding = __.detectEncoding(response.headers, rawHtml);
    const normalizedEncoding = detectedEncoding ?? 'utf-8';
    updatedPage.encoding = normalizedEncoding;
    updatedPage.save();
    encodingToUse = normalizedEncoding;
  }
  return __.applyEncoding(buffer, encodingToUse);
}

/**
 * Load the "NEW" HTML from storage, compare it with the the scanned HTML,
 * update the page state and update the HTML storage as necessary. Returns
 * without waiting for the save operations to complete.
 * Note that the "NEW" HTML is used for comparison - this is the HTML that was
 * downloaded during the most recent scan. This is the simplest and most
 * resource-efficient approach.
 *
 * @param {Page} page - Page object to update.
 * @param {string} scannedHtml - HTML to process.
 *
 * @returns {boolean} True if a new major change is detected.
 */
async function processHtml(page, scannedHtml) {
  // Do nothing if the page no longer exists
  const existsInStorage = await page.existsInStorage();
  if (!existsInStorage) {
    return false;
  }

  const prevHtml = await PageStore.loadHtml(page.id, PageStore.htmlTypes.NEW);

  return processHtmlWithConditions(page, scannedHtml, prevHtml);
}

/**
 * Processes HTML with selectors specified in page settings. If selectors
 * do not exist or page was not scanned yet standard update is called.
 *
 * @param {Page} page - Page object to update.
 * @param {string} scanHtml - HTML to process.
 * @param {string} prevHtml - Previous HTML.
 *
 * @returns {boolean} True if a new major change is detected.
 */
async function processHtmlWithConditions(page, scanHtml, prevHtml) {
  if (page.selectors && prevHtml != null) {
    const scanParts = await __.matchHtmlWithSelector(scanHtml, page.selectors);
    const prevParts = await __.matchHtmlWithSelector(prevHtml, page.selectors);
    return updatePageState(
      page,
      new ContentData(prevHtml, prevParts),
      new ContentData(scanHtml, scanParts),
    );
  } else {
    return updatePageState(
      page,
      new ContentData(prevHtml, null),
      new ContentData(scanHtml, null),
    );
  }
}

/**
 * Compare the scanned HTML with the "NEW" HTML from storage, update the page
 * state and save the HTML to storage. The method returns without waiting for
 * the save operations to complete.
 *
 * @param {Page} page - Page object to update.
 * @param {ContentData} prevHtmlData - HTML from storage.
 * @param {ContentData} scannedHtmlData - Scanned HTML to process.
 *
 * @returns {boolean} True if a new major change is detected.
 */
async function updatePageState(page, prevHtmlData, scannedHtmlData) {
  const updatedPage = await Page.load(page.id);
  const scannedHtmlHash = computeHtmlHash(scannedHtmlData.html);

  const changeType = getChanges(
    prevHtmlData,
    scannedHtmlData,
    updatedPage,
  );

  const isSameHtml = prevHtmlData.html === scannedHtmlData.html;
  const isSameHash = updatedPage.newHtmlHash != null &&
    updatedPage.newHtmlHash === scannedHtmlHash;
  const shouldSaveNewHtml = !(isSameHtml || isSameHash);

  if (changeType === changeEnum.MAJOR_CHANGE) {
    if (!updatedPage.isChanged()) {
      // This is a newly detected change, so update the old HTML.
      await PageStore
        .saveHtml(updatedPage.id, PageStore.htmlTypes.OLD, prevHtmlData.html);
      updatedPage.oldScanTime = updatedPage.newScanTime;
    }
    if (shouldSaveNewHtml) {
      await PageStore
        .saveHtml(updatedPage.id, PageStore.htmlTypes.NEW, scannedHtmlData.html);
    }
    updatedPage.state = Page.stateEnum.CHANGED;
  } else {
    if (shouldSaveNewHtml) {
      await PageStore
        .saveHtml(updatedPage.id, PageStore.htmlTypes.NEW, scannedHtmlData.html);
    }
    // Only update the state if not previously marked as changed.
    if (!updatedPage.isChanged()) {
      updatedPage.state = Page.stateEnum.NO_CHANGE;
    }
  }

  updatedPage.newHtmlHash = scannedHtmlHash;
  updatedPage.newScanTime = Date.now();

  await updatedPage.save();
  __.log(`Scan-Ergebnis gespeichert für URL: ${updatedPage.url}`);
  return changeType === changeEnum.MAJOR_CHANGE;
}

/**
 * Berechnet einen einfachen Hash über HTML für schnelle Vergleiche.
 *
 * @param {string} html - HTML-String.
 * @returns {string} Hash als String.
 */
function computeHtmlHash(html) {
  let hash = 2166136261;
  const safeHtml = html || '';
  for (let i = 0; i < safeHtml.length; i++) {
    hash ^= safeHtml.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16);
}
