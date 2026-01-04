import {backgroundActionEnum, uiActionsEnum} from './actions.js';
import {Autoscan} from '/lib/scan/autoscan.js';
import {ScanQueue, scanQueueStateEnum} from '/lib/scan/scan_queue.js';
import {showNotification} from '/lib/scan/notification.js';
import {PageStore, hasPageStateChanged, isItemChanged}
  from '/lib/page/page_store.js';
import {isUpToDate, latestVersion} from '/lib/update/update.js';
import {openUpdate} from '/lib/update/update_url.js';
import {log} from '/lib/util/log.js';
import {Config} from '/lib/util/config.js';
import {g} from '/lib/util/env.js';

const defaultIcon = {
  18: '/images/updatescanner_18.png',
  48: '/images/updatescanner_48.png',
  64: '/images/updatescanner_64.png',
  96: '/images/updatescanner_96.png',
};

const scanIcon = {
  18: '/images/updatescanner_18_scan.png',
  48: '/images/updatescanner_48_scan.png',
  64: '/images/updatescanner_64_scan.png',
  96: '/images/updatescanner_96_scan.png',
};

/**
 * Class representing the Update Scanner background process.
 */
export class Background {
  /**
   * @property {PageStore} pageStore - Object used for saving and loading data
   * from storage.
   */
  constructor() {
    this.pageStore = null;
    this.scanQueue = null;
    this.autoscan = null;
    this._initPromise = null;
    this._listenersRegistered = false;
    this._boundHandleMessage = this._handleMessage.bind(this);
    this._boundHandleAlarm = this._handleAlarm.bind(this);
    this._boundHandleInstalled = this._handleInstalled.bind(this);
    this._boundHandleStartup = this._handleStartup.bind(this);
  }

  /**
   * Start the background processes and listeners.
   */
  async init() {
    await this.ensureInitialized();
  }

  /**
   * Registriert alle Listener synchron beim Start der Event Page.
   */
  registerListeners() {
    if (this._listenersRegistered) {
      return;
    }
    this._listenersRegistered = true;

    browser.runtime.onMessage.addListener(this._boundHandleMessage);
    browser.alarms.onAlarm.addListener(this._boundHandleAlarm);
    browser.runtime.onInstalled.addListener(this._boundHandleInstalled);
    browser.runtime.onStartup.addListener(this._boundHandleStartup);
  }

  /**
   * Stellt sicher, dass die Initialisierung nur einmal parallel läuft.
   *
   * @returns {Promise<void>} Promise der Initialisierung.
   */
  async ensureInitialized() {
    if (!this._initPromise) {
      this._initPromise = (async () => {
        this.pageStore = await PageStore.load();
        this.pageStore.bindPageUpdate(this._handlePageUpdate.bind(this));

        this.scanQueue = new ScanQueue();
        this.scanQueue.bindScanComplete(this._handleScanComplete.bind(this));
        this.scanQueue.bindQueueStateChange(
          this._handleScanQueueStateChange.bind(this),
        );

        this._refreshToolbar();
        this.pageStore.refreshFolderState();
        await this._checkFirstRun();
        await this._checkIfUpdateRequired();

        this.autoscan = new Autoscan(this.scanQueue, this.pageStore);
        await this.autoscan.init();
      })().catch((error) => {
        // Fehler zurücksetzen, damit ein späterer Init-Versuch möglich ist.
        this._initPromise = null;
        throw error;
      });
    }

    return this._initPromise;
  }

  /**
   * Called when a Page is updated in Storage. Refresh the icon if its state
   * changed.
   *
   * @param {string} pageId - ID of the changed Page.
   * @param {storage.StorageChange} change - Object representing the change.
   */
  _handlePageUpdate(pageId, change) {
    if (hasPageStateChanged(change)) {
      this._refreshToolbar();
      this.pageStore.refreshFolderState();
    }
  }

  /**
   * Verarbeitet Nachrichten aus der UI oder anderen Scripten.
   *
   * @param {object} message - Nachrichtendaten.
   * @returns {Promise<object|undefined>} Antwort für sendMessage, falls nötig.
   */
  _handleMessage(message) {
    return this.ensureInitialized().then(() => {
      if (message.action === backgroundActionEnum.SCAN_ALL) {
        this._scanAll();
      } else if (message.action === backgroundActionEnum.SCAN_ITEM) {
        this._scanItem(message.itemId);
      } else if (message.action === backgroundActionEnum.CANCEL_SCAN) {
        this._cancelScan();
      } else if (message.action === uiActionsEnum.QUEUE_STATE_REQUEST) {
        return {
          action: uiActionsEnum.QUEUE_STATE_CHANGED,
          data: this.scanQueue.getScanState(),
        };
      }

      return undefined;
    });
  }

  /**
   * Aktualisiert Icon und Badge der Toolbar-Aktion.
   */
  _refreshToolbar() {
    const updateCount = this.pageStore.getPageList()
      .filter(isItemChanged).length;

    const queueState = this.scanQueue.getScanState();
    const isActive = queueState.state === scanQueueStateEnum.ACTIVE;

    this._refreshIcon(isActive ? scanIcon : defaultIcon);
    this._refreshBadge(updateCount === 0 ? '' : updateCount.toString());
  }

  /**
   * Refreshes toolbar icon.
   *
   * @param {object} iconPath - Path to icon.
   * @private
   */
  _refreshIcon(iconPath) {
    browser.action.setIcon({path: iconPath});
  }

  /**
   * Refreshes toolbar icon badge text.
   * Empty string removes the badge.
   *
   * @param {string} text - Text.
   * @private
   */
  _refreshBadge(text) {
    browser.action.setBadgeText({text: text});
  }

  /**
   * If this is the first time the addon has been run, create a Page with
   * the Update Scanner website and scan it immediately.
   */
  async _checkFirstRun() {
    const config = await new Config().load();
    if (config.get('isFirstRun')) {
      const page = await this.pageStore.createWebsitePage();
      config.set('isFirstRun', false);
      config.set('updateVersion', latestVersion);
      await config.save();

      this.scanQueue.add([page]);
      this.scanQueue.scan();
    }
  }

  /**
   * If the data structures aren't up to date, open the Update page to perform
   * an update.
   */
  async _checkIfUpdateRequired() {
    if (!(await isUpToDate())) {
      openUpdate();
    }
  }

  /**
   * Manual scan of all Pages in the PageStore.
   */
  _scanAll() {
    this._scanItem(PageStore.ROOT_ID);
  }

  /**
   * Manual scan of a single item. If the item is a PageFolder, scan all items
   * in the folder.
   *
   * @param {string} itemId - ID of the item to scan.
   */
  _scanItem(itemId) {
    const scanList = this.pageStore.getDescendantPages(itemId);

    log(`Pages to manually scan: ${scanList.length}`);
    this.scanQueue.add(scanList);
    this.scanQueue.manualScan();
  }

  /**
   * Bricht laufende Scans ab und leert die Queue.
   */
  _cancelScan() {
    this.scanQueue.cancel();
  }

  /**
   * Called whenever a scan is complete.
   *
   * @param {ScanResult} result - Object containing the result of the scan.
   */
  _handleScanComplete({majorChanges, scanCount, isManualScan}) {
    // Wait for pageStore to be fully updated before triggering the notification
    g.setTimeout(() => {
      log(`Scan complete, ${majorChanges} new changes.`);
      log(`${scanCount} pages scanned.`);

      // If the user has already viewed some changes, don't include in the count
      const changeCount = this.pageStore.getChangedPageList().length;
      const notifyChangeCount = Math.min(majorChanges, changeCount);

      if (notifyChangeCount > 0 || isManualScan) {
        showNotification(notifyChangeCount);
      }
    }, 1000);
  }

  /**
   * Behandelt Alarm-Events der Event Page.
   *
   * @param {alarms.Alarm} alarm - Alarmdaten.
   * @private
   */
  async _handleAlarm(alarm) {
    await this.ensureInitialized();
    if (this.autoscan) {
      this.autoscan.onAlarm(alarm);
    }
  }

  /**
   * Reagiert auf Installations-Events und stellt die Initialisierung sicher.
   *
   * @private
   */
  async _handleInstalled() {
    await this.ensureInitialized();
  }

  /**
   * Reagiert auf Startup-Events und stellt die Initialisierung sicher.
   *
   * @private
   */
  async _handleStartup() {
    await this.ensureInitialized();
  }

  /**
   * Called whenever scan queue state changes and sends message to other
   * listeners.
   *
   * @param {object} stateData - Scan queue state data.
   * @param {?Function} sendResponse - Response function.
   * @private
   */
  _handleScanQueueStateChange(stateData, sendResponse) {
    const message = {
      action: uiActionsEnum.QUEUE_STATE_CHANGED,
      data: stateData,
    };
    if (sendResponse != null) {
      sendResponse(message);
    } else {
      // Ohne aktiven Listener kann sendMessage in MV3 fehlschlagen; Fehler bewusst ignorieren.
      void browser.runtime.sendMessage(message).catch((error) => {
        if (error?.message?.includes('Receiving end does not exist')) {
          return;
        }
        console.warn('UI-Nachricht konnte nicht zugestellt werden.', error);
      });
    }

    this._refreshToolbar();
  }
}
