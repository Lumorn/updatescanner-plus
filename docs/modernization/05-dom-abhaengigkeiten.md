# Schritt 5 – DOM-Abhängigkeiten reduzieren (Background/Event Page)

Firefox MV3 nutzt Event Pages (DOM-basiert), startet sie aber nicht persistent neu.
Damit Initialisierung robust bleibt, reduzieren wir direkte Abhängigkeiten auf
`window`/`document` im Background und kapseln DOM-Parsing.

## Kategorien der Anpassungen

* Hintergrund-Timer und globale Referenzen laufen über `globalThis`/Utility.
* Action-API wird über Utility-Funktion geholt (action/browserAction).
* DOMParser-Zugriff ist in eine Utility gekapselt und kann fehlende DOM-Umgebung
  erkennen.

## Wichtige Fundstellen (vorher/nachher)

* `src/lib/background/background.js:189` – `window.setTimeout` -> `g.setTimeout`.
* `src/lib/util/promise.js:9` – `window.setTimeout` -> `g.setTimeout`.
* `src/lib/scan/selector_matcher.js:18` – `DOMParser` -> `parseHTML()`.
* `src/app/background/eventpage.js:4-6` – Background-Instanz an `globalThis`.
* `src/lib/popup/popup.js:72+` – `window.close` (UI bleibt bewusst DOM-basiert).
* `src/lib/main/main.js:49+` – `window.location`/`document.location` (UI).
* `src/lib/util/view_helpers.js:34+` – `document.querySelector` (UI).
* `src/lib/popup/popup_view.js:138+` – `document.createElement` (UI).

## Hinweis zu Firefox MV3

Event Pages sind DOM-basiert, aber nicht persistent. Daher muss der Background
bei Neustart wieder stabil initialisieren; DOM-Abhängigkeiten bleiben dort nur
wo nötig (z.B. DOMParser in Firefox).
