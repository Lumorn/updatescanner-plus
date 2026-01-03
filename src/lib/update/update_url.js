/**
 * Open the Update page URL.
 */
export function openUpdate() {
  const url = browser.runtime.getURL('/app/update/update.html');
  browser.tabs.create({url: url});
}
