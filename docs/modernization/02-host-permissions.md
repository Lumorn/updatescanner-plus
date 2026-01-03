# Schritt 2: Host-Permissions trennen

In diesem Schritt wurden Host-/Origin-Patterns aus `permissions` entfernt und nach
`host_permissions` verschoben. So bleiben in `permissions` nur noch API-Rechte.
Es gibt keine `optional_permissions` mit Host-Patterns, daher ist derzeit kein
`optional_host_permissions` nötig.

Warum: In Manifest V3 müssen Host-Permissions separat angegeben werden, damit der
Browser sie als Host-Zugriff behandelt und korrekt im Installationsdialog anzeigt.

Testhinweise (Host access prüfen):
1) Add-on in about:addons öffnen.
2) Update Scanner auswählen → Berechtigungen/Host-Zugriff prüfen.
3) Eine beliebige URL hinzufügen und einen Scan auslösen.
4) Im Browser-Konsole prüfen, ob Requests ohne Permission/CORS-Fehler laufen.

Bekannte Beobachtung: `npm run dev` scheitert in der Umgebung ohne installiertes
Firefox-Binary (`Error: not found: firefox`).
Bekannte Beobachtung: `npm run lint` meldet `JSON_INVALID` für `manifest_version`,
weil die genutzte `web-ext`-Version nur MV2 validiert.
