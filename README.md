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
* Update-Liste im Popup zeigt Webseiten-Icons nach dem Scan, mit Platzhalter wenn kein Icon verfügbar ist.
* Sidebar zeigt Webseiten-Icons in der Baumansicht, mit Platzhalter wenn kein Icon verfügbar ist.
* Scan-Modi für ganze Seiten oder gezielte Bereiche per CSS-Selektoren.
* Bereichsauswahl per Overlay im Content-Script; Kontextmenü „Bereich auswählen“ liefert einen CSS-Selektor für gezielte Scans.
* Ausgewählter Bereich wird gespeichert und ist in Hauptansicht und Popup editierbar.
* Globaler Scan-Modus-Umschalter im Settings-Panel und in den Seiteneinstellungen, um zwischen altem und neuem Scan-Modus zu wechseln.
* Konfigurierbare Pause zwischen Legacy-Scans über das Settings-Panel.
* Einstellungsdialoge laden den globalen Scan-Engine-Modus asynchron und stabil ohne Syntaxfehler.
* Alter Scan-Modus arbeitet rein HTML-basiert und blendet Hidden-Tab-Optionen in den Einstellungen aus.
* Zentrale HTML-Normalisierung entfernt optional dynamische Bereiche über „Ignorierte Selektoren“ pro Seite.
* Zusätzliche Filter pro Seite: Regex-Liste für dynamischen Text und Attribut-Blacklist für DOM-Diffs.
* Optionaler Scan über einen versteckten Tab mit DOM-Snapshot statt fetch.
* Scan-Quelle pro Seite als HTTP-Fetch oder Headless-Tab-Snapshot konfigurierbar.
* Versteckter Tab wird per Tab-Hide-API verborgen und bei fehlender API in ein minimiertes Popup ausgelagert.
* Hidden-Tab-Scan wartet optional auf Selektoren (inkl. Timeout pro Seite), nutzt ein DOM-Stabilitätsfenster und einen globalen Standard-Delay.
* Headless-Scans unterstützen konfigurierbare Wartestrategien (Network-Idle, Selektor bereit, Timeout).
* Hidden-Tab-Scan wartet nach `document.readyState === 'complete'` kurz nach und kann ein zusätzliches Mutation-Stabilitätsfenster (konfigurierbar) nutzen.
* Hidden-Tab-Scan kann optional auf Network-Idle/Hydration-Signale warten; berücksichtigt Fetch/XHR-Requests sowie long-lived WebSocket/EventSource-Aktivität und meldet Timeouts als Hinweis im UI.
* Globale Einstellung für Network-Idle-Wartezeit bei neuen Seiten sowie Sammelaktion für alle Seiten.
* Zusätzliche Hidden-Tab-Defaults für Wartezeit, DOM-Stabilität und Network-Idle-Fenster/Timeout im Settings-Panel konfigurierbar.
* Hidden-Tab-Snapshots entfernen optional definierte CSS-Selektoren (z. B. Ads/Widgets) und können alternativ nur den Text-Hash verwenden.
* Optionaler Scroll-Simulator im Hidden-Tab-Scan (Schritte/Delay/Max-Höhe) lädt Lazy-Content und meldet Fehler als UI-Hinweis.
* Hidden-Tab-Scan versucht bei Fehlern einmalig mit längerer Wartezeit erneut und fällt anschließend mit UI-Hinweis auf fetch zurück.
* UI-Hinweise differenzieren Hidden-Tab-Fehler (Timeout, CSP, Script-Injektion, Tab-Hide) in Popup und Detailansicht.
* Hauptansicht meldet Sandbox-Blockaden (Null-Origin/CSP) im Vorschau-Iframe als Hinweis.
* Hidden-Tab-Snapshot serialisiert Shadow DOMs und same-origin Iframes; bei cross-origin Frames wird ein Platzhalter mit URL erfasst.
* Standard-Scan über einen versteckten Tab ist für neue Seiten aktiviert (kann in den Einstellungen angepasst werden).
* Aktion im Settings-Panel, um den versteckten Tab-Scan für alle bestehenden Seiten zu aktivieren/deaktivieren.
* Fetch-Scans erkennen sehr kurze/leere Antworten und wechseln automatisch auf einen Hidden-Tab-Snapshot.
* Hauptansicht rendert gespeicherte Seiten konsistent, indem der `<base>`-Tag im `<head>` ergänzt und fehlendes HTML-Grundgerüst automatisch erzeugt wird.
* Hauptansicht rendert die Vorschau jetzt wieder in voller Breite und Höhe, damit Seiten nicht verkleinert wirken.
* Hauptansicht nutzt einen flexiblen Vorschau-Container, damit die Inhaltsfläche dauerhaft die volle Höhe ausfüllt.
* Hauptansicht streckt den Vorschau-Iframe flexibel, damit gescannte Seiten vollständig gescrollt werden können.
* Hauptansicht injiziert ein Head-Stylesheet in die Vorschau, um Containerspalten in voller Breite zu rendern.
* Hauptansicht erzwingt scrollbare Vorschauinhalte, damit vollständige Seiten angezeigt werden.
* Hauptansicht zeigt eine sichere Fallback-Ansicht mit Empty-State, wenn die aufgerufene Seite fehlt.
* Hauptansicht initialisiert zuverlässig auch bei spät geladenen Skripten, damit Menü und Seitenansicht reagieren.
* Hauptansicht zeigt bei Initialisierungsfehlern eine verständliche Meldung und deaktiviert Menü sowie View-Dropdown.
* Öffnung der Hauptansicht fällt bei Tab-Update-Fehlern automatisch auf einen neuen Tab zurück.
* Option, Cookies/Credentials pro Seite beim fetch-Scan mitzuschicken.
* Fetch-Scan unterstützt optionale Cache-/Mode-/Redirect-Policies sowie benutzerdefinierte Header pro Seite.
* Seiteneinstellungen bieten Presets für „statische“ und „dynamische“ Seiten, um Scan-Defaults schnell zu setzen.
* Fetch-Scan kann optional per POST senden und serialisiert POST-Parameter als URL-Form oder JSON inklusive Content-Type.
* Diff-Typ pro Seite (Text oder HTML) mit Standard-Diff (diff-match-patch) sowie optionalem HTML-Diff mit `<ins>/<del>`-Markup.
* Umschalter in der Diff-Ansicht, um zwischen Text- und HTML-Diff zu wechseln.
* Verbessertes Diff-Styling mit klaren Farben und Hintergründen für Einfügungen und Löschungen.
* Optionaler DOM-Diff-Modus vergleicht die DOM-Struktur und speichert strukturierte Change-Listen zur gezielten UI-Hervorhebung.
* Detailansicht visualisiert DOM-Diff-Änderungen mit farbigen Einträgen, Zusammenfassung und Toggle.
* Option, Zahländerungen zu ignorieren sowie minimale Zeichen-/Wortänderungen und eine Levenshtein-Schwelle zu definieren.
* Popup-Settings bieten Defaults für Fetch-Modus, Selektoren, Diff-Typ und Schwellenwerte neuer Seiten.
* Einstellungsdialoge validieren URL, Selektoren, Fetch-Header und Schwellenwerte mit klaren Fehlermeldungen.
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
* Popup-Settings sind in klaren Gruppen mit konsistenter Label-Ausrichtung, Abständen und Button-Hierarchie strukturiert.
* Popup-Settings nutzen kompaktere Abstände und engere Beschreibungen, damit mehr Optionen sichtbar bleiben.
* Scrollbarer Container für die Popup-Settings hält den Titel sichtbar, während der Inhalt bewegt wird.
* Scan-Queue nutzt ein Deque/Index-Modell und verhindert Duplikate per Seiten-ID.
* Scan-Queue verarbeitet mehrere Scans parallel, serialisiert Requests pro Host
  und nutzt einen konfigurierbaren Host-Delay.
* Scans speichern NEW-HTML nur bei echten Änderungen und merken sich zusätzlich
  einen Hash, um unnötige Schreibvorgänge zu vermeiden.
* Legacy-Scan nutzt einen Quick-Hash der Roh-HTML-Daten, um teure Normalisierung
  und Diff-Schritte bei unveränderten Seiten zu überspringen.
* Popup-Settings erlauben eine Anpassung des Host-Delays, um Legacy-Scans je nach Bedarf zu beschleunigen.
* Popup-Settings erlauben die Konfiguration der Scan-Parallelität für die Queue.
* Hauptansicht erlaubt Skriptausführung im Sandbox-iframe, damit dynamische Seiten korrekt gerendert werden.
* Option pro Seite, Same-Origin im Sandbox-iframe der Hauptansicht zu erlauben, damit Same-Origin-Requests funktionieren.

## Roadmap

* Geplante Verbesserungen werden hier ergänzt, sobald sie feststehen.

## Konzept

* Projekt-Konzept: [docs/konzept.md](docs/konzept.md)

## Parser-Schicht (HTML-Parsing)

Die HTML-Parsing-Schicht liegt in `src/lib/util/html.js`. Dort werden HTML-Texte
über `DOMParser` in ein Dokument gewandelt und Selektoren (CSS oder optional
XPath) auf das Dokument angewendet. Diese Helfer werden von den Scan-Modulen
in `src/lib/scan/` genutzt, um Teilbereiche auszuwählen, Filter anzuwenden und
Textinhalte zu extrahieren.

## Filterlogik (Ignorierte Selektoren)

Für dynamische Inhalte (z. B. Consent-Banner, Werbe-Widgets) kann pro Seite eine
Liste „Ignorierte Selektoren“ gepflegt werden. Diese Selektoren werden vor dem
Vergleich der gescannten HTML-Versionen angewendet:

* Die Selektoren werden vor dem Vergleich aus dem HTML entfernt bzw. durch
  Platzhalter ersetzt.
* Der Filter greift sowohl auf die neu gescannte Seite als auch auf die
  gespeicherte „NEW“-Version, damit der Vergleich stabil bleibt.
* Selektoren unterstützen CSS (Standard) und optional XPath (Prefix `xpath:`).
* Ungültige Selektoren blockieren den Scan nicht und werden still ignoriert.

Standardmäßig werden bei neuen Seiten folgende Elemente entfernt, um
Script-Anteile und typische Werbe-Container zu reduzieren:

* `script`
* `.ads`
* `.ad`
* `.advertisement`
* `.cookie-banner`

## Ignorierte Änderungen (Schwellwerte & Filter)

Update Scanner Plus kann kleine oder dynamische Änderungen gezielt ausblenden.
Folgende Mechanismen wirken vor dem Vergleich der Inhalte:

* **Zahländerungen ignorieren:** Optional werden Zahlen entfernt, damit reine
  Zähler-/Preis-Updates keine Treffer erzeugen.
* **Minimale Änderungen:** Über die Seiteneinstellungen lassen sich minimale
  Änderungen in Zeichen und Wörtern festlegen. Änderungen darunter werden
  ignoriert.
* **Levenshtein-Schwelle:** Eine relative Schwelle (0–1) bewertet die
  Ähnlichkeit der Texte und kann kleine Abweichungen ausblenden.
* **Regex-Filterliste:** Dynamische Textteile (z. B. Zeitstempel) können per
  Regex entfernt werden, etwa `\\d{4}-\\d{2}-\\d{2}` oder
  `\\d{2}:\\d{2}:\\d{2}`.
* **Ignorierte Selektoren / Attribut-Blacklist:** Entfernen dynamische DOM-
  Bereiche oder Attribute vor dem Diff.

## Filterlogik (Regex & Attribut-Blacklist)

Zusätzlich zu Ignorier-Selektoren können pro Seite Regex-Filter und eine
Attribut-Blacklist gepflegt werden:

* Regex-Filter werden vor dem Diff auf den Text angewendet (mehrere Regex pro
  Zeile oder kommasepariert), um z. B. Timestamps auszublenden.
* Optional kann bei Text-Diffs ein JSONPath genutzt werden, um strukturierte
  JSON-Antworten auf relevante Teilbereiche zu reduzieren.
* Die Attribut-Blacklist entfernt definierte Attribute aus dem DOM, bevor HTML-
  oder DOM-Diffs berechnet werden.
* Die Filter greifen sowohl auf die neu gescannte Seite als auch auf die
  gespeicherte „NEW“-Version, damit der Vergleich stabil bleibt.

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

**Tests**
* `npm run test` (Unit-Tests über Karma)
* `npm run test:watch` (Unit-Tests im Watch-Modus)
* `npm run test:func` (funktionale Tests via pytest)

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
