# Schritt 9: Migration auf scripting API (MV3)

## Status

**Nicht zutreffend.** In der aktuellen Codebasis gibt es keine Script- oder CSS-Injektion
über die Tabs-API.

## Fundstellen-Suche (Schritt 9.1)

Gesucht wurde nach:
- `tabs.executeScript`
- `chrome.tabs.executeScript`
- `tabs.insertCSS`
- `tabs.removeCSS`
- `executeScript({code:`
- `insertCSS({code:`

Treffer (nur Dokumentation, keine Injektion im Code):
- `README.md:146` (Checklisten-Eintrag für Schritt 9)
- `docs/modernization/09-scripting-api.md:11-16,28` (diese Dokumentation)

## Manifest/Permissions (Schritt 9.2)

Geprüft: `src/manifest.json`. Da keine Injektion verwendet wird, ist keine
`scripting`-Permission erforderlich. `host_permissions` bleiben unverändert.

## Hinweise zur MV3-scripting-API

- Für MV3 wäre `browser.scripting.executeScript()` der Ersatz für
  `tabs.executeScript()`.
- Spezialseiten (z. B. Reader View, `view-source:`, PDF-Viewer) erlauben keine
  Injektion und müssen bei Bedarf abgefangen werden.

## Testablauf (kurz)

1. `npm run lint`
2. `npm run dev`
3. Smoke-Test: Add-on lädt ohne Fehler, Popup/Sidebar funktionieren.
4. Repo-Suche bestätigt: keine Nutzung von Tabs-Injektion im Quellcode.
