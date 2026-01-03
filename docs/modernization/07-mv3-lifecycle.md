# Schritt 7 – Event-Registrierung robust machen (MV3-Lebenszyklus)

## Was bedeutet die non-persistente Event Page für uns?

In MV3 kann der Background jederzeit schlafen gehen und bei Events neu starten.
Daher müssen Listener sofort registriert werden und die Initialisierung
idempotent sein. Logik darf nicht davon abhängen, dass der Background dauerhaft
läuft.

## Grundregeln

- Listener synchron beim Start registrieren (kein async davor).
- Handler rufen immer `ensureInitialized()` auf.
- Alarme nur anlegen, wenn sie fehlen (kein blindes Rescheduling bei jedem Wake).
- UI kommuniziert über Messaging, Background stellt eine stabile API an
  `globalThis.updateScanner` bereit.

## Relevante Listener (Fundstellen)

- `browser.runtime.onMessage` → `src/lib/background/background.js:63`
- `browser.alarms.onAlarm` → `src/lib/background/background.js:64`
- `browser.runtime.onInstalled` → `src/lib/background/background.js:65`
- `browser.runtime.onStartup` → `src/lib/background/background.js:66`
- `browser.runtime.onMessage` (Popup) → `src/lib/popup/popup.js:44`
- `browser.notifications.onClicked` → `src/lib/scan/notification.js:34-35`
- `browser.storage.onChanged` → `src/lib/util/storage.js:55`
- `Storage.addListener` (PageStore) → `src/lib/page/page_store.js:363`
- `Storage.addListener` (StorageInfo) → `src/lib/page/storage_info.js:145`

## Debugging / Symptome

- Hintergrund inspizieren: `about:debugging` → Erweiterung → „Inspect“.
- Typische Symptome: verlorene Alarme, fehlende Queue-Updates, Popup zeigt
  keine Zustände nach dem Wake.
- Bei Problemen zuerst prüfen, ob Listener registriert sind und
  `ensureInitialized()` erfolgreich durchläuft.
