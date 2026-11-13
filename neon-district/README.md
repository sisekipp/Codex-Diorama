# Yoru · Nox · Ares — 3D-Dioramen

Eine React-PWA mit drei frei drehbaren Babylon.js-Dioramen.

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

## ARES / OUTPOST 07 — Marsbasis

Die dritte Szene ist über **Ares · Marsbasis** oder `/?scene=mars` erreichbar. Vier Ansichten zeigen die Basis, Startrampe, Kraterlandschaft und Außenmission. Wohnmodule, Drucktunnel, ein offener Roverhangar, Gewächshaus mit Pflanzen, Solarfelder, Tanks, Pumpen, Antenne und Probenstation bilden den Außenposten.

Sechs Rover einschließlich Erkundungs-, Fracht-, Wartungs- und abgestellter Fahrzeuge sowie sechs Raumanzugfiguren bevölkern die Basis. Fahrende Rover besitzen drehende Räder; laufende Astronauten und Fahrzeuge erzeugen neue Stiefel- und Reifenspuren. Wind lässt diese schneller verblassen. Der nahe Boden enthält geometrische Sandrippen, ergänzende Normaldetails und verstreute Steine.

Die Rakete durchläuft Countdown, zurückfahrende Versorgungsarme, Zündung, Abheben und Aufstieg. Flammen, Triebwerkslicht, transparente Rauchwolken, Bodenstaub und örtliches Hitzeflimmern begleiten den Start. **Start wiederholen** setzt ihn zurück; die Rampenkamera folgt dem Aufstieg bis zu einer manuellen Kameraeingabe. Eine zweite Rampe enthält einen abgestellten Lander.

**Windstärke**, **Staub in der Luft** und **Tageszeit** werden separat von den Stadtwettereinstellungen gespeichert. Reduzierte Bewegung pausiert Fahrzeuge, Astronauten, Partikel und Start; die Tageszeit bleibt einstellbar. Die sparsame Qualität begrenzt Lichtquellen und Partikel. Alle Marsmodelle und Oberflächendetails entstehen lokal im Projekt, die Reflexionsumgebung wird aus dem bestehenden CC0-Bestand wiederverwendet. Es gibt keine zusätzlichen Downloads.

`src/scene/mars/` trennt Gelände, Materialien, Basis, Figuren, Rover, Spuren und Startablauf. Spuren verwenden begrenzte Instanzpuffer mit Verblassen; der Sand wird nicht dauerhaft verformt. Rauch und Staub sind transparente Partikelsysteme, keine Strömungssimulation. `npm test` prüft zusätzlich Startphasen, Armfreigabe, Aufstieg, Windverblassen, Geländeanker und Tageslicht.

## BOREAL / Station 12 — polare Küste auf der Erde

Viertes Diorama unter **Boreal · Eisbasis** oder `/?scene=polar`: erhöhte Forschungs- und Wohnmodule mit transparenten Fenstern und ausgestatteten Innenräumen, offene Fahrzeugwerkstatt, Kraftstoffanlage, Bohrstation, alter Außenposten und ein Eisbrecher am Anleger. Vier Ansichten zeigen Station, Landebahn, Eishafen und Fahrzeuge/Forscher aus der Nähe.

Das Hercules-Modell von mgg8 / Aviation Gazetteer (CC0) wird lokal geladen. Vier Propeller und sechs Räder sind in bewegliche Teile umgebaut. Es landet, bremst, rollt zum Vorfeld und öffnet eine ergänzte Ladeplattform. **Landung wiederholen** startet den Ablauf neu. Die Flugkamera folgt bis zur manuellen Eingabe. Eine 52 m breite freie Anflugzone hält Gletscher und Berge außerhalb des Flugzeugs; der gesamte Anflug ist gegen Rumpf, Kufen und Flügel geprüft.

Drei Kufenbahnen drücken das hoch aufgelöste Schneegelände um bis zu 13 cm ein und erzeugen seitliche Schneewälle. Das bleibt während der Sitzung erhalten, auch nach einer neuen Landung. Aufgewirbelter Schnee entsteht direkt an den Kufen und beim Taxi weiter. Raupenfahrzeuge und laufende Forscher erzeugen begrenzte, mit Wind verblassende Oberflächenabdrücke. Die Fahrzeugspuren abseits der Piste verformen den Untergrund nicht. Eine Pistenraupe, Versorgungstransporter und Schneemobile haben ausgearbeitete Fahrwerke, Hydraulik und Beleuchtung. Sieben Forscher besitzen bewegliche Hüft-, Knie-, Schulter- und Ellenbogengelenke sowie geformte Winterkleidung und Ausrüstung.

Schneefall, Windstärke, Bodenschnee und Tageszeit lassen sich getrennt einstellen und bleiben lokal gespeichert. Nacht aktiviert das Polarlicht. Reduzierte Bewegung pausiert Fahrzeuge, Figuren, Kräne, Antennen, Wetter und Landung. Die sparsame Qualität begrenzt Partikel, Lichter und Aktualisierungen der Reflexionen und Schatten.

Weitere Modellrecherche und genaue Herkunft: [Modellquellen](../docs/boreal-model-sources.md). Es werden ausschließlich Downloads ohne Anmeldung eingesetzt. Figuren und Eisbrecher bleiben eigene Modelle; die besser ausgearbeiteten Sketchfab-Figuren sind wegen der Anmeldung nicht importiert. Die Schneeoberfläche und polare Lichtumgebung stammen von Poly Haven (CC0). Alle Dateien einschließlich des Modelldecoders sind lokal und werden für Offlinebetrieb vorgehalten.

## Cloudflare-Deployment

Cloudflare Workers mit Static Assets und GitHub-Anbindung ist vorbereitet. Die vollständigen Dashboard-Werte, Cache-Regeln und PWA-Prüfschritte stehen in der [Cloudflare-Anleitung](../docs/deployment/cloudflare.md). Lokal prüft `npm run check:cloudflare` den Produktionsbuild ohne Veröffentlichung; `npm run preview:cloudflare` startet die Cloudflare-Laufzeit.
