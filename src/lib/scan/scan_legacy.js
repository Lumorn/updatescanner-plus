import {PageStore} from '/lib/page/page_store.js';
import {Page} from '/lib/page/page.js';
import {isUpToDate} from '/lib/update/update.js';
import {log} from '/lib/util/log.js';
import {waitForMs} from '/lib/util/promise.js';
import {applyEncoding, detectEncoding} from '/lib/util/encoding.js';
import {Config} from '/lib/util/config.js';
import {matchHtmlWithSelector} from './selector_matcher.js';
import {parseHTML} from '/lib/util/html.js';
import {getChanges, ContentData, changeEnum} from './scan_content.js';
import {isMajorChange} from './fuzzy.js';
import {resolveFaviconUrl} from './scan_favicon.js';


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

/**
 * Ermittelt den aktiven Selektor für Bereichsscans.
 *
 * @param {Page} page - Page object.
 * @returns {?string} Selektor-String.
 */
function resolveAreaSelectors(page) {
  return page?.areaSelector || page?.selectors || null;
}

/**
 * Ermittelt den Scan-Quellenmodus mit Legacy-Fallback.
 *
 * @param {Page} page - Page object.
 * @returns {string} Modus für den Scan.
 */
function resolveScanSourceMode(page) {
  if (page?.scanSourceMode === ScanSourceMode.HEADLESS) {
    return ScanSourceMode.HEADLESS;
  }
  if (page?.scanSourceMode === ScanSourceMode.HTTP) {
    return ScanSourceMode.HTTP;
  }
  return page?.useHiddenTabScan ? ScanSourceMode.HEADLESS : ScanSourceMode.HTTP;
}

/**
 * Ermittelt die Headless-Wartestrategie mit Legacy-Fallback.
 *
 * @param {Page} page - Page object.
 * @returns {string} Strategie für den Headless-Scan.
 */
function resolveHeadlessWaitStrategy(page) {
  if (page?.headlessWaitStrategy === HeadlessWaitStrategy.SELECTOR_READY) {
    return HeadlessWaitStrategy.SELECTOR_READY;
  }
  if (page?.headlessWaitStrategy === HeadlessWaitStrategy.TIMEOUT) {
    return HeadlessWaitStrategy.TIMEOUT;
  }
  if (page?.headlessWaitStrategy === HeadlessWaitStrategy.NETWORK_IDLE) {
    return HeadlessWaitStrategy.NETWORK_IDLE;
  }
  if (page?.waitForSelector) {
    return HeadlessWaitStrategy.SELECTOR_READY;
  }
  if (page?.waitForNetworkIdle === false) {
    return HeadlessWaitStrategy.TIMEOUT;
  }
  return HeadlessWaitStrategy.NETWORK_IDLE;
}

const SCAN_LEGACY_IDLE_DEFAULT_MS = 2000;
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
const HIDDEN_TAB_SCROLL_DEFAULT_DELAY_MS = 250;
const HIDDEN_TAB_SCROLL_TIMEOUT_BUFFER_MS = 2000;
const FETCH_FALLBACK_MIN_LENGTH = 200;

const ScanSourceMode = {
  HTTP: 'http',
  HEADLESS: 'headless',
};

const HeadlessWaitStrategy = {
  NETWORK_IDLE: 'network-idle',
  SELECTOR_READY: 'selector-ready',
  TIMEOUT: 'timeout',
};

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
  const scanIdleMs = await getScanLegacyIdleMs();
  for (const page of pageList) {
    if (await scanPage(page)) {
      newMajorChangeCount++;
    }

    await __.waitForMs(scanIdleMs);
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
    const scanSourceMode = resolveScanSourceMode(page);
    if (scanSourceMode === ScanSourceMode.HEADLESS) {
      ({html, scanNoticeKey} = await getHtmlFromHeadlessFetcherWithRetry(page));
    } else {
      html = await getHtmlFromHttpFetcher(page);
      if (shouldFallbackToHeadless(html)) {
        __.log(`HTTP-Ergebnis zu kurz/leer für "${page.title}", starte Headless-Fallback.`);
        const fallbackResult = await getHtmlFromHeadlessFetcherWithRetry(page);
        const fallbackNoticeKey =
          fallbackResult.scanNoticeKey ?? 'scan.notice.fetchTooShortFallback';
        return processHtml(page, fallbackResult.html, fallbackNoticeKey);
      }
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
      updatedPage.lastScanNoticeKey = error?.noticeKey ?? null;
      updatedPage.save();
    }
  }
  return false;
}

/**
 * Lädt HTML über den HTTP-Fetcher (Standardpfad).
 *
 * @param {Page} page - Page object associated with the scan.
 * @returns {string} HTML page content.
 */
async function getHtmlFromHttpFetcher(page) {
  let response;
  try {
    response = await fetch(page.url);
  } catch (error) {
    __.log(`Fetch fehlgeschlagen für "${page.title}": ${error}`);
    const fetchError = new Error(`Fetch fehlgeschlagen: ${error}`);
    fetchError.noticeKey = 'scan.notice.fetchFailed';
    throw fetchError;
  }

  if (!response.ok) {
    __.log(`Fetch-Statusfehler für "${page.title}": ${response.status} ${response.statusText}`);
    const statusError = new Error(`[${response.status}] ${response.statusText}`);
    statusError.noticeKey = 'scan.notice.fetchFailed';
    throw statusError;
  }

  return await getHtmlFromResponse(response, page);
}

/**
 * Prüft, ob ein HTTP-HTML so kurz ist, dass ein Headless-Fallback sinnvoll ist.
 *
 * @param {?string} html - HTML-Text.
 * @returns {boolean} true, wenn ein Fallback empfohlen wird.
 */
function shouldFallbackToHeadless(html) {
  if (html == null) {
    return true;
  }
  const trimmed = html.trim();
  if (trimmed.length === 0) {
    return true;
  }
  if (trimmed.length < FETCH_FALLBACK_MIN_LENGTH) {
    const lowerHtml = trimmed.toLowerCase();
    const hasHtmlMarkers =
      lowerHtml.includes('<html') ||
      lowerHtml.includes('<body') ||
      lowerHtml.includes('<!doctype');
    return !hasHtmlMarkers;
  }
  return false;
}

/**
 * Liest die konfigurierte Wartezeit zwischen Legacy-Scans.
 *
 * @returns {Promise<number>} Wartezeit in Millisekunden.
 */
async function getScanLegacyIdleMs() {
  const configValue = await Config.loadSingleSetting('scanLegacyIdleMs');
  if (configValue === null || configValue === '') {
    return SCAN_LEGACY_IDLE_DEFAULT_MS;
  }
  const parsed = Number(configValue);
  return Number.isFinite(parsed) && parsed >= 0 ?
    parsed :
    SCAN_LEGACY_IDLE_DEFAULT_MS;
}

/**
 * Versucht den Hidden-Tab-Scan einmalig erneut und fällt danach auf fetch zurück.
 *
 * @param {Page} page - Page object associated with the scan.
 * @returns {{html: string, scanNoticeKey: ?string}} HTML und optionaler Hinweis-Key.
 */
async function getHtmlFromHeadlessFetcherWithRetry(page) {
  let lastHiddenTabNoticeKey = null;
  try {
    return await getHtmlFromHeadlessFetcher(page);
  } catch (error) {
    const noticeKey = logHiddenTabFailure(page, error, '1. Versuch');
    lastHiddenTabNoticeKey = noticeKey ?? lastHiddenTabNoticeKey;
  }

  try {
    return await getHtmlFromHeadlessFetcher(page, {extraWaitMs: HIDDEN_TAB_RETRY_EXTRA_WAIT_MS});
  } catch (error) {
    const noticeKey = logHiddenTabFailure(page, error, 'Retry');
    lastHiddenTabNoticeKey = noticeKey ?? lastHiddenTabNoticeKey;
  }

  __.log(`Hidden-Tab-Scan fehlgeschlagen für "${page.title}", verwende Fetch-Fallback.`);
  const html = await getHtmlFromHttpFetcher(page);
  return {
    html,
    scanNoticeKey: lastHiddenTabNoticeKey ?? 'scan.notice.hiddenTabFallback',
  };
}

/**
 * Lädt HTML über den Headless-Fetcher (versteckter Tab + DOM-Snapshot).
 *
 * @param {Page} page - Page object associated with the scan.
 * @param {object} options - Zusatzoptionen für den Scan.
 * @param {number} options.extraWaitMs - Zusätzliche Wartezeit vor dem Snapshot.
 * @returns {{html: string, scanNoticeKey: ?string}} HTML und optionaler Hinweis-Key.
 */
async function getHtmlFromHeadlessFetcher(page, {extraWaitMs = 0} = {}) {
  const tab = await browser.tabs.create({
    url: page.url,
    active: false,
  });

  let scanNoticeKey = null;

  // Tab nach Möglichkeit verstecken, damit er für Nutzer unsichtbar bleibt.
  if (browser.tabs.hide) {
    try {
      await browser.tabs.hide(tab.id);
    } catch (error) {
      const hideError = new Error(`Tab konnte nicht versteckt werden: ${error}`);
      hideError.noticeKey = 'scan.notice.hiddenTabHideFailed';
      const noticeKey = logHiddenTabFailure(page, hideError, 'Tab verstecken');
      scanNoticeKey = noticeKey ?? scanNoticeKey;
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

  try {
    await waitForTabReady(tab.id);
    scanNoticeKey =
      (await applyHeadlessWaitStrategy(tab.id, page, extraWaitMs)) ?? scanNoticeKey;
    if (page?.hiddenTabScrollSteps && page.hiddenTabScrollSteps > 0) {
      try {
        await simulateScroll(tab.id, {
          steps: page.hiddenTabScrollSteps,
          delayMs: page.hiddenTabScrollDelayMs,
          maxHeight: page.hiddenTabScrollMaxHeight,
        });
      } catch (error) {
        const noticeKey = error?.noticeKey ?? 'scan.notice.hiddenTabScrollError';
        scanNoticeKey = noticeKey;
        __.log(`Scroll-Simulation fehlgeschlagen bei "${page.title}": ${error}`);
      }
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
 * @returns {?string} Hinweis-Key für die UI.
 */
function logHiddenTabFailure(page, error, attemptLabel) {
  const prefix = `Hidden-Tab-Scan (${attemptLabel})`;
  const noticeKey = getHiddenTabFailureNoticeKey(error);
  const noticeSuffix = noticeKey ? ` [${noticeKey}]` : '';
  if (error?.name === 'ScanTimeoutError') {
    __.log(`${prefix}${noticeSuffix} Timeout bei "${page.title}": ${error.message}`);
  } else {
    __.log(`${prefix}${noticeSuffix} fehlgeschlagen bei "${page.title}": ${error}`);
  }
  return noticeKey;
}

/**
 * Ermittelt einen Hinweis-Key für Hidden-Tab-Fehler.
 *
 * @param {Error} error - Fehlerobjekt.
 * @returns {?string} Hinweis-Key für die UI.
 */
function getHiddenTabFailureNoticeKey(error) {
  if (error?.noticeKey) {
    return error.noticeKey;
  }
  if (error?.name === 'ScanTimeoutError') {
    return 'scan.notice.hiddenTabTimeout';
  }
  const message = String(error?.message ?? error ?? '').toLowerCase();
  if (message.includes('content security policy') || message.includes('csp')) {
    return 'scan.notice.hiddenTabCsp';
  }
  if (
    message.includes('executescript') ||
    message.includes('scripting.execute') ||
    message.includes('tabs.executescript')
  ) {
    return 'scan.notice.hiddenTabExecuteScriptError';
  }
  return null;
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

}

/**
 * Wendet die konfigurierte Headless-Wartestrategie an.
 *
 * @param {number} tabId - Tab-ID.
 * @param {Page} page - Page object associated with the scan.
 * @param {number} extraWaitMs - Zusätzliche Wartezeit (z. B. beim Retry).
 * @returns {Promise<?string>} Optionaler Hinweis-Key.
 */
async function applyHeadlessWaitStrategy(tabId, page, extraWaitMs) {
  const strategy = resolveHeadlessWaitStrategy(page);
  let scanNoticeKey = null;
  const defaultWaitMs = page?.hiddenTabDefaultWaitMs ?? HIDDEN_TAB_DEFAULT_WAIT_MS;
  const totalWaitMs = defaultWaitMs + Math.max(0, extraWaitMs);

  if (strategy === HeadlessWaitStrategy.NETWORK_IDLE) {
    const networkIdleTimeoutMs =
      page?.waitForNetworkIdleTimeoutMs ?? HIDDEN_TAB_NETWORK_IDLE_TIMEOUT_MS;
    const networkIdleWindowMs =
      page?.hiddenTabNetworkIdleWindowMs ?? HIDDEN_TAB_NETWORK_IDLE_WINDOW_MS;
    try {
      await waitForNetworkIdle(tabId, {
        timeoutMs: networkIdleTimeoutMs,
        idleWindowMs: networkIdleWindowMs,
      });
    } catch (error) {
      if (error?.noticeKey === 'scan.notice.networkIdleTimeout') {
        scanNoticeKey = error.noticeKey;
      } else {
        throw error;
      }
    }
    if (page?.waitForSelector) {
      await waitForOptionalSelector(tabId, page);
    }
    await waitForOptionalDelay(totalWaitMs);
    return scanNoticeKey;
  }

  if (strategy === HeadlessWaitStrategy.SELECTOR_READY) {
    if (page?.waitForSelector) {
      await waitForOptionalSelector(tabId, page);
    } else {
      __.log('Headless-Wartestrategie "selector-ready" ohne Selektor, nutze Timeout.');
    }
    await waitForOptionalDelay(totalWaitMs);
    return scanNoticeKey;
  }

  await waitForOptionalDelay(totalWaitMs);
  return scanNoticeKey;
}

/**
 * Wartet optional für eine definierte Zeit.
 *
 * @param {number} waitMs - Wartezeit in Millisekunden.
 */
async function waitForOptionalDelay(waitMs) {
  if (waitMs > 0) {
    await __.waitForMs(waitMs);
  }
}

/**
 * Wartet, bis im Tab keine Netzwerkaktivität mehr stattfindet oder Hydration-Signale erkannt werden.
 *
 * @param {number} tabId - Tab-ID.
 * @param {{timeoutMs: number, idleWindowMs: number}} options - Optionen für Network-Idle.
 */
async function waitForNetworkIdle(tabId, {timeoutMs, idleWindowMs} = {}) {
  const timeoutMsValue = Math.max(0, timeoutMs ?? HIDDEN_TAB_NETWORK_IDLE_TIMEOUT_MS);
  if (timeoutMsValue <= 0) {
    return;
  }

  const result = await executeInTab(
    tabId,
    async (idleWindowMsValue, timeoutMsValue, checkIntervalMs) => {
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
        let lastActivity = performance.now();
        const fetchActivity = {pending: 0, lastStart: 0, lastEnd: 0};
        const xhrActivity = {pending: 0, lastStart: 0, lastEnd: 0};
        const originalFetch = window.fetch;
        const originalXhrOpen = typeof XMLHttpRequest !== 'undefined'
          ? XMLHttpRequest.prototype?.open
          : null;
        const originalXhrSend = typeof XMLHttpRequest !== 'undefined'
          ? XMLHttpRequest.prototype?.send
          : null;
        const originalXhrAbort = typeof XMLHttpRequest !== 'undefined'
          ? XMLHttpRequest.prototype?.abort
          : null;
        const originalWebSocket = window.WebSocket;
        const originalEventSource = window.EventSource;
        const xhrState = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
        const longLivedConnections = new Set();
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
          if (originalXhrOpen && typeof XMLHttpRequest !== 'undefined') {
            XMLHttpRequest.prototype.open = originalXhrOpen;
          }
          if (originalXhrSend && typeof XMLHttpRequest !== 'undefined') {
            XMLHttpRequest.prototype.send = originalXhrSend;
          }
          if (originalXhrAbort && typeof XMLHttpRequest !== 'undefined') {
            XMLHttpRequest.prototype.abort = originalXhrAbort;
          }
          if (originalWebSocket) {
            window.WebSocket = originalWebSocket;
          }
          if (originalEventSource) {
            window.EventSource = originalEventSource;
          }
          longLivedConnections.clear();
        };

        const decrementFetchPending = () => {
          fetchActivity.pending = Math.max(0, fetchActivity.pending - 1);
          fetchActivity.lastEnd = performance.now();
          resetIdle();
        };

        const decrementXhrPending = (xhrInstance) => {
          if (xhrState) {
            const state = xhrState.get(xhrInstance);
            if (state?.done) {
              return;
            }
            if (state) {
              state.done = true;
            }
          }
          xhrActivity.pending = Math.max(0, xhrActivity.pending - 1);
          xhrActivity.lastEnd = performance.now();
          resetIdle();
        };

        if (typeof originalFetch === 'function') {
          window.fetch = function(...args) {
            fetchActivity.pending += 1;
            fetchActivity.lastStart = performance.now();
            resetIdle();
            const result = originalFetch.apply(this, args);
            Promise.resolve(result)
              .finally(() => {
                decrementFetchPending();
              });
            return result;
          };
        }

        if (
          originalXhrOpen &&
          originalXhrSend &&
          originalXhrAbort &&
          typeof XMLHttpRequest !== 'undefined'
        ) {
          // XHR-Aktivität mit Pending-Counter erfassen, damit Idle erst nach Abschluss greift.
          XMLHttpRequest.prototype.open = function(...args) {
            if (xhrState) {
              xhrState.set(this, {openedAt: performance.now(), done: false});
            }
            resetIdle();
            return originalXhrOpen.apply(this, args);
          };

          XMLHttpRequest.prototype.send = function(...args) {
            xhrActivity.pending += 1;
            xhrActivity.lastStart = performance.now();
            resetIdle();
            const markDone = () => decrementXhrPending(this);
            this.addEventListener('loadend', markDone, {once: true});
            this.addEventListener('error', markDone, {once: true});
            this.addEventListener('timeout', markDone, {once: true});
            this.addEventListener('abort', markDone, {once: true});
            return originalXhrSend.apply(this, args);
          };

          XMLHttpRequest.prototype.abort = function(...args) {
            decrementXhrPending(this);
            return originalXhrAbort.apply(this, args);
          };
        }

        // WebSocket-Verbindungen zählen nicht als Pending, sollen aber Aktivität melden.
        if (typeof originalWebSocket === 'function') {
          window.WebSocket = function(...args) {
            const socket = new originalWebSocket(...args);
            longLivedConnections.add(socket);
            const markActivity = () => resetIdle();
            socket.addEventListener('open', markActivity);
            socket.addEventListener('message', markActivity);
            socket.addEventListener('error', markActivity);
            socket.addEventListener('close', () => {
              longLivedConnections.delete(socket);
              resetIdle();
            });
            return socket;
          };
        }

        // EventSource verhält sich häufig long-lived und darf den Idle-Check nicht blockieren.
        if (typeof originalEventSource === 'function') {
          window.EventSource = function(...args) {
            const source = new originalEventSource(...args);
            longLivedConnections.add(source);
            const markActivity = () => resetIdle();
            source.addEventListener('open', markActivity);
            source.addEventListener('message', markActivity);
            source.addEventListener('error', markActivity);
            source.addEventListener('close', () => {
              longLivedConnections.delete(source);
              resetIdle();
            });
            return source;
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

        const hasPendingRequests = () => fetchActivity.pending > 0 || xhrActivity.pending > 0;

        const checkIdle = () => {
          const now = performance.now();
          const idleEnough =
            !hasPendingRequests() && now - lastActivity >= idleWindowMsValue;
          const hydrated = hasHydrationSignal();
          if ((idleEnough || hydrated) && !hasPendingRequests()) {
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
      Math.max(0, idleWindowMs ?? HIDDEN_TAB_NETWORK_IDLE_WINDOW_MS),
      timeoutMsValue,
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
 * Simuliert Scrollen im Tab, um Lazy-Content zu laden.
 *
 * @param {number} tabId - Tab-ID.
 * @param {object} options - Scroll-Optionen.
 * @param {number} options.steps - Anzahl der Scroll-Schritte.
 * @param {?number} options.delayMs - Verzögerung pro Schritt.
 * @param {?number} options.maxHeight - Maximale Scroll-Höhe.
 */
async function simulateScroll(tabId, {steps, delayMs = null, maxHeight = null} = {}) {
  const scrollSteps = Number.isFinite(steps) ? Math.max(0, steps) : 0;
  if (scrollSteps <= 0) {
    return false;
  }
  const stepDelayMs = Number.isFinite(delayMs)
    ? Math.max(0, delayMs)
    : HIDDEN_TAB_SCROLL_DEFAULT_DELAY_MS;
  const maxScrollHeight = Number.isFinite(maxHeight) ? Math.max(0, maxHeight) : null;
  const timeoutMs = Math.max(
    HIDDEN_TAB_SCROLL_TIMEOUT_BUFFER_MS,
    scrollSteps * (stepDelayMs + HIDDEN_TAB_DOM_STABILITY_CHECK_INTERVAL_MS)
      + HIDDEN_TAB_SCROLL_TIMEOUT_BUFFER_MS,
  );

  try {
    await Promise.race([
      executeInTab(
        tabId,
        async (scrollStepCount, delayPerStepMs, maxScrollHeightValue) => {
          const waitForMutationOrDelay = (delayToUseMs) => new Promise((resolve) => {
            let resolved = false;
            const observer = new MutationObserver(() => {
              if (resolved) {
                return;
              }
              resolved = true;
              observer.disconnect();
              resolve(true);
            });
            if (document.documentElement) {
              observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true,
              });
            }
            if (delayToUseMs > 0) {
              setTimeout(() => {
                if (resolved) {
                  return;
                }
                resolved = true;
                observer.disconnect();
                resolve(false);
              }, delayToUseMs);
            } else {
              Promise.resolve().then(() => {
                if (resolved) {
                  return;
                }
                resolved = true;
                observer.disconnect();
                resolve(false);
              });
            }
          });

          const scrollRoot = document.scrollingElement || document.documentElement || document.body;
          if (!scrollRoot) {
            return false;
          }
          const rawScrollHeight = scrollRoot.scrollHeight || 0;
          const viewportHeight = window.innerHeight || 0;
          const boundedHeight = maxScrollHeightValue && maxScrollHeightValue > 0
            ? Math.min(rawScrollHeight, maxScrollHeightValue)
            : rawScrollHeight;
          const maxScrollTop = Math.max(0, boundedHeight - viewportHeight);
          if (maxScrollTop === 0) {
            window.scrollTo(0, 0);
            return false;
          }
          const stepSize = maxScrollTop / Math.max(1, scrollStepCount);
          for (let stepIndex = 1; stepIndex <= scrollStepCount; stepIndex += 1) {
            const nextScrollTop = Math.min(maxScrollTop, Math.round(stepIndex * stepSize));
            window.scrollTo(0, nextScrollTop);
            await waitForMutationOrDelay(delayPerStepMs);
          }
          window.scrollTo(0, 0);
          await waitForMutationOrDelay(Math.min(delayPerStepMs, 200));
          return true;
        },
        [scrollSteps, stepDelayMs, maxScrollHeight],
      ),
      (async () => {
        await __.waitForMs(timeoutMs);
        const timeoutError = new ScanTimeoutError('Timeout bei Scroll-Simulation.');
        timeoutError.noticeKey = 'scan.notice.hiddenTabScrollTimeout';
        throw timeoutError;
      })(),
    ]);
    return true;
  } catch (error) {
    if (error?.name === 'ScanTimeoutError') {
      throw error;
    }
    const scrollError = new Error(error?.message || 'Scroll-Simulation fehlgeschlagen.');
    scrollError.noticeKey = 'scan.notice.hiddenTabScrollError';
    throw scrollError;
  }
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
 * Normalisiert HTML durch Entfernen/Ersetzen dynamischer Bereiche.
 *
 * @param {?string} html - HTML-Text.
 * @param {Page} page - Page object associated with the scan.
 * @returns {?string} Normalisiertes HTML.
 */
function normalizeHtml(html, page) {
  if (html == null) {
    return html;
  }

  const ignoreSelectors = parseIgnoreSelectorList(page?.ignoredSelectors);
  if (ignoreSelectors.length === 0) {
    return html;
  }

  const dom = parseHTML(html);
  if (!dom) {
    __.log('DOMParser nicht verfügbar, Ignorier-Selektoren werden übersprungen.');
    return html;
  }

  ignoreSelectors.forEach((selector) => {
    try {
      dom.querySelectorAll(selector).forEach((element) => {
        const placeholder = dom.createComment(`ignored:${selector}`);
        const parent = element.parentNode;
        if (parent) {
          parent.replaceChild(placeholder, element);
        } else {
          element.remove();
        }
      });
    } catch (error) {
      // Ungültige Selektoren sollen die Normalisierung nicht blockieren.
    }
  });

  return dom.documentElement?.outerHTML ?? html;
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
  const quickHash = computeQuickHtmlHash(scannedHtml);
  const prevQuickHash = computeQuickHtmlHash(prevHtml);

  if (prevHtml != null && quickHash === prevQuickHash) {
    return applyQuickNoChange(page, scanNoticeKey);
  }

  const normalizedScanHtml = normalizeHtml(scannedHtml, page);
  const normalizedPrevHtml = normalizeHtml(prevHtml, page);

  return processHtmlWithConditions(
    page,
    normalizedScanHtml,
    normalizedPrevHtml,
    scanNoticeKey,
  );
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
  const selectors = resolveAreaSelectors(page);
  if (selectors && prevHtml != null) {
    const scanParts = await __.matchHtmlWithSelector(scanHtml, selectors);
    const prevParts = await __.matchHtmlWithSelector(prevHtml, selectors);
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
 * Verarbeitet einen Text-Diff-Scan basierend auf HTML-Quellen.
 *
 * @param {Page} page - Page object to update.
 * @param {?string} scanHtml - Gescanntes HTML.
 * @param {?string} prevHtml - Vorheriges HTML.
 * @param {?string} scanNoticeKey - Optionaler Hinweis-Key.
 * @returns {boolean} True, wenn eine neue größere Änderung erkannt wurde.
 */
async function processTextDiff(page, scanHtml, prevHtml, scanNoticeKey) {
  const selectors = resolveAreaSelectors(page);
  if (selectors && prevHtml != null) {
    const scanData = buildTextContentData(scanHtml, selectors);
    const prevData = buildTextContentData(prevHtml, selectors);
    return updatePageState(page, prevData, scanData, scanNoticeKey);
  }

  const scanData = buildTextContentData(scanHtml, null);
  const prevData = buildTextContentData(prevHtml, null);
  return updatePageState(page, prevData, scanData, scanNoticeKey);
}

/**
 * Erstellt ContentData aus HTML-Text für den Text-Diff.
 *
 * @param {?string} html - HTML-Text.
 * @param {?string} selectors - Optionaler Selektor für Teilbereiche.
 * @returns {ContentData} ContentData mit Textinhalt.
 */
function buildTextContentData(html, selectors) {
  const textData = extractTextFromHtml(html, selectors);
  return new ContentData(textData.text, textData.parts);
}

/**
 * Extrahiert Text aus HTML optional nach Selektoren.
 *
 * @param {?string} html - HTML-Text.
 * @param {?string} selectors - Selektoren für Teilbereiche.
 * @returns {{text: string, parts: ?Array<string>}} Textdaten.
 */
function extractTextFromHtml(html, selectors) {
  if (!html) {
    return {text: '', parts: selectors ? [''] : null};
  }

  const dom = parseHTML(html);
  if (!dom) {
    __.log('DOMParser nicht verfügbar, Text-Diff verwendet Rohtext.');
    const fallbackText = normalizeTextContent(html);
    return {text: fallbackText, parts: selectors ? [fallbackText] : null};
  }

  const root = dom.body ?? dom.documentElement;
  const fullText = normalizeTextContent(root?.textContent ?? '');

  if (!selectors) {
    return {text: fullText, parts: null};
  }

  try {
    const matches = dom.querySelectorAll(selectors);
    const parts = [];
    matches.forEach((element) => {
      parts.push(normalizeTextContent(element.textContent ?? ''));
    });
    const joinedText = parts.join('\n');
    return {text: joinedText, parts: parts};
  } catch (error) {
    __.log(`Ungültige Selektoren im Text-Diff, verwende Gesamtext: ${error}`);
    return {text: fullText, parts: [fullText]};
  }
}

/**
 * Normalisiert Text, um instabile Whitespace-Änderungen zu reduzieren.
 *
 * @param {string} text - Rohtext.
 * @returns {string} Normalisierter Text.
 */
function normalizeTextContent(text) {
  return (text ?? '').replace(/\s+/g, ' ').trim();
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
  updatedPage.faviconUrl = resolveFaviconUrl(
    updatedPage.url,
    scannedHtmlData.html,
  );

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
 * Schneller "keine Änderung"-Pfad, wenn der Quick-Hash übereinstimmt.
 *
 * @param {Page} page - Page object to update.
 * @param {?string} scanNoticeKey - Optionaler Hinweis-Key.
 * @returns {boolean} True, wenn eine neue größere Änderung erkannt wurde.
 */
async function applyQuickNoChange(page, scanNoticeKey = null) {
  const updatedPage = await Page.load(page.id);
  updatedPage.lastScanNoticeKey = scanNoticeKey;
  if (!updatedPage.isChanged()) {
    updatedPage.state = Page.stateEnum.NO_CHANGE;
  }
  updatedPage.newScanTime = Date.now();
  await updatedPage.save();
  __.log(`Scan-Ergebnis gespeichert (Quick-Hash) für URL: ${updatedPage.url}`);
  return false;
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
 * Berechnet einen sehr schnellen Kurz-Hash für frühe Gleichheitsprüfungen.
 *
 * @param {?string} html - HTML-String.
 * @returns {string} Quick-Hash als String.
 */
function computeQuickHtmlHash(html) {
  const safeHtml = html || '';
  const length = safeHtml.length;
  const prefix = safeHtml.slice(0, 256);
  const suffix = safeHtml.slice(-256);
  let hash = length;
  for (let i = 0; i < prefix.length; i++) {
    hash = (hash * 31 + prefix.charCodeAt(i)) >>> 0;
  }
  for (let i = 0; i < suffix.length; i++) {
    hash = (hash * 31 + suffix.charCodeAt(i)) >>> 0;
  }
  return `${length}:${hash.toString(16)}`;
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
