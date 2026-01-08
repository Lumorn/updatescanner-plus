import * as view from './popup_view.js';
import {openMain, showAllChanges, paramEnum, actionEnum}
  from '/lib/main/main_url.js';
import {backgroundActionEnum} from '/lib/background/actions.js';
import {PageStore, hasPageStateChanged, isItemChanged}
  from '/lib/page/page_store.js';
import {createBackupJson} from '/lib/backup/backup.js';
import {openRestoreUrl} from '/lib/backup/restore_url.js';
import {waitForMs} from '/lib/util/promise.js';
import {uiActionsEnum} from '/lib/background/actions.js';
import {Config} from '/lib/util/config.js';
import {translate} from '/lib/util/i18n.js';

/**
 * Class representing the Update Scanner toolbar popup.
 */
export class Popup {
  /**
   * @property {PageStore} pageStore - Object used for saving and loading data
   * from storage.
   */
  constructor() {
    this.pageStore = null;
    this.config = null;
    this.version = null;
  }

  /**
   * Initialises the popup data and event handlers.
   */
  async init() {
    // Small delay to allow popup to render
    await waitForMs(100);

    this.pageStore = await PageStore.load();
    this.pageStore.bindPageUpdate(this._handlePageUpdate.bind(this));

    this.config = await (new Config()).load();
    this.version = browser.runtime.getManifest().version;

    view.init();
    view.bindShowAllClick(this._handleShowAllClick.bind(this));
    view.bindNewClick(this._handleNewClick.bind(this));
    view.bindSidebarClick(this._handleSidebarClick.bind(this));
    view.bindScanAllClick(this._handleScanAllClick.bind(this));
    view.bindScanCancelClick(this._handleScanCancelClick.bind(this));
    view.bindBackupClick(this._handleBackupClick.bind(this));
    view.bindRestoreClick(this._handleRestoreClick.bind(this));
    view.bindSettingsClick(this._handleSettingsClick.bind(this));
    view.bindHelpClick(this._handleHelpClick.bind(this));
    view.bindPageClick(this._handlePageClick.bind(this));
    view.bindLanguageChange(this._handleLanguageChange.bind(this));
    view.bindScanEngineDefaultChange(
      this._handleScanEngineDefaultChange.bind(this),
    );
    view.bindHiddenTabScanDefaultChange(
      this._handleHiddenTabScanDefaultChange.bind(this),
    );
    view.bindHiddenTabScanAllChange(
      this._handleHiddenTabScanAllChange.bind(this),
    );
    view.bindWaitForNetworkIdleDefaultChange(
      this._handleWaitForNetworkIdleDefaultChange.bind(this),
    );
    view.bindWaitForNetworkIdleAllChange(
      this._handleWaitForNetworkIdleAllChange.bind(this),
    );
    view.bindHiddenTabIgnoreSelectorsDefaultChange(
      this._handleHiddenTabIgnoreSelectorsDefaultChange.bind(this),
    );
    view.bindHiddenTabTextHashDefaultChange(
      this._handleHiddenTabTextHashDefaultChange.bind(this),
    );
    view.bindHiddenTabScrollStepsDefaultChange(
      this._handleHiddenTabScrollStepsDefaultChange.bind(this),
    );
    view.bindHiddenTabScrollDelayDefaultChange(
      this._handleHiddenTabScrollDelayDefaultChange.bind(this),
    );
    view.bindHiddenTabScrollMaxHeightDefaultChange(
      this._handleHiddenTabScrollMaxHeightDefaultChange.bind(this),
    );
    view.setLanguage(this.config.get('language'));
    view.setScanEngineDefault(this.config.get('scanEngineMode'));
    view.setHiddenTabSettingsEnabled(
      this.config.get('scanEngineMode') === 'new',
    );
    view.setHiddenTabScanDefault(this.config.get('useHiddenTabScanByDefault'));
    view.setWaitForNetworkIdleDefault(
      this.config.get('waitForNetworkIdleByDefault'),
    );
    view.setHiddenTabIgnoreSelectorsDefault(
      this.config.get('hiddenTabIgnoreSelectorsByDefault'),
    );
    view.setHiddenTabTextHashDefault(
      this.config.get('hiddenTabUseTextSnapshotHashByDefault'),
    );
    view.setHiddenTabScrollStepsDefault(
      this.config.get('hiddenTabScrollStepsByDefault'),
    );
    view.setHiddenTabScrollDelayDefault(
      this.config.get('hiddenTabScrollDelayMsByDefault'),
    );
    view.setHiddenTabScrollMaxHeightDefault(
      this.config.get('hiddenTabScrollMaxHeightByDefault'),
    );
    this._syncHiddenTabScanAllState();
    this._syncWaitForNetworkIdleAllState();
    view.setVersion(this.version);

    browser.runtime.onMessage.addListener(this._handleMessage.bind(this));
    browser.runtime.sendMessage({action: uiActionsEnum.QUEUE_STATE_REQUEST})
      .then(this._handleMessage.bind(this));

    this._refreshPageList();
  }

  /**
   * Update the page list to show all pages in the 'changed'' state.
   */
  _refreshPageList() {
    view.clearPageList();
    this.pageStore.getPageList()
      .filter(isItemChanged)
      .map(view.addPage);
  }

  /**
   * Called when the New button is clicked, to open the page to create a new
   * scan item.
   */
  async _handleNewClick() {
    const tabs = await browser.tabs.query({currentWindow: true, active: true});
    openMain({
      [paramEnum.ACTION]: actionEnum.NEW_PAGE,
      [paramEnum.TITLE]: tabs[0].title,
      [paramEnum.URL]: tabs[0].url,
    }, true);
    window.close();
  }

  /**
   * Called when the Sidebar button is clicked, to open the sidebar.
   */
  _handleSidebarClick() {
    browser.sidebarAction.open();
    window.close();
  }

  /**
   * Called when the Scan All menu item is clicked, to scan all pages.
   */
  _handleScanAllClick() {
    browser.runtime.sendMessage({action: backgroundActionEnum.SCAN_ALL});
    window.close();
  }

  /**
   * Bricht den aktuellen Scan ab.
   */
  _handleScanCancelClick() {
    browser.runtime.sendMessage({action: backgroundActionEnum.CANCEL_SCAN});
  }

  /**
   * Called when the Backup menu item is clicked, to backup pages to a file.
   */
  async _handleBackupClick() {
    const blob = new Blob(
      [createBackupJson(this.pageStore)],
      {type: 'application/json'},
    );
    const url = URL.createObjectURL(blob);

    await view.downloadUrl(url, translate('backup.filename'));
    URL.revokeObjectURL(url);
  }

  /**
   * Called when the Restore menu item is clicked, to restore pages from a file.
   */
  async _handleRestoreClick() {
    openRestoreUrl();
    window.close();
  }

  /**
   * Called when the Help menu item is clicked, to open the help website.
   */
  _handleHelpClick() {
    browser.tabs.create({
      url:
        'https://sneakypete81.github.io/updatescanner/',
    });
    window.close();
  }

  /**
   * Called when the "Show All Updates" button is clicked, to open all changes
   * in new tabs.
   */
  async _handleShowAllClick() {
    await showAllChanges();
    window.close();
  }

  /**
   * Called when an item in the page list is clicked, to view that page.
   *
   * @param {string} pageId - ID of the clicked page.
   */
  _handlePageClick(pageId) {
    if (pageId !== undefined) {
      const params = {
        [paramEnum.ACTION]: actionEnum.SHOW_DIFF,
        [paramEnum.ID]: pageId,
      };
      openMain(params, true);
    }
  }

  /**
   * Called when a Page is updated in Storage. Refresh the page list if its
   * state changed.
   *
   * @param {string} pageId - ID of the changed Page.
   * @param {storage.StorageChange} change - Object representing the change.
   */
  _handlePageUpdate(pageId, change) {
    if (hasPageStateChanged(change)) {
      this._refreshPageList();
    }
  }

  /**
   * Called when message is sent to the UI.
   *
   * @param {object} message - Message content.
   * @private
   */
  _handleMessage(message) {
    if (message.action === uiActionsEnum.QUEUE_STATE_CHANGED) {
      this._handleQueueChange(message.data);
    }
  }

  /**
   * Called when scan queue state changes.
   *
   * @param {scanQueueStateEnum} queueData - Scan queue state.
   * @private
   */
  _handleQueueChange(queueData) {
    view.setScanState(queueData);
  }

  /**
   * Öffnet die Einstellungen im Popup.
   */
  _handleSettingsClick() {
    view.showSettingsPanel();
  }

  /**
   * Speichert die neue Sprache und aktualisiert die UI.
   *
   * @param {string} language - Sprachcode.
   */
  async _handleLanguageChange(language) {
    this.config.set('language', language);
    await this.config.save();
    view.setLanguage(language);
    view.setVersion(this.version);
  }

  /**
   * Speichert den globalen Scan-Modus.
   *
   * @param {string} mode - Scan-Modus.
   */
  async _handleScanEngineDefaultChange(mode) {
    this.config.set('scanEngineMode', mode);
    await this.config.save();
    view.setScanEngineDefault(mode);
    view.setHiddenTabSettingsEnabled(mode === 'new');
  }

  /**
   * Speichert den Default für versteckte Tabs bei neuen Scans.
   *
   * @param {boolean} enabled - Neuer Standardwert.
   */
  async _handleHiddenTabScanDefaultChange(enabled) {
    this.config.set('useHiddenTabScanByDefault', enabled);
    await this.config.save();
    view.setHiddenTabScanDefault(enabled);
  }

  /**
   * Speichert den Default für Network-Idle bei neuen Scans.
   *
   * @param {boolean} enabled - Neuer Standardwert.
   */
  async _handleWaitForNetworkIdleDefaultChange(enabled) {
    this.config.set('waitForNetworkIdleByDefault', enabled);
    await this.config.save();
    view.setWaitForNetworkIdleDefault(enabled);
  }

  /**
   * Speichert die Default-Selektoren für Snapshot-Bereinigung.
   *
   * @param {string} selectors - Selektoren-String.
   */
  async _handleHiddenTabIgnoreSelectorsDefaultChange(selectors) {
    this.config.set('hiddenTabIgnoreSelectorsByDefault', selectors);
    await this.config.save();
    view.setHiddenTabIgnoreSelectorsDefault(selectors);
  }

  /**
   * Speichert den Default für Text-Hash-Snapshots.
   *
   * @param {boolean} enabled - Neuer Standardwert.
   */
  async _handleHiddenTabTextHashDefaultChange(enabled) {
    this.config.set('hiddenTabUseTextSnapshotHashByDefault', enabled);
    await this.config.save();
    view.setHiddenTabTextHashDefault(enabled);
  }

  /**
   * Speichert die Default-Schritte für die Scroll-Simulation.
   *
   * @param {string} value - Eingabewert.
   */
  async _handleHiddenTabScrollStepsDefaultChange(value) {
    const parsed = parseOptionalNumber(value);
    this.config.set('hiddenTabScrollStepsByDefault', parsed);
    await this.config.save();
    view.setHiddenTabScrollStepsDefault(parsed);
  }

  /**
   * Speichert den Default für das Scroll-Delay.
   *
   * @param {string} value - Eingabewert.
   */
  async _handleHiddenTabScrollDelayDefaultChange(value) {
    const parsed = parseOptionalNumber(value);
    this.config.set('hiddenTabScrollDelayMsByDefault', parsed);
    await this.config.save();
    view.setHiddenTabScrollDelayDefault(parsed);
  }

  /**
   * Speichert den Default für die maximale Scroll-Höhe.
   *
   * @param {string} value - Eingabewert.
   */
  async _handleHiddenTabScrollMaxHeightDefaultChange(value) {
    const parsed = parseOptionalNumber(value);
    this.config.set('hiddenTabScrollMaxHeightByDefault', parsed);
    await this.config.save();
    view.setHiddenTabScrollMaxHeightDefault(parsed);
  }

  /**
   * Überträgt die Einstellung für den versteckten Tab auf alle vorhandenen Seiten.
   *
   * @param {boolean} enabled - Neuer Wert für alle Seiten.
   */
  async _handleHiddenTabScanAllChange(enabled) {
    const pages = this.pageStore.getPageList();
    await Promise.all(pages.map(async (page) => {
      page.useHiddenTabScan = enabled;
      await page.save();
    }));
    this._syncHiddenTabScanAllState();
  }

  /**
   * Überträgt die Network-Idle-Einstellung auf alle vorhandenen Seiten.
   *
   * @param {boolean} enabled - Neuer Wert für alle Seiten.
   */
  async _handleWaitForNetworkIdleAllChange(enabled) {
    const pages = this.pageStore.getPageList();
    await Promise.all(pages.map(async (page) => {
      page.waitForNetworkIdle = enabled;
      await page.save();
    }));
    this._syncWaitForNetworkIdleAllState();
  }

  /**
   * Ermittelt den Sammelstatus für versteckte Tabs und aktualisiert die UI.
   */
  _syncHiddenTabScanAllState() {
    const pages = this.pageStore.getPageList();
    const total = pages.length;
    const enabledCount = pages.filter((page) => page.useHiddenTabScan).length;
    const checked = total > 0 && enabledCount === total;
    const indeterminate = enabledCount > 0 && enabledCount < total;
    view.setHiddenTabScanAllState({checked, indeterminate});
  }

  /**
   * Ermittelt den Sammelstatus für Network-Idle und aktualisiert die UI.
   */
  _syncWaitForNetworkIdleAllState() {
    const pages = this.pageStore.getPageList();
    const total = pages.length;
    const enabledCount = pages.filter((page) => page.waitForNetworkIdle).length;
    const checked = total > 0 && enabledCount === total;
    const indeterminate = enabledCount > 0 && enabledCount < total;
    view.setWaitForNetworkIdleAllState({checked, indeterminate});
  }
}

/**
 * @param {string} value - Eingabewert.
 * @returns {?number} Zahl oder null.
 */
function parseOptionalNumber(value) {
  if (!value || value.trim() === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
