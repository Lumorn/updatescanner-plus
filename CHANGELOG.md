# Update Scanner Changelog

## Unreleased

* Dokumentation für Fork und AMO-Vorbereitung aktualisiert
* MV3-Modernisierung To-Do-Liste in README ergänzt
* Modernisierungsdoku für Schritt 0 ergänzt (Arbeitsbasis, Smoke Tests)
* Host-Permissions aus `permissions` nach `host_permissions` verschoben (MV3)
* Modernisierungsdoku für Schritt 2 ergänzt (host_permissions)
* Hinweise zu optionalen Host-Rechten und Lint-Status in Schritt-2-Doku ergänzt
* Modernisierungsdoku für Schritt 3 ergänzt (action-Toolbar)
* Development-Abschnitt im README ergänzt
* Web-Ext-Skripte für Dev/Lint/Build standardisiert
* Minimale CI für web-ext lint ergänzt
* PR-Template mit Smoke-Test-Checkliste hinzugefügt
* Manifest auf MV3-Basis umgestellt (manifest_version 3, action statt browser_action, browser_style entfernt, background.page beibehalten)
* Hintergrund-Toolbar nutzt temporäres Action-Fallback für Icon/Badge
* Hintergrund-Event-Page aktiviert (background.scripts statt background.page)
* Modernisierungsdoku für Schritt 4 ergänzt (Event Page)
* Lint-Workflow nutzt temporäres MV2-Manifest wegen web-ext-4.x-Limitierung
* DOM-Abhängigkeiten im Background reduziert (globalThis/Utility)
* DOMParser-Zugriff gekapselt, damit Event Page robust bleibt
* Modernisierungsdoku für Schritt 5 ergänzt (DOM-Abhängigkeiten)
* Background-Instanz über env-Utility global verfügbar gemacht

## 4.6.0beta2

* Fix issue that prevented editing of page properties

## 4.6.0beta1

* Add basic support for element selection (#596 thanks to @adadsamcik)
* Fix race condition when displaying notification after a scan

## 4.5.1alpha3

* Fix for no root folder after fresh installation

## 4.5.1alpha2

* Fix problem when restoring folders (#495)

## 4.5.1alpha1

* Fix potential race conditions in async functions

## 4.5.0beta1

* Add support for Notification Sound extension (#445)
  * <https://addons.mozilla.org/firefox/addon/notification-sound>

## 4.4.0

* Open a new tab when a page is clicked in the popup (#286)
* Popup no longer truncates buttons (#326 #178 thanks to @Jackymancs4)
* Popup now displays correctly in overflow menu (#322 thanks to @Jackymancs4)
* Prevent incorrect HTML from appearing when reusing IDs (#305)
* Make page heading slightly blue, as a hint that it's clickable (#299)
* Fix missing Restore dialog for Linux (#371)
* Stop popup blocker from preventing restore (#371)
* Fix delete confirmation dialog in sidebar (#381)

## 4.3.2

* Allow copy to clipboard on debug info pages (#291)
* Robustness improvements (#294 thanks to @peteroupc)
* Remove v3 upgrade text from sidebar

## 4.3.1

* Whitelist Facebook and Twitter for use when Tracking Protection is enabled (#218)
* Prevent Win7 sidebar tree from using bold font by default (#158)
* Add Debug Info page
* (dev) Replace webpack with native ES Modules
* (dev) Replace grunt with npm scripts

## 4.3.0

* Scan individual folders/pages from the sidebar right-click menu (#123)
* Detect and handle all character encodings (#136)

## 4.2.1

* Use IndexedDB for HTML storage (#149, #191)
* Automatically upgrade to IndexedDB storage
* Add unlimitedStorage permission (#149)

## 4.2.0

* Added backup/restore functionality (#117)

## 4.1.0

* Change sidebar item color to grey on error (#116)
* Make folder text bold when they contain changed pages (#118)
* Show a message if the last scan was unsuccessful
* Scroll popup list if it overflows (#138)
* Add page title to tab (#129)
* Open iframe links outside iframe (#122)
* Fix upgrade race condition (#139)

## 4.0.0

Rewritten as a WebExtension to support Firefox 57+.
