# Permission-Audit (Schritt 12)

## Ziel
Minimalprinzip für MV3-Permissions umsetzen, ohne Funktionsverlust. Ergebnis ist ein review-freundliches Manifest mit belegbarer Nutzung pro Permission.

## Baseline (Manifest)
**Geladenes Manifest:** `src/manifest.json`

| Feld | Wert |
| --- | --- |
| `permissions` | `alarms`, `notifications`, `storage`, `tabs`, `unlimitedStorage` |
| `host_permissions` | `<all_urls>` |
| `optional_permissions` | _keine_ |
| `optional_host_permissions` | _keine_ |
| `content_scripts` | _keine_ (kein automatischer Host-Zugriff über `matches`) |

## Permission → warum nötig → Code-Stellen

| Permission | Kategorie | Begründung | Code-Referenz |
| --- | --- | --- | --- |
| `alarms` | API | Zeitgesteuerte Auto-Scans nutzen Alarme für regelmäßige Läufe. | `src/lib/scan/autoscan.js` (L68–88, `startAlarm`/`ensureAutoscanAlarmScheduled`) |
| `notifications` | API | Systembenachrichtigungen bei gefundenen Updates. | `src/lib/scan/notification.js` (L27–36, `showNotification`) |
| `storage` | API | Persistenz für Seitenlisten, Einstellungen und Zustände. | `src/lib/util/storage.js` (L20–55, `Storage.save/load/remove`) |
| `tabs` | API | Tabs erstellen/aktualisieren und aktive Tab-Infos für neue Einträge lesen. | `src/lib/popup/popup.js` (L65–71, `_handleNewClick`), `src/lib/main/main_url.js` (L38–44, `openMain`) |
| `unlimitedStorage` | API | Speicherung umfangreicher HTML-Snapshots der gescannten Seiten ohne Quota-Engpass. | `src/lib/page/page_store.js` (L469–495, `saveHtml/loadHtml`) |
| `host_permissions:<all_urls>` | Host | Scans laden beliebige URLs per Fetch; Einschränkungen würden Funktionsumfang reduzieren. | `src/lib/scan/scan.js` (L69, `fetch(page.url)`) |

## Entfernte Permissions

* `host_permissions`: `*://twitter.com/*`, `*://www.facebook.com/*` entfernt, da durch `<all_urls>` funktional redundant.

## Hinweis zu Firefox MV3 Host-Zugriff
Firefox erlaubt Nutzern, den Host-Zugriff pro Website oder global in `about:addons` zu steuern. Bei Tests sicherstellen, dass der Site Access nicht blockiert ist.
