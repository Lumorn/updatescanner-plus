# Update Scanner Changelog

## Unreleased

* Test-Fixtures für statische und dynamische Seiten ergänzt
* Unit-Tests für Normalisierung, Diff-Strategien und Filter ergänzt
* README um Hinweise zur lokalen Testausführung erweitert
* Seiteneinstellungen um Presets für statische und dynamische Seiten ergänzt
* Popup-Settings um Defaults für Fetch-Modus, Selektoren, Diff-Typ und Schwellenwerte erweitert
* Validierung und Fehlertexte für URL, Selektoren, Fetch-Header und Schwellenwerte ergänzt
* Projekt-Konzeptdokument mit Zielen, Nicht-Zielen, Änderungsarten sowie Risiken ergänzt
* HTML-Selektoren unterstützen jetzt CSS und optional XPath (Prefix `xpath:`) für Bereichs- und Text-Diffs
* Standard-Filterregeln entfernt Script-Tags und typische Werbe-Container bei neuen Seiten
* Bereichsauswahl-Overlay ergänzt, Kontextmenü „Bereich auswählen“ speichert den Selektor und Scans nutzen ihn
* Anzeige/Bearbeitung des ausgewählten Bereichs in Hauptansicht und Popup ergänzt
* Einstellungsdialoge laden den globalen Scan-Engine-Modus asynchron ohne Syntaxfehler
* Update-Liste im Popup zeigt Webseiten-Icons nach dem Scan, mit Platzhalter bei fehlendem Icon
* Sidebar zeigt Webseiten-Icons in der Baumansicht, mit Platzhalter bei fehlendem Icon
* Abstände und Zeilenhöhen im Popup-Settings-Menü reduziert, damit mehr Optionen sichtbar sind
* Hauptansicht rendert gespeicherte Seiten wieder korrekt, indem der `<base>`-Tag sauber im `<head>` ergänzt und fehlendes HTML-Grundgerüst aufgebaut wird
* Hauptansicht rendert Vorschau-Seiten wieder in voller Breite und Höhe, damit sie nicht verkleinert wirken
* Hauptansicht streckt den Vorschau-Container dauerhaft über die volle Höhe
* Hauptansicht streckt den Vorschau-Iframe flexibel, damit gescannte Seiten vollständig scrollen
* Hauptansicht injiziert ein Head-Stylesheet in Vorschau-HTML, um Layout-Container ohne Max-Width darzustellen
* Hauptansicht erlaubt Skriptausführung im Sandbox-iframe, damit dynamische Seiten wieder angezeigt werden
* Hauptansicht unterstützt optional Same-Origin im Sandbox-iframe pro Seite, damit Same-Origin-Requests funktionieren
* Hauptansicht meldet Sandbox-Blockaden (Null-Origin/CSP) im Vorschau-Iframe als Hinweis
* Hauptansicht zeigt bei fehlenden Seiten eine sichere Fallback-Ansicht mit Empty-State
* Hauptansicht initialisiert zuverlässiger, damit Menü und Ansicht auch nach spätem Script-Load reagieren
* Hauptansicht zeigt Initialisierungsfehler mit verständlicher Meldung und deaktiviert Menü sowie View-Dropdown
* Öffnung der Hauptansicht fällt bei fehlgeschlagenen Tab-Updates automatisch auf einen neuen Tab zurück
* Globalen Scan-Modus-Umschalter im Settings-Panel ergänzt, um den Alt-Modus global zu setzen
* Konfigurierbare Wartezeit zwischen Legacy-Scans inkl. Einstellungsfeld im Popup ergänzt
* Konfigurierbarer Host-Delay pro Host im Popup ergänzt, inkl. Hinweis auf schnellere Legacy-Scans bei kleineren Werten
* Konfigurierbare Scan-Parallelität ergänzt, inkl. Popup-Einstellung für die Queue
* Scrollbarer Container im Settings-Popup ergänzt, damit der Titel sichtbar bleibt
* Hidden-Tab-Einstellungen im Popup werden im alten Scan-Modus ausgeblendet, damit nur verfügbare Optionen sichtbar sind
* Alter Scan-Modus arbeitet nur HTML-basiert und blendet nicht benötigte Zusatzoptionen aus
* Standard für neue Seiten auf Hidden-Tab-Scan umgestellt und Beschreibungstexte aktualisiert
* Diff-Ausgabe berücksichtigt Highlight-Farbe/Markierungen pro Seite und zeigt bei deaktivierter Hervorhebung die neue Version ohne Highlighting
* Fetch-Scans erkennen sehr kurze/leere Antworten und wechseln automatisch auf einen Hidden-Tab-Snapshot
* Zentrale HTML-Normalisierung ergänzt, die pro Seite definierte „Ignorierte Selektoren“ entfernt/ersetzt
* Neue Filter-Optionen ergänzt: Regex-Liste und Attribut-Blacklist pro Seite inkl. UI-Feldern und Default-Einstellungen
* Text-Normalisierung speichert normalisierte Inhalte in der Scan-Pipeline und unterstützt optional JSONPath für strukturierte Antworten
* Globale Einstellung ergänzt, um neue Seiten standardmäßig im versteckten Tab zu scannen
* Aktion im Popup ergänzt, um den versteckten Tab-Scan für alle vorhandenen Seiten zu aktivieren/deaktivieren
* Option zum Mitsenden von Cookies/Credentials pro Seite beim fetch-Scan ergänzt
* Fetch-Scan um konfigurierbare Cache-/Mode-/Redirect-Policies und benutzerdefinierte Header erweitert
* Fetch-Scan unterstützt POST-Requests mit Body-Serialisierung und UI-Hinweisen bei Fehlern
* Diff-Typ pro Seite ergänzt (Text/HTML) inkl. Standard-Diff über diff-match-patch und optionalem HTML-Diff mit `<ins>/<del>`-Markup
* Diff-Ansicht um Umschalter für Text- vs. HTML-Diff sowie besseres Styling für Einfügungen/Löschungen erweitert
* DOM-Diff-Modus ergänzt, der strukturierte Change-Listen speichert, um Änderungen gezielt hervorzuheben
* DOM-Diff-Detailansicht mit farbigen Change-Listen, Zusammenfassung und Toggle ergänzt
* Optionaler Scan-Modus ergänzt, der die Seite in einem versteckten Tab lädt und einen DOM-Snapshot erfasst
* Scan-Quelle pro Seite als HTTP-Fetch oder Headless-Tab-Snapshot konfigurierbar
* Headless-Scans unterstützen konfigurierbare Wartestrategien (Network-Idle, Selektor bereit, Timeout)
* Hidden-Tab-Scan versteckt Tabs per `tabs.hide`, mit Fallback in minimierte Popup-Fenster
* Manifest um die Permission `tabHide` ergänzt, damit versteckte Tabs genutzt werden können
* Hidden-Tab-Scan wartet optional auf Selektoren, nutzt ein DOM-Stabilitätsfenster und einen Standard-Delay
* Hidden-Tab-Scan wartet nach `document.readyState === 'complete'` kurz nach und kann ein Mutation-Stabilitätsfenster abwarten (konfigurierbar im Popup)
* Page-Dialog um Felder für waitForSelector und Timeout ergänzt
* Hidden-Tab-Scan wartet optional auf Network-Idle/Hydration-Signale, berücksichtigt Fetch/XHR sowie long-lived WebSocket/EventSource-Aktivität und meldet Timeout-Hinweise in der UI
* Globale Einstellung für Network-Idle-Wartezeit bei neuen Seiten sowie Sammelaktion für alle Seiten
* Zusätzliche Default-Werte für Hidden-Tab-Wartezeit, DOM-Stabilität sowie Network-Idle-Fenster/Timeout im Settings-Panel ergänzt
* Hidden-Tab-Snapshot kann über CSS-Selektoren bereinigt werden und optional einen Text-Hash für DOM-Stabilität nutzen
* Hidden-Tab-Scan kann optional eine Scroll-Simulation (Schritte/Delay/Max-Höhe) durchführen und meldet Fehler/Timeouts als UI-Hinweis
* Hidden-Tab-Scan wiederholt fehlgeschlagene Scans einmalig mit längerer Wartezeit und nutzt bei Bedarf Fetch mit UI-Hinweis
* Hidden-Tab-Fehler werden differenziert (Timeout/CSP/Script-Injektion/Tab-Hide) und als UI-Hinweise in Popup und Detailansicht angezeigt
* Hidden-Tab-Snapshot erfasst Shadow DOMs sowie same-origin Iframes und legt bei cross-origin Frames Platzhalter mit URL ab
* Scan-Queue verarbeitet mehrere Scans parallel, mit Host-basiertem Rate-Limit und adaptiven Delays
* Scan-Queue serialisiert Requests pro Host und nutzt einen konfigurierbaren Host-Delay
* Heuristische Änderungsfilter ergänzt: minimale Zeichen-/Wortänderungen und optionale Levenshtein-Schwelle pro Seite
* Versionsanzeige im Popup unter der Buttonreihe ergänzt und Versionierungsregel dokumentiert
* Scan-Queue auf Deque/Index-Logik umgestellt und Duplikate per Seiten-ID verhindert
* NEW-HTML wird nur gespeichert, wenn sich der Inhalt ändert; zusätzlich wird ein Hash abgelegt, um redundante Schreibvorgänge zu vermeiden
* Legacy-Scan nutzt einen Quick-Hash der Roh-HTML-Daten, um bei unveränderten Seiten Normalisierung und Diff zu überspringen
* Typografie-Tokens um zusätzliche Schriftgrößen und Font-Weights erweitert und die Hierarchie in Hauptansicht/Popup geschärft
* Gemeinsame Button- und Menü-Variablen eingeführt, damit Popup und Hauptansicht identische Hover-/Active-/Focus-Zustände nutzen
* Dark-Mode-Overrides in ein gemeinsames Theme-Token-Set ausgelagert
* Popup-Footer-Knöpfe für Neu/Sidebar/Menü auf gleiche Breite gebracht
* Popup-Menü reagiert wieder zuverlässig auf den Menüknopf und Außenklicks
* Popup-Menü wird wieder direkt über dem Menüknopf eingeblendet und nicht verdeckt
* Popup-Scan-Leiste bleibt stabil sichtbar, auch wenn die Liste länger wird
* Popup-Scan-Status passt sich dynamisch an die verfügbare Breite an, damit die Buttons nicht verrutschen
* Popup-Footer-Buttons und Versionsanzeige bleiben stabil, auch wenn die Liste sehr lang ist
* Abbrechen-Button im Popup ergänzt, um laufende Scans zu stoppen
* Buttons und Menüs in Popup und Hauptansicht modernisiert (Radius, Schatten, Fokuszustände, konsistente Abstände, Mindestklickfläche)
* Popup-Settings in klare Gruppen gegliedert, mit konsistenten Abständen, Label-Ausrichtung und Button-Hierarchie
* Dark-Mode-Tokens für Popup, Hauptansicht und Sidebar ergänzt (Farben, Rahmen, Schatten)
* Zentrales Theme-Token-Set für Farben, Abstände und Typografie eingeführt und UI-CSS auf Variablen umgestellt
* Mehrsprachigkeit auf das gesamte Add-on ausgeweitet und Übersetzungen modular erweiterbar gemacht
* Popup-Menü um Einstellungen für die Sprachwahl erweitert (Englisch/Deutsch)
* Zeichencodierung-Handling beim Scannen gehärtet (UTF-8-Fallback bei fehlender Kodierung)
* Fehlende Sidebar-Abhängigkeiten unter `src/dependencies` ergänzt, damit jQuery, JSTree, Dialog-Polyfill und idb-file-storage beim Laden verfügbar sind
* Dev- und Build-Skripte kopieren vor dem Start die Abhängigkeiten, damit Sidebar und Storage-Module geladen werden
* Manifest-Version auf numerisches Format korrigiert, eigene Gecko-ID gesetzt und `background.persistent` entfernt
* Add-on-Name im Manifest auf „Update Scanner Plus (Fork)“ angepasst
* AMO-Publishing-Dokumentation mit Submission-Guide, Review-Notes-Vorlage und Release-Checklist ergänzt
* SECURITY.md und PRIVACY.md ergänzt sowie Publishing-Links im README hinzugefügt
* Dev-/Build-Tooling mit zentraler web-ext-Config und Quickstart dokumentiert
* Lockfile-Konsistenz für npm ci wiederhergestellt
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
* Hintergrund-Toolbar nutzt Action-API ohne Fallback für Icon/Badge
* Hintergrund-Event-Page aktiviert (background.scripts statt background.page)
* Modernisierungsdoku für Schritt 4 ergänzt (Event Page)
* Lint-Workflow nutzt temporäres MV2-Manifest wegen web-ext-4.x-Limitierung
* DOM-Abhängigkeiten im Background reduziert (globalThis/Utility)
* DOMParser-Zugriff gekapselt, damit Event Page robust bleibt
* Modernisierungsdoku für Schritt 5 ergänzt (DOM-Abhängigkeiten)
* Background-Instanz über env-Utility global verfügbar gemacht
* Action-API vollständig auf `browser.action` umgestellt
* Modernisierungsdoku für Schritt 6 ergänzt (Action-API-Refactor)
* Schritt-6-Doku präzisiert (keine Action-Aufrufe in UI-Skripten gefunden)
* Event-Listener im Background werden nun synchron registriert und nutzen eine idempotente Initialisierung
* Autoscanner-Alarm wird nur angelegt, wenn er fehlt (kein Rescheduling bei jedem Wake)
* Modernisierungsdoku für Schritt 7 ergänzt (MV3-Lifecycle)
* Queue-State-Antwort im Background nutzt nun den Message-Return-Pfad
* FileReader-Eventhandler nutzt jetzt `addEventListener` (CSP-konforme Patterns)
* Modernisierungsdoku für Schritt 8 ergänzt (CSP/Inline-Skripte)
* README-Checklist für Schritt 8 aktualisiert
* CSP-Doku präzisiert (keine Optionsseite vorhanden)
* Modernisierungsdoku für Schritt 9 ergänzt (scripting API, nicht zutreffend)
* Modernisierungsdoku für Schritt 10 ergänzt (web_accessible_resources, nicht erforderlich)
* README-Checklist für Schritt 10 aktualisiert
* Storage/IndexedDB-Initialisierung mit Promise-Guard und Write-Queue gehärtet
* Debug-Logs für Init/Settings/Scan-Ergebnisse ergänzt
* Modernisierungsdoku für Schritt 11 ergänzt (Storage/IndexedDB)
* Host-Permissions bereinigt (redundante Einträge entfernt)
* Modernisierungsdoku für Schritt 12 ergänzt (Permission-Audit)
* MV3-kompatible URL-Ermittlung für die Hauptansicht (runtime.getURL) korrigiert
* UI-Nachrichten im Background tolerieren fehlende Empfänger, um MV3-Fehler zu vermeiden
* Restore-Dialog nutzt runtime.getURL, damit das Öffnen in MV3-Umgebungen funktioniert
* Debug-Info- und Update-Seiten öffnen MV3-kompatibel per runtime.getURL

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
