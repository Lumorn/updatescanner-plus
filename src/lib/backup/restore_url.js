/**
 * Öffnet die Wiederherstellungsseite.
 */
export function openRestoreUrl() {
  const url = browser.runtime.getURL('/app/restore/restore.html');
  browser.tabs.create({url: url});
}
