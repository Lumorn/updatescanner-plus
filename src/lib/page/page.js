import {Storage} from '/lib/util/storage.js';
import {log} from '/lib/util/log.js';

// Allow function mocking
export const __ = {
  log: (...args) => log(...args),
};

const ScanSourceMode = {
  HTTP: 'http',
  HEADLESS: 'headless',
};

const HeadlessWaitStrategy = {
  NETWORK_IDLE: 'network-idle',
  SELECTOR_READY: 'selector-ready',
  TIMEOUT: 'timeout',
};

/**
 * Normalisiert den Scan-Quellenmodus für eine Seite.
 *
 * @param {?string} scanSourceMode - Modus aus der Persistenz.
 * @param {boolean} useHiddenTabScan - Legacy-Flag für Hidden-Tab.
 * @returns {string} Normalisierter Modus.
 */
function normalizeScanSourceMode(scanSourceMode, useHiddenTabScan) {
  if (scanSourceMode === ScanSourceMode.HEADLESS || scanSourceMode === ScanSourceMode.HTTP) {
    return scanSourceMode;
  }
  return useHiddenTabScan ? ScanSourceMode.HEADLESS : ScanSourceMode.HTTP;
}

/**
 * Normalisiert die Headless-Wartestrategie.
 *
 * @param {?string} headlessWaitStrategy - Strategie aus der Persistenz.
 * @returns {string} Normalisierte Strategie.
 */
function normalizeHeadlessWaitStrategy(headlessWaitStrategy) {
  if (
    headlessWaitStrategy === HeadlessWaitStrategy.NETWORK_IDLE ||
    headlessWaitStrategy === HeadlessWaitStrategy.SELECTOR_READY ||
    headlessWaitStrategy === HeadlessWaitStrategy.TIMEOUT
  ) {
    return headlessWaitStrategy;
  }
  return HeadlessWaitStrategy.NETWORK_IDLE;
}

/**
 * Class representing a webpage.
 */
export class Page {
  /**
   * @returns {object} Default values for new Pages.
   */
  static get DEFAULTS() {
    return {
      title: 'New Page',
      url: null,
      faviconUrl: null,
      scanRateMinutes: 24 * 60,
      changeThreshold: 100,
      ignoreNumbers: false,
      encoding: null,
      highlightChanges: true,
      highlightColour: '#ffff66',
      markChanges: false,
      doPost: false,
      postParams: null,
      state: Page.stateEnum.NO_CHANGE,
      lastAutoscanTime: null,
      oldScanTime: null,
      newScanTime: null,
      selectors: null,
      areaSelector: null,
      contentMode: Page.contentModeEnum.TEXT,
      requireExactMatchCount: false,
      partialScan: false,
      scanSourceMode: 'http',
      useHiddenTabScan: false,
      sendCredentials: false,
      fetchCache: null,
      fetchMode: null,
      fetchRedirect: null,
      fetchHeaders: '',
      textDiffMode: false,
      domDiffMode: false,
      newHtmlHash: null,
      lastScanNoticeKey: null,
      lastDiffResult: null,
      waitForSelector: null,
      waitForSelectorTimeoutMs: null,
      waitForNetworkIdle: true,
      waitForNetworkIdleTimeoutMs: null,
      headlessWaitStrategy: 'network-idle',
      hiddenTabDefaultWaitMs: null,
      hiddenTabNetworkIdleWindowMs: null,
      hiddenTabDomStabilityWindowMs: null,
      hiddenTabDomStabilityTimeoutMs: null,
      hiddenTabMutationStabilityWindowMs: null,
      hiddenTabMutationStabilityTimeoutMs: null,
      hiddenTabIgnoreSelectors: '',
      ignoredSelectors: '',
      filterRegexList: '',
      attributeBlacklist: '',
      hiddenTabUseTextSnapshotHash: false,
      hiddenTabScrollSteps: null,
      hiddenTabScrollDelayMs: null,
      hiddenTabScrollMaxHeight: null,
    };
  }

  /**
   * @returns {object} Enumeration of Page change states. Any value other
   * than NO_CHANGE or CHANGE indicates an error.
   */
  static get stateEnum() {
    return {
      NO_CHANGE: 'no_change',
      CHANGED: 'changed',
      ERROR: 'error',
    };
  }

  /**
   * @returns {{HTML: string, TEXT: string, IGNORE: string}} Enumeration of
   *   page content mode.
   */
  static get contentModeEnum() {
    return {
      IGNORE: 'ignore',
      HTML: 'html',
      TEXT: 'text',
    };
  }

  /**
   * @param {string} id - ID of the Page.
   * @returns {string} Storage key for the Page object.
   */
  static _KEY(id) {
    return 'page:' + id;
  }

  /**
   * @param {string} key - Storage key for the Page object.
   *
   * @returns {?string} Page ID, or null if the key is not for a Page
   * object.
   */
  static idFromKey(key) {
    const matches = key.match('^page:(.*)$');
    if (matches == null) {
      return null;
    } else {
      return matches[1];
    }
  }

  /**
   * @param {string} key - Storage key.
   *
   * @returns {boolean} True if the key is for a Page object.
   */
  static isPageKey(key) {
    return Page.idFromKey(key) !== null;
  }

  /**
   * @param {string} id - ID of the page.
   * @param {object} data - Serialised Page object from storage.
   *
   * @property {string} id - ID of the page.
   * @property {string} title - Title of the page.
   * @property {string} url - URL of the page.
   * @property {?string} faviconUrl - URL des Webseiten-Icons.
   * @property {number} scanRateMinutes - Number of minutes between scans. Zero
   * means manual scan only.
   * @property {number} changeThreshold - Number of characters changed before
   * signalling that a change has occurred.
   * @property {boolean} ignoreNumbers - Don't trigger if only a number has
   * changed.
   * @property {?string} encoding - Text encoding of the page.
   * @property {boolean} highlightChanges - Whether to highlight changed text.
   * @property {string} highlightColour - HTML colour string to use for
   * highlighting.
   * @property {boolean} markChanges - Whether to mark changes with << >>.
   * @property {boolean} doPost - Perform a POST request instead of a GET.
   * @property {boolean} postParams - POST parameters to use if doPost is true.
   * @property {Page.stateEnum} state - Current scan state of the page.
   * @property {number} lastAutoscanTime - Time that this page was last
   * autoscanned (ms since Unix epoch).
   * @property {number} oldScanTime - Time when the OLD HTML was last updated
   * (ms since Unix epoch).
   * @property {number} newScanTime - Time when the NEW HTML was last updated
   * (ms since Unix epoch).
   * @property {string} selectors - Selectors separated by comma.
   * @property {?string} areaSelector - Ausgewählter Bereichs-Selektor.
   * @property {contentModeEnum|string} contentMode - Mode used for content
   *   comparison.
   * @property {boolean} requireExactMatchCount - True if part count should
   *   match.
   * @property {boolean} partialScan - True if selectors should be used for
   *   selecting parts of the page to scan.
   * @property {string} scanSourceMode - Scan-Modus (http oder headless).
   * @property {boolean} useHiddenTabScan - Nutzt einen versteckten Tab als
   *   Scan-Quelle statt fetch.
   * @property {boolean} sendCredentials - Sendet Cookies/Credentials beim fetch.
   * @property {?string} fetchCache - Cache-Policy für fetch.
   * @property {?string} fetchMode - Fetch-Mode (cors, no-cors, same-origin).
   * @property {?string} fetchRedirect - Redirect-Policy für fetch.
   * @property {string} fetchHeaders - Zusätzliche Fetch-Header als Text.
   * @property {boolean} textDiffMode - Vergleicht Text statt HTML.
   * @property {boolean} domDiffMode - Vergleicht den DOM statt HTML/Text.
   * @property {?string} newHtmlHash - Hash der zuletzt gespeicherten NEW-HTML.
   * @property {?string} lastScanNoticeKey - Optionaler Hinweis-Key für die UI.
   * @property {?object} lastDiffResult - Strukturierte Diff-Ergebnisse für die UI.
   * @property {?string} waitForSelector - Optionaler Selektor, auf den beim
   *   Hidden-Tab-Scan gewartet wird.
   * @property {?number} waitForSelectorTimeoutMs - Timeout für den Selektor.
   * @property {boolean} waitForNetworkIdle - Wartet auf Network-Idle vor dem Snapshot.
   * @property {?number} waitForNetworkIdleTimeoutMs - Timeout für Network-Idle.
   * @property {string} headlessWaitStrategy - Strategie für Headless-Warten.
   * @property {?number} hiddenTabDefaultWaitMs - Standard-Wartezeit vor Snapshot.
   * @property {?number} hiddenTabNetworkIdleWindowMs - Fenster für Network-Idle.
   * @property {?number} hiddenTabDomStabilityWindowMs - Zeitfenster, in dem das
   *   DOM stabil bleiben muss.
   * @property {?number} hiddenTabDomStabilityTimeoutMs - Timeout für die
   *   DOM-Stabilitätsprüfung.
   * @property {?number} hiddenTabMutationStabilityWindowMs - Zeitfenster für
   *   DOM-Mutation-Stabilität vor dem Snapshot.
   * @property {?number} hiddenTabMutationStabilityTimeoutMs - Timeout für die
   *   Mutation-Stabilitätsprüfung.
   * @property {string} hiddenTabIgnoreSelectors - CSS-Selektoren, die beim
   *   Hidden-Tab-Snapshot ignoriert werden.
   * @property {string} ignoredSelectors - CSS-Selektoren, die beim Scan-HTML
   *   entfernt oder ersetzt werden.
   * @property {string} filterRegexList - Regex-Liste für Textfilter vor dem Diff.
   * @property {string} attributeBlacklist - Attributliste, die vor dem Diff entfernt wird.
   * @property {boolean} hiddenTabUseTextSnapshotHash - Nutzt einen Text-Hash
   *   (innerText) für den DOM-Snapshot.
   * @property {?number} hiddenTabScrollSteps - Schritte für Scroll-Simulation.
   * @property {?number} hiddenTabScrollDelayMs - Wartezeit pro Schritt (ms).
   * @property {?number} hiddenTabScrollMaxHeight - Maximale Scroll-Höhe (px).
   */
  constructor(
    id,
    {
      title = Page.DEFAULTS.title,
      url = Page.DEFAULTS.url,
      faviconUrl = Page.DEFAULTS.faviconUrl,
      scanRateMinutes = Page.DEFAULTS.scanRateMinutes,
      changeThreshold = Page.DEFAULTS.changeThreshold,
      ignoreNumbers = Page.DEFAULTS.ignoreNumbers,
      encoding = Page.DEFAULTS.encoding,
      highlightChanges = Page.DEFAULTS.highlightChanges,
      highlightColour = Page.DEFAULTS.highlightColour,
      markChanges = Page.DEFAULTS.markChanges,
      doPost = Page.DEFAULTS.doPost,
      postParams = Page.DEFAULTS.postParams,
      state = Page.DEFAULTS.state,
      lastAutoscanTime = Page.DEFAULTS.lastAutoscanTime,
      oldScanTime = Page.DEFAULTS.oldScanTime,
      newScanTime = Page.DEFAULTS.newScanTime,
      selectors = Page.DEFAULTS.selectors,
      areaSelector = Page.DEFAULTS.areaSelector,
      contentMode = Page.DEFAULTS.contentMode,
      requireExactMatchCount = Page.DEFAULTS.requireExactMatchCount,
      partialScan = Page.DEFAULTS.partialScan,
      scanSourceMode = Page.DEFAULTS.scanSourceMode,
      useHiddenTabScan = Page.DEFAULTS.useHiddenTabScan,
      sendCredentials = Page.DEFAULTS.sendCredentials,
      fetchCache = Page.DEFAULTS.fetchCache,
      fetchMode = Page.DEFAULTS.fetchMode,
      fetchRedirect = Page.DEFAULTS.fetchRedirect,
      fetchHeaders = Page.DEFAULTS.fetchHeaders,
      textDiffMode = Page.DEFAULTS.textDiffMode,
      domDiffMode = Page.DEFAULTS.domDiffMode,
      newHtmlHash = Page.DEFAULTS.newHtmlHash,
      lastScanNoticeKey = Page.DEFAULTS.lastScanNoticeKey,
      lastDiffResult = Page.DEFAULTS.lastDiffResult,
      waitForSelector = Page.DEFAULTS.waitForSelector,
      waitForSelectorTimeoutMs = Page.DEFAULTS.waitForSelectorTimeoutMs,
      waitForNetworkIdle = Page.DEFAULTS.waitForNetworkIdle,
      waitForNetworkIdleTimeoutMs = Page.DEFAULTS.waitForNetworkIdleTimeoutMs,
      headlessWaitStrategy = Page.DEFAULTS.headlessWaitStrategy,
      hiddenTabDefaultWaitMs = Page.DEFAULTS.hiddenTabDefaultWaitMs,
      hiddenTabNetworkIdleWindowMs = Page.DEFAULTS.hiddenTabNetworkIdleWindowMs,
      hiddenTabDomStabilityWindowMs = Page.DEFAULTS.hiddenTabDomStabilityWindowMs,
      hiddenTabDomStabilityTimeoutMs = Page.DEFAULTS.hiddenTabDomStabilityTimeoutMs,
      hiddenTabMutationStabilityWindowMs =
        Page.DEFAULTS.hiddenTabMutationStabilityWindowMs,
      hiddenTabMutationStabilityTimeoutMs =
        Page.DEFAULTS.hiddenTabMutationStabilityTimeoutMs,
      hiddenTabIgnoreSelectors = Page.DEFAULTS.hiddenTabIgnoreSelectors,
      ignoredSelectors = Page.DEFAULTS.ignoredSelectors,
      filterRegexList = Page.DEFAULTS.filterRegexList,
      attributeBlacklist = Page.DEFAULTS.attributeBlacklist,
      hiddenTabUseTextSnapshotHash = Page.DEFAULTS.hiddenTabUseTextSnapshotHash,
      hiddenTabScrollSteps = Page.DEFAULTS.hiddenTabScrollSteps,
      hiddenTabScrollDelayMs = Page.DEFAULTS.hiddenTabScrollDelayMs,
      hiddenTabScrollMaxHeight = Page.DEFAULTS.hiddenTabScrollMaxHeight,
    },
  ) {
    this.id = id;
    this.title = title;
    this.url = url;
    this.faviconUrl = faviconUrl;
    this.scanRateMinutes = scanRateMinutes;
    this.changeThreshold = changeThreshold;
    this.ignoreNumbers = ignoreNumbers;
    this.encoding = encoding;
    this.highlightChanges = highlightChanges;
    this.highlightColour = highlightColour;
    this.markChanges = markChanges;
    this.doPost = doPost;
    this.postParams = postParams;
    this.state = state;
    this.lastAutoscanTime = lastAutoscanTime;
    this.oldScanTime = oldScanTime;
    this.newScanTime = newScanTime;
    this.selectors = selectors;
    this.areaSelector = areaSelector?.trim() || null;
    this.contentMode = contentMode;
    this.requireExactMatchCount = requireExactMatchCount;
    this.partialScan = partialScan;
    this.scanSourceMode = normalizeScanSourceMode(scanSourceMode, useHiddenTabScan);
    this.useHiddenTabScan = this.scanSourceMode === 'headless';
    this.sendCredentials = sendCredentials;
    this.fetchCache = fetchCache;
    this.fetchMode = fetchMode;
    this.fetchRedirect = fetchRedirect;
    this.fetchHeaders = fetchHeaders;
    this.textDiffMode = textDiffMode;
    this.domDiffMode = domDiffMode;
    this.newHtmlHash = newHtmlHash;
    this.lastScanNoticeKey = lastScanNoticeKey;
    this.lastDiffResult = lastDiffResult;
    this.waitForSelector = waitForSelector?.trim() || null;
    this.waitForSelectorTimeoutMs = waitForSelectorTimeoutMs;
    this.waitForNetworkIdle = waitForNetworkIdle;
    this.waitForNetworkIdleTimeoutMs = waitForNetworkIdleTimeoutMs;
    this.headlessWaitStrategy = normalizeHeadlessWaitStrategy(headlessWaitStrategy);
    this.hiddenTabDefaultWaitMs = hiddenTabDefaultWaitMs;
    this.hiddenTabNetworkIdleWindowMs = hiddenTabNetworkIdleWindowMs;
    this.hiddenTabDomStabilityWindowMs = hiddenTabDomStabilityWindowMs;
    this.hiddenTabDomStabilityTimeoutMs = hiddenTabDomStabilityTimeoutMs;
    this.hiddenTabMutationStabilityWindowMs = hiddenTabMutationStabilityWindowMs;
    this.hiddenTabMutationStabilityTimeoutMs = hiddenTabMutationStabilityTimeoutMs;
    this.hiddenTabIgnoreSelectors = hiddenTabIgnoreSelectors;
    this.ignoredSelectors = ignoredSelectors;
    this.filterRegexList = filterRegexList;
    this.attributeBlacklist = attributeBlacklist;
    this.hiddenTabUseTextSnapshotHash = hiddenTabUseTextSnapshotHash;
    this.hiddenTabScrollSteps = hiddenTabScrollSteps;
    this.hiddenTabScrollDelayMs = hiddenTabScrollDelayMs;
    this.hiddenTabScrollMaxHeight = hiddenTabScrollMaxHeight;
  }

  /**
   * Convert the Page instance to an object suitable for storage.
   *
   * @returns {object} Object suitable for storage.
   */
  _toObject() {
    return {
      title: this.title,
      url: this.url,
      faviconUrl: this.faviconUrl,
      scanRateMinutes: this.scanRateMinutes,
      changeThreshold: this.changeThreshold,
      ignoreNumbers: this.ignoreNumbers,
      encoding: this.encoding,
      highlightChanges: this.highlightChanges,
      highlightColour: this.highlightColour,
      markChanges: this.markChanges,
      doPost: this.doPost,
      postParams: this.postParams,
      state: this.state,
      lastAutoscanTime: this.lastAutoscanTime,
      oldScanTime: this.oldScanTime,
      newScanTime: this.newScanTime,
      selectors: this.selectors,
      areaSelector: this.areaSelector,
      contentMode: this.contentMode,
      requireExactMatchCount: this.requireExactMatchCount,
      partialScan: this.partialScan,
      scanSourceMode: this.scanSourceMode,
      useHiddenTabScan: this.useHiddenTabScan,
      sendCredentials: this.sendCredentials,
      fetchCache: this.fetchCache,
      fetchMode: this.fetchMode,
      fetchRedirect: this.fetchRedirect,
      fetchHeaders: this.fetchHeaders,
      textDiffMode: this.textDiffMode,
      domDiffMode: this.domDiffMode,
      newHtmlHash: this.newHtmlHash,
      lastScanNoticeKey: this.lastScanNoticeKey,
      lastDiffResult: this.lastDiffResult,
      waitForSelector: this.waitForSelector,
      waitForSelectorTimeoutMs: this.waitForSelectorTimeoutMs,
      waitForNetworkIdle: this.waitForNetworkIdle,
      waitForNetworkIdleTimeoutMs: this.waitForNetworkIdleTimeoutMs,
      headlessWaitStrategy: this.headlessWaitStrategy,
      hiddenTabDefaultWaitMs: this.hiddenTabDefaultWaitMs,
      hiddenTabNetworkIdleWindowMs: this.hiddenTabNetworkIdleWindowMs,
      hiddenTabDomStabilityWindowMs: this.hiddenTabDomStabilityWindowMs,
      hiddenTabDomStabilityTimeoutMs: this.hiddenTabDomStabilityTimeoutMs,
      hiddenTabMutationStabilityWindowMs: this.hiddenTabMutationStabilityWindowMs,
      hiddenTabMutationStabilityTimeoutMs: this.hiddenTabMutationStabilityTimeoutMs,
      hiddenTabIgnoreSelectors: this.hiddenTabIgnoreSelectors,
      ignoredSelectors: this.ignoredSelectors,
      filterRegexList: this.filterRegexList,
      attributeBlacklist: this.attributeBlacklist,
      hiddenTabUseTextSnapshotHash: this.hiddenTabUseTextSnapshotHash,
      hiddenTabScrollSteps: this.hiddenTabScrollSteps,
      hiddenTabScrollDelayMs: this.hiddenTabScrollDelayMs,
      hiddenTabScrollMaxHeight: this.hiddenTabScrollMaxHeight,
    };
  }

  /**
   * @returns {object} Object suitable for backups, excluding current scan
   * state.
   */
  backup() {
    return {
      type: 'Page',
      title: this.title,
      url: this.url,
      faviconUrl: this.faviconUrl,
      scanRateMinutes: this.scanRateMinutes,
      changeThreshold: this.changeThreshold,
      ignoreNumbers: this.ignoreNumbers,
      encoding: this.encoding,
      highlightChanges: this.highlightChanges,
      highlightColour: this.highlightColour,
      markChanges: this.markChanges,
      doPost: this.doPost,
      postParams: this.postParams,
      selectors: this.selectors,
      areaSelector: this.areaSelector,
      contentMode: this.contentMode,
      requireExactMatchCount: this.requireExactMatchCount,
      partialScan: this.partialScan,
      scanSourceMode: this.scanSourceMode,
      useHiddenTabScan: this.useHiddenTabScan,
      sendCredentials: this.sendCredentials,
      fetchCache: this.fetchCache,
      fetchMode: this.fetchMode,
      fetchRedirect: this.fetchRedirect,
      fetchHeaders: this.fetchHeaders,
      textDiffMode: this.textDiffMode,
      domDiffMode: this.domDiffMode,
      waitForSelector: this.waitForSelector,
      waitForSelectorTimeoutMs: this.waitForSelectorTimeoutMs,
      waitForNetworkIdle: this.waitForNetworkIdle,
      waitForNetworkIdleTimeoutMs: this.waitForNetworkIdleTimeoutMs,
      headlessWaitStrategy: this.headlessWaitStrategy,
      hiddenTabDefaultWaitMs: this.hiddenTabDefaultWaitMs,
      hiddenTabNetworkIdleWindowMs: this.hiddenTabNetworkIdleWindowMs,
      hiddenTabMutationStabilityWindowMs: this.hiddenTabMutationStabilityWindowMs,
      hiddenTabMutationStabilityTimeoutMs: this.hiddenTabMutationStabilityTimeoutMs,
      hiddenTabIgnoreSelectors: this.hiddenTabIgnoreSelectors,
      ignoredSelectors: this.ignoredSelectors,
      filterRegexList: this.filterRegexList,
      attributeBlacklist: this.attributeBlacklist,
      hiddenTabUseTextSnapshotHash: this.hiddenTabUseTextSnapshotHash,
      hiddenTabScrollSteps: this.hiddenTabScrollSteps,
      hiddenTabScrollDelayMs: this.hiddenTabScrollDelayMs,
      hiddenTabScrollMaxHeight: this.hiddenTabScrollMaxHeight,
      newHtmlHash: this.newHtmlHash,
      // state: this.state,
      // lastAutoscanTime: this.lastAutoscanTime,
      // oldScanTime: this.oldScanTime,
      // newScanTime: this.newScanTime,
    };
  }

  /**
   * Load the Page from storage. If it doesn't exist or an error occurs,
   * an empty default Page is returned.
   *
   * @param {string} id - ID of the Page.
   *
   * @returns {Promise} A Promise that fulfils with a Page object.
   */
  static async load(id) {
    try {
      const data = (await Storage.load(Page._KEY(id))) || {};
      return new Page(id, data);
    } catch (error) {
      __.log(`ERROR: Page.load: ${error}`);
      return new Page(id, {});
    }
  }

  /**
   * Check if the Page still exists in storage. This might not be the case if
   * it was deleted by another process, for example.
   *
   * @returns {Promise} A Promise that fulfils with a boolean indicating Whether
   * the page exists in storage.
   */
  async existsInStorage() {
    try {
      const data = await Storage.load(Page._KEY(this.id));
      return data !== undefined;
    } catch (error) {
      __.log(`ERROR: Page.existsInStorage: ${error}`);
    }
    return false;
  }

  /**
   * Save the Page to storage.
   *
   * @returns {Promise} An empty Promise that fulfils when the operation is
   * finished. Errors are logged and ignored.
   */
  async save() {
    try {
      await Storage.save(Page._KEY(this.id), this._toObject());
    } catch (error) {
      __.log(`ERROR: Page.save: ${error}`);
    }
    return {};
  }

  /**
   * Delete the Page from storage.
   *
   * @returns {Promise} An empty Promise that fulfils when the operation is
   * finished. Errors are logged and ignored.
   */
  async delete() {
    try {
      await Storage.remove(Page._KEY(this.id));
    } catch (error) {
      __.log(`ERROR: Page.delete: ${error}`);
    }
    return {};
  }

  /**
   * @returns {boolean} True if the Page state is CHANGED.
   */
  isChanged() {
    return this.state === Page.stateEnum.CHANGED;
  }

  /**
   * @returns {boolean} True if the Page state is ERROR.
   */
  isError() {
    return this.state === Page.stateEnum.ERROR;
  }
}
