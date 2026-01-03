# Release-Checklist (AMO)

- [ ] Version bump in `src/manifest.json` (und ggf. `package.json`)
- [ ] `npm ci`
- [ ] `npm run lint:addon`
- [ ] `npm run build:zip`
- [ ] Manuelle Smoke Tests (Popup, Sidebar, Scan, Autoscan)
- [ ] Permissions unverändert bzw. auditiert
- [ ] CSP ok (keine Inline-Skripte)
- [ ] Review Notes ausgefüllt (Template kopiert + angepasst)
- [ ] `dist/` Artefakt vorhanden (`dist/*.zip`)
- [ ] Optional: Git Tag `vX.Y.Z`
