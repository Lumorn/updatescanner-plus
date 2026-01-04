# Update Scanner Plus (Fork)

**Fork von https://github.com/sneakypete81/updatescanner**

Dieses Fork existiert, um die Erweiterung aktiv zu warten, Fehler zu beheben und
gezielte Verbesserungen vorzunehmen. Die ursprünglichen Lizenzhinweise bleiben
bestehen.

## Überblick

„Update Scanner Plus (Fork)“ überwacht Webseiten auf Änderungen und zeigt die
Unterschiede an. Die Erweiterung läuft als Firefox-WebExtension mit Popup und
Sidebar.

## Versionierung (Beta-Hinweis)

Wichtig: Bei jeder Änderung – auch bei kleinen Anpassungen – muss die
Versionsnummer in `src/manifest.json` aktualisiert werden. Für die aktuelle
Beta-Phase hängen wir dafür eine zusätzliche Zahl an die bestehende Version an
(z. B. `4.6.0.3` → `4.6.0.4`). Diese Versionsnummer wird im Popup unter der
Buttonreihe (Neu/Sidebar/Menü) angezeigt und muss immer aktuell sein.

## Features

* Überwachung von Webseiten auf Änderungen mit Diff-Ansicht.
* Diff-Ansicht berücksichtigt pro Seite Highlight-Farbe, Markierungen und optional die neue Version ohne Hervorhebung.
* Automatische Scans in wählbaren Intervallen sowie manuelle Scans.
* Benachrichtigungen bei gefundenen Änderungen.
* Popup- und Sidebar-Ansicht für die Verwaltung der Einträge.
* Scan-Modi für ganze Seiten oder gezielte Bereiche per CSS-Selektoren.
* Zentrale HTML-Normalisierung entfernt optional dynamische Bereiche über „Ignorierte Selektoren“ pro Seite.
* Optionaler Scan über einen versteckten Tab mit DOM-Snapshot statt fetch.
* Versteckter Tab wird per Tab-Hide-API verborgen und bei fehlender API in ein minimiertes Popup ausgelagert.
* Hidden-Tab-Scan wartet optional auf Selektoren (inkl. Timeout pro Seite), nutzt ein DOM-Stabilitätsfenster und einen globalen Standard-Delay.
* Hidden-Tab-Scan kann optional auf Network-Idle/Hydration-Signale warten; berücksichtigt Fetch/XHR-Requests sowie long-lived WebSocket/EventSource-Aktivität und meldet Timeouts als Hinweis im UI.
* Globale Einstellung für Network-Idle-Wartezeit bei neuen Seiten sowie Sammelaktion für alle Seiten.
* Hidden-Tab-Snapshots entfernen optional definierte CSS-Selektoren (z. B. Ads/Widgets) und können alternativ nur den Text-Hash verwenden.
* Optionaler Scroll-Simulator im Hidden-Tab-Scan (Schritte/Delay/Max-Höhe) lädt Lazy-Content und meldet Fehler als UI-Hinweis.
* Hidden-Tab-Scan versucht bei Fehlern einmalig mit längerer Wartezeit erneut und fällt anschließend mit UI-Hinweis auf fetch zurück.
* UI-Hinweise differenzieren Hidden-Tab-Fehler (Timeout, CSP, Script-Injektion, Tab-Hide) in Popup und Detailansicht.
* Hidden-Tab-Snapshot serialisiert Shadow DOMs und same-origin Iframes; bei cross-origin Frames wird ein Platzhalter mit URL erfasst.
* Standard-Scan über einen versteckten Tab ist für neue Seiten aktiviert (kann in den Einstellungen angepasst werden).
* Aktion im Settings-Panel, um den versteckten Tab-Scan für alle bestehenden Seiten zu aktivieren/deaktivieren.
* Fetch-Scans erkennen sehr kurze/leere Antworten und wechseln automatisch auf einen Hidden-Tab-Snapshot.
* Option, Cookies/Credentials pro Seite beim fetch-Scan mitzuschicken.
* Fetch-Scan unterstützt optionale Cache-/Mode-/Redirect-Policies sowie benutzerdefinierte Header pro Seite.
* Fetch-Scan kann optional per POST senden und serialisiert POST-Parameter als URL-Form oder JSON inklusive Content-Type.
* Optionaler Text-Diff-Modus vergleicht extrahierten Text (auch mit Selektoren) statt HTML und rendert die Diff-Ansicht als escapten Text in einer Vor/Nachher-Ansicht.
* Option, Zahländerungen zu ignorieren und Schwellwerte für Änderungen zu setzen.
* Backup und Wiederherstellung der gespeicherten Einträge (JSON).
* Robuster Zeichencodierungs-Fallback (UTF-8), wenn keine Kodierung erkennbar ist.
* Stabile Öffnung der Hauptansicht über MV3-kompatible URL-Ermittlung.
* Wiederherstellungsseite öffnet MV3-kompatibel über `runtime.getURL`.
* Debug-Info- und Update-Seiten öffnen MV3-kompatibel über `runtime.getURL`.
* Mehrsprachige Oberfläche im gesamten Add-on inkl. modular erweiterbarer
  Sprachverwaltung (Englisch/Deutsch).
* Zentrales Theme-Token-Set für Farben, Abstände und Typografie mit konsistenten
  Font- und Line-Height-Skalen.
* Erweiterte Typografie-Skala mit zusätzlichen Schriftgrößen/Font-Weights und klarer
  Hierarchie für Überschriften, Sektionstitel und Metatexte in Hauptansicht und Popup.
* Dark-Mode-Varianten für zentrale UI-Farbtokens konsistent im gemeinsamen Theme hinterlegt.
* Modernisierte Button- und Menü-Styles mit klaren Fokus-/Hover-Zuständen und
  konsistenten Klickflächen.
* Gemeinsame Button- und Menü-Variablen sorgen für einheitliche Hover-/Active-
  und Fokuszustände in Popup und Hauptansicht.
* Gleich große Footer-Knöpfe im Popup für Neu/Sidebar/Menü.
* Popup-Menü reagiert zuverlässig auf den Menüknopf und schließt sauber bei
  Außenklicks.
* Popup-Menü klappt direkt über dem Menüknopf aus und wird nicht verdeckt.
* Popup-Scan-Leiste bleibt stabil sichtbar, auch wenn die Liste wächst.
* Abbrechen-Button im Popup, um laufende Scans zu stoppen.
* Popup-Scan-Status und Abbrechen-Button passen sich dynamisch an die verfügbare Breite an.
* Popup-Footer mit Buttons und Versionsanzeige bleibt stabil, auch wenn die Liste sehr lang ist.
* Scan-Queue nutzt ein Deque/Index-Modell und verhindert Duplikate per Seiten-ID.
* Scan-Queue verarbeitet mehrere Scans parallel und bremst Requests pro Host ab.
* Scans speichern NEW-HTML nur bei echten Änderungen und merken sich zusätzlich
  einen Hash, um unnötige Schreibvorgänge zu vermeiden.

## Roadmap

* Geplante Verbesserungen werden hier ergänzt, sobald sie feststehen.

## Filterlogik (Ignorierte Selektoren)

Für dynamische Inhalte (z. B. Consent-Banner, Werbe-Widgets) kann pro Seite eine
Liste „Ignorierte Selektoren“ gepflegt werden. Diese Selektoren werden vor dem
Vergleich der gescannten HTML-Versionen angewendet:

* Die Selektoren werden vor dem Vergleich aus dem HTML entfernt bzw. durch
  Platzhalter ersetzt.
* Der Filter greift sowohl auf die neu gescannte Seite als auch auf die
  gespeicherte „NEW“-Version, damit der Vergleich stabil bleibt.
* Ungültige Selektoren blockieren den Scan nicht und werden still ignoriert.

## Installation

* AMO: (folgt)
* Manuell:
  1. Repository klonen.
  2. In Firefox `about:debugging` öffnen.
  3. „Temporäres Add-on laden…“ auswählen und `src/manifest.json` wählen.

## Entwicklung / Build

Dieses Projekt nutzt `web-ext` für einen reproduzierbaren Dev- und Build-Workflow.
Das Manifest liegt in `src/`, die Build-Artefakte landen in `dist/`.

### Developer Quickstart

**Voraussetzungen**
* Node.js LTS (Stand 03.01.2026: 24.x LTS oder `lts/*`)
* npm

**Install**
* `npm ci`
* Hinweis: `npm ci` nutzt die Versionen aus `npm-shrinkwrap.json`.

**Lint**
* `npm run lint:addon`

**Dev Run**
* `npm run dev:firefox` (kopiert Abhängigkeiten nach `src/dependencies` und startet Firefox mit temporär installiertem Add-on aus `src/`)
* Hinweis: Die für Sidebar und Storage benötigten Abhängigkeiten liegen im Repository unter `src/dependencies`. Für Updates kann `node scripts/copy-dependencies.js` genutzt werden.

**Build**
* `npm run build:zip` (erzeugt das XPI im Ordner `dist/`)

## Publishing

* Leitfaden: [docs/publish/amo-submission.md](docs/publish/amo-submission.md)
* Review Notes Vorlage: [docs/publish/review-notes-template.md](docs/publish/review-notes-template.md)
* Release-Checklist: [docs/publish/release-checklist.md](docs/publish/release-checklist.md)

### Hinweise zu Signing

`web-ext sign` benötigt AMO API Key/Secret. Hinterlege Secrets lokal in
`~/.web-ext-config.mjs` und committe sie nicht.

Hinweis für MV3: eine feste Extension-ID ist wichtig für Updates und Signing
(`browser_specific_settings.gecko.id` im Manifest).
Für dieses Fork ist die feste ID `updatescanner-plus@lumorn` gesetzt, damit die
Erweiterung parallel zum Original installierbar ist. Der Anzeigename im
Manifest lautet „Update Scanner Plus (Fork)“, um beide Add-ons eindeutig zu
unterscheiden.

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
- [x] 8. CSP und Inline-Skripte prüfen und bereinigen  
  CSP prüfen, Inline-Skripte entfernen oder ersetzen.  
  Done:
  - CSP-Fehler in der Konsole sind eliminiert.
  - Keine Inline-Skripte in HTML-Dateien.
  - Notizen: `docs/modernization/08-csp-inline-scripts.md`.
  - Hinweis: Keine `options_ui` vorhanden, nur Popup/Sidebar und Tab-Seiten.
- [x] 9. Optional: Migration von tabs.executeScript → scripting.executeScript  
  Optionaler API-Wechsel für MV3-Standardpfad, ohne Funktionsverlust.  
  Done:
  - Keine Script- oder CSS-Injektion im Code gefunden (Schritt nicht zutreffend).
  - Notizen: `docs/modernization/09-scripting-api.md`.
- [x] 10. Optional: web_accessible_resources (MV3-Syntax)  
  `web_accessible_resources` in MV3-Format bringen und Zugriffe prüfen.  
  Done:
  - Nicht erforderlich, da keine Web-Context-Ladungen erfolgen.
  - Notizen: `docs/modernization/10-web-accessible-resources.md`.
- [x] 11. Storage/IndexedDB im Worker verifizieren  
  Speichern und Laden aus dem Worker prüfen, inklusive Migrationen.  
  Done:
  - Storage-Operationen funktionieren im Worker.
  - Keine Datenverluste beim Neustart.
  - Notizen: `docs/modernization/11-storage-indexeddb.md`.
- [x] 12. Permission-Audit und Minimalprinzip (ohne Funktionsverlust)  
  Permissions auf das nötige Minimum reduzieren und dokumentieren.  
  Done:
  - Manifest enthält nur benötigte Permissions.
  - Funktionsumfang ist vollständig erhalten.
  - Notizen: `docs/modernization/12-permission-audit.md`.
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
