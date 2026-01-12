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
  initDomDiffToggle();
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
  setDiffTypeToggleValue(page);
  setDiffTypeToggleDisabled(false);
  showDiffTypeToggle();
  updateDomDiffPanel(page);
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
  setDiffTypeToggleDisabled(true);
  hideDiffTypeToggle();
  hideDomDiffPanel();
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
  setDiffTypeToggleDisabled(true);
  hideDiffTypeToggle();
  hideDomDiffPanel();
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
  setDiffTypeToggleDisabled(true);
  hideDiffTypeToggle();
  hideDomDiffPanel();
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
  setDiffTypeToggleDisabled(true);
  hideDiffTypeToggle();
  hideDomDiffPanel();
  showEmptyState(message);
}

/**
 * Initialisiert den Toggle für die DOM-Diff-Ansicht.
 */
function initDomDiffToggle() {
  const toggle = qs('#dom-diff-toggle');
  if (!toggle) {
    return;
  }
  $on(toggle, 'change', () => {
    const panel = qs('#dom-diff-panel');
    if (!panel) {
      return;
    }
    panel.classList.toggle('is-collapsed', !toggle.checked);
  });
}

/**
 * @param {Function} handler - Handler für den Diff-Typ-Wechsel.
 */
export function bindDiffTypeToggleChange(handler) {
  const toggle = qs('#diff-type-toggle');
  if (!toggle) {
    return;
  }
  $on(toggle, 'change', ({target}) => {
    if (target.value) {
      handler(target.value);
    }
  });
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
 * Setzt den Wert des Diff-Typ-Toggles basierend auf der aktuellen Seite.
 *
 * @param {Page} page - Page object.
 */
function setDiffTypeToggleValue(page) {
  const toggle = qs('#diff-type-toggle');
  if (!toggle) {
    return;
  }
  const diffType = page?.diffType ?? (page?.textDiffMode ? 'text' : 'html');
  toggle.value = diffType || 'html';
}

/**
 * Aktiviert oder deaktiviert den Diff-Typ-Toggle.
 *
 * @param {boolean} disabled - True zum Deaktivieren.
 */
function setDiffTypeToggleDisabled(disabled) {
  const toggle = qs('#diff-type-toggle');
  if (!toggle) {
    return;
  }
  toggle.disabled = Boolean(disabled);
}

/**
 * Blendet den Diff-Typ-Toggle ein.
 */
function showDiffTypeToggle() {
  const container = qs('#diff-type-switch');
  if (!container) {
    return;
  }
  showElement(container);
}

/**
 * Blendet den Diff-Typ-Toggle aus.
 */
function hideDiffTypeToggle() {
  const container = qs('#diff-type-switch');
  if (!container) {
    return;
  }
  hideElement(container);
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
 * Aktualisiert die DOM-Diff-Ansicht in der Detailansicht.
 *
 * @param {Page} page - Page object to view.
 */
function updateDomDiffPanel(page) {
  const panel = qs('#dom-diff-panel');
  if (!panel) {
    return;
  }

  const diffResult = page?.lastDiffResult;
  if (diffResult?.mode !== 'dom') {
    hideElement(panel);
    return;
  }

  showElement(panel);
  const toggle = qs('#dom-diff-toggle');
  if (toggle) {
    panel.classList.toggle('is-collapsed', !toggle.checked);
  }

  const changes = Array.isArray(diffResult.changes) ? diffResult.changes : [];
  renderDomDiffSummary(changes);
  renderDomDiffList(changes);
}

/**
 * Blendet die DOM-Diff-Ansicht aus.
 */
function hideDomDiffPanel() {
  const panel = qs('#dom-diff-panel');
  if (!panel) {
    return;
  }
  hideElement(panel);
}

/**
 * Rendert die Zusammenfassung der DOM-Diffs.
 *
 * @param {Array} changes - Change-Liste.
 */
function renderDomDiffSummary(changes) {
  const summary = qs('#dom-diff-summary');
  if (!summary) {
    return;
  }
  summary.textContent = '';

  const counts = buildDomDiffCounts(changes);
  const items = [
    {
      label: translate('main.domDiff.summary.added'),
      count: counts.added,
    },
    {
      label: translate('main.domDiff.summary.removed'),
      count: counts.removed,
    },
    {
      label: translate('main.domDiff.summary.attributes'),
      count: counts.attributes,
    },
    {
      label: translate('main.domDiff.summary.text'),
      count: counts.text,
    },
    {
      label: translate('main.domDiff.summary.replaced'),
      count: counts.replaced,
    },
  ];

  items.forEach((item) => {
    const entry = document.createElement('div');
    entry.className = 'dom-diff-summary-item';
    entry.textContent = `${item.label}: ${item.count}`;
    summary.appendChild(entry);
  });
}

/**
 * Rendert die Liste der DOM-Diff-Einträge.
 *
 * @param {Array} changes - Change-Liste.
 */
function renderDomDiffList(changes) {
  const list = qs('#dom-diff-list');
  if (!list) {
    return;
  }
  list.textContent = '';

  if (!changes || changes.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'dom-diff-empty';
    empty.textContent = translate('main.domDiff.empty');
    list.appendChild(empty);
    return;
  }

  changes.forEach((change) => {
    list.appendChild(buildDomDiffListItem(change));
  });
}

/**
 * Erstellt einen DOM-Diff-Eintrag für die Liste.
 *
 * @param {object} change - Change-Datensatz.
 * @returns {HTMLLIElement} Gerendertes Listenelement.
 */
function buildDomDiffListItem(change) {
  const item = document.createElement('li');
  item.className = 'dom-diff-item';

  const meta = getDomDiffTypeMeta(change?.type);
  if (meta?.className) {
    item.classList.add(meta.className);
  }

  const title = document.createElement('div');
  title.className = 'dom-diff-item-title';
  title.textContent = meta?.label || translate('main.domDiff.type.unknown');
  item.appendChild(title);

  const details = document.createElement('div');
  details.className = 'dom-diff-item-details';
  details.textContent = buildDomDiffDetails(change);
  item.appendChild(details);

  return item;
}

/**
 * Liefert die Metadaten für den jeweiligen DOM-Diff-Typ.
 *
 * @param {string} type - Change-Typ.
 * @returns {{label: string, className: string}} Meta-Informationen.
 */
function getDomDiffTypeMeta(type) {
  switch (type) {
    case 'added':
      return {
        label: translate('main.domDiff.type.added'),
        className: 'dom-diff-item--insert',
      };
    case 'removed':
      return {
        label: translate('main.domDiff.type.removed'),
        className: 'dom-diff-item--delete',
      };
    case 'attr_added':
      return {
        label: translate('main.domDiff.type.attrAdded'),
        className: 'dom-diff-item--attribute',
      };
    case 'attr_removed':
      return {
        label: translate('main.domDiff.type.attrRemoved'),
        className: 'dom-diff-item--attribute',
      };
    case 'attr_changed':
      return {
        label: translate('main.domDiff.type.attrChanged'),
        className: 'dom-diff-item--attribute',
      };
    case 'text_changed':
      return {
        label: translate('main.domDiff.type.textChanged'),
        className: 'dom-diff-item--text',
      };
    case 'replaced':
      return {
        label: translate('main.domDiff.type.replaced'),
        className: 'dom-diff-item--replace',
      };
    default:
      return {
        label: translate('main.domDiff.type.unknown'),
        className: 'dom-diff-item--attribute',
      };
  }
}

/**
 * Baut die Detailbeschreibung für einen Change.
 *
 * @param {object} change - Change-Datensatz.
 * @returns {string} Beschreibender Text.
 */
function buildDomDiffDetails(change) {
  const details = [];
  if (change?.nodeName) {
    details.push(`${translate('main.domDiff.field.node')}: ${change.nodeName}`);
  }
  if (change?.attribute) {
    details.push(
      `${translate('main.domDiff.field.attribute')}: ${change.attribute}`,
    );
  }
  if (change?.value) {
    details.push(`${translate('main.domDiff.field.value')}: ${change.value}`);
  }
  if (change?.from) {
    details.push(`${translate('main.domDiff.field.from')}: ${change.from}`);
  }
  if (change?.to) {
    details.push(`${translate('main.domDiff.field.to')}: ${change.to}`);
  }
  if (Number.isFinite(change?.partIndex)) {
    details.push(`${translate('main.domDiff.field.part')}: ${change.partIndex}`);
  }
  if (change?.path) {
    details.push(`${translate('main.domDiff.field.path')}: ${change.path}`);
  }
  return details.length > 0 ?
    details.join(' · ') :
    translate('main.domDiff.empty');
}

/**
 * Zählt die Change-Typen für die Zusammenfassung.
 *
 * @param {Array} changes - Change-Liste.
 * @returns {{added: number, removed: number, attributes: number, text: number,
 * replaced: number}} Aggregierte Zähler.
 */
function buildDomDiffCounts(changes) {
  const summary = {
    added: 0,
    removed: 0,
    attributes: 0,
    text: 0,
    replaced: 0,
  };

  (changes || []).forEach((change) => {
    switch (change?.type) {
      case 'added':
        summary.added += 1;
        break;
      case 'removed':
        summary.removed += 1;
        break;
      case 'attr_added':
      case 'attr_removed':
      case 'attr_changed':
        summary.attributes += 1;
        break;
      case 'text_changed':
        summary.text += 1;
        break;
      case 'replaced':
        summary.replaced += 1;
        break;
      default:
        summary.attributes += 1;
        break;
    }
  });

  return summary;
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
  iframe.sandbox = 'allow-top-navigation allow-scripts';
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
