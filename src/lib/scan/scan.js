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
const HIDDEN_TAB_DEFAULT_WAIT_MS = 3000;
const HIDDEN_TAB_RETRY_EXTRA_WAIT_MS = 4000;
const HIDDEN_TAB_WAIT_FOR_SELECTOR_TIMEOUT_MS = 10000;
const HIDDEN_TAB_DOM_STABILITY_WINDOW_MS = 1000;
const HIDDEN_TAB_DOM_STABILITY_TIMEOUT_MS = 8000;
const HIDDEN_TAB_DOM_STABILITY_CHECK_INTERVAL_MS = 250;
const HIDDEN_TAB_NETWORK_IDLE_WINDOW_MS = 1500;
const HIDDEN_TAB_NETWORK_IDLE_TIMEOUT_MS = 8000;
const HIDDEN_TAB_NETWORK_IDLE_CHECK_INTERVAL_MS = 100;

class ScanTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ScanTimeoutError';
  }
}

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
    let html = '';
    let scanNoticeKey = null;

    if (page.useHiddenTabScan) {
      ({html, scanNoticeKey} = await getHtmlFromHiddenTabWithRetry(page));
    } else {
      html = await getHtmlFromFetch(page);
    }

    return processHtml(page, html, scanNoticeKey);
  } catch (error) {
    if (error?.name === 'ScanTimeoutError') {
      __.log(`Scan-Timeout bei "${page.title}": ${error.message}`);
    } else {
      __.log(`Could not scan "${page.title}": ${error}`);
    }
    // Only save if the page still exists
    if (await page.existsInStorage()) {
      const updatedPage = await Page.load(page.id);
      updatedPage.state = Page.stateEnum.ERROR;
      updatedPage.lastScanNoticeKey = null;
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
  const fetchOptions = page.sendCredentials ? {credentials: 'include'} : undefined;
  const response = await fetch(page.url, fetchOptions);
  if (!response.ok) {
    throw Error(`[${response.status}] ${response.statusText}`);
  }

  return await getHtmlFromResponse(response, page);
}

/**
 * Versucht den Hidden-Tab-Scan einmalig erneut und fällt danach auf fetch zurück.
 *
 * @param {Page} page - Page object associated with the scan.
 * @returns {{html: string, scanNoticeKey: ?string}} HTML und optionaler Hinweis-Key.
 */
async function getHtmlFromHiddenTabWithRetry(page) {
  try {
    return await getHtmlFromHiddenTab(page);
  } catch (error) {
    logHiddenTabFailure(page, error, '1. Versuch');
  }

  try {
    return await getHtmlFromHiddenTab(page, {extraWaitMs: HIDDEN_TAB_RETRY_EXTRA_WAIT_MS});
  } catch (error) {
    logHiddenTabFailure(page, error, 'Retry');
  }

  __.log(`Hidden-Tab-Scan fehlgeschlagen für "${page.title}", verwende Fetch-Fallback.`);
  const html = await getHtmlFromFetch(page);
  return {html, scanNoticeKey: 'scan.notice.hiddenTabFallback'};
}

/**
 * Lädt HTML über einen versteckten Tab und einen DOM-Snapshot.
 *
 * @param {Page} page - Page object associated with the scan.
 * @param {object} options - Zusatzoptionen für den Scan.
 * @param {number} options.extraWaitMs - Zusätzliche Wartezeit vor dem Snapshot.
 * @returns {string} HTML page content.
 */
async function getHtmlFromHiddenTab(page, {extraWaitMs = 0} = {}) {
  const tab = await browser.tabs.create({
    url: page.url,
    active: false,
  });

  // Tab nach Möglichkeit verstecken, damit er für Nutzer unsichtbar bleibt.
  if (browser.tabs.hide) {
    try {
      await browser.tabs.hide(tab.id);
    } catch (error) {
      __.log(`Konnte Tab nicht verstecken: ${page.url}. Fehler: ${error}`);
    }
  } else if (browser.windows?.create) {
    // Fallback: Tab in ein minimiertes Popup-Fenster verschieben.
    try {
      await browser.windows.create({
        tabId: tab.id,
        type: 'popup',
        state: 'minimized',
        focused: false,
      });
    } catch (error) {
      __.log(`Konnte Tab nicht in ein minimiertes Fenster verschieben: ${page.url}. Fehler: ${error}`);
    }
  }

  let scanNoticeKey = null;

  try {
    await waitForTabReady(tab.id, page);
    const shouldWaitForNetworkIdle = page?.waitForNetworkIdle ?? true;
    if (shouldWaitForNetworkIdle) {
      const networkIdleTimeoutMs =
        page?.waitForNetworkIdleTimeoutMs ?? HIDDEN_TAB_NETWORK_IDLE_TIMEOUT_MS;
      try {
        await waitForNetworkIdle(tab.id, networkIdleTimeoutMs);
      } catch (error) {
        if (error?.noticeKey === 'scan.notice.networkIdleTimeout') {
          scanNoticeKey = error.noticeKey;
        } else {
          throw error;
        }
      }
    }
    const waitMs = HIDDEN_TAB_DEFAULT_WAIT_MS + Math.max(0, extraWaitMs);
    if (waitMs > 0) {
      await __.waitForMs(waitMs);
    }
    await waitForDomStability(tab.id, page);
    const html = await getHtmlFromTab(tab.id);
    return {html, scanNoticeKey};
  } finally {
    await browser.tabs.remove(tab.id).catch(() => {
      __.log(`Konnte Tab nicht schließen: ${page.url}`);
    });
  }
}

/**
 * Protokolliert Fehler beim Hidden-Tab-Scan mit Kontext.
 *
 * @param {Page} page - Page object associated with the scan.
 * @param {Error} error - Fehlerobjekt.
 * @param {string} attemptLabel - Beschriftung des Versuchs.
 */
function logHiddenTabFailure(page, error, attemptLabel) {
  const prefix = `Hidden-Tab-Scan (${attemptLabel})`;
  if (error?.name === 'ScanTimeoutError') {
    __.log(`${prefix} Timeout bei "${page.title}": ${error.message}`);
  } else {
    __.log(`${prefix} fehlgeschlagen bei "${page.title}": ${error}`);
  }
}

/**
 * Wartet, bis der Tab fertig geladen ist.
 *
 * @param {number} tabId - Tab-ID.
 */
async function waitForTabReady(tabId, page) {
  const tab = await browser.tabs.get(tabId);
  if (tab.status === 'complete') {
    await waitForOptionalSelector(tabId, page);
    return;
  }

  await new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new ScanTimeoutError('Timeout beim Laden des versteckten Tabs.'));
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

  await waitForOptionalSelector(tabId, page);
}

/**
 * Wartet, bis im Tab keine Netzwerkaktivität mehr stattfindet oder Hydration-Signale erkannt werden.
 *
 * @param {number} tabId - Tab-ID.
 * @param {number} timeoutMs - Timeout für Network-Idle.
 */
async function waitForNetworkIdle(tabId, timeoutMs) {
  if (timeoutMs <= 0) {
    return;
  }

  const result = await executeInTab(
    tabId,
    async (idleWindowMs, timeoutMsValue, checkIntervalMs) => {
      const hasHydrationSignal = () => {
        const root = document.documentElement;
        const body = document.body;
        if (root?.classList?.contains('hydrated') || root?.classList?.contains('is-hydrated')) {
          return true;
        }
        if (body?.classList?.contains('hydrated') || body?.classList?.contains('is-hydrated')) {
          return true;
        }
        if (root?.dataset?.hydrated === 'true' || body?.dataset?.hydrated === 'true') {
          return true;
        }
        if (document.querySelector('[data-hydrated="true"],[data-hydration="complete"],[data-hydration-state="complete"]')) {
          return true;
        }
        return Boolean(
          window.__NUXT__ ||
          window.__NEXT_DATA__ ||
          window.__APOLLO_STATE__ ||
          window.__REMIX_CONTEXT__ ||
          window.__SVELTEKIT_DATA__,
        );
      };

      return new Promise((resolve) => {
        let pending = 0;
        let lastActivity = performance.now();
        const originalFetch = window.fetch;
        const originalXhrSend = typeof XMLHttpRequest !== 'undefined'
          ? XMLHttpRequest.prototype?.send
          : null;
        let observer = null;
        let intervalId = null;
        let timeoutId = null;

        const resetIdle = () => {
          lastActivity = performance.now();
        };

        const cleanup = () => {
          if (intervalId) {
            clearInterval(intervalId);
          }
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          if (observer) {
            observer.disconnect();
          }
          if (originalFetch) {
            window.fetch = originalFetch;
          }
          if (originalXhrSend && typeof XMLHttpRequest !== 'undefined') {
            XMLHttpRequest.prototype.send = originalXhrSend;
          }
        };

        const decrementPending = () => {
          pending = Math.max(0, pending - 1);
          resetIdle();
        };

        if (typeof originalFetch === 'function') {
          window.fetch = function(...args) {
            pending += 1;
            resetIdle();
            const result = originalFetch.apply(this, args);
            Promise.resolve(result)
              .finally(() => {
                decrementPending();
              });
            return result;
          };
        }

        if (originalXhrSend && typeof XMLHttpRequest !== 'undefined') {
          XMLHttpRequest.prototype.send = function(...args) {
            pending += 1;
            resetIdle();
            this.addEventListener('loadend', decrementPending, {once: true});
            return originalXhrSend.apply(this, args);
          };
        }

        if (window.PerformanceObserver) {
          try {
            observer = new PerformanceObserver((list) => {
              if (list.getEntries().length > 0) {
                resetIdle();
              }
            });
            observer.observe({type: 'resource', buffered: true});
          } catch (error) {
            observer = null;
          }
        }

        const checkIdle = () => {
          const now = performance.now();
          const idleEnough = pending === 0 && now - lastActivity >= idleWindowMs;
          const hydrated = hasHydrationSignal();
          if ((idleEnough || hydrated) && pending === 0) {
            cleanup();
            resolve({idle: true, hydrated});
          }
        };

        intervalId = setInterval(checkIdle, checkIntervalMs);
        timeoutId = setTimeout(() => {
          cleanup();
          resolve({idle: false, hydrated: false});
        }, timeoutMsValue);

        checkIdle();
      });
    },
    [
      HIDDEN_TAB_NETWORK_IDLE_WINDOW_MS,
      timeoutMs,
      HIDDEN_TAB_NETWORK_IDLE_CHECK_INTERVAL_MS,
    ],
  );

  if (!result?.idle) {
    const timeoutError = new ScanTimeoutError('Timeout beim Warten auf Network-Idle.');
    timeoutError.noticeKey = 'scan.notice.networkIdleTimeout';
    throw timeoutError;
  }
}

/**
 * Liefert den DOM-Snapshot aus dem Tab über executeScript.
 *
 * @param {number} tabId - Tab-ID.
 * @returns {string} HTML page content.
 */
async function getHtmlFromTab(tabId) {
  const result = await executeInTab(tabId, () => {
    const escapeText = (value) => {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    };

    const escapeAttribute = (value) => {
      return escapeText(value).replace(/"/g, '&quot;');
    };

    const getIframeScanData = (iframe) => {
      const srcValue = iframe.getAttribute('src') ?? iframe.src ?? '';
      try {
        const doc = iframe.contentDocument;
        if (doc?.documentElement) {
          const html = doc.documentElement.outerHTML ?? '';
          return {content: encodeURIComponent(html), src: srcValue, isCrossOrigin: false};
        }
      } catch (error) {
        // Zugriff auf Cross-Origin-Iframes kann fehlschlagen, dann Platzhalter verwenden.
      }
      return {content: 'cross-origin', src: srcValue, isCrossOrigin: true};
    };

    const serializeAttributes = (element, extraAttributes = {}) => {
      const parts = [];
      for (const attr of Array.from(element.attributes ?? [])) {
        if (attr.name === 'data-scan-content' || attr.name === 'data-scan-src') {
          continue;
        }
        parts.push(`${attr.name}="${escapeAttribute(attr.value)}"`);
      }
      for (const [name, value] of Object.entries(extraAttributes)) {
        if (value == null || value === '') {
          continue;
        }
        parts.push(`${name}="${escapeAttribute(value)}"`);
      }
      return parts.length ? ` ${parts.join(' ')}` : '';
    };

    const serializeChildren = (parentNode) => {
      let html = '';
      for (const child of Array.from(parentNode.childNodes ?? [])) {
        html += serializeNode(child);
      }
      return html;
    };

    const serializeElement = (element) => {
      const tagName = element.tagName.toLowerCase();
      let extraAttributes = {};
      if (tagName === 'iframe') {
        const iframeData = getIframeScanData(element);
        extraAttributes = {
          'data-scan-content': iframeData.content,
          'data-scan-src': iframeData.src,
        };
      }
      let html = `<${tagName}${serializeAttributes(element, extraAttributes)}>`;
      if (element.shadowRoot) {
        const shadowContent = serializeChildren(element.shadowRoot);
        html += `<template data-shadow-root="${element.shadowRoot.mode}">${shadowContent}</template>`;
      }
      html += serializeChildren(element);
      html += `</${tagName}>`;
      return html;
    };

    const serializeNode = (node) => {
      if (!node) {
        return '';
      }
      switch (node.nodeType) {
        case Node.DOCUMENT_NODE:
          return serializeChildren(node);
        case Node.DOCUMENT_FRAGMENT_NODE:
          return serializeChildren(node);
        case Node.DOCUMENT_TYPE_NODE:
          return `<!DOCTYPE ${node.name}>`;
        case Node.ELEMENT_NODE:
          return serializeElement(node);
        case Node.TEXT_NODE:
          return escapeText(node.nodeValue);
        case Node.COMMENT_NODE:
          return `<!--${node.nodeValue ?? ''}-->`;
        default:
          return '';
      }
    };

    const doctype = document.doctype ? `<!DOCTYPE ${document.doctype.name}>` : '';
    return `${doctype}${serializeNode(document.documentElement)}`;
  });
  return result ?? '';
}

/**
 * Führt eine Funktion im Tab aus und liefert das Ergebnis zurück.
 *
 * @param {number} tabId - Tab-ID.
 * @param {Function} func - Funktion, die im Tab ausgeführt wird.
 * @param {Array} args - Argumente für die Funktion.
 * @returns {any} Ergebnis der Funktion.
 */
async function executeInTab(tabId, func, args = []) {
  if (browser.scripting && browser.scripting.executeScript) {
    const [{result}] = await browser.scripting.executeScript({
      target: {tabId},
      func,
      args,
    });
    return result;
  }

  const serializedArgs = args.map((arg) => JSON.stringify(arg)).join(',');
  const code = `(${func})(${serializedArgs})`;
  const [result] = await browser.tabs.executeScript(tabId, {code});
  return result;
}

/**
 * Wartet optional auf einen Selektor im Tab.
 *
 * @param {number} tabId - Tab-ID.
 * @param {Page} page - Page object associated with the scan.
 */
async function waitForOptionalSelector(tabId, page) {
  const selector = page?.waitForSelector;
  if (!selector) {
    return;
  }

  const timeoutMs = page?.waitForSelectorTimeoutMs ?? HIDDEN_TAB_WAIT_FOR_SELECTOR_TIMEOUT_MS;
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const found = await executeInTab(
      tabId,
      (selectorToFind) => Boolean(document.querySelector(selectorToFind)),
      [selector],
    );
    if (found) {
      return;
    }
    await __.waitForMs(HIDDEN_TAB_DOM_STABILITY_CHECK_INTERVAL_MS);
  }

  throw new ScanTimeoutError(`Timeout beim Warten auf Selektor: ${selector}`);
}

/**
 * Wartet, bis sich das DOM über ein Zeitfenster nicht mehr ändert.
 *
 * @param {number} tabId - Tab-ID.
 * @param {Page} page - Page object associated with the scan.
 */
async function waitForDomStability(tabId, page) {
  const stabilityWindowMs = page?.hiddenTabDomStabilityWindowMs ?? HIDDEN_TAB_DOM_STABILITY_WINDOW_MS;
  if (stabilityWindowMs <= 0) {
    return;
  }

  const timeoutMs = page?.hiddenTabDomStabilityTimeoutMs ?? HIDDEN_TAB_DOM_STABILITY_TIMEOUT_MS;
  const startTime = Date.now();
  let lastChangeTime = startTime;
  const ignoreSelectorList = parseIgnoreSelectorList(page?.hiddenTabIgnoreSelectors);
  const useTextHash = page?.hiddenTabUseTextSnapshotHash ?? false;
  let lastSnapshot = await getDomSnapshotInfo(tabId, {
    ignoreSelectorList,
    includeTextHash: useTextHash,
  });

  while (Date.now() - startTime < timeoutMs) {
    await __.waitForMs(HIDDEN_TAB_DOM_STABILITY_CHECK_INTERVAL_MS);
    const nextSnapshot = await getDomSnapshotInfo(tabId, {
      ignoreSelectorList,
      includeTextHash: useTextHash,
    });
    const lastHash = getSnapshotHash(lastSnapshot, useTextHash);
    const nextHash = getSnapshotHash(nextSnapshot, useTextHash);
    const lastLength = getSnapshotLength(lastSnapshot, useTextHash);
    const nextLength = getSnapshotLength(nextSnapshot, useTextHash);
    if (nextHash !== lastHash || nextLength !== lastLength) {
      lastSnapshot = nextSnapshot;
      lastChangeTime = Date.now();
    }
    if (Date.now() - lastChangeTime >= stabilityWindowMs) {
      return;
    }
  }

  throw new ScanTimeoutError('Timeout beim Warten auf DOM-Stabilität.');
}

/**
 * Liefert Hash und Länge des DOMs aus dem Tab.
 *
 * @param {number} tabId - Tab-ID.
 * @param {object} options - Optionen für die Snapshot-Ermittlung.
 * @param {Array<string>} options.ignoreSelectorList - Selektoren, die entfernt werden.
 * @param {boolean} options.includeTextHash - Ob zusätzlich ein Text-Hash erstellt wird.
 * @returns {{length: number, hash: string, textLength: number, textHash: ?string}}
 *   Snapshot-Info.
 */
async function getDomSnapshotInfo(
  tabId,
  {ignoreSelectorList = [], includeTextHash = false} = {},
) {
  const snapshot = await executeInTab(
    tabId,
    (selectorsToIgnore, shouldIncludeTextHash) => {
      const computeHash = (value) => {
        let hash = 2166136261;
        const safeValue = value || '';
        for (let i = 0; i < safeValue.length; i++) {
          hash ^= safeValue.charCodeAt(i);
          hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
        }
        return (hash >>> 0).toString(16);
      };
      const root = document.documentElement;
      if (!root) {
        return {length: 0, hash: '0', textLength: 0, textHash: null};
      }

      const cleanedRoot = root.cloneNode(true);
      const removalSelectors = ['script', 'style', 'meta'];
      if (Array.isArray(selectorsToIgnore)) {
        removalSelectors.push(...selectorsToIgnore.filter(Boolean));
      }
      removalSelectors.forEach((selector) => {
        try {
          cleanedRoot.querySelectorAll(selector).forEach((element) => element.remove());
        } catch (error) {
          // Ungültige Selektoren sollen den Snapshot nicht blockieren.
        }
      });

      const html = cleanedRoot.outerHTML ?? '';
      const text = shouldIncludeTextHash ? (cleanedRoot.innerText ?? '') : '';
      return {
        length: html.length,
        hash: computeHash(html),
        textLength: text.length,
        textHash: shouldIncludeTextHash ? computeHash(text) : null,
      };
    },
    [ignoreSelectorList, includeTextHash],
  );

  return snapshot ?? {length: 0, hash: '0', textLength: 0, textHash: null};
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
async function processHtml(page, scannedHtml, scanNoticeKey = null) {
  // Do nothing if the page no longer exists
  const existsInStorage = await page.existsInStorage();
  if (!existsInStorage) {
    return false;
  }

  const prevHtml = await PageStore.loadHtml(page.id, PageStore.htmlTypes.NEW);

  return processHtmlWithConditions(page, scannedHtml, prevHtml, scanNoticeKey);
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
async function processHtmlWithConditions(page, scanHtml, prevHtml, scanNoticeKey) {
  if (page.selectors && prevHtml != null) {
    const scanParts = await __.matchHtmlWithSelector(scanHtml, page.selectors);
    const prevParts = await __.matchHtmlWithSelector(prevHtml, page.selectors);
    return updatePageState(
      page,
      new ContentData(prevHtml, prevParts),
      new ContentData(scanHtml, scanParts),
      scanNoticeKey,
    );
  } else {
    return updatePageState(
      page,
      new ContentData(prevHtml, null),
      new ContentData(scanHtml, null),
      scanNoticeKey,
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
async function updatePageState(page, prevHtmlData, scannedHtmlData, scanNoticeKey = null) {
  const updatedPage = await Page.load(page.id);
  const scannedHtmlHash = computeHtmlHash(scannedHtmlData.html);
  updatedPage.lastScanNoticeKey = scanNoticeKey;

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

/**
 * Zerlegt Selektorlisten in einzelne Einträge.
 *
 * @param {?string} selectors - Selektor-String.
 * @returns {Array<string>} Bereinigte Selektoren.
 */
function parseIgnoreSelectorList(selectors) {
  if (!selectors) {
    return [];
  }
  return selectors
    .split(/[\n,]+/)
    .map((selector) => selector.trim())
    .filter(Boolean);
}

/**
 * Liefert den gewünschten Snapshot-Hash zurück.
 *
 * @param {{hash: string, textHash: ?string}} snapshot - Snapshot-Daten.
 * @param {boolean} useTextHash - Ob der Text-Hash bevorzugt wird.
 * @returns {string} Hash-Wert.
 */
function getSnapshotHash(snapshot, useTextHash) {
  if (useTextHash && snapshot?.textHash) {
    return snapshot.textHash;
  }
  return snapshot?.hash ?? '0';
}

/**
 * Liefert die gewünschte Snapshot-Länge zurück.
 *
 * @param {{length: number, textLength: number}} snapshot - Snapshot-Daten.
 * @param {boolean} useTextHash - Ob die Textlänge bevorzugt wird.
 * @returns {number} Länge.
 */
function getSnapshotLength(snapshot, useTextHash) {
  if (useTextHash && Number.isFinite(snapshot?.textLength)) {
    return snapshot.textLength;
  }
  return snapshot?.length ?? 0;
}
