import {
  qs, $on, $delegate, findParentWithClass,
  showElement, hideElement, isHidden,
} from '/lib/util/view_helpers.js';
import {waitForMs} from '/lib/util/promise.js';
import {scanQueueStateEnum} from '/lib/scan/scan_queue.js';
import {setLanguage as applyLanguage, translate as i18nTranslate}
  from '/lib/util/i18n.js';

/**
 * Initialise the Popup view.
 */
export function init() {
  $on(qs('#menu-button'), 'click', toggleMenu);
  $on(qs('#backup-menu'), 'click', showBackupPanel);
  $on(qs('#restore-menu'), 'click', showRestorePanel);
}

/**
 * @param {Function} handler - Called when the ShowAll button is clicked.
 */
export function bindShowAllClick(handler) {
  $on(qs('#show-all-button'), 'click', handler);
}

/**
 * @param {Function} handler - Called when the New button is clicked.
 */
export function bindNewClick(handler) {
  $on(qs('#new-button'), 'click', handler);
}

/**
 * @param {Function} handler - Called when the Sidebar button is clicked.
 */
export function bindSidebarClick(handler) {
  $on(qs('#sidebar-button'), 'click', handler);
}

/**
 * @param {Function} handler - Called when the Help menu item is clicked.
 */
export function bindHelpClick(handler) {
  $on(qs('#help-menu'), 'click', handler);
}

/**
 * @param {Function} handler - Called when the Backup button is clicked.
 */
export function bindBackupClick(handler) {
  $on(qs('#backup-button'), 'click', handler);
}

/**
 * @param {Function} handler - Called when the Restore menu item is clicked.
 */
export function bindRestoreClick(handler) {
  $on(qs('#restore-button'), 'click', handler);
}

/**
 * @param {Function} handler - Called when the Scan All menu item is clicked.
 */
export function bindScanAllClick(handler) {
  $on(qs('#scan-all-menu'), 'click', handler);
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn Abbrechen geklickt wird.
 */
export function bindScanCancelClick(handler) {
  $on(qs('#scan-cancel-button'), 'click', handler);
}

/**
 * @param {Function} handler - Called when the Settings menu item is clicked.
 */
export function bindSettingsClick(handler) {
  $on(qs('#settings-menu'), 'click', handler);
}

/**
 * @param {Function} handler - Called when the language selection changes.
 */
export function bindLanguageChange(handler) {
  $on(qs('#language-select'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn der Default geändert wird.
 */
export function bindHiddenTabScanDefaultChange(handler) {
  $on(qs('#hidden-tab-scan-default'), 'change', (event) => {
    handler(event.target.checked);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn alle Seiten umgestellt werden.
 */
export function bindHiddenTabScanAllChange(handler) {
  $on(qs('#hidden-tab-scan-all'), 'change', (event) => {
    handler(event.target.checked);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn der Network-Idle-Default geändert wird.
 */
export function bindWaitForNetworkIdleDefaultChange(handler) {
  $on(qs('#wait-for-network-idle-default'), 'change', (event) => {
    handler(event.target.checked);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn alle Seiten umgestellt werden.
 */
export function bindWaitForNetworkIdleAllChange(handler) {
  $on(qs('#wait-for-network-idle-all'), 'change', (event) => {
    handler(event.target.checked);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn die Ignore-Selektoren geändert werden.
 */
export function bindHiddenTabIgnoreSelectorsDefaultChange(handler) {
  $on(qs('#hidden-tab-ignore-selectors-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn der Text-Hash-Default geändert wird.
 */
export function bindHiddenTabTextHashDefaultChange(handler) {
  $on(qs('#hidden-tab-text-hash-default'), 'change', (event) => {
    handler(event.target.checked);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn die Scroll-Schritte geändert werden.
 */
export function bindHiddenTabScrollStepsDefaultChange(handler) {
  $on(qs('#hidden-tab-scroll-steps-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn das Scroll-Delay geändert wird.
 */
export function bindHiddenTabScrollDelayDefaultChange(handler) {
  $on(qs('#hidden-tab-scroll-delay-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn die maximale Scroll-Höhe geändert wird.
 */
export function bindHiddenTabScrollMaxHeightDefaultChange(handler) {
  $on(qs('#hidden-tab-scroll-max-height-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * Setzt die aktuelle Sprache und aktualisiert die UI-Texte.
 *
 * @param {string} language - Sprachcode.
 */
export function setLanguage(language) {
  const activeLanguage = applyLanguage(language);
  qs('#language-select').value = activeLanguage;
}

/**
 * Setzt den Default-Status für versteckte Tabs in den Einstellungen.
 *
 * @param {boolean} enabled - Aktiviert den Default für versteckte Tabs.
 */
export function setHiddenTabScanDefault(enabled) {
  qs('#hidden-tab-scan-default').checked = enabled;
}

/**
 * Setzt den Default-Status für Network-Idle in den Einstellungen.
 *
 * @param {boolean} enabled - Aktiviert den Default für Network-Idle.
 */
export function setWaitForNetworkIdleDefault(enabled) {
  qs('#wait-for-network-idle-default').checked = enabled;
}

/**
 * Setzt die Default-Selektoren für versteckte Tabs.
 *
 * @param {string} value - Selektoren-String.
 */
export function setHiddenTabIgnoreSelectorsDefault(value) {
  qs('#hidden-tab-ignore-selectors-default').value = value ?? '';
}

/**
 * Setzt den Default-Status für Text-Hash-Snapshots.
 *
 * @param {boolean} enabled - Aktiviert den Text-Hash-Default.
 */
export function setHiddenTabTextHashDefault(enabled) {
  qs('#hidden-tab-text-hash-default').checked = enabled;
}

/**
 * Setzt den Default für die Scroll-Schritte.
 *
 * @param {?number} value - Optionaler Zahlenwert.
 */
export function setHiddenTabScrollStepsDefault(value) {
  qs('#hidden-tab-scroll-steps-default').value = formatOptionalNumber(value);
}

/**
 * Setzt den Default für das Scroll-Delay.
 *
 * @param {?number} value - Optionaler Zahlenwert.
 */
export function setHiddenTabScrollDelayDefault(value) {
  qs('#hidden-tab-scroll-delay-default').value = formatOptionalNumber(value);
}

/**
 * Setzt den Default für die maximale Scroll-Höhe.
 *
 * @param {?number} value - Optionaler Zahlenwert.
 */
export function setHiddenTabScrollMaxHeightDefault(value) {
  qs('#hidden-tab-scroll-max-height-default').value = formatOptionalNumber(value);
}

/**
 * Setzt den Status für den versteckten Tab-Scan bei allen Seiten.
 *
 * @param {{checked: boolean, indeterminate: boolean}} state - Statuswerte.
 */
export function setHiddenTabScanAllState({checked, indeterminate}) {
  const checkbox = qs('#hidden-tab-scan-all');
  checkbox.checked = checked;
  checkbox.indeterminate = indeterminate;
}

/**
 * Setzt den Status für Network-Idle bei allen Seiten.
 *
 * @param {{checked: boolean, indeterminate: boolean}} state - Statuswerte.
 */
export function setWaitForNetworkIdleAllState({checked, indeterminate}) {
  const checkbox = qs('#wait-for-network-idle-all');
  checkbox.checked = checked;
  checkbox.indeterminate = indeterminate;
}

/**
 * Setzt die angezeigte Version im Popup.
 *
 * @param {string} version - Versionsnummer.
 */
export function setVersion(version) {
  qs('#popup-version').textContent = i18nTranslate('popup.version', {version});
}

/**
 * @param {?number} value - Optionaler Zahlenwert.
 * @returns {string} String-Wert für Eingabefelder.
 */
function formatOptionalNumber(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

/**
 * Zeigt das Einstellungs-Panel an.
 */
export function showSettingsPanel() {
  showPanel('#settings-panel');
}

/**
 * @param {Function} handler - Called when a Page list item is clicked.
 */
export function bindPageClick(handler) {
  // Match all elements that have .panel-list-item as a parent
  $delegate(qs('#list'), '.panel-list-item *', 'click', ({target}) => {
    // Search upwards to find .panel-list-item
    const item = findParentWithClass(target, 'panel-list-item');
    handler(item.dataset.id);
  });
}

/**
 * Add a page to the list of updated pages.
 *
 * @param {Page} page - Page to add.
 */
export function addPage(page) {
  qs('#list').appendChild(createListItem(page));
}

/**
 * Remove all items from the list of updated pages.
 */
export function clearPageList() {
  qs('#list').innerHTML = '';
}

/**
 * Download a Url object. Used for downloading backup JSON files. Awaits until
 * the click event has fired, so it's safe to release the ObjectURL.
 *
 * @param {Url} url - Url object to download.
 * @param {string} filename - Default filename for the download.
 */
export async function downloadUrl(url, filename) {
  const link = qs('#backup-link');
  link.href = url;
  link.download = filename;
  link.click();

  await waitForMs(0);
}

/**
 * Updates scan state UI based on scan queue state.
 *
 * @param {{state: string, queueLength: number,
 * scanned: number}} queueData - Scan queue data.
 */
export function setScanState(queueData) {
  const scanStateUI = qs('#scan-state');
  const textWrapper = qs('#scan-state-title', scanStateUI);
  if (queueData.state === scanQueueStateEnum.ACTIVE) {
    showElement(scanStateUI);
    const total = queueData.scanned + queueData.queueLength;
    const progress = total > 0 ?
      Math.floor((queueData.scanned / total) * 100) :
      0;
    textWrapper.textContent = i18nTranslate('scan.progress', {
      progress,
      scanned: queueData.scanned,
      total,
    });
  } else if (queueData.state === scanQueueStateEnum.INACTIVE) {
    hideElement(scanStateUI);
  }
}

/**
 * Create a new list item for a Page.
 *
 * @param {Page} page - Page object to use for the list item.
 *
 * @returns {Element} List item for the given Page.
 */
function createListItem(page) {
  const item = document.createElement('div');
  item.className = 'panel-list-item';
  item.dataset.id = page.id;

  const icon = document.createElement('div');
  icon.className = 'icon';
  // const image = document.createElement('img');
  // image.src = '/images/updatescanner_18.png';
  // icon.appendChild(image);

  const text = document.createElement('div');
  text.className = 'text';
  text.textContent = page.title;

  item.appendChild(icon);
  item.appendChild(text);
  return item;
}

/**
 * Display/hide the menu. When displayed, a click outside the menu will hide it.
 *
 * @param {Event} event - Event used to initiate the toggle.
 */
function toggleMenu(event) {
  const menu = qs('#menu');
  const body = qs('body');
  if (isHidden(menu)) {
    showElement(menu);
    body.addEventListener('click', handleMenuOutsideClick);
    event.stopPropagation();
  } else {
    hideElement(menu);
    body.removeEventListener('click', handleMenuOutsideClick);
  }
}

/**
 * Blendet das Menü aus, wenn außerhalb geklickt wird.
 *
 * @param {Event} event - Klick-Ereignis.
 */
function handleMenuOutsideClick(event) {
  const menu = qs('#menu');
  const menuButton = qs('#menu-button');
  if (menu.contains(event.target) || menuButton.contains(event.target)) {
    return;
  }
  hideElement(menu);
  qs('body').removeEventListener('click', handleMenuOutsideClick);
}

/**
 * Display the Backup panel.
 */
function showBackupPanel() {
  showPanel('#backup-panel');
}

/**
 * Display the Restore panel.
 */
function showRestorePanel() {
  showPanel('#restore-panel');
}

/**
 * Blendet alle Panels aus und zeigt das gewünschte Panel.
 *
 * @param {string} selector - Ziel-Panel-Selector.
 */
function showPanel(selector) {
  hideElement(qs('#main-panel'));
  hideElement(qs('#backup-panel'));
  hideElement(qs('#restore-panel'));
  hideElement(qs('#settings-panel'));
  hideElement(qs('#menu'));
  qs('body').removeEventListener('click', handleMenuOutsideClick);
  showElement(qs(selector));
}
