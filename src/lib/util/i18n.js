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
    'popup.version': 'Version {version}',
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
    'settings.group.general': 'General',
    'settings.group.scanning': 'Scanning defaults',
    'settings.group.hiddenTab': 'Hidden tab scans',
    'settings.group.areaSelector': 'Selected area',
    'settings.language.label': 'Language',
    'settings.language.description': 'Select the language for the interface.',
    'settings.language.option.en': 'English',
    'settings.language.option.de': 'German',
    'settings.scanEngine.label': 'Global scan mode',
    'settings.scanEngine.option.legacy': 'Legacy scan mode',
    'settings.scanEngine.option.new': 'New scan mode',
    'settings.scanEngine.description':
      'Choose which scan engine is used across the extension.',
    'settings.scanLegacyIdleMs.label': 'Legacy scan pause (ms)',
    'settings.scanLegacyIdleMs.placeholder': '2000',
    'settings.scanLegacyIdleMs.description':
      'Delay between legacy scan requests.',
    'settings.scanHostIdleMs.label':
      'Host delay (ms) — smaller values speed up legacy scans but cause more requests per host.',
    'settings.scanHostIdleMs.placeholder': '2000',
    'settings.scanHostIdleMs.description':
      'Minimum delay between scan requests per host.',
    'settings.scanConcurrency.label': 'Scan concurrency',
    'settings.scanConcurrency.placeholder': '2',
    'settings.scanConcurrency.description':
      'Number of parallel scans running from the queue.',
    'settings.hiddenTabSettings.disabledHint':
      'Hidden tab options are only available in the new scan mode.',
    'settings.hiddenTabScan.label': 'Use hidden tab for scans by default',
    'settings.hiddenTabScan.description':
      'New pages use a hidden background tab by default for more reliable scans.',
    'settings.hiddenTabScanAll.label': 'Use hidden tab scan for all pages',
    'settings.hiddenTabScanAll.description':
      'Apply the hidden tab scan setting to all existing pages.',
    'settings.waitForNetworkIdle.label':
      'Wait for network idle in hidden tabs by default',
    'settings.waitForNetworkIdle.description':
      'Wait for network idle or hydration signals before capturing new hidden tab scans.',
    'settings.waitForNetworkIdleAll.label':
      'Apply network idle wait to all pages',
    'settings.waitForNetworkIdleAll.description':
      'Update the network idle wait setting for all existing pages.',
    'settings.hiddenTabDefaultWaitMs.label':
      'Default wait before snapshot (ms)',
    'settings.hiddenTabDefaultWaitMs.placeholder': '3000',
    'settings.hiddenTabDefaultWaitMs.description':
      'Extra delay before capturing hidden tab snapshots on new pages.',
    'settings.hiddenTabDomStabilityWindow.label':
      'DOM stability window by default (ms)',
    'settings.hiddenTabDomStabilityWindow.placeholder': '1000',
    'settings.hiddenTabDomStabilityWindow.description':
      'Time window the DOM must remain stable before capturing a snapshot.',
    'settings.hiddenTabDomStabilityTimeout.label':
      'DOM stability timeout by default (ms)',
    'settings.hiddenTabDomStabilityTimeout.placeholder': '8000',
    'settings.hiddenTabDomStabilityTimeout.description':
      'Timeout for DOM stability waits on new pages.',
    'settings.hiddenTabMutationStabilityWindow.label':
      'Mutation stability window by default (ms)',
    'settings.hiddenTabMutationStabilityWindow.placeholder': '250',
    'settings.hiddenTabMutationStabilityWindow.description':
      'Time window without DOM mutations before capturing a snapshot.',
    'settings.hiddenTabMutationStabilityTimeout.label':
      'Mutation stability timeout by default (ms)',
    'settings.hiddenTabMutationStabilityTimeout.placeholder': '2000',
    'settings.hiddenTabMutationStabilityTimeout.description':
      'Timeout for mutation stability waits on new pages.',
    'settings.hiddenTabNetworkIdleTimeout.label':
      'Network idle timeout by default (ms)',
    'settings.hiddenTabNetworkIdleTimeout.placeholder': '8000',
    'settings.hiddenTabNetworkIdleTimeout.description':
      'Timeout for network idle waits in hidden tab scans for new pages.',
    'settings.hiddenTabNetworkIdleWindow.label':
      'Network idle window by default (ms)',
    'settings.hiddenTabNetworkIdleWindow.placeholder': '1500',
    'settings.hiddenTabNetworkIdleWindow.description':
      'Minimum quiet window before snapshot on new pages.',
    'settings.hiddenTabIgnoreSelectors.label':
      'Ignore selectors for snapshots by default',
    'settings.hiddenTabIgnoreSelectors.placeholder': '.ads, .cookie-banner',
    'settings.hiddenTabIgnoreSelectors.description':
      'CSS selectors removed from hidden tab snapshots for new pages.',
    'settings.hiddenTabTextHash.label':
      'Use text-only snapshot hash by default',
    'settings.hiddenTabTextHash.description':
      'Use only innerText for DOM stability checks on new pages.',
    'settings.hiddenTabScrollSteps.label':
      'Scroll simulation steps by default',
    'settings.hiddenTabScrollSteps.placeholder': '0',
    'settings.hiddenTabScrollSteps.description':
      'Number of scroll steps for hidden tab scans on new pages (0 disables it).',
    'settings.hiddenTabScrollDelay.label':
      'Scroll step delay by default (ms)',
    'settings.hiddenTabScrollDelay.placeholder': '250',
    'settings.hiddenTabScrollDelay.description':
      'Wait time after each scroll step for new pages.',
    'settings.hiddenTabScrollMaxHeight.label':
      'Max scroll height by default (px)',
    'settings.hiddenTabScrollMaxHeight.placeholder': '0',
    'settings.hiddenTabScrollMaxHeight.description':
      'Limit the simulated scroll height for new pages (0 disables the limit).',
    'settings.areaSelector.label': 'Selected area selector',
    'settings.areaSelector.placeholder': '.main-content',
    'settings.areaSelector.description':
      'Use the context menu to select a page area and store it for scans.',
    'settings.areaSelector.button': 'Select area',
    'settings.areaSelector.hint.default':
      'The selector is saved for the current tab if a matching page exists.',
    'settings.areaSelector.hint.missing':
      'No matching page found for the current tab.',
    'scan.progress': 'Scan in progress {progress}% ({scanned}/{total})',
    'scan.cancel': 'Cancel',
    'backup.filename': 'Update Scanner Backup.json',
    'page.defaultTitle': 'Update Scanner Website',
    'main.menu.debugInfo': 'Debug Info',
    'main.menu.pageSettings': 'Page Settings',
    'main.menu.scanEngine': 'Scan mode:',
    'main.menu.scanEngine.legacy': 'Legacy scan mode',
    'main.menu.scanEngine.new': 'New scan mode',
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
    'main.dialog.scanEngine': 'Scan mode:',
    'main.dialog.scanEngine.legacy': 'Legacy scan mode',
    'main.dialog.scanEngine.new': 'New scan mode',
    'main.dialog.scanMode': 'Scan mode:',
    'main.dialog.scanMode.anywhere': 'Anywhere in the page',
    'main.dialog.scanMode.insideElements': 'Inside the selected HTML elements',
    'main.dialog.scanMode.countOnly': 'Only count HTML elements',
    'main.dialog.areaSelector': 'Selected area:',
    'main.dialog.areaSelector.placeholder': '.main-content',
    'main.dialog.areaSelector.description':
      'Use the context menu entry “Bereich auswählen” to fill this automatically.',
    'main.dialog.hiddenTabScan': 'Use hidden tab for scan',
    'main.dialog.hiddenTabScan.description':
      'Open a hidden background tab and capture the DOM snapshot instead of fetch.',
    'main.dialog.waitForNetworkIdle': 'Wait for network idle',
    'main.dialog.waitForNetworkIdle.description':
      'Wait for network idle or hydration signals before taking a snapshot.',
    'main.dialog.waitForSelector': 'Wait for selector:',
    'main.dialog.waitForSelector.placeholder': '.main-content',
    'main.dialog.waitForSelector.description':
      'Optional CSS selector to wait for before taking a snapshot.',
    'main.dialog.waitForSelectorTimeoutMs': 'Wait for selector timeout (ms):',
    'main.dialog.waitForSelectorTimeoutMs.description':
      'Set 0 to disable the selector wait timeout.',
    'main.dialog.waitForNetworkIdleTimeout': 'Network idle timeout (ms):',
    'main.dialog.waitForNetworkIdleTimeout.description':
      'Set 0 to skip the network idle wait.',
    'main.dialog.hiddenTabIgnoreSelectors': 'Ignore selectors for snapshot:',
    'main.dialog.hiddenTabIgnoreSelectors.placeholder': '.ads, .cookie-banner',
    'main.dialog.hiddenTabIgnoreSelectors.description':
      'CSS selectors that will be removed before hashing the snapshot.',
    'main.dialog.hiddenTabTextHash': 'Use text-only snapshot hash',
    'main.dialog.hiddenTabTextHash.description':
      'Compare only the visible text for DOM stability.',
    'main.dialog.hiddenTabScrollSteps': 'Scroll simulation steps:',
    'main.dialog.hiddenTabScrollSteps.placeholder': '0',
    'main.dialog.hiddenTabScrollSteps.description':
      'Number of scroll steps before snapshot (0 disables it).',
    'main.dialog.hiddenTabScrollDelayMs': 'Scroll step delay (ms):',
    'main.dialog.hiddenTabScrollDelayMs.placeholder': '250',
    'main.dialog.hiddenTabScrollDelayMs.description':
      'Wait time after each scroll step before continuing.',
    'main.dialog.hiddenTabScrollMaxHeight': 'Max scroll height (px):',
    'main.dialog.hiddenTabScrollMaxHeight.placeholder': '0',
    'main.dialog.hiddenTabScrollMaxHeight.description':
      'Limit the simulated scroll to a maximum document height.',
    'main.dialog.sendCredentials': 'Send cookies/credentials',
    'main.dialog.sendCredentials.description':
      'Include cookies/credentials when fetching this page.',
    'main.dialog.fetchCache': 'Fetch cache policy:',
    'main.dialog.fetchCache.default': 'Default (browser)',
    'main.dialog.fetchCache.noStore': 'No store',
    'main.dialog.fetchCache.reload': 'Reload',
    'main.dialog.fetchCache.noCache': 'No cache',
    'main.dialog.fetchCache.forceCache': 'Force cache',
    'main.dialog.fetchCache.onlyIfCached': 'Only if cached',
    'main.dialog.fetchCache.description':
      'Optional cache policy for fetch scans.',
    'main.dialog.fetchMode': 'Fetch mode:',
    'main.dialog.fetchMode.default': 'Default (cors)',
    'main.dialog.fetchMode.cors': 'CORS',
    'main.dialog.fetchMode.noCors': 'No-CORS',
    'main.dialog.fetchMode.sameOrigin': 'Same-origin',
    'main.dialog.fetchMode.description':
      'Override the fetch mode when scanning via fetch.',
    'main.dialog.fetchRedirect': 'Fetch redirect:',
    'main.dialog.fetchRedirect.default': 'Default (follow)',
    'main.dialog.fetchRedirect.follow': 'Follow',
    'main.dialog.fetchRedirect.error': 'Error',
    'main.dialog.fetchRedirect.manual': 'Manual',
    'main.dialog.fetchRedirect.description':
      'Define how fetch handles redirects for this page.',
    'main.dialog.fetchHeaders': 'Fetch headers:',
    'main.dialog.fetchHeaders.placeholder': 'X-Custom-Header: Value',
    'main.dialog.fetchHeaders.description':
      'One header per line in the format "Name: Value".',
    'main.dialog.textDiffMode': 'Text diff mode',
    'main.dialog.textDiffMode.description':
      'Compare extracted text (and selectors) instead of HTML.',
    'main.dialog.selectors': 'CSS selectors:',
    'main.dialog.selectors.description': 'CSS selectors for more information see',
    'main.dialog.ignoredSelectors': 'Ignored selectors:',
    'main.dialog.ignoredSelectors.placeholder': '.ads, .cookie-banner',
    'main.dialog.ignoredSelectors.description':
      'CSS selectors that will be removed before comparing HTML.',
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
    'scan.notice.hiddenTabFallback': 'Hidden tab failed, fetch was used.',
    'scan.notice.hiddenTabTimeout':
      'Hidden tab timed out; fetch was used.',
    'scan.notice.hiddenTabCsp':
      'Hidden tab blocked by Content Security Policy; fetch was used.',
    'scan.notice.hiddenTabExecuteScriptError':
      'Hidden tab script injection failed; fetch was used.',
    'scan.notice.hiddenTabHideFailed':
      'Hidden tab could not be hidden; scan continued.',
    'scan.notice.fetchTooShortFallback':
      'Fetch response was too short; hidden tab was used instead.',
    'scan.notice.fetchFailed':
      'Fetch failed; scan aborted.',
    'scan.notice.domDiffUnavailable':
      'DOM diff unavailable; HTML diff was used instead.',
    'scan.notice.domDiffFailed':
      'DOM diff failed; HTML diff was used instead.',
    'scan.notice.postParamsUnsupported':
      'POST parameters could not be serialized; scan aborted.',
    'scan.notice.networkIdleTimeout':
      'Network idle timeout reached; snapshot captured anyway.',
    'scan.notice.hiddenTabScrollTimeout':
      'Scroll simulation timed out; snapshot captured anyway.',
    'scan.notice.hiddenTabScrollError':
      'Scroll simulation failed; snapshot captured anyway.',
    'scan.notice.hiddenTabMutationTimeout':
      'Mutation stability timed out; snapshot captured anyway.',
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
    'debugInfo.details.sendCredentials': 'sendCredentials',
    'debugInfo.details.fetchCache': 'fetchCache',
    'debugInfo.details.fetchMode': 'fetchMode',
    'debugInfo.details.fetchRedirect': 'fetchRedirect',
    'debugInfo.details.fetchHeaders': 'fetchHeaders',
    'debugInfo.details.textDiffMode': 'textDiffMode',
    'debugInfo.details.waitForNetworkIdle': 'waitForNetworkIdle',
    'debugInfo.details.waitForNetworkIdleTimeoutMs': 'waitForNetworkIdleTimeoutMs',
    'debugInfo.details.hiddenTabIgnoreSelectors': 'hiddenTabIgnoreSelectors',
    'debugInfo.details.hiddenTabUseTextSnapshotHash': 'hiddenTabUseTextSnapshotHash',
    'debugInfo.details.hiddenTabScrollSteps': 'hiddenTabScrollSteps',
    'debugInfo.details.hiddenTabScrollDelayMs': 'hiddenTabScrollDelayMs',
    'debugInfo.details.hiddenTabScrollMaxHeight': 'hiddenTabScrollMaxHeight',
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
    'popup.version': 'Version {version}',
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
    'settings.group.general': 'Allgemein',
    'settings.group.scanning': 'Scan-Standards',
    'settings.group.hiddenTab': 'Hidden-Tab-Scans',
    'settings.group.areaSelector': 'Bereichsauswahl',
    'settings.language.label': 'Sprache',
    'settings.language.description': 'Wähle die Sprache der Oberfläche aus.',
    'settings.language.option.en': 'Englisch',
    'settings.language.option.de': 'Deutsch',
    'settings.scanEngine.label': 'Globaler Scan-Modus',
    'settings.scanEngine.option.legacy': 'Alter Scan-Modus',
    'settings.scanEngine.option.new': 'Neuer Scan-Modus',
    'settings.scanEngine.description':
      'Wähle, welcher Scan-Modus in der gesamten Erweiterung verwendet wird.',
    'settings.scanLegacyIdleMs.label': 'Pause für Legacy-Scans (ms)',
    'settings.scanLegacyIdleMs.placeholder': '2000',
    'settings.scanLegacyIdleMs.description':
      'Wartezeit zwischen Legacy-Scan-Anfragen.',
    'settings.scanHostIdleMs.label':
      'Host-Delay (ms) – Kleinere Werte beschleunigen den Legacy-Scan, verursachen aber mehr Requests pro Host.',
    'settings.scanHostIdleMs.placeholder': '2000',
    'settings.scanHostIdleMs.description':
      'Mindestabstand zwischen Scan-Anfragen pro Host.',
    'settings.scanConcurrency.label': 'Scan-Parallelität',
    'settings.scanConcurrency.placeholder': '2',
    'settings.scanConcurrency.description':
      'Anzahl paralleler Scans, die aus der Queue abgearbeitet werden.',
    'settings.hiddenTabSettings.disabledHint':
      'Hidden-Tab-Optionen sind nur im neuen Scan-Modus verfügbar.',
    'settings.hiddenTabScan.label': 'Versteckten Tab für Scans verwenden',
    'settings.hiddenTabScan.description':
      'Neue Seiten werden standardmäßig im versteckten Hintergrund-Tab gescannt.',
    'settings.hiddenTabScanAll.label':
      'Versteckten Tab-Scan für alle Seiten aktivieren/deaktivieren',
    'settings.hiddenTabScanAll.description':
      'Überträgt die Einstellung für den versteckten Tab auf alle vorhandenen Seiten.',
    'settings.waitForNetworkIdle.label':
      'Network-Idle bei versteckten Tabs standardmäßig abwarten',
    'settings.waitForNetworkIdle.description':
      'Wartet vor dem Snapshot auf Network-Idle oder Hydration-Signale.',
    'settings.waitForNetworkIdleAll.label':
      'Network-Idle-Wartezeit für alle Seiten übernehmen',
    'settings.waitForNetworkIdleAll.description':
      'Überträgt die Network-Idle-Einstellung auf alle vorhandenen Seiten.',
    'settings.hiddenTabDefaultWaitMs.label':
      'Standard-Wartezeit vor Snapshot (ms)',
    'settings.hiddenTabDefaultWaitMs.placeholder': '3000',
    'settings.hiddenTabDefaultWaitMs.description':
      'Zusätzliche Wartezeit vor dem Snapshot für neue Seiten.',
    'settings.hiddenTabDomStabilityWindow.label':
      'DOM-Stabilitätsfenster standardmäßig (ms)',
    'settings.hiddenTabDomStabilityWindow.placeholder': '1000',
    'settings.hiddenTabDomStabilityWindow.description':
      'Zeitfenster, in dem das DOM stabil bleiben muss, bevor ein Snapshot erstellt wird.',
    'settings.hiddenTabDomStabilityTimeout.label':
      'DOM-Stabilitäts-Timeout standardmäßig (ms)',
    'settings.hiddenTabDomStabilityTimeout.placeholder': '8000',
    'settings.hiddenTabDomStabilityTimeout.description':
      'Timeout für DOM-Stabilitätsprüfungen bei neuen Seiten.',
    'settings.hiddenTabMutationStabilityWindow.label':
      'Mutation-Stabilitätsfenster standardmäßig (ms)',
    'settings.hiddenTabMutationStabilityWindow.placeholder': '250',
    'settings.hiddenTabMutationStabilityWindow.description':
      'Zeitfenster ohne DOM-Mutationen vor dem Snapshot.',
    'settings.hiddenTabMutationStabilityTimeout.label':
      'Mutation-Stabilitäts-Timeout standardmäßig (ms)',
    'settings.hiddenTabMutationStabilityTimeout.placeholder': '2000',
    'settings.hiddenTabMutationStabilityTimeout.description':
      'Timeout für Mutation-Stabilitätsprüfungen bei neuen Seiten.',
    'settings.hiddenTabNetworkIdleTimeout.label':
      'Network-Idle-Timeout standardmäßig (ms)',
    'settings.hiddenTabNetworkIdleTimeout.placeholder': '8000',
    'settings.hiddenTabNetworkIdleTimeout.description':
      'Timeout für Network-Idle-Warten in Hidden-Tab-Scans bei neuen Seiten.',
    'settings.hiddenTabNetworkIdleWindow.label':
      'Network-Idle-Fenster standardmäßig (ms)',
    'settings.hiddenTabNetworkIdleWindow.placeholder': '1500',
    'settings.hiddenTabNetworkIdleWindow.description':
      'Mindestfenster ohne Aktivität vor dem Snapshot für neue Seiten.',
    'settings.hiddenTabIgnoreSelectors.label':
      'Selektoren für Snapshots standardmäßig ignorieren',
    'settings.hiddenTabIgnoreSelectors.placeholder': '.werbung, .cookie-banner',
    'settings.hiddenTabIgnoreSelectors.description':
      'CSS-Selektoren, die bei neuen Seiten aus Hidden-Tab-Snapshots entfernt werden.',
    'settings.hiddenTabTextHash.label':
      'Text-Hash für Snapshots standardmäßig verwenden',
    'settings.hiddenTabTextHash.description':
      'Nur innerText für DOM-Stabilitätsprüfungen bei neuen Seiten nutzen.',
    'settings.hiddenTabScrollSteps.label':
      'Scroll-Simulation standardmäßig in Schritten',
    'settings.hiddenTabScrollSteps.placeholder': '0',
    'settings.hiddenTabScrollSteps.description':
      'Anzahl der Scroll-Schritte für versteckte Tabs bei neuen Seiten (0 deaktiviert).',
    'settings.hiddenTabScrollDelay.label':
      'Scroll-Delay standardmäßig (ms)',
    'settings.hiddenTabScrollDelay.placeholder': '250',
    'settings.hiddenTabScrollDelay.description':
      'Wartezeit nach jedem Scroll-Schritt für neue Seiten.',
    'settings.hiddenTabScrollMaxHeight.label':
      'Maximale Scroll-Höhe standardmäßig (px)',
    'settings.hiddenTabScrollMaxHeight.placeholder': '0',
    'settings.hiddenTabScrollMaxHeight.description':
      'Begrenzt die simulierte Scroll-Höhe für neue Seiten (0 deaktiviert die Grenze).',
    'settings.areaSelector.label': 'Bereichs-Selektor',
    'settings.areaSelector.placeholder': '.main-content',
    'settings.areaSelector.description':
      'Per Kontextmenü kann ein Seitenbereich gewählt und für Scans gespeichert werden.',
    'settings.areaSelector.button': 'Bereich auswählen',
    'settings.areaSelector.hint.default':
      'Der Selektor wird für die aktuelle Tab-Seite gespeichert, sofern sie existiert.',
    'settings.areaSelector.hint.missing':
      'Für den aktuellen Tab wurde keine passende Seite gefunden.',
    'scan.progress': 'Scan läuft {progress}% ({scanned}/{total})',
    'scan.cancel': 'Abbrechen',
    'backup.filename': 'Update Scanner Sicherung.json',
    'page.defaultTitle': 'Update Scanner Webseite',
    'main.menu.debugInfo': 'Debug-Info',
    'main.menu.pageSettings': 'Seiteneinstellungen',
    'main.menu.scanEngine': 'Scan-Modus:',
    'main.menu.scanEngine.legacy': 'Alter Scan-Modus',
    'main.menu.scanEngine.new': 'Neuer Scan-Modus',
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
    'main.dialog.scanEngine': 'Scan-Modus:',
    'main.dialog.scanEngine.legacy': 'Alter Scan-Modus',
    'main.dialog.scanEngine.new': 'Neuer Scan-Modus',
    'main.dialog.scanMode': 'Scan-Modus:',
    'main.dialog.scanMode.anywhere': 'Überall auf der Seite',
    'main.dialog.scanMode.insideElements': 'Innerhalb der ausgewählten HTML-Elemente',
    'main.dialog.scanMode.countOnly': 'Nur HTML-Elemente zählen',
    'main.dialog.areaSelector': 'Ausgewählter Bereich:',
    'main.dialog.areaSelector.placeholder': '.main-content',
    'main.dialog.areaSelector.description':
      'Nutze das Kontextmenü „Bereich auswählen“, um den Selektor automatisch zu übernehmen.',
    'main.dialog.hiddenTabScan': 'Versteckten Tab zum Scannen verwenden',
    'main.dialog.hiddenTabScan.description':
      'Einen versteckten Hintergrund-Tab öffnen und den DOM-Snapshot statt fetch verwenden.',
    'main.dialog.waitForNetworkIdle': 'Auf Network-Idle warten',
    'main.dialog.waitForNetworkIdle.description':
      'Vor dem Snapshot auf Network-Idle oder Hydration-Signale warten.',
    'main.dialog.waitForSelector': 'Auf Selektor warten:',
    'main.dialog.waitForSelector.placeholder': '.main-content',
    'main.dialog.waitForSelector.description':
      'Optionaler CSS-Selektor, auf den vor dem Snapshot gewartet wird.',
    'main.dialog.waitForSelectorTimeoutMs': 'Selektor-Timeout (ms):',
    'main.dialog.waitForSelectorTimeoutMs.description':
      '0 deaktiviert das Timeout für den Selektor.',
    'main.dialog.waitForNetworkIdleTimeout': 'Network-Idle-Timeout (ms):',
    'main.dialog.waitForNetworkIdleTimeout.description':
      '0 setzt die Network-Idle-Wartezeit außer Kraft.',
    'main.dialog.hiddenTabIgnoreSelectors': 'Selektoren für Snapshot ignorieren:',
    'main.dialog.hiddenTabIgnoreSelectors.placeholder': '.werbung, .cookie-banner',
    'main.dialog.hiddenTabIgnoreSelectors.description':
      'CSS-Selektoren, die vor dem Hashing aus dem Snapshot entfernt werden.',
    'main.dialog.hiddenTabTextHash': 'Nur Text für Snapshot-Hash verwenden',
    'main.dialog.hiddenTabTextHash.description':
      'Für die DOM-Stabilität nur sichtbaren Text vergleichen.',
    'main.dialog.hiddenTabScrollSteps': 'Scroll-Simulation Schritte:',
    'main.dialog.hiddenTabScrollSteps.placeholder': '0',
    'main.dialog.hiddenTabScrollSteps.description':
      'Anzahl der Scroll-Schritte vor dem Snapshot (0 deaktiviert).',
    'main.dialog.hiddenTabScrollDelayMs': 'Scroll-Schritt-Delay (ms):',
    'main.dialog.hiddenTabScrollDelayMs.placeholder': '250',
    'main.dialog.hiddenTabScrollDelayMs.description':
      'Wartezeit nach jedem Scroll-Schritt vor dem nächsten Schritt.',
    'main.dialog.hiddenTabScrollMaxHeight': 'Maximale Scroll-Höhe (px):',
    'main.dialog.hiddenTabScrollMaxHeight.placeholder': '0',
    'main.dialog.hiddenTabScrollMaxHeight.description':
      'Begrenzt die simulierte Scroll-Höhe auf eine maximale Dokumenthöhe.',
    'main.dialog.sendCredentials': 'Cookies/Credentials mitsenden',
    'main.dialog.sendCredentials.description':
      'Beim Abruf dieser Seite Cookies/Credentials mitsenden.',
    'main.dialog.fetchCache': 'Fetch-Cache-Policy:',
    'main.dialog.fetchCache.default': 'Standard (Browser)',
    'main.dialog.fetchCache.noStore': 'Nicht speichern',
    'main.dialog.fetchCache.reload': 'Neu laden',
    'main.dialog.fetchCache.noCache': 'Kein Cache',
    'main.dialog.fetchCache.forceCache': 'Cache erzwingen',
    'main.dialog.fetchCache.onlyIfCached': 'Nur wenn gecacht',
    'main.dialog.fetchCache.description':
      'Optionale Cache-Policy für Fetch-Scans.',
    'main.dialog.fetchMode': 'Fetch-Modus:',
    'main.dialog.fetchMode.default': 'Standard (cors)',
    'main.dialog.fetchMode.cors': 'CORS',
    'main.dialog.fetchMode.noCors': 'No-CORS',
    'main.dialog.fetchMode.sameOrigin': 'Same-Origin',
    'main.dialog.fetchMode.description':
      'Überschreibt den Fetch-Modus beim Scan über fetch.',
    'main.dialog.fetchRedirect': 'Fetch-Redirect:',
    'main.dialog.fetchRedirect.default': 'Standard (follow)',
    'main.dialog.fetchRedirect.follow': 'Folgen',
    'main.dialog.fetchRedirect.error': 'Fehler',
    'main.dialog.fetchRedirect.manual': 'Manuell',
    'main.dialog.fetchRedirect.description':
      'Legt fest, wie Fetch mit Redirects für diese Seite umgeht.',
    'main.dialog.fetchHeaders': 'Fetch-Header:',
    'main.dialog.fetchHeaders.placeholder': 'X-Custom-Header: Wert',
    'main.dialog.fetchHeaders.description':
      'Ein Header pro Zeile im Format "Name: Wert".',
    'main.dialog.textDiffMode': 'Text-Diff-Modus',
    'main.dialog.textDiffMode.description':
      'Vergleicht extrahierten Text (und Selektoren) statt HTML.',
    'main.dialog.selectors': 'CSS-Selektoren:',
    'main.dialog.selectors.description':
      'CSS-Selektoren, weitere Infos unter',
    'main.dialog.ignoredSelectors': 'Ignorierte Selektoren:',
    'main.dialog.ignoredSelectors.placeholder': '.werbung, .cookie-banner',
    'main.dialog.ignoredSelectors.description':
      'CSS-Selektoren, die vor dem HTML-Vergleich entfernt oder ersetzt werden.',
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
    'scan.notice.hiddenTabFallback': 'Versteckter Tab fehlgeschlagen, Fetch verwendet.',
    'scan.notice.hiddenTabTimeout':
      'Versteckter Tab lief in ein Timeout; Fetch verwendet.',
    'scan.notice.hiddenTabCsp':
      'Versteckter Tab durch Content-Security-Policy blockiert; Fetch verwendet.',
    'scan.notice.hiddenTabExecuteScriptError':
      'Script-Injektion im versteckten Tab fehlgeschlagen; Fetch verwendet.',
    'scan.notice.hiddenTabHideFailed':
      'Versteckter Tab konnte nicht verborgen werden; Scan wurde fortgesetzt.',
    'scan.notice.fetchTooShortFallback':
      'Fetch-Antwort war zu kurz; stattdessen wurde der versteckte Tab genutzt.',
    'scan.notice.fetchFailed':
      'Fetch fehlgeschlagen; Scan abgebrochen.',
    'scan.notice.domDiffUnavailable':
      'DOM-Diff nicht verfügbar; HTML-Diff wurde verwendet.',
    'scan.notice.domDiffFailed':
      'DOM-Diff fehlgeschlagen; HTML-Diff wurde verwendet.',
    'scan.notice.postParamsUnsupported':
      'POST-Parameter konnten nicht serialisiert werden; Scan abgebrochen.',
    'scan.notice.networkIdleTimeout':
      'Network-Idle-Timeout erreicht; Snapshot trotzdem erstellt.',
    'scan.notice.hiddenTabScrollTimeout':
      'Scroll-Simulation lief in ein Timeout; Snapshot trotzdem erstellt.',
    'scan.notice.hiddenTabScrollError':
      'Scroll-Simulation fehlgeschlagen; Snapshot trotzdem erstellt.',
    'scan.notice.hiddenTabMutationTimeout':
      'Mutation-Stabilität lief in ein Timeout; Snapshot trotzdem erstellt.',
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
    'debugInfo.details.sendCredentials': 'sendCredentials',
    'debugInfo.details.fetchCache': 'fetchCache',
    'debugInfo.details.fetchMode': 'fetchMode',
    'debugInfo.details.fetchRedirect': 'fetchRedirect',
    'debugInfo.details.fetchHeaders': 'fetchHeaders',
    'debugInfo.details.textDiffMode': 'textDiffMode',
    'debugInfo.details.waitForNetworkIdle': 'waitForNetworkIdle',
    'debugInfo.details.waitForNetworkIdleTimeoutMs': 'waitForNetworkIdleTimeoutMs',
    'debugInfo.details.hiddenTabIgnoreSelectors': 'hiddenTabIgnoreSelectors',
    'debugInfo.details.hiddenTabUseTextSnapshotHash': 'hiddenTabUseTextSnapshotHash',
    'debugInfo.details.hiddenTabScrollSteps': 'hiddenTabScrollSteps',
    'debugInfo.details.hiddenTabScrollDelayMs': 'hiddenTabScrollDelayMs',
    'debugInfo.details.hiddenTabScrollMaxHeight': 'hiddenTabScrollMaxHeight',
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
