# Projekt-Konzept

## Ziele

* Unterstützung von Seiten-Typen: statische Seiten, dynamische Seiten und Single-Page-Applications (SPA).
* Änderungen zuverlässig erkennen und nachvollziehbar darstellen (Text, DOM-Struktur, visuelle Differenzen).
* Konfigurierbare Filter, um dynamische oder irrelevante Inhalte auszublenden.

## Nicht-Ziele

* Kein Echtzeit-Monitoring oder Live-Tracking im Sekundenbereich.
* Kein Ersatz für Performance- oder Uptime-Monitoring.
* Keine Analyse von serverseitigen Logdaten oder Backend-Änderungen ohne sichtbare Auswirkung im gerenderten Inhalt.

## Relevante Änderungsarten

* Text-Diff: Änderungen im extrahierten oder bereinigten Textinhalt.
* DOM-Struktur: Strukturänderungen im Dokumentbaum (z. B. neue/entfernte Elemente).
* Visuell: gerenderte Unterschiede, die per Snapshot erkennbar sind (Headless-Browser).

## Ausgeschlossene Änderungsarten

* Reine Zustandsänderungen ohne persistente DOM-Änderung (z. B. Cursor, Scrollposition, Hover).
* Personalisierte Inhalte, die nur durch eingeloggte Sitzungen oder A/B-Tests entstehen.
* Änderungen, die ausschließlich in Response-Headern oder serverseitigen Logs stattfinden.

## Risiken & Abhängigkeiten

* Headless-Browser-Scans erhöhen Ressourcenbedarf und Laufzeit, insbesondere bei vielen Seiten.
* CSP/Script-Injektion kann das Rendern oder DOM-Snapshots blockieren.
* Rate-Limits oder Bot-Schutzmaßnahmen können Scans verlangsamen oder verhindern.
* Storage-Wachstum bei häufigen Änderungen erfordert regelmäßige Wartung (z. B. Cleanup).
