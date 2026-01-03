# Schritt 3 – Toolbar: browser_action → action

In diesem Schritt wird die Toolbar-Schaltfläche auf den MV3-`action`-Block
umgestellt. Der bisherige `browser_action`-Block ist durch `action` ersetzt
worden, inklusive `default_icon`, `default_title` und `default_popup`.
Eventuelle `browser_style`-Angaben werden entfernt, da Firefox MV3 diese
Option nicht mehr unterstützt. Ein vorhandenes Command
`_execute_browser_action` wird auf `_execute_action` migriert (falls im
Manifest vorhanden).

Für den Übergang wurde im Background ein minimales Fallback ergänzt.
Dieser Schritt wird in der API-Refactor-Phase (Schritt 6) vollständig
entfernt, sodass nur noch `browser.action` genutzt wird.

Smoke Test: Add-on laden, Toolbar-Icon sichtbar, Popup öffnet,
Badge/Icon aktualisieren ohne Fehler im Background.
