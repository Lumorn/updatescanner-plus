# Schritt 6 – API-Refactor: browserAction → action

In diesem Schritt wurde die Toolbar-API vollständig auf `browser.action`
umgestellt. Alle bisherigen Verweise auf `browser.browserAction` wurden
entfernt, sodass nur noch die MV3-Action-API genutzt wird.

Betroffene Bereiche:
* Background-Logik (Icon, Badge, Title/Popup-Verhalten).
* Keine Action-Aufrufe in Popup/Sidebar/Options gefunden.

Hinweis: Es wird bewusst keine MV2-Kompatibilität mehr gepflegt.
Der Code nutzt ausschließlich die MV3-Action-API.

Kurz-Testablauf:
1. Add-on lädt ohne Fehler in der Browser-Konsole.
2. Toolbar-Icon ist sichtbar.
3. Popup öffnet per Klick.
4. Scan starten und Badge/Icon aktualisieren sich plausibel.
5. Scan-Ende zeigt korrekten Status (z.B. Anzahl Änderungen).
6. Keine TypeError wegen fehlender `browser.action`-API.
