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
 * @param {Function} handler - Wird aufgerufen, wenn der Scan-Modus geändert wird.
 */
export function bindScanEngineDefaultChange(handler) {
  $on(qs('#scan-engine-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn der Legacy-Scan-Delay geändert wird.
 */
export function bindScanLegacyIdleMsChange(handler) {
  $on(qs('#scan-legacy-idle-ms'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn der Host-Delay geändert wird.
 */
export function bindScanHostIdleMsChange(handler) {
  $on(qs('#scan-host-idle-ms'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn die Scan-Parallelität geändert wird.
 */
export function bindScanConcurrencyChange(handler) {
  $on(qs('#scan-concurrency'), 'change', (event) => {
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
 * @param {Function} handler - Wird aufgerufen, wenn der Default-Delay geändert wird.
 */
export function bindHiddenTabDefaultWaitMsDefaultChange(handler) {
  $on(qs('#hidden-tab-default-wait-ms-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn das DOM-Fenster geändert wird.
 */
export function bindHiddenTabDomStabilityWindowDefaultChange(handler) {
  $on(qs('#hidden-tab-dom-stability-window-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn das DOM-Timeout geändert wird.
 */
export function bindHiddenTabDomStabilityTimeoutDefaultChange(handler) {
  $on(qs('#hidden-tab-dom-stability-timeout-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn das Mutation-Fenster geändert wird.
 */
export function bindHiddenTabMutationStabilityWindowDefaultChange(handler) {
  $on(qs('#hidden-tab-mutation-stability-window-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn das Mutation-Timeout geändert wird.
 */
export function bindHiddenTabMutationStabilityTimeoutDefaultChange(handler) {
  $on(qs('#hidden-tab-mutation-stability-timeout-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn das Network-Idle-Timeout geändert wird.
 */
export function bindHiddenTabNetworkIdleTimeoutDefaultChange(handler) {
  $on(qs('#hidden-tab-network-idle-timeout-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn das Network-Idle-Fenster geändert wird.
 */
export function bindHiddenTabNetworkIdleWindowDefaultChange(handler) {
  $on(qs('#hidden-tab-network-idle-window-default'), 'change', (event) => {
    handler(event.target.value);
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
 * @param {Function} handler - Wird aufgerufen, wenn die Regex-Liste geändert wird.
 */
export function bindFilterRegexListDefaultChange(handler) {
  $on(qs('#filter-regex-list-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn die Standard-Selektoren geändert werden.
 */
export function bindSelectorsDefaultChange(handler) {
  $on(qs('#selectors-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn ignorierte Selektoren geändert werden.
 */
export function bindIgnoredSelectorsDefaultChange(handler) {
  $on(qs('#ignored-selectors-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn der Diff-Typ geändert wird.
 */
export function bindDiffTypeDefaultChange(handler) {
  $on(qs('#diff-type-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn der Fetch-Modus geändert wird.
 */
export function bindFetchModeDefaultChange(handler) {
  $on(qs('#fetch-mode-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn die Änderungsschwelle geändert wird.
 */
export function bindChangeThresholdDefaultChange(handler) {
  $on(qs('#change-threshold-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn die minimale Zeichenänderung geändert wird.
 */
export function bindMinChangeCharsDefaultChange(handler) {
  $on(qs('#min-change-chars-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn die minimale Wortänderung geändert wird.
 */
export function bindMinChangeWordsDefaultChange(handler) {
  $on(qs('#min-change-words-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn die Levenshtein-Schwelle geändert wird.
 */
export function bindLevenshteinThresholdDefaultChange(handler) {
  $on(qs('#levenshtein-threshold-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn die Zahl-Ignore-Option geändert wird.
 */
export function bindIgnoreNumbersDefaultChange(handler) {
  $on(qs('#ignore-numbers-default'), 'change', (event) => {
    handler(event.target.checked);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn die Attribut-Blacklist geändert wird.
 */
export function bindAttributeBlacklistDefaultChange(handler) {
  $on(qs('#attribute-blacklist-default'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn der Bereichs-Selektor geändert wird.
 */
export function bindAreaSelectorChange(handler) {
  $on(qs('#area-selector-input'), 'change', (event) => {
    handler(event.target.value);
  });
}

/**
 * @param {Function} handler - Wird aufgerufen, wenn die Bereichsauswahl startet.
 */
export function bindAreaSelectorClick(handler) {
  $on(qs('#area-selector-button'), 'click', handler);
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
 * Setzt den globalen Scan-Modus in den Einstellungen.
 *
 * @param {string} mode - Scan-Modus.
 */
export function setScanEngineDefault(mode) {
  qs('#scan-engine-default').value = mode;
}

/**
 * Setzt die Wartezeit zwischen Legacy-Scans.
 *
 * @param {number} value - Wartezeit in Millisekunden.
 */
export function setScanLegacyIdleMs(value) {
  qs('#scan-legacy-idle-ms').value = formatOptionalNumber(value);
}

/**
 * Setzt den Mindestabstand zwischen Scan-Requests pro Host.
 *
 * @param {number} value - Wartezeit in Millisekunden.
 */
export function setScanHostIdleMs(value) {
  qs('#scan-host-idle-ms').value = formatOptionalNumber(value);
}

/**
 * Setzt die Scan-Parallelität.
 *
 * @param {number} value - Anzahl paralleler Scans.
 */
export function setScanConcurrency(value) {
  qs('#scan-concurrency').value = formatOptionalNumber(value);
}

/**
 * Setzt den aktuellen Bereichs-Selektor im Popup.
 *
 * @param {string} value - Selektor-String.
 */
export function setAreaSelectorValue(value) {
  qs('#area-selector-input').value = value ?? '';
}

/**
 * Steuert die Verfügbarkeit der Bereichsauswahl.
 *
 * @param {{disabled: boolean, hint: string}} state - UI-Status.
 */
export function setAreaSelectorState(state) {
  const input = qs('#area-selector-input');
  const button = qs('#area-selector-button');
  const hint = qs('#area-selector-hint');
  input.disabled = state.disabled;
  button.disabled = state.disabled;
  if (state.hint) {
    hint.textContent = state.hint;
  }
}

/**
 * Schaltet die Hidden-Tab-Einstellungen abhängig vom Scan-Modus.
 *
 * @param {boolean} enabled - True, wenn die Hidden-Tab-Einstellungen sichtbar sein sollen.
 */
export function setHiddenTabSettingsEnabled(enabled) {
  const settingsWrapper = qs('#hidden-tab-settings');
  const hint = qs('#hidden-tab-settings-disabled-hint');

  if (enabled) {
    showElement(settingsWrapper);
    hideElement(hint);
  } else {
    hideElement(settingsWrapper);
    showElement(hint);
  }
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
 * Setzt den Default-Delay vor dem Snapshot.
 *
 * @param {?number} value - Optionaler Zahlenwert.
 */
export function setHiddenTabDefaultWaitMsDefault(value) {
  qs('#hidden-tab-default-wait-ms-default').value = formatOptionalNumber(value);
}

/**
 * Setzt das DOM-Stabilitätsfenster.
 *
 * @param {?number} value - Optionaler Zahlenwert.
 */
export function setHiddenTabDomStabilityWindowDefault(value) {
  qs('#hidden-tab-dom-stability-window-default').value = formatOptionalNumber(value);
}

/**
 * Setzt das DOM-Stabilitäts-Timeout.
 *
 * @param {?number} value - Optionaler Zahlenwert.
 */
export function setHiddenTabDomStabilityTimeoutDefault(value) {
  qs('#hidden-tab-dom-stability-timeout-default').value = formatOptionalNumber(value);
}

/**
 * Setzt das Mutation-Stabilitätsfenster.
 *
 * @param {?number} value - Optionaler Zahlenwert.
 */
export function setHiddenTabMutationStabilityWindowDefault(value) {
  qs('#hidden-tab-mutation-stability-window-default').value = formatOptionalNumber(value);
}

/**
 * Setzt das Mutation-Stabilitäts-Timeout.
 *
 * @param {?number} value - Optionaler Zahlenwert.
 */
export function setHiddenTabMutationStabilityTimeoutDefault(value) {
  qs('#hidden-tab-mutation-stability-timeout-default').value = formatOptionalNumber(value);
}

/**
 * Setzt das Network-Idle-Timeout.
 *
 * @param {?number} value - Optionaler Zahlenwert.
 */
export function setHiddenTabNetworkIdleTimeoutDefault(value) {
  qs('#hidden-tab-network-idle-timeout-default').value = formatOptionalNumber(value);
}

/**
 * Setzt das Network-Idle-Fenster.
 *
 * @param {?number} value - Optionaler Zahlenwert.
 */
export function setHiddenTabNetworkIdleWindowDefault(value) {
  qs('#hidden-tab-network-idle-window-default').value = formatOptionalNumber(value);
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
 * Setzt die Default-Regex-Liste für neue Seiten.
 *
 * @param {string} value - Regex-Liste.
 */
export function setFilterRegexListDefault(value) {
  qs('#filter-regex-list-default').value = value ?? '';
}

/**
 * Setzt die Standard-Selektoren für neue Seiten.
 *
 * @param {string} value - Selektoren-String.
 */
export function setSelectorsDefault(value) {
  qs('#selectors-default').value = value ?? '';
}

/**
 * Setzt die Standard-Ignore-Selektoren für neue Seiten.
 *
 * @param {string} value - Selektoren-String.
 */
export function setIgnoredSelectorsDefault(value) {
  qs('#ignored-selectors-default').value = value ?? '';
}

/**
 * Setzt den Standard-Diff-Typ für neue Seiten.
 *
 * @param {string} value - Diff-Typ.
 */
export function setDiffTypeDefault(value) {
  qs('#diff-type-default').value = value ?? 'html';
}

/**
 * Setzt den Standard-Fetch-Modus für neue Seiten.
 *
 * @param {?string} value - Fetch-Modus.
 */
export function setFetchModeDefault(value) {
  qs('#fetch-mode-default').value = value ?? '';
}

/**
 * Setzt die Standard-Änderungsschwelle.
 *
 * @param {?number} value - Anzahl Zeichen.
 */
export function setChangeThresholdDefault(value) {
  qs('#change-threshold-default').value = formatOptionalNumber(value);
}

/**
 * Setzt die Standard-Minimum-Zeichenänderung.
 *
 * @param {?number} value - Anzahl Zeichen.
 */
export function setMinChangeCharsDefault(value) {
  qs('#min-change-chars-default').value = formatOptionalNumber(value);
}

/**
 * Setzt die Standard-Minimum-Wortänderung.
 *
 * @param {?number} value - Anzahl Wörter.
 */
export function setMinChangeWordsDefault(value) {
  qs('#min-change-words-default').value = formatOptionalNumber(value);
}

/**
 * Setzt die Standard-Levenshtein-Schwelle.
 *
 * @param {?number} value - Ratio.
 */
export function setLevenshteinThresholdDefault(value) {
  qs('#levenshtein-threshold-default').value = formatOptionalNumber(value);
}

/**
 * Setzt den Default für die Option "Zahlen ignorieren".
 *
 * @param {boolean} enabled - Aktiviert den Default.
 */
export function setIgnoreNumbersDefault(enabled) {
  qs('#ignore-numbers-default').checked = enabled;
}

/**
 * Setzt die Default-Attribut-Blacklist für neue Seiten.
 *
 * @param {string} value - Attributliste.
 */
export function setAttributeBlacklistDefault(value) {
  qs('#attribute-blacklist-default').value = value ?? '';
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

  const icon = createIconElement(page);

  const text = document.createElement('div');
  text.className = 'text';

  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = page.title;
  text.appendChild(title);

  if (page.lastScanNoticeKey) {
    const notice = document.createElement('div');
    notice.className = 'notice';
    notice.textContent = i18nTranslate(page.lastScanNoticeKey);
    text.appendChild(notice);
  }

  item.appendChild(icon);
  item.appendChild(text);
  return item;
}

/**
 * Erstellt das Icon-Element für die Update-Liste.
 *
 * @param {Page} page - Page object für das Listenelement.
 * @returns {HTMLDivElement} Icon-Container.
 */
function createIconElement(page) {
  const icon = document.createElement('div');
  icon.className = 'icon';

  if (page.faviconUrl) {
    const image = document.createElement('img');
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.src = page.faviconUrl;
    image.addEventListener('error', () => {
      applyPlaceholderIcon(icon);
    });
    icon.appendChild(image);
  } else {
    applyPlaceholderIcon(icon);
  }

  return icon;
}

/**
 * Setzt den Platzhalterzustand für fehlende Icons.
 *
 * @param {HTMLDivElement} icon - Icon-Container.
 */
function applyPlaceholderIcon(icon) {
  icon.classList.add('icon--placeholder');
  icon.replaceChildren();
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
