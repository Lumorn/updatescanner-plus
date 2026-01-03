# AMO-Submission Guide (Schritt-für-Schritt)

Dieses Dokument beschreibt den konkreten Ablauf für eine Einreichung bei
addons.mozilla.org (AMO). Es ist bewusst praxisnah gehalten.

## 1) Voraussetzungen

* AMO Developer Account vorhanden.
* Lokaler Build (Schritt 13):
  1. `npm ci`
  2. `npm run lint:addon`
  3. `npm run build:zip`

## 2) Was hochgeladen wird

* Das Build-Artefakt liegt unter `dist/`.
* Upload-Datei: `dist/*.zip` (von `web-ext build` erzeugt).

## 3) AMO-Form-Felder (typische Angaben)

* **Name**: „Update Scanner Plus“ (oder konsistent zum Manifest).
* **Summary**: 1 Satz, z. B. „Überwacht Webseiten und meldet Änderungen.“
* **Description** (kurz): 2–4 Sätze, Fokus auf Kernfunktion und UI.
* **Kategorie**: z. B. „Produktivität“ oder „Tools“.
* **Support-/Website-Links**:
  * GitHub Repo: <https://github.com/Lumorn/updatescanner-plus>

## 4) Infos, die Reviewer brauchen

### Funktionsweise (1 Absatz)
Die Erweiterung speichert eine Liste von Webseiten, lädt deren Inhalte in
regelmäßigen Abständen, vergleicht neue mit vorherigen Versionen und zeigt
Änderungen im Popup und in der Sidebar an. Benutzer können Scans manuell
starten, Intervalle festlegen und optional CSS-Selektoren nutzen, um nur
bestimmte Bereiche zu überwachen.

### Externe Netzwerkzugriffe
* **Ziele**: Benutzerdefinierte Webseiten-URLs (vom Nutzer hinzugefügt).
* **Zweck**: Inhalte abrufen, um Änderungen zu erkennen.
* **Datenumfang**: HTTP-Requests an die Zielseite; keine zusätzliche Telemetrie.

### Permissions (mit Begründung)
* `alarms`: Periodische Autoscan-Intervalle.
* `notifications`: Meldung, wenn Änderungen gefunden wurden.
* `storage`: Speicherung von Einstellungen, URLs und Scan-Ergebnissen.
* `tabs`: Öffnen von Seiten/Debug-Ansichten in Tabs aus der UI.
* `unlimitedStorage`: Speicherung größerer HTML-Snapshots für den Verlauf.

## 5) No Remote Code (Pflicht-Statement)
Alle Skripte sind im Add-on gebündelt. Es werden **keine** Remote-Skripte
nachgeladen, und es gibt kein `eval()`/`new Function()`.

## 6) Host Permissions / Site Access (Firefox MV3)
* `host_permissions` verwendet aktuell `<all_urls>`, weil Nutzer beliebige
  Webseiten überwachen können.
* Hinweis: In Firefox kann der Host-Zugriff in `about:addons` eingeschränkt
  werden. Bei Bugreports prüfen, ob Site Access limitiert wurde.

## Bekannte Risiken / Checks

* **Externe Skripte**: Keine `<script src="https://...">` in Extension-Pages.
* **Remote Code**: Kein `eval()`/`new Function()` gefunden.
* **Secrets/Keys**: Keine API-Keys oder Tokens im Repo entdeckt.
* **Binärdateien**: Keine unnötigen großen Binärdateien vorhanden.

(Prüfung per Repository-Suche vor dem Release.)
