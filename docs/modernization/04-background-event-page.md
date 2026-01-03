# Schritt 4: Background-Event-Page (MV3)

Firefox unterstützt in Manifest V3 keinen `background.service_worker`. Stattdessen
läuft der Hintergrund als Event Page über `background.scripts`, die bei Bedarf
aufwacht und sich wieder schlafen legt.

## Änderungen

- Manifest: `background.page` entfernt und durch `background.scripts` ersetzt.
- `persistent: false` explizit gesetzt (Event-Page-Standard in MV3).
- Entry-Skript als Modul registriert, damit Imports wie gehabt funktionieren.

## Debugging-Hinweise

- Event Pages können schlafen und bei Bedarf neu starten.
- Logs und Hintergrundzustand findest du in `about:debugging` → Erweiterung →
  „Inspect“ beim Background.
- Bei fehlenden Logs die Erweiterung neu laden und auf Wake-up-Events achten.
