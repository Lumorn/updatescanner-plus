import {scanPage} from './scan.js';
import {waitForMs} from '/lib/util/promise.js';

// Allow function mocking
export const __ = {
  scanPage: (...args) => scanPage(...args),
  waitForMs: (...args) => waitForMs(...args),
};

// Wait between scanning pages
const SCAN_IDLE_MS = 2000;
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

    this._changeScanState(true, 0);
    const {majorChanges, scanCount} = await this._processScanQueue();
    this._changeScanState(false, 0);

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
   * Updates scan state and notifies listeners.
   *
   * @param {boolean} isScanning - True if scanning is active.
   * @param {number} scannedCount - Number of already scanned items.
   * @private
   */
  _changeScanState(isScanning, scannedCount) {
    this._isScanning = isScanning;
    this._scanCompleteCount = scannedCount;
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
    return {
      state: this._isScanning ?
        scanQueueStateEnum.ACTIVE :
        scanQueueStateEnum.INACTIVE,
      queueLength: Math.max(0, this.queue.length - this._headIndex),
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

    while (this._headIndex < this.queue.length) {
      const page = this.queue[this._headIndex];
      this._headIndex += 1;
      this._queuedIds.delete(page.id);
      const majorChange = await __.scanPage(page);
      if (majorChange) {
        majorChanges++;
      }
      scanCount++;
      this._changeScanState(true, scanCount);

      if (this._headIndex < this.queue.length) {
        await __.waitForMs(SCAN_IDLE_MS);
      }
      this._maybeCompactQueue();
    }

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
}
