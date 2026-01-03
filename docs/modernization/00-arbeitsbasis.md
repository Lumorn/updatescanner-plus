# Schritt 0: Arbeitsbasis und Sicherheitsnetz

## Ziel dieses Schrittes

Eine saubere, reproduzierbare Arbeitsbasis schaffen: klarer Dev-Workflow, minimale CI-Prüfung, dokumentierte Smoke Tests. Keine funktionalen Änderungen am Add-on und keine MV3-Migration in diesem Schritt.

## Aktuelle Baseline (heutiger Stand)

* Manifest ist **MV2** (`manifest_version: 2`).
* Hintergrundseite läuft über **`background.page`** (HTML).
* Toolbar nutzt **`browser_action`** mit Popup.
* **`permissions`** enthält umfangreiche Rechte inkl. **`<all_urls>`**.
* **`sidebar_action`** ist aktiv.
* **`commands`** sind definiert (u. a. für Sidebar).
* UI besteht aus Popup und Sidebar, kein MV3-Service-Worker.

## Lokales Setup

Voraussetzungen:

* Node.js (LTS)
* npm
* Firefox (Developer Edition empfohlen, aber nicht Pflicht)

## Dev-Run

Empfehlung: `web-ext run` mit sauberem Profil, damit lokale Tests reproduzierbar bleiben.

Beispiel:

```bash
npx web-ext run -s src --firefox-profile /tmp/updatescanner-plus-profile
```

Weitere Details:

* web-ext Getting started: <https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/>
* web-ext command reference: <https://extensionworkshop.com/documentation/develop/web-ext-command-reference/>

## Debugging

Zentrale Stelle ist `about:debugging` (Add-ons/Worker debuggen). Das bleibt später für MV3 wichtig.

* <https://firefox-source-docs.mozilla.org/devtools-user/about_colon_debugging/index.html>

## Smoke Tests (nach jedem Schritt)

1. Add-on lässt sich als temporäres Add-on laden (ohne Fehler in der Browser-Konsole).
2. Popup öffnet sich.
3. Sidebar lässt sich öffnen (Shortcut oder UI).
4. Eine URL kann hinzugefügt werden und erscheint in der Liste.
5. Manuelles Scannen startet und endet ohne Fehler.
6. Badge/Icon aktualisiert sich plausibel (z. B. Scan aktiv / Änderungen).
7. Einstellungen lassen sich speichern und nach Neustart wieder laden.
8. Benachrichtigungen erscheinen (falls im aktuellen Funktionsumfang aktivierbar).

## Ausblick (MV3 später)

MV3-Migration Guide (später relevant):

* <https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/>
