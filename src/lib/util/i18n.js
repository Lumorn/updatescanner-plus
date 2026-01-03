import {Config} from './config.js';

const DEFAULT_LANGUAGE = 'en';

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
    'backup.filename': 'Update Scanner Backup.json',
    'page.defaultTitle': 'Update Scanner Website',
    'main.menu.debugInfo': 'Debug Info',
    'main.menu.pageSettings': 'Page Settings',
    'main.view.old': 'View Old Page',
    'main.view.new': 'View New Page',
    'main.view.diff': 'View Changes',
    'main.dialog.pageSettings': 'Page Settings',
    'main.dialog.folderSettings': 'Folder Settings',
    'main.dialog.titleLabel': 'Title:',
    'main.dialog.urlLabel': 'URL:',
    'main.dialog.urlPlaceholder': 'https://www.example.com',
    'main.dialog.autoscan': 'Autoscan:',
    'main.dialog.often': 'Often',
    'main.dialog.never': 'Never',
    'main.dialog.changeThreshold': 'Change Threshold:',
    'main.dialog.low': 'Low',
    'main.dialog.high': 'High',
    'main.dialog.ignoreNumbers': 'Ignore changes to numbers',
    'main.dialog.scanMode': 'Scan mode:',
    'main.dialog.scanMode.anywhere': 'Anywhere in the page',
    'main.dialog.scanMode.insideElements': 'Inside the selected HTML elements',
    'main.dialog.scanMode.countOnly': 'Only count HTML elements',
    'main.dialog.selectors': 'CSS selectors:',
    'main.dialog.selectors.description': 'CSS selectors for more information see',
    'main.dialog.cancel': 'Cancel',
    'main.dialog.ok': 'Ok',
    'main.subtitle.error':
      'This page returned an error when scanned. Click the title above to see what\'s wrong.',
    'main.subtitle.notScanned': 'This page has not yet been scanned.',
    'main.subtitle.lastScanned':
      'This page was last scanned {time}. The changes are highlighted.',
    'main.subtitle.oldNotAvailable':
      'There is no old version of this page available yet.',
    'main.subtitle.oldScanned':
      'This is the old version of the page, scanned {time}.',
    'main.subtitle.newNotScanned': 'This page has not yet been scanned.',
    'main.subtitle.newScanned':
      'This is the new version of the page, scanned {time}.',
    'main.titleWithPage': 'Update Scanner - {title}',
    'main.autoscan.every5': 'Scan every 5 minutes',
    'main.autoscan.every15': 'Scan every 15 minutes',
    'main.autoscan.every30': 'Scan every 30 minutes',
    'main.autoscan.every60': 'Scan every hour',
    'main.autoscan.every6hours': 'Scan every 6 hours',
    'main.autoscan.every24hours': 'Scan every day',
    'main.autoscan.everyWeek': 'Scan every week',
    'main.autoscan.manual': 'Manual scan only',
    'main.scanMode.description.anywhere': '',
    'main.scanMode.description.insideElements':
      'Check only inside selected elements using HTML elements selector.',
    'main.scanMode.description.countOnly':
      'Check only for change in number of HTML element matches. Content is ignored.',
    'main.selectors.unavailable': 'Selectors not available in "Anywhere" scan mode.',
    'main.threshold.all': 'All changes are detected',
    'main.threshold.all.detail': '',
    'main.threshold.cosmetic': 'Cosmetic changes are ignored',
    'main.threshold.cosmetic.detail': '(less than about 10 characters)',
    'main.threshold.minor': 'Minor changes are ignored',
    'main.threshold.minor.detail': '(less than about 50 characters)',
    'main.threshold.small': 'Small changes are ignored',
    'main.threshold.small.detail': '(less than about 100 characters)',
    'main.threshold.medium': 'Medium changes are ignored',
    'main.threshold.medium.detail': '(less than about 500 characters)',
    'main.threshold.major': 'Major changes are ignored',
    'main.threshold.major.detail': '(less than about 1000 characters)',
    'update.title': 'Update Scanner',
    'update.updating':
      'Updating to the latest version of Update Scanner, please wait...',
    'update.failed':
      'Failed to update to the latest version of Update Scanner.',
    'update.complete': 'You have been updated to the latest version of Update Scanner.',
    'restore.pageTitle': 'Update Scanner - Restore Pages',
    'restore.selectBackup': 'Select Backup File',
    'restore.restoring': 'Restoring pages, please wait...',
    'restore.failed': 'Failed to restore pages.',
    'restore.complete': 'Your pages have been restored successfully.',
    'restore.confirmOverwrite':
      'Restoring will overwrite your existing pages - are you sure?',
    'sidebar.dialog.delete': 'Delete',
    'sidebar.dialog.cancel': 'Cancel',
    'sidebar.dialog.confirm': 'Delete this item - are you sure?',
    'sidebar.context.newPage': 'New Page',
    'sidebar.context.newFolder': 'New Folder',
    'sidebar.context.delete': 'Delete',
    'sidebar.context.scanNow': 'Scan Now',
    'sidebar.context.settings': 'Settings',
    'debug.title': 'Storage API',
    'debug.reload': 'Reload',
    'debug.preload': 'Preload',
    'debug.addPage': 'Add Page',
    'debug.clear': 'Clear',
    'debug.notify': 'Show Notification',
    'debug.key': 'Key:',
    'debug.value': 'Value:',
    'debug.add': 'Add',
    'debugInfo.title': 'Update Scanner - Debug Info',
    'debugInfo.titleWithPage': '{title} - Debug Info',
    'debugInfo.oldHtml': 'Old HTML',
    'debugInfo.newHtml': 'New HTML',
    'debugInfo.download': 'Download',
    'debugInfo.filename.oldSuffix': '-old.html',
    'debugInfo.filename.newSuffix': '-new.html',
    'debugInfo.details.url': 'URL',
    'debugInfo.details.scanRateMinutes': 'scanRateMinutes',
    'debugInfo.details.changeThreshold': 'changeThreshold',
    'debugInfo.details.ignoreNumbers': 'ignoreNumbers',
    'debugInfo.details.encoding': 'encoding',
    'debugInfo.details.highlightChanges': 'highlightChanges',
    'debugInfo.details.highlightColour': 'highlightColour',
    'debugInfo.details.markChanges': 'markChanges',
    'debugInfo.details.doPost': 'doPost',
    'debugInfo.details.postParams': 'postParams',
    'debugInfo.details.state': 'state',
    'debugInfo.details.lastAutoscanTime': 'lastAutoscanTime',
    'debugInfo.details.oldScanTime': 'oldScanTime',
    'debugInfo.details.newScanTime': 'newScanTime',
    'notification.none': 'No updates were detected.',
    'notification.single': 'A webpage has been updated.',
    'notification.multi': '{count} webpages have been updated.',
    'notification.click': 'Click this panel to view the changes.',
    'time.future': 'in the future',
    'time.todayAt': 'today at {time}',
    'time.yesterdayAt': 'yesterday at {time}',
    'time.oneDay': 'one day ago',
    'time.days': '{days} days ago',
    'time.oneWeek': 'one week ago',
    'time.weeks': '{weeks} weeks ago',
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
    'backup.filename': 'Update Scanner Sicherung.json',
    'page.defaultTitle': 'Update Scanner Webseite',
    'main.menu.debugInfo': 'Debug-Info',
    'main.menu.pageSettings': 'Seiteneinstellungen',
    'main.view.old': 'Alte Seite ansehen',
    'main.view.new': 'Neue Seite ansehen',
    'main.view.diff': 'Änderungen ansehen',
    'main.dialog.pageSettings': 'Seiteneinstellungen',
    'main.dialog.folderSettings': 'Ordner-Einstellungen',
    'main.dialog.titleLabel': 'Titel:',
    'main.dialog.urlLabel': 'URL:',
    'main.dialog.urlPlaceholder': 'https://www.beispiel.de',
    'main.dialog.autoscan': 'Auto-Scan:',
    'main.dialog.often': 'Häufig',
    'main.dialog.never': 'Nie',
    'main.dialog.changeThreshold': 'Änderungsschwelle:',
    'main.dialog.low': 'Niedrig',
    'main.dialog.high': 'Hoch',
    'main.dialog.ignoreNumbers': 'Änderungen an Zahlen ignorieren',
    'main.dialog.scanMode': 'Scan-Modus:',
    'main.dialog.scanMode.anywhere': 'Überall auf der Seite',
    'main.dialog.scanMode.insideElements': 'Innerhalb der ausgewählten HTML-Elemente',
    'main.dialog.scanMode.countOnly': 'Nur HTML-Elemente zählen',
    'main.dialog.selectors': 'CSS-Selektoren:',
    'main.dialog.selectors.description':
      'CSS-Selektoren, weitere Infos unter',
    'main.dialog.cancel': 'Abbrechen',
    'main.dialog.ok': 'OK',
    'main.subtitle.error':
      'Diese Seite lieferte beim Scannen einen Fehler. Klicke oben auf den Titel, um Details zu sehen.',
    'main.subtitle.notScanned': 'Diese Seite wurde noch nicht gescannt.',
    'main.subtitle.lastScanned':
      'Diese Seite wurde zuletzt {time} gescannt. Die Änderungen sind hervorgehoben.',
    'main.subtitle.oldNotAvailable':
      'Es gibt noch keine alte Version dieser Seite.',
    'main.subtitle.oldScanned':
      'Dies ist die alte Version der Seite, gescannt {time}.',
    'main.subtitle.newNotScanned': 'Diese Seite wurde noch nicht gescannt.',
    'main.subtitle.newScanned':
      'Dies ist die neue Version der Seite, gescannt {time}.',
    'main.titleWithPage': 'Update Scanner - {title}',
    'main.autoscan.every5': 'Alle 5 Minuten scannen',
    'main.autoscan.every15': 'Alle 15 Minuten scannen',
    'main.autoscan.every30': 'Alle 30 Minuten scannen',
    'main.autoscan.every60': 'Stündlich scannen',
    'main.autoscan.every6hours': 'Alle 6 Stunden scannen',
    'main.autoscan.every24hours': 'Täglich scannen',
    'main.autoscan.everyWeek': 'Wöchentlich scannen',
    'main.autoscan.manual': 'Nur manuell scannen',
    'main.scanMode.description.anywhere': '',
    'main.scanMode.description.insideElements':
      'Nur innerhalb ausgewählter Elemente anhand des HTML-Selektors prüfen.',
    'main.scanMode.description.countOnly':
      'Nur Änderungen an der Anzahl der HTML-Elemente prüfen. Inhalt wird ignoriert.',
    'main.selectors.unavailable':
      'Selektoren sind im Modus "Überall" nicht verfügbar.',
    'main.threshold.all': 'Alle Änderungen werden erkannt',
    'main.threshold.all.detail': '',
    'main.threshold.cosmetic': 'Kosmetische Änderungen werden ignoriert',
    'main.threshold.cosmetic.detail': '(weniger als etwa 10 Zeichen)',
    'main.threshold.minor': 'Kleine Änderungen werden ignoriert',
    'main.threshold.minor.detail': '(weniger als etwa 50 Zeichen)',
    'main.threshold.small': 'Geringe Änderungen werden ignoriert',
    'main.threshold.small.detail': '(weniger als etwa 100 Zeichen)',
    'main.threshold.medium': 'Mittlere Änderungen werden ignoriert',
    'main.threshold.medium.detail': '(weniger als etwa 500 Zeichen)',
    'main.threshold.major': 'Größere Änderungen werden ignoriert',
    'main.threshold.major.detail': '(weniger als etwa 1000 Zeichen)',
    'update.title': 'Update Scanner',
    'update.updating':
      'Update Scanner wird auf die neueste Version aktualisiert, bitte warten...',
    'update.failed':
      'Update Scanner konnte nicht auf die neueste Version aktualisiert werden.',
    'update.complete': 'Update Scanner wurde auf die neueste Version aktualisiert.',
    'restore.pageTitle': 'Update Scanner - Seiten wiederherstellen',
    'restore.selectBackup': 'Sicherungsdatei auswählen',
    'restore.restoring': 'Seiten werden wiederhergestellt, bitte warten...',
    'restore.failed': 'Seiten konnten nicht wiederhergestellt werden.',
    'restore.complete': 'Deine Seiten wurden erfolgreich wiederhergestellt.',
    'restore.confirmOverwrite':
      'Beim Wiederherstellen werden deine bestehenden Seiten überschrieben. Bist du sicher?',
    'sidebar.dialog.delete': 'Löschen',
    'sidebar.dialog.cancel': 'Abbrechen',
    'sidebar.dialog.confirm': 'Diesen Eintrag löschen - bist du sicher?',
    'sidebar.context.newPage': 'Neue Seite',
    'sidebar.context.newFolder': 'Neuer Ordner',
    'sidebar.context.delete': 'Löschen',
    'sidebar.context.scanNow': 'Jetzt scannen',
    'sidebar.context.settings': 'Einstellungen',
    'debug.title': 'Storage-API',
    'debug.reload': 'Neu laden',
    'debug.preload': 'Vorab laden',
    'debug.addPage': 'Seite hinzufügen',
    'debug.clear': 'Leeren',
    'debug.notify': 'Benachrichtigung anzeigen',
    'debug.key': 'Schlüssel:',
    'debug.value': 'Wert:',
    'debug.add': 'Hinzufügen',
    'debugInfo.title': 'Update Scanner - Debug-Info',
    'debugInfo.titleWithPage': '{title} - Debug-Info',
    'debugInfo.oldHtml': 'Altes HTML',
    'debugInfo.newHtml': 'Neues HTML',
    'debugInfo.download': 'Herunterladen',
    'debugInfo.filename.oldSuffix': '-alt.html',
    'debugInfo.filename.newSuffix': '-neu.html',
    'debugInfo.details.url': 'URL',
    'debugInfo.details.scanRateMinutes': 'scanRateMinutes',
    'debugInfo.details.changeThreshold': 'changeThreshold',
    'debugInfo.details.ignoreNumbers': 'ignoreNumbers',
    'debugInfo.details.encoding': 'encoding',
    'debugInfo.details.highlightChanges': 'highlightChanges',
    'debugInfo.details.highlightColour': 'highlightColour',
    'debugInfo.details.markChanges': 'markChanges',
    'debugInfo.details.doPost': 'doPost',
    'debugInfo.details.postParams': 'postParams',
    'debugInfo.details.state': 'state',
    'debugInfo.details.lastAutoscanTime': 'lastAutoscanTime',
    'debugInfo.details.oldScanTime': 'oldScanTime',
    'debugInfo.details.newScanTime': 'newScanTime',
    'notification.none': 'Es wurden keine Updates gefunden.',
    'notification.single': 'Eine Webseite wurde aktualisiert.',
    'notification.multi': '{count} Webseiten wurden aktualisiert.',
    'notification.click': 'Klicke auf diese Meldung, um die Änderungen zu sehen.',
    'time.future': 'in der Zukunft',
    'time.todayAt': 'heute um {time}',
    'time.yesterdayAt': 'gestern um {time}',
    'time.oneDay': 'vor einem Tag',
    'time.days': 'vor {days} Tagen',
    'time.oneWeek': 'vor einer Woche',
    'time.weeks': 'vor {weeks} Wochen',
  },
};

let currentLanguage = DEFAULT_LANGUAGE;

/**
 * Registriert oder erweitert Übersetzungen für eine Sprache.
 *
 * @param {string} language - Sprachcode.
 * @param {object} messages - Übersetzungen für die Sprache.
 */
export function registerTranslations(language, messages) {
  translations[language] = {
    ...(translations[language] || {}),
    ...messages,
  };
}

/**
 * Liefert die verfügbaren Sprachcodes.
 *
 * @returns {string[]} Sprachcodes.
 */
export function getAvailableLanguages() {
  return Object.keys(translations);
}

/**
 * Liefert die aktuell aktive Sprache.
 *
 * @returns {string} Sprachcode.
 */
export function getLanguage() {
  return currentLanguage;
}

/**
 * Setzt die aktuelle Sprache und aktualisiert die UI.
 *
 * @param {string} language - Sprachcode.
 *
 * @returns {string} Tatsächlich verwendeter Sprachcode.
 */
export function setLanguage(language) {
  currentLanguage = translations[language] ? language : DEFAULT_LANGUAGE;
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = currentLanguage;
    applyTranslations(document);
  }
  return currentLanguage;
}

/**
 * Übersetzt einen Schlüssel mit optionalen Platzhaltern.
 *
 * @param {string} key - Übersetzungsschlüssel.
 * @param {object} replacements - Platzhalterwerte.
 *
 * @returns {string} Übersetzter Text.
 */
export function translate(key, replacements = {}) {
  const languageMap = translations[currentLanguage] || translations[DEFAULT_LANGUAGE];
  const fallback = translations[DEFAULT_LANGUAGE]?.[key] || key;
  const template = languageMap?.[key] || fallback;

  return template.replace(/\{(\w+)\}/g, (match, placeholder) => {
    if (Object.prototype.hasOwnProperty.call(replacements, placeholder)) {
      return replacements[placeholder];
    }
    return match;
  });
}

/**
 * Wendet Übersetzungen auf markierte Elemente an.
 *
 * @param {Document|Element} root - Wurzelelement für die Suche.
 */
export function applyTranslations(root) {
  const rootElement = root || (typeof document === 'undefined' ? null : document);
  if (!rootElement || !rootElement.querySelectorAll) {
    return;
  }

  rootElement.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n;
    element.textContent = translate(key);
  });

  rootElement.querySelectorAll('[data-i18n-attr]').forEach((element) => {
    const mappings = element.dataset.i18nAttr.split(';');
    mappings.forEach((mapping) => {
      const [attribute, key] = mapping.split(':').map((value) => value.trim());
      if (attribute && key) {
        element.setAttribute(attribute, translate(key));
      }
    });
  });
}

/**
 * Lädt die Sprache aus der Konfiguration und setzt sie.
 *
 * @returns {Promise<string>} Aktueller Sprachcode.
 */
export async function loadLanguageFromConfig() {
  const language = await Config.loadSingleSetting('language');
  return setLanguage(language);
}
