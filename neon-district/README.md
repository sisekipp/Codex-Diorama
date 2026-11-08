# Yoru — Cyberpunk District

Eine React-PWA mit einer frei drehbaren Babylon.js-Stadtszene.

## Lokal starten

```sh
npm install
npm run dev
```

## Produktionsversion

```sh
npm run build
npm run preview
```

Der Build führt TypeScript aus und erzeugt `dist/` mit Manifest, Icons und einem versionierten Offline-Cache. PWA-Funktionen benötigen HTTPS oder localhost. Nach dem ersten vollständigen Laden ist die Szene offline verfügbar. Die Installation erfolgt über das Browsermenü oder, bei unterstütztem Installationsereignis, über die Schaltfläche in der App.

## Bedienung

- Maus/Finger ziehen: Kamera drehen.
- Mausrad oder Zwei-Finger-Geste: zoomen.
- Plus-/Minus-Tasten und Tastatur +/−: zoomen; 0: Startansicht.
- Drei Ansichten: Straßenschlucht, Dächer, Panorama.
- Kamerafahrt: langsamer automatischer Orbit; manuelle Eingabe stoppt ihn.
- Einstellungen: Regen, Grafikqualität, PNG-Bild der aktuellen Ansicht speichern.
- Escape: Dialog oder reduzierte Oberfläche schließen.

Die sparsame Grafikqualität ist auf kleinen Displays voreingestellt. Reduzierte Bewegung deaktiviert Regenanimation, Dampf und automatische Kamerafahrt. Ein ausgeblendeter Tab pausiert die Darstellung.

## Architektur

`src/App.tsx` enthält die Oberfläche und bindet den asynchron geladenen Szenencontroller ein. `src/scene/createScene.ts` verwaltet Engine, Kamera, Licht, Reflexionen und Lebenszyklus. `city.ts` baut die Stadt aus wiederverwendeten Geometrien; `details.ts` ergänzt Feuerleitern, Läden, Straßenobjekte und Fahrzeugdetails; `materials.ts` erstellt Materialien und lokale Texturen; `atmosphere.ts` enthält Regen und Dampf.

## Assets und Qualitätsumfang

Alle Architekturteile, Fahrzeuge, Straßenobjekte, Schilder und App-Icons wurden eigens im Projekt erstellt. Yorus Texturen entstehen im Projekt; der Hafen verwendet zusätzlich die unten genannten CC0-Oberflächen von Poly Haven. Keine Modelle, Screenshots, Namen von Schauplätzen oder sonstigen Assets aus Cyberpunk 2077 werden verwendet. Die erste Version nutzt detailliert zusammengesetzte prozedurale Geometrie; externe hochauflösende Modellpakete sind noch nicht integriert. Diese können für eine spätere realistischere Ausarbeitung ergänzt werden.

Barlow Condensed und DM Sans: lokal eingebundene Schriften über Fontsource, SIL Open Font License. Symbole: Lucide, ISC-Lizenz. Babylon.js: Apache-2.0. React: MIT.

Uhrzeit, Temperatur und Koordinaten in der Oberfläche beschreiben die fiktive Szene; es werden keine Wetter- oder Standortdienste aufgerufen.

## Detailrunde

Die Szene enthält zusätzlich Feuerleitern mit Treppen und Geländern, Wartungskästen, Kabeltrassen, Fensterbänke, einen ausgestatteten Ramen-Tresen, eine Werkstatt, einen Straßenimbiss, Speisekarten, Plakate, Lieferkisten, Müllsäcke, Gullygitter und eine Wartungsabsperrung. Neue lokale Texturen zeigen Rost, Holzmaserung, Kratzer, Schmutz und Asphaltreparaturen. Unregelmäßige Pfützen ergänzen die vorhandenen Reflexionen. Das Fahrzeug hat zusätzliche Felgen, Reifenprofile, Karosseriefugen, Kühlöffnungen, Kennzeichen und Scheibenwischer. Wiederkehrende Bauteile teilen Geometrie und Materialien.

## Zwei Städte und Wetter

Oben in der Szenenauswahl zwischen **Yoru · Nachtviertel** und **Nox · Megastadt** wechseln. Ein direkter Aufruf der zweiten Stadt ist über `/?scene=megacity` möglich. Nox enthält Megabauten, Hochbahnzüge und fliegenden Verkehr auf mehreren Ebenen. Beide Städte sind ohne Menschen.

Unter Szeneneinstellungen lassen sich Regenstärke, Dampf und Straßennässe unabhängig einstellen. Die Werte bleiben lokal gespeichert. Reduzierte Bewegung pausiert die animierten Effekte und den Verkehr; die Nässe bleibt sichtbar. Die neuen Bauteile und Shader liegen in `streetLife.ts`, `megacity.ts`, `wetStreet.ts` und `weather.ts`. `npm test` prüft die Wettersteuerung.

## NOX / PORT 09 — vertikaler Hafen

Die Megastadt enthält jetzt einen schwebenden Hochbahnhof zwischen einem geneigten Wohnblock und einem zylindrischen Konzernturm. Die Vordergrundansicht beginnt beim Aerocab-Terminal. Die Ansichten heißen **Lufthafen**, **Hochbahnhof** und **Megastadt**.

Züge halten am Bahnsteig; Türen öffnen während des Halts. Flugverkehr folgt geschlossenen Korridoren; ein Shuttle bedient das Terminal. Die Stadt bleibt ohne Personen. Bei reduzierter Bewegung stehen Fahrzeuge und Wettereffekte still.

`harborKit.ts` enthält geteilte Architekturbauteile und physikalische Materialien, `megacity.ts` den Stadtaufbau, `harborTraffic.ts` den Verkehr und `harborMotion.ts` den getesteten Zugablauf. Farb-, Normal- und Materialtexturen sowie die Beleuchtungsumgebung stammen von [Poly Haven](https://polyhaven.com/license), CC0. Vollständige Quellen und Dateiprüfsummen stehen in [docs/harbor-assets.json](docs/harbor-assets.json).

Die Kameraansichten **Werkstatt** (Yoru) und **Andockplatz** (Nox) zeigen die neu modellierten Vordergrundobjekte aus der Nähe. Kleine Profilrillen, Schrauben und Leitungen werden in größerer Entfernung ausgeblendet. Die übrigen Stadtobjekte verwenden weiterhin einfachere Modelle.

Die Beleuchtungsrunde ergänzt mitbewegte Scheinwerfer und Rücklichtschein sowie Licht von Reklamen, Straßen- und Bahnsteiglampen. Ein begrenzter Vorrat tatsächlicher Lichtquellen folgt den nahen Leuchten; die reduzierte Grafikqualität verwendet weniger davon. Nasse Straßen beziehen bewegte Glanzlichter aus denselben Lichtquellen. Räder des fahrenden Coupés und der Züge rollen abhängig von der Strecke; Hubturbinen und Lüfter besitzen eigene Drehachsen. Bei reduzierter Bewegung bleiben sie still.

Auch der Lieferwagen, Fassadenanschlüsse, Dachtechnik, Automaten, Schildergehäuse, Müllbehälter, Brücke, Ladegeräte und Bahnsteigmöbel sind weiter ausgearbeitet. Opaque Strukturmaterialien nutzen einheitliche physikalische Beleuchtung und gemeinsame lokale Detailtexturen; dafür sind keine zusätzlichen Downloads erforderlich.
