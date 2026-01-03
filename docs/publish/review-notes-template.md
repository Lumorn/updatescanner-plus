# AMO Review Notes – Vorlage

> Vorlage für die AMO-Einreichung. Bitte pro Release ausfüllen.

## Build-Anleitung

1. `npm ci`
2. `npm run lint:addon`
3. `npm run build:zip` (Artefakt: `dist/*.zip`)

## Architektur (Kurzbeschreibung)

* **Background**: [kurz beschreiben, z. B. Scan-Logik, Alarme, Notifications]
* **UI (Popup/Sidebar)**: [kurz beschreiben, z. B. Liste, Steuerung, Status]
* **Storage**: [z. B. IndexedDB/Storage für URLs, Ergebnisse, Einstellungen]

## Externe Requests (falls vorhanden)

* `<domain oder Muster>` → Zweck → Datenumfang
  * Beispiel: `https://example.com/*` → Scan der Zielseite → Seiteninhalt

## Permissions

* `permission` → warum nötig → wo im Code
  * Beispiel: `tabs` → Öffnen von Seiten aus UI → `src/lib/main/main_url.js`

## Host Permissions

* `<all_urls>` oder Domainliste → warum notwendig für Kernfunktion

## Datenschutz

* Sammeln wir personenbezogene Daten? (ja/nein)
* Telemetrie/Tracking? (ja/nein)

## Remote Code

* Statement: Kein Remote Code, keine `eval()`, keine externen Skripte.
