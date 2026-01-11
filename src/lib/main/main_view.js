import {qs, $on, hideElement, showElement, toggleElement}
  from '/lib/util/view_helpers.js';
import {timeSince} from '/lib/util/date_format.js';
import {translate} from '/lib/util/i18n.js';

export const ViewTypes = {
  OLD: 'old',
  NEW: 'new',
  DIFF: 'diff',
};

/**
 * Initialise the main view.
 */
export function init() {
  initMenu();
}

/**
 * Initialise the dropdown menu.
 */
function initMenu() {
  const menu = qs('#menu');

  // Toggle the menu when its button is clicked
  $on(qs('#menuButton'), 'click', (event) => {
    toggleElement(menu);
    // Prevent the click from immediately closing the dropdown
    event.stopPropagation();
  });

  // Klicks im Menü sollen nicht das Schließen durch den Fenster-Handler auslösen.
  $on(menu, 'click', (event) => {
    event.stopPropagation();
  });

  // Hide the menu when something else is clicked
  $on(window, 'click', ({target}) => {
    hideElement(menu);
  });
}

/**
 * @param {object} handlers - Object containing the following keys
 * settingsHandler - Called when the Page Settings menu item is clicked
 * debugHandler - Called when the Debug Info menu item is clicked.
 */
export function bindMenu({settingsHandler, debugHandler}) {
  $on(qs('#page-settings'), 'click', () => {
    hideElement(qs('#menu'));
    settingsHandler();
  });
  $on(qs('#debug-info'), 'click', () => {
    hideElement(qs('#menu'));
    debugHandler();
  });
}

/**
 * @param {Function} handler - Called when the View Dropdown choice changes.
 */
export function bindViewDropdownChange(handler) {
  $on(qs('#view-dropdown'), 'change', ({target}) => {
    if (target.value) {
      handler(target.value);
    }
  });
}

/**
 * Show the diff view of the specified page.
 *
 * @param {Page} page - Page object to view.
 * @param {string} html - HTML string with diff highlighting.
 */
export function viewDiff(page, html) {
  setTitle(page.title, page.url);
  setErrorBanner('');
  setMenuDisabled(false);
  if (page.isError()) {
    setSubtitle(translate('main.subtitle.error'));
  } else if (page.newScanTime == null) {
    setSubtitle(translate('main.subtitle.notScanned'));
  } else {
    const scanTime = timeSince(new Date(page.newScanTime));
    setSubtitle(translate('main.subtitle.lastScanned', {time: scanTime}));
  }
  setScanNotice(page);
  setViewDropdown(ViewTypes.DIFF);
  setViewDropdownDisabled(false);
  loadSandboxedIframe(html);
}

/**
 * Show the old view of the specified page.
 *
 * @param {Page} page - Page object to view.
 * @param {string} html - Old HTML string.
 */
export function viewOld(page, html) {
  setTitle(page.title, page.url);
  setErrorBanner('');
  setMenuDisabled(false);
  if (page.oldScanTime == null) {
    setSubtitle(translate('main.subtitle.oldNotAvailable'));
  } else {
    const scanTime = timeSince(new Date(page.oldScanTime));
    setSubtitle(translate('main.subtitle.oldScanned', {time: scanTime}));
  }
  setScanNotice(page);
  setViewDropdown(ViewTypes.OLD);
  setViewDropdownDisabled(false);
  loadSandboxedIframe(html);
}

/**
 * Show the new view of the specified page.
 *
 * @param {Page} page - Page object to view.
 * @param {string} html - New HTML string.
 */
export function viewNew(page, html) {
  setTitle(page.title, page.url);
  setErrorBanner('');
  setMenuDisabled(false);
  if (page.newScanTime == null) {
    setSubtitle(translate('main.subtitle.newNotScanned'));
  } else {
    const scanTime = timeSince(new Date(page.newScanTime));
    setSubtitle(translate('main.subtitle.newScanned', {time: scanTime}));
  }
  setScanNotice(page);
  setViewDropdown(ViewTypes.NEW);
  setViewDropdownDisabled(false);
  loadSandboxedIframe(html);
}

/**
 * Zeigt eine sichere Fallback-Ansicht, wenn die Seite nicht gefunden wurde.
 */
export function viewMissingPage() {
  const title = 'Seite nicht gefunden';
  setTitle(title, '');
  setErrorBanner('');
  setMenuDisabled(false);
  setSubtitle(title);
  setScanNotice(null);
  setViewDropdown('');
  setViewDropdownDisabled(true);
  showEmptyState('Die angeforderte Seite ist nicht mehr vorhanden.');
}

/**
 * Zeigt einen Initialisierungsfehler in der UI an und deaktiviert Interaktionen.
 *
 * @param {string} message - Fehlermeldung für die Anzeige.
 */
export function viewInitError(message) {
  const title = 'Fehler beim Laden';
  setTitle(title, '');
  setSubtitle('Die Ansicht konnte nicht initialisiert werden.');
  setScanNotice(null);
  setViewDropdown('');
  setViewDropdownDisabled(true);
  setMenuDisabled(true);
  setErrorBanner(message);
  showEmptyState(message);
}

/**
 * @param {string} title - Title of the page.
 * @param {string} url - URL of the page.
 */
function setTitle(title, url) {
  document.title = translate('main.titleWithPage', {title});

  const titleElement = qs('#title');
  titleElement.textContent = title;
  titleElement.href = url;
}

/**
 * @param {string} subtitle - Subtitle text to use below the main title (eg
 * describing when the page was last updated).
 */
function setSubtitle(subtitle) {
  const subtitleElement = qs('#subtitle');
  subtitleElement.textContent = subtitle;
}

/**
 * Setzt den Hinweisbanner für Fehler und blendet ihn bei Bedarf aus.
 *
 * @param {string} message - Fehlertext, leer um auszublenden.
 */
function setErrorBanner(message) {
  const banner = qs('#error-banner');
  if (!message) {
    banner.textContent = '';
    hideElement(banner);
    return;
  }
  banner.textContent = message;
  showElement(banner);
}

/**
 * Zeigt optionale Scan-Hinweise im Detailbereich an.
 *
 * @param {Page} page - Page object to view.
 */
function setScanNotice(page) {
  const noticeElement = qs('#scan-notice');
  if (!page?.lastScanNoticeKey) {
    noticeElement.textContent = '';
    hideElement(noticeElement);
    return;
  }
  noticeElement.textContent = translate(page.lastScanNoticeKey);
  showElement(noticeElement);
}

/**
 * @param {ViewTypes} viewType - New value of the dropdown selection.
 */
function setViewDropdown(viewType) {
  const viewDropdown = qs('#view-dropdown');
  viewDropdown.value = viewType;
}

/**
 * @param {boolean} isDisabled - true, wenn die View-Auswahl deaktiviert werden soll.
 */
function setViewDropdownDisabled(isDisabled) {
  const viewDropdown = qs('#view-dropdown');
  viewDropdown.disabled = isDisabled;
}

/**
 * Aktiviert oder deaktiviert das Menü.
 *
 * @param {boolean} isDisabled - true, wenn das Menü deaktiviert werden soll.
 */
function setMenuDisabled(isDisabled) {
  const menuButton = qs('#menuButton');
  const menu = qs('#menu');
  menuButton.disabled = isDisabled;
  menu.classList.toggle('is-disabled', isDisabled);
  menu.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');
  if (isDisabled) {
    hideElement(menu);
  }
}

/**
 * Create a sandboxed iframe with the supplied unsafe HTML and insert it into
 * the main content area.
 *
 * @param {string} html - Unsafe HTML to load.
 */
function loadSandboxedIframe(html) {
  removeIframe();
  removeEmptyState();
  const iframe = document.createElement('iframe');
  iframe.id = 'frame';
  iframe.classList.add('frame');
  iframe.sandbox = 'allow-top-navigation';
  iframe.srcdoc = html;
  qs('#frameContainer').appendChild(iframe);
}

/**
 * Remove the iframe from the DOM, if it exists.
 */
function removeIframe() {
  const iframe = qs('#frame');
  if (iframe) {
    iframe.parentNode.removeChild(iframe);
  }
}

/**
 * Zeigt eine kleine Empty-State-Nachricht in der Hauptansicht.
 *
 * @param {string} message - Text für den Empty-State.
 */
function showEmptyState(message) {
  removeIframe();
  removeEmptyState();
  const emptyState = document.createElement('div');
  emptyState.id = 'frame-empty-state';
  emptyState.style.padding = '24px';
  emptyState.style.fontFamily = 'sans-serif';
  emptyState.style.color = 'var(--text-muted, #666)';
  emptyState.textContent = message;
  qs('#frameContainer').appendChild(emptyState);
}

/**
 * Entfernt den Empty-State aus der Ansicht, falls vorhanden.
 */
function removeEmptyState() {
  const emptyState = qs('#frame-empty-state');
  if (emptyState) {
    emptyState.parentNode.removeChild(emptyState);
  }
}
