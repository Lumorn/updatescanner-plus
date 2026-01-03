# Schritt 8: CSP und Inline-Skripte (MV3)

## Geprüfte Extension-Pages

* `src/app/popup/popup.html`
* `src/app/sidebar/sidebar.html`
* `src/app/main/main.html`
* `src/app/update/update.html`
* `src/app/restore/restore.html`
* `src/app/debug_info/debug_info.html`
* `src/app/debug/debug.html`
* Hinweis: Es gibt keine `options_ui` im Manifest, nur Popup/Sidebar und Tab-Seiten.

## Änderungen

* Keine Inline-Skripte in den Extension-HTMLs gefunden (nur externe Module).
* Keine Inline-Eventhandler in den HTML-Dateien.
* Event-Handler im FileReader-Helper auf `addEventListener` umgestellt.
* Manifest nutzt weiterhin die sichere Default-CSP von Firefox (kein explizites CSP gesetzt).

## Tests / Validierung

* `npm run lint`
* `npm run dev`
* Smoke Tests:
  * Popup, Sidebar und Tab-Seiten öffnen ohne Fehler.
  * Konsole prüfen: keine CSP-Verletzungen.
  * Kernfunktion (Scan starten / speichern / anzeigen) funktioniert unverändert.

## Typische CSP-Fehler (Beispiele)

* `Refused to execute inline script` → Inline-`<script>` in HTML.
* `Refused to execute inline event handler` → `onclick=...` & Co. in HTML.
* `Refused to evaluate a string as JavaScript` → `eval()` oder `setTimeout("...")`.
