import {
  qs, $on, $delegate, findParentWithClass,
  showElement, hideElement, isHidden,
} from '/lib/util/view_helpers.js';
import {waitForMs} from '/lib/util/promise.js';
import {scanQueueStateEnum} from '/lib/scan/scan_queue.js';

const translations = {
  en: {
    'app.title': 'Update Scanner',
    'button.showAll': 'Show All Updates',
    'menu.scanAll': 'Scan All Pages',
    'menu.backup': 'Backup Pages',
    'menu.restore': 'Restore Pages',
    'menu.settings': 'Settings',
    'menu.help': 'Help',
    'footer.new': 'New',
    'footer.sidebar': 'Sidebar',
    'footer.menu': 'Menu',
    'backup.title': 'Backup Pages',
    'backup.description.line1': 'This will save your pages to a local file,',
    'backup.description.line2': 'which can later be restored if necessary.',
    'backup.description2.line1': 'All pages and their settings will be saved,',
    'backup.description2.line2': 'but not the downloaded HTML.',
    'backup.button': 'Backup Pages',
    'restore.title': 'Restore Pages',
    'restore.description': 'This will restore your pages from a backup file.',
    'restore.warning.line1': 'Existing pages will be overwritten.',
    'restore.warning.line2': 'Please make a backup first!',
    'restore.button': 'Restore Pages',
    'settings.title': 'Settings',
    'settings.language.label': 'Language',
    'settings.language.description': 'Select the language for the interface.',
    'settings.language.option.en': 'English',
    'settings.language.option.de': 'German',
    'scan.progress': 'Scan in progress {progress}% ({scanned}/{total})',
  },
  de: {
    'app.title': 'Update Scanner',
    'button.showAll': 'Alle Updates anzeigen',
    'menu.scanAll': 'Alle Seiten scannen',
    'menu.backup': 'Seiten sichern',
    'menu.restore': 'Seiten wiederherstellen',
    'menu.settings': 'Einstellungen',
    'menu.help': 'Hilfe',
    'footer.new': 'Neu',
    'footer.sidebar': 'Sidebar',
    'footer.menu': 'Menü',
    'backup.title': 'Seiten sichern',
    'backup.description.line1': 'Dies speichert deine Seiten lokal,',
    'backup.description.line2': 'damit sie später wiederhergestellt werden können.',
    'backup.description2.line1': 'Alle Seiten und Einstellungen werden gesichert,',
    'backup.description2.line2': 'aber nicht das heruntergeladene HTML.',
    'backup.button': 'Seiten sichern',
    'restore.title': 'Seiten wiederherstellen',
    'restore.description': 'Dies stellt deine Seiten aus einer Sicherung wieder her.',
    'restore.warning.line1': 'Vorhandene Seiten werden überschrieben.',
    'restore.warning.line2': 'Bitte zuerst eine Sicherung erstellen!',
    'restore.button': 'Seiten wiederherstellen',
    'settings.title': 'Einstellungen',
    'settings.language.label': 'Sprache',
    'settings.language.description': 'Wähle die Sprache der Oberfläche aus.',
    'settings.language.option.en': 'Englisch',
    'settings.language.option.de': 'Deutsch',
    'scan.progress': 'Scan läuft {progress}% ({scanned}/{total})',
  },
};

let currentLanguage = 'en';

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
 * Setzt die aktuelle Sprache und aktualisiert die UI-Texte.
 *
 * @param {string} language - Sprachcode.
 */
export function setLanguage(language) {
  currentLanguage = translations[language] ? language : 'en';
  applyTranslations();
  qs('#language-select').value = currentLanguage;
  document.documentElement.lang = currentLanguage;
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
    const progress = Math.floor((queueData.scanned / total) * 100);
    textWrapper.textContent = translate('scan.progress', {
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
    body.addEventListener('click', toggleMenu);
    event.stopPropagation();
  } else {
    hideElement(menu);
    body.removeEventListener('click', toggleMenu);
  }
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
  qs('body').removeEventListener('click', toggleMenu);
  showElement(qs(selector));
}

/**
 * Liefert die übersetzte Zeichenkette für den aktuellen Sprachmodus.
 *
 * @param {string} key - Schlüssel für die Übersetzung.
 * @param {object} replacements - Platzhalterwerte.
 *
 * @returns {string} Übersetzter Text.
 */
function translate(key, replacements = {}) {
  const languageMap = translations[currentLanguage] || translations.en;
  const fallback = translations.en[key] || key;
  const template = languageMap[key] || fallback;

  return template.replace(/\{(\w+)\}/g, (match, placeholder) => {
    if (Object.prototype.hasOwnProperty.call(replacements, placeholder)) {
      return replacements[placeholder];
    }
    return match;
  });
}

/**
 * Wendet Übersetzungen auf alle markierten Elemente an.
 */
function applyTranslations() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((element) => {
    const key = element.dataset.i18n;
    element.textContent = translate(key);
  });
}
