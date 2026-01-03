# Schritt 10 – web_accessible_resources (MV3)

## Ergebnis

* `web_accessible_resources` wird **nicht benötigt** und ist im Manifest nicht vorhanden.
* Keine Ressourcen werden von Webseiten-Kontexten geladen.
* Alle genutzten Assets (Icons, SVGs, CSS-Hintergründe) werden nur in Extension-Pages
  (Popup, Sidebar, Tab-Seiten) verwendet.

## Begründung

* Es gibt keine Content-Skripte oder Skript-/CSS-Injektion in Webseiten.
* Es werden keine `moz-extension://`-URLs fest im Code verwendet.
* Ressourcen werden ausschließlich von Extension-UI geladen.

## MV3-/Firefox-Hinweis

* Firefox unterstützt **kein** `use_dynamic_url`.
* Bei künftigem Bedarf müssen Ressourcen explizit in MV3-Objektform angegeben werden.

## Testanleitung (Smoke)

1. `npm run lint`
2. `npm run dev`
3. Add-on lädt ohne Manifest-Warnungen.
4. Popup/Sidebar/Tab-Seiten laden Icons und CSS ohne Fehler.
