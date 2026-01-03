# Update Scanner Plus

**Fork von https://github.com/sneakypete81/updatescanner**

Dieses Fork existiert, um die Erweiterung aktiv zu warten, Fehler zu beheben und
gezielte Verbesserungen vorzunehmen. Die ursprünglichen Lizenzhinweise bleiben
bestehen.

## Überblick

„Update Scanner Plus“ überwacht Webseiten auf Änderungen und zeigt die
Unterschiede an. Die Erweiterung läuft als Firefox-WebExtension mit Popup und
Sidebar.

## Features

* Überwachung von Webseiten auf Änderungen mit Diff-Ansicht.
* Automatische Scans in wählbaren Intervallen sowie manuelle Scans.
* Benachrichtigungen bei gefundenen Änderungen.
* Popup- und Sidebar-Ansicht für die Verwaltung der Einträge.
* Scan-Modi für ganze Seiten oder gezielte Bereiche per CSS-Selektoren.
* Option, Zahländerungen zu ignorieren und Schwellwerte für Änderungen zu setzen.
* Backup und Wiederherstellung der gespeicherten Einträge (JSON).

## Roadmap

* Geplante Verbesserungen werden hier ergänzt, sobald sie feststehen.

## Installation

* AMO: (folgt)
* Manuell:
  1. Repository klonen.
  2. In Firefox `about:debugging` öffnen.
  3. „Temporäres Add-on laden…“ auswählen und `src/manifest.json` wählen.

## Entwicklung / Build

Dieses Projekt nutzt `web-ext` zum Bauen der XPI-Datei.

* Abhängigkeiten installieren:
  * `npm install`
* Build erstellen:
  * `npm run build`
* Ergebnis:
  * Die XPI-Datei wird im Ordner `dist/` erzeugt.

Zum lokalen Testen ohne Build:
* `npm run run` (startet Firefox mit geladenem Add-on aus `src/`).

## Development (FOC)

Für einen reproduzierbaren Start im Dev-Modus empfiehlt sich `web-ext`.
Das Manifest liegt in `src/`, daher muss der Source-Ordner gesetzt werden.

* Starten: `npm run dev` (lädt das Add-on aus `src/`)
* Linten: `npm run lint` (führt zusätzlich `web-ext lint` aus; MV3 nutzt dafür ein temporäres MV2-Manifest wegen der web-ext-4.x-Limitierung)
* Build: `npm run build` (erstellt das XPI-Paket in `dist/`)
* Details und Smoke Tests: `docs/modernization/00-arbeitsbasis.md`

## Lizenz

GPL-3.0-only. Weitergabe und Änderungen müssen unter der GPL erfolgen und die
Lizenzhinweise beibehalten.

## Credits

* Originalautor: [sneakypete81](https://github.com/sneakypete81/updatescanner)
* Contributors willkommen.

## AMO Reviewer Info

* Quellcode: https://github.com/sneakypete81/updatescanner (Original) und dieses Fork.
* Builds werden mit `web-ext` erstellt. Für Releases wird der Quellcode im Repo
  bereitgestellt; falls Minifizierung oder Bundling eingesetzt wird, liegt ein
  entsprechendes Source-Archiv beim Release bei.

## MV3 Modernisierung – To-Do Liste (FOC)

Ziel ist die Umstellung auf Manifest V3 und aktuelle Firefox-Add-on-Technik
(Stand 03.01.2026). Der Funktionsumfang bleibt identisch, danach folgen
Feature-Erweiterungen. Die Liste ist in kleine, klar abhakbare Schritte
unterteilt.

- [ ] 0. Arbeitsbasis und Sicherheitsnetz  
  Ausgangslage prüfen, sichere Arbeitsbasis schaffen und Rückfalloptionen
  vorbereiten.  
  Done:
  - Basis-Branch und Backup-Tags existieren.
  - Build und Start laufen lokal reproduzierbar.
- [x] 1. Manifest V3 Grundgerüst  
  MV3-Manifest anlegen, Version und Mindestangaben definieren, ohne Logik zu
  ändern.  
  Done:
  - Manifest V3 lädt ohne Fehler.
  - Extension startet und zeigt UI.
  - Hintergrundseite bleibt als `background.page` aktiv, kein Service Worker.
- [x] 2. Host Permissions sauber trennen  
  Host-Rechte in `host_permissions` auslagern und restliche Permissions
  bereinigen.  
  Done:
  - Host-Rechte sind ausschließlich in `host_permissions`.
  - Keine unnötigen Permissions im Manifest.
  - Notizen: `docs/modernization/02-host-permissions.md`.
- [x] 3. Toolbar: browser_action → action  
  Toolbar-Definition auf MV3-`action` umstellen, UI-Icon und Popup prüfen.  
  Done:
  - `browser_action` ist entfernt.
  - Toolbar-Popup öffnet wie bisher.
  - Hintergrund nutzt die Action-API für Icon/Badge.
  - Notizen: `docs/modernization/03-action-toolbar.md`.
- [x] 4. Hintergrundseite entfernen, Event Page aktivieren  
  Hintergrundseite ablösen und Event-Page-Skripte als zentralen Einstieg setzen.  
  Done:
  - Event Page läuft über `background.scripts`.
  - Keine `background.page` mehr im Manifest.
  - Notizen: `docs/modernization/04-background-event-page.md`.
- [x] 5. Worker-Kompatibilität: window/document eliminieren  
  Zugriff auf `window`/`document` in Worker-Kontexten entfernen oder ersetzen.  
  Done:
  - Keine direkten `window`/`document`-Zugriffe im Worker.
  - Funktionen laufen im Worker fehlerfrei.
  - Utility: `lib/util/env.js` bündelt globalThis/Timer-Zugriffe.
  - Notizen: `docs/modernization/05-dom-abhaengigkeiten.md`.
- [x] 6. API-Refactor: browser.browserAction → browser.action  
  API-Aufrufe umstellen, damit Toolbar-Logik MV3-konform ist.  
  Done:
  - Keine Nutzung von `browser.browserAction` mehr.
  - Toolbar-APIs funktionieren unverändert.
  - Keine Action-Aufrufe in Popup/Sidebar/Options gefunden.
  - Notizen: `docs/modernization/06-action-api-refactor.md`.
- [x] 7. Event-Registrierung robust machen (MV3-Lebenszyklus)  
  Listener so registrieren, dass Wake-up/Shutdown korrekt abgedeckt sind.  
  Done:
  - Listener werden beim Start zuverlässig registriert.
  - Keine verlorenen Events nach Idle/Restart.
  - Notizen: `docs/modernization/07-mv3-lifecycle.md`.
  - Queue-State-Antwort erfolgt per Message-Return für Event-Pages.
- [ ] 8. CSP und Inline-Skripte prüfen und bereinigen  
  CSP prüfen, Inline-Skripte entfernen oder ersetzen.  
  Done:
  - CSP-Fehler in der Konsole sind eliminiert.
  - Keine Inline-Skripte in HTML-Dateien.
- [ ] 9. Optional: Migration von tabs.executeScript → scripting.executeScript  
  Optionaler API-Wechsel für MV3-Standardpfad, ohne Funktionsverlust.  
  Done:
  - `scripting.executeScript` ersetzt alte Aufrufe.
  - Injects funktionieren in allen Zielseiten.
- [ ] 10. Optional: web_accessible_resources (MV3-Syntax)  
  `web_accessible_resources` in MV3-Format bringen und Zugriffe prüfen.  
  Done:
  - MV3-Syntax ist korrekt und minimal.
  - Ressourcen laden wie zuvor.
- [ ] 11. Storage/IndexedDB im Worker verifizieren  
  Speichern und Laden aus dem Worker prüfen, inklusive Migrationen.  
  Done:
  - Storage-Operationen funktionieren im Worker.
  - Keine Datenverluste beim Neustart.
- [ ] 12. Permission-Audit und Minimalprinzip (ohne Funktionsverlust)  
  Permissions auf das nötige Minimum reduzieren und dokumentieren.  
  Done:
  - Manifest enthält nur benötigte Permissions.
  - Funktionsumfang ist vollständig erhalten.
- [ ] 13. Packaging/Build/Dev-Tooling modernisieren (kleiner Schritt)  
  Build/Release-Tools an MV3 anpassen, ohne große Umbauten.  
  Done:
  - Build erzeugt lauffähiges MV3-Paket.
  - Dev-Workflow bleibt stabil.
- [ ] 14. Doku und Migrationsnotizen (für zukünftige Erweiterungen)  
  MV3-Migrationsnotizen dokumentieren und Lessons Learned festhalten.  
  Done:
  - README enthält MV3-Notizen.
  - Interne Hinweise sind auffindbar und klar.

### Smoke Tests (nach jedem Schritt)

* Add-on startet ohne Fehler in `about:debugging`.
* Toolbar-Popup öffnet und zeigt die Liste.
* Sidebar lädt und zeigt bestehende Einträge.
* Manuelles Scannen liefert Ergebnis.
* Benachrichtigung erscheint bei Änderungen.
