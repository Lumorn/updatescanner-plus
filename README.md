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
