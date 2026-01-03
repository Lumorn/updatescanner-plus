# Schritt 11 – Storage/IndexedDB verifizieren und stabilisieren

## Bestandsaufnahme (Storage-Fundstellen)

### A) Einstellungen (Intervall, UI-Optionen, Debug)
- `src/lib/util/config.js` (Config laden/speichern, Zeilen 38–64).
- `src/lib/util/storage.js` (Zugriff auf `browser.storage.local`, Zeilen 20–55).
- `src/app/debug/debug_script.js` (Debug-Reads/Writes, Zeilen 23–129).

### B) Datenbestand (URLs, Ordner, Metadaten)
- `src/lib/page/storage_info.js` (IDs/Struktur, Zeilen 72–92, 103–138).
- `src/lib/page/page.js` (URL/Metadaten/Scan-Flags via `Storage.*`, Zeilen 243–294).
- `src/lib/page/page_folder.js` (Ordner/Children via `Storage.*`, Zeilen 114–148).
- `src/lib/util/storage.js` (Zugriff auf `browser.storage.local`, Zeilen 20–55).

### C) Scan-Resultate (Hashes/HTML, Zeitstempel, Diff-Basis)
- `src/lib/page/page.js` (Scan-Zeiten/State im Page-Objekt, Zeilen 243–282).
- `src/lib/page/page_store.js` (HTML-Blob-Speicherung, Zeilen 469–516).
- `src/lib/util/storage_db.js` (IndexedDB `put/get/remove`, Zeilen 16–93).

### D) Laufzeitstatus (Queue/Scan läuft)
- `src/lib/scan/scan_queue.js` (Queue-Status nur RAM, Zeilen 47–138).
- `src/lib/background/background.js` (Scan-State-Weitergabe, Zeilen 276–300).

### Sonstige Speicher
- Kein `localStorage`/`sessionStorage` im Repo.
- Kein JSON-Datei-Store für Runtime-Daten.

## Was muss persistent sein?

**Muss persistent (funktional notwendig):**
- URL-Liste, Ordner/Gruppen, Metadaten (Titel, URL, Scan-Settings) → `storage.local`.
- Scan-Zustand pro Seite (Status, Zeitstempel) → `storage.local`.
- HTML-Hashes/HTML-Diff-Basis (OLD/NEW HTML) → IndexedDB.
- Settings/Config (Debug/First-Run/Update-Version) → `storage.local`.

**Darf flüchtig sein (wird nach Wake neu aufgebaut):**
- Laufzeit-Queue und Scan-Status (`ScanQueue`, `_isScanning`, Queue-Länge).
- UI-Temporärzustand in Popup/Sidebar.

## Init-Flow (Event Page)

- `Background.ensureInitialized()` bleibt der zentrale Einstieg für den MV3-Background.
- `StorageDB.ensureInitialized()` öffnet IndexedDB einmalig (Promise-Guard) pro Wake.
- `PageStore.load()` ruft die DB-Initialisierung vor dem Laden der Struktur.

## Schreibstrategie (Eager Commit + Write-Queue)

- Jeder relevante Write wird sofort persistiert (keine Abhängigkeit von `onSuspend`).
- Serialisierte Writes via Promise-Queue:
  - `Storage._queueWrite()` für `storage.local`.
  - `StorageDB._queueWrite()` für IndexedDB.

## Quota-Handling

- `storage.local` und IndexedDB loggen `QuotaExceededError` mit Kontext.
- Keine UI-Änderungen, nur `console.error`.
- Manifest enthält bereits `unlimitedStorage` und bleibt aktiv.

## Migration (localStorage)

- Keine Nutzung von `localStorage`/`sessionStorage` gefunden → keine Migration nötig.

## Debug/Logs

- Beim Init: Log der geladenen URL-/Ordner-Zahlen.
- Beim Settings-Save: Log „Einstellungen gespeichert“.
- Beim Scan-Result: Log mit gespeicherter URL.

## Testplan

- `npm run lint`
- `npm run dev`
- Manuelle Tests:
  1. Add-on starten, 2–3 URLs hinzufügen, Settings ändern.
  2. Scan auslösen und Ergebnis erzeugen.
  3. Browser schließen und neu öffnen.
  4. Prüfen: URLs, Ordner/Settings, letzte Scan-Infos/Hashes.
  5. Erweiterung neu laden → Popup öffnen/Scan starten → keine Init-Fehler.
  6. Optional: viele URLs → Quota-Fehler werden geloggt, kein Crash.
