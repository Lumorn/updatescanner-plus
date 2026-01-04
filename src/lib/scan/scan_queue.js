import {scanPage} from './scan.js';
import {waitForMs} from '/lib/util/promise.js';
import {Config} from '/lib/util/config.js';

// Allow function mocking
export const __ = {
  scanPage: (...args) => scanPage(...args),
  waitForMs: (...args) => waitForMs(...args),
};

// Maximale Anzahl paralleler Scans in der Queue
const MAX_PARALLEL_SCANS = 4;
// Mindestabstand zwischen Requests pro Host
const HOST_IDLE_MS_DEFAULT = 2000;
const COMPACT_QUEUE_MIN_HEAD = 50;

/**
 * Scan queue state name mappings.
 *
 * @type {{ACTIVE: string, INACTIVE: string}} Enum.
 */
export const scanQueueStateEnum = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

/**
 * @typedef {object} ScanResult
 * @property {number} majorChanges Number of pages that had major changes
 * when scanned.
 * @property {number} scanCount Number of pages that were scanned.
 */

/**
 * @callback ScanCompleteHandler
 * @param {ScanResult} scanResult - Object containing the result of the scan.
 */

/**
 * @callback QueueStateHandler
 * @param {scanQueueStateEnum} state - New queue state.
 */

/**
 * Class to maintain a queue of pages to scan.
 */
export class ScanQueue {
  /**
   * Create a new empty queue.
   */
  constructor() {
    this.queue = [];
    this._headIndex = 0;
    this._queuedIds = new Set();
    this._scanCompleteHandler = null;
    this._queueStateChangeHandler = null;
    this._isScanning = false;
    this._scanCompleteCount = 0;
    this._isManualScan = false;
    this._activeScans = 0;
    this._lastRequestTime = new Map();
    this._hostWaitQueue = new Map();
    this._hostDelayMs = null;
    this._hostDelayMsPromise = null;
    this._cancelRequested = false;
  }

  /**
   * Bind a handler to call whenever a scan is completed.
   *
   * @param {ScanCompleteHandler} handler - Called when a scan completes.
   */
  bindScanComplete(handler) {
    this._scanCompleteHandler = handler;
  }

  /**
   *  Bind a handler to call whenever queue state changes.
   *
   * @param {QueueStateHandler} handler - Called when queue state changes.
   */
  bindQueueStateChange(handler) {
    this._queueStateChangeHandler = handler;
  }

  /**
   * Add a list of pages to the queue. Ignore pages that are already queued.
   *
   * @param {Array.<Page>} pageList - List of pages to add to the queue.
   */
  add(pageList) {
    for (const page of pageList) {
      if (!this._queuedIds.has(page.id)) {
        this.queue.push(page);
        this._queuedIds.add(page.id);
      }
    }
  }

  /**
   * Start scanning the pages in the queue. When the scan is complete, call
   * the scanComplete handler. Does nothing if a scan is already in progress.
   */
  async scan() {
    if (this._isScanning) {
      return;
    }

    this._cancelRequested = false;
    this._changeScanState(true, 0, 0);
    const {majorChanges, scanCount} = await this._processScanQueue();
    this._changeScanState(false, 0, 0);

    if (this._scanCompleteHandler !== null) {
      this._scanCompleteHandler({
        majorChanges: majorChanges,
        scanCount: scanCount,
        isManualScan: this._isManualScan,
      });
    }
    this._isManualScan = false;
  }

  /**
   * Bricht laufende Scans ab und leert die Queue.
   */
  cancel() {
    this._cancelRequested = true;
    this.queue = [];
    this._headIndex = 0;
    this._queuedIds.clear();
    this._isManualScan = false;
    this._changeScanState(this._activeScans > 0, this._scanCompleteCount,
      this._activeScans);
  }

  /**
   * Updates scan state and notifies listeners.
   *
   * @param {boolean} isScanning - True if scanning is active.
   * @param {number} scannedCount - Number of already scanned items.
   * @param {number} activeScans - Anzahl aktuell laufender Scans.
   * @private
   */
  _changeScanState(isScanning, scannedCount, activeScans) {
    this._isScanning = isScanning;
    this._scanCompleteCount = scannedCount;
    this._activeScans = activeScans;
    if (this._queueStateChangeHandler != null) {
      this._queueStateChangeHandler(this.getScanState());
    }
  }

  /**
   * Returns current scan state.
   *
   * @returns {{state: string, queueLength: number, scanned: number}} Scan
   *   queue state enum.
   */
  getScanState() {
    const remaining = Math.max(0, this.queue.length - this._headIndex);
    return {
      state: this._isScanning ?
        scanQueueStateEnum.ACTIVE :
        scanQueueStateEnum.INACTIVE,
      queueLength: remaining + this._activeScans,
      scanned: this._scanCompleteCount,
    };
  }

  /**
   * Identical to the scan function, but when the scanComplete handler is called
   * the isManualScan property is set.
   */
  async manualScan() {
    this._isManualScan = true;
    await this.scan();
  }

  /**
   * Scan all pages in the queue. Pages added during the scan are scanned too.
   *
   * @returns {ScanResult} Result of the scan.
   */
  async _processScanQueue() {
    let majorChanges = 0;
    let scanCount = 0;

    const workerCount = Math.max(
      1,
      Math.min(MAX_PARALLEL_SCANS, this.queue.length - this._headIndex),
    );
    const workers = [];
    for (let index = 0; index < workerCount; index++) {
      workers.push((async () => {
        while (true) {
          if (this._cancelRequested) {
            return;
          }
          const page = this._getNextPage();
          if (!page) {
            return;
          }

          this._activeScans += 1;
          this._changeScanState(true, scanCount, this._activeScans);

          await this._waitForHost(page);
          const majorChange = await __.scanPage(page);
          if (majorChange) {
            majorChanges++;
          }
          scanCount++;
          this._activeScans -= 1;
          this._changeScanState(true, scanCount, this._activeScans);
          this._maybeCompactQueue();
        }
      })());
    }

    await Promise.all(workers);

    if (this._headIndex >= this.queue.length) {
      this.queue = [];
      this._headIndex = 0;
    }

    return {majorChanges: majorChanges, scanCount: scanCount};
  }

  /**
   * Kompaktiert die Queue, wenn der Kopfindex groß genug ist.
   *
   * @private
   */
  _maybeCompactQueue() {
    if (this._headIndex < COMPACT_QUEUE_MIN_HEAD) {
      return;
    }

    if (this._headIndex <= this.queue.length / 2) {
      return;
    }

    this.queue = this.queue.slice(this._headIndex);
    this._headIndex = 0;
  }

  /**
   * Holt die nächste Seite aus der Queue oder null, wenn nichts übrig ist.
   *
   * @returns {Page|null} Nächste Seite oder null.
   * @private
   */
  _getNextPage() {
    if (this._headIndex >= this.queue.length) {
      return null;
    }

    const page = this.queue[this._headIndex];
    this._headIndex += 1;
    this._queuedIds.delete(page.id);
    return page;
  }

  /**
   * Wartet bei Bedarf, um Burst-Requests auf denselben Host zu vermeiden.
   *
   * @param {Page} page - Seite, deren Host limitiert werden soll.
   * @private
   */
  async _waitForHost(page) {
    const hostKey = this._getHostKey(page);
    if (!hostKey) {
      return;
    }

    const previousWait = this._hostWaitQueue.get(hostKey) || Promise.resolve();
    let releaseWait = null;
    const waitToken = new Promise((resolve) => {
      releaseWait = resolve;
    });
    const queuedWait = previousWait.then(() => waitToken);
    this._hostWaitQueue.set(hostKey, queuedWait);

    await previousWait;
    try {
      const hostDelayMs = await this._getHostDelayMs();
      const lastRequestTime = this._lastRequestTime.get(hostKey);
      if (lastRequestTime != null) {
        const elapsed = Date.now() - lastRequestTime;
        const remaining = hostDelayMs - elapsed;
        if (remaining > 0) {
          await __.waitForMs(remaining);
        }
      }
      this._lastRequestTime.set(hostKey, Date.now());
    } finally {
      if (releaseWait) {
        releaseWait();
      }
      if (this._hostWaitQueue.get(hostKey) === queuedWait) {
        this._hostWaitQueue.delete(hostKey);
      }
    }
  }

  /**
   * Liest den konfigurierten Host-Delay aus der Config.
   *
   * @returns {Promise<number>} Konfigurierter Host-Delay in Millisekunden.
   * @private
   */
  async _getHostDelayMs() {
    if (this._hostDelayMs != null) {
      return this._hostDelayMs;
    }

    if (!this._hostDelayMsPromise) {
      this._hostDelayMsPromise = (async () => {
        const configValue = await Config.loadSingleSetting('scanHostIdleMs');
        const parsed = Number(configValue);
        const resolved = Number.isFinite(parsed) && parsed >= 0 ?
          parsed :
          HOST_IDLE_MS_DEFAULT;
        this._hostDelayMs = resolved;
        return resolved;
      })();
    }

    return this._hostDelayMsPromise;
  }

  /**
   * Ermittelt den Host-Key für das Rate-Limiting.
   *
   * @param {Page} page - Seite, deren Host bestimmt wird.
   * @returns {string|null} Host-Key oder null bei ungültiger URL.
   * @private
   */
  _getHostKey(page) {
    try {
      return new URL(page.url).host;
    } catch (error) {
      return null;
    }
  }
}
