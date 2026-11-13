# Cloudflare: Codex Diorama veröffentlichen

Das Projekt ist für **Cloudflare Workers mit Static Assets** vorbereitet. Alle vier Dioramen laufen im Browser. Es werden weder ein Backend noch eine Datenbank, R2 oder zusätzliche API-Schlüssel benötigt.

## Einmalige Einrichtung im Cloudflare-Dashboard

1. Unter **Workers & Pages** ein Projekt über **GitHub / Repository importieren** anlegen.
2. Cloudflare Zugriff auf **sisekipp/Codex-Diorama** geben. Es genügt die Freigabe dieses einzelnen Repositorys.
3. Diese Werte eintragen:

| Einstellung | Wert |
|---|---|
| Worker-/Projektname | `codex-diorama` |
| Repository | `sisekipp/Codex-Diorama` |
| Produktionsbranch | `main` |
| Root directory / Projektverzeichnis | `neon-district` |
| Build command | `npm run build:cloudflare` |
| Deploy command | `npm run deploy:cloudflare` |

Cloudflare installiert die Abhängigkeiten anhand von `package-lock.json`. Die Node-Version steht in `.node-version`. Der Build erzeugt `dist/`; `wrangler.jsonc` weist Cloudflare an, ausschließlich diese fertigen Dateien auszuliefern. Ein zusätzliches Output-directory-Feld ist bei diesem Workers-Ablauf nicht erforderlich. Der Worker-Name im Dashboard muss zum Namen in der Konfiguration passen.

Der Build prüft auch, ob Startseite, PWA, Header-Regeln, Flugzeug und Modelldecoder vorhanden sind und die Grenzen für einzelne Dateien und Dateianzahl eingehalten werden. Wrangler ist als feste Entwicklungsabhängigkeit hinterlegt. Keine Zugangsdaten ins Repository schreiben; Cloudflare erstellt die Berechtigung für seinen Git-Build im Dashboard.

4. Das erste Deployment starten und die im Dashboard angezeigte **workers.dev-Adresse** öffnen. Der genaue Hostname enthält auch das eigene Cloudflare-Konto und wird nicht im Projekt vorgegeben.
5. Unter den Domain-Einstellungen des Workers kann anschließend eine eigene Domain hinzugefügt werden.

Danach veröffentlicht Cloudflare Änderungen auf `main` automatisch. Für Änderungen zunächst einen separaten Branch und die von Cloudflare angebotene Vorschau verwenden; Vorschau-Deployments im Dashboard aktivieren. Eine manuelle GitHub-Actions-Pipeline wird für diesen Ablauf nicht gebraucht.

Offizielle Anleitung: [Workers Builds und GitHub](https://developers.cloudflare.com/workers/ci-cd/builds/), [Build-Einstellungen](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

## Vor dem ersten Deployment lokal prüfen

Aus dem Ordner `neon-district`:

```sh
npm ci
npm test
npm run check:cloudflare
```

`check:cloudflare` erstellt den Build und lässt Wrangler einen **lokalen Probelauf ohne Upload** ausführen. Es ist kein Cloudflare-Login erforderlich.

Die tatsächlichen Cloudflare-Header und die statische Auslieferung lokal prüfen:

```sh
npm run preview:cloudflare
```

Diese Vorschau verwendet den bereits erzeugten Build. Sie ergänzt die normale Vite-Vorschau um Cloudflares eigene lokale Laufzeit und Header-Regeln. Für einen späteren manuellen Upload wären `npx wrangler login`, `npm run build:cloudflare` und `npm run deploy:cloudflare` erforderlich; für die GitHub-Anbindung ist das nicht nötig.

## PWA und Updates

- Dateien unter `/assets/` haben Inhalts-Hashes und werden langfristig im Browser gespeichert.
- HTML, unversionierte Modelle, Materialdateien, Icons und Decoder werden vor Wiederverwendung auf Änderungen geprüft. Ihre unveränderten Dateinamen erhalten **kein** `immutable`.
- `sw.js`, das Manifest und gegebenenfalls ältere Registrierungsdateien erhalten `no-cache`.
- Die Regeln stehen in `public/_headers` und werden beim Build nach `dist/_headers` kopiert. Beim Überschreiben der allgemeinen Cache-Regel wird der vorherige Header ausdrücklich entfernt, damit keine widersprüchlichen Werte entstehen.
- Der Offline-Cache bleibt versioniert. Sobald eine vollständig geladene neue Version wartet, erscheint **„Neue Version verfügbar“** mit **„Aktualisieren“** und **„Später“**. Der Wechsel erfolgt bewusst, da die aktuelle Szene dabei neu startet. Bei Rückkehr in den Tab und nach Wiederherstellung der Verbindung wird erneut auf Updates geprüft.

Keine zusätzliche Cloudflare-Regel mit einer langen Browser-Cachezeit für die gesamte Website einrichten. Die Aktualisierung der PWA wird durch den Service Worker verwaltet; bloßes Löschen des Cloudflare-CDN-Caches ersetzt keinen PWA-Versionswechsel.

Referenzen: [Cloudflare-Header](https://developers.cloudflare.com/workers/static-assets/headers/), [Vite-PWA Update-Prompt](https://vite-pwa-org.netlify.app/guide/prompt-for-update.html).

## Nach dem ersten Deployment prüfen

- Yoru, Nox, Ares und Boreal auswählen; auch direkte Links mit `?scene=polar` bzw. `?scene=mars` öffnen.
- Flugzeug, Materialien und Decoder auf erfolgreiche Downloads prüfen.
- Auf Smartphone und Desktop Kamera, Wetter und Animationen testen.
- Nach vollständigem Laden offline neu laden und die installierte PWA testen.
- Ein kleines Folge-Deployment prüfen: Der Hinweis auf die neue Version muss erscheinen; **„Aktualisieren“** muss die neue Version laden und die Szenenauswahl in der URL erhalten.
- Die reale 3D-Leistung hängt weiter vom Gerät ab. Cloudflare beschleunigt die Auslieferung, berechnet die Szene jedoch nicht auf einem Server.

Die Vorbereitung im Repository richtet noch kein Cloudflare-Konto ein und veröffentlicht selbst keine Website. Die einmalige Kontoverknüpfung und das erste Deployment erfolgen im Dashboard.
