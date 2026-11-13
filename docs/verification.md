# Prüfung — 8. November 2026

## Erfolgreich

- TypeScript-Prüfung und Produktionsbuild (`npm run build`).
- Desktopansicht bei 1440 × 900 sowie Mobilansicht bei 390 × 844 ohne horizontales Überlaufen.
- Echte Touch-Eingaben in emulierter Mobilansicht drehen die Kamera; reduzierte Bewegung deaktiviert die Regenanimation.
- Sichtbare 3D-Szene, Zoom, Wechsel zwischen Straßenschlucht/Dächern/Panorama und Kamerarücksetzung.
- Automatische Kamerafahrt startet; manuelles Ziehen beendet sie.
- Regenumschaltung und Wechsel auf sparsame Grafikqualität.
- Informationsdialog öffnet und schließt per Escape; Fokus wird im Dialog gehalten.
- Manifest mit drei Icon-Einträgen sowie aktivem Service Worker.
- Produktionsversion nach erfolgreichem erstem Laden ohne Netzwerk erneut geöffnet: Szene bereit, Service Worker kontrolliert die Seite, keine JavaScript-Laufzeitfehler.
- Schriften sind lokal eingebunden und offline verfügbar.

## Umfang und Grenzen

Die Szene besteht aus eigens zusammengesetzter Geometrie mit detaillierten Fassadenbauteilen, Schildern, Fenstern, Straßenobjekten und einem Fahrzeug. Hochauflösende externe Modellpakete sind nicht integriert. Die visuelle Richtung ist eine stilisierte Cyberpunk-Nachtszene; sie erreicht keine AAA-Spielgrafik.

Babylon.js bildet den größten Build-Bestandteil (rund 1,77 MB unkomprimiert, 407 KB gzip). Vite meldet dazu einen Größenhinweis; der Build ist erfolgreich. Das Rendering wurde auf dem verfügbaren Browser geprüft; reale Mobilgeräte können abweichende Leistung zeigen. Für kleine Displays ist sparsame Grafikqualität voreingestellt.

## Veröffentlichung

Ein privates Hosting-Projekt ist angelegt; seine Kennung steht in `neon-district/.openai/hosting.json`. Quellcodeübertragung und Veröffentlichung wurden nicht ausgeführt. Die automatische Freigabeprüfung hat diesen Schritt wegen fehlender ausdrücklicher Zustimmung zur externen Übertragung blockiert. Die Anwendung ist lokal fertig und kann nach Zustimmung veröffentlicht werden.

## Zweite Detailrunde

Ergänzt: Fassaden- und Feuerleiterdetails, ausgestattete Ladenfronten und ein Straßenimbiss, Materialverschleiß, Straßenrequisiten und Fahrzeugdetails. `src/scene/details.ts` hält die zusätzliche Geometrie getrennt vom Stadtaufbau. Wiederkehrende Kästen, Geländer und Zylinder nutzen Instanzen.

Erneut geprüft: TypeScript und Produktionsbuild, Desktop 1440 × 900 und emulierte Mobilansicht 390 × 844, Zoom, Kameravoreinstellungen und Rücksetzung sowie Offline-Neuladen. Beide Ansichten starten ohne JavaScript-Laufzeitfehler und ohne horizontales Überlaufen. Die mobilen Prüfungen ersetzen keinen Test auf einem realen Smartphone. Screenshots liegen in `artifacts/`. Die Veröffentlichung bleibt unverändert ausstehend.

## Wetter und zweite Stadt — aktueller Stand

Die zusätzlich aufgetauchte Miniatur-Plattform, die veränderte Startkamera und der Tiefenschärfe-Filter wurden auf Wunsch wieder entfernt. Menschen wurden ebenfalls vollständig entfernt; die kurz erprobten Figurenmodelle und ihr Importpaket gehören nicht mehr zum Projekt.

Regenstärke, Dampf und Straßennässe lassen sich getrennt zwischen 0 und 100 Prozent einstellen. Die Werte werden lokal gespeichert. Regen und Bodenspritzer skalieren mit der Stärke; die Grafikqualität reduziert die Partikelzahl, ohne die Einstellungen zurückzusetzen. Dampf verwendet eine weich auslaufende, unregelmäßige Textur mit begrenzter Deckkraft und weniger überlagernden Partikeln. Der Wasserfilm verzerrt planare Reflexionen und ergänzt gebrochene Neon-Lichtspuren. Vier Fahrzeuge, zwei Motorräder und zusätzliche Müllansammlungen ergänzen die erste Straße.

Die separat auswählbare zweite Szene „Nox“ enthält tierweise aufgebaute Megastrukturen, Brücken, Landedecks, zwei bewegte Hochbahnzüge mit je fünf Wagen sowie 104 modellierte Flugautos und weitere entfernte Verkehrslampen. Es gibt drei eigene Kameraansichten. Die URL kann mit `?scene=megacity` direkt in der zweiten Szene starten. Beide Szenen enthalten keine Menschen.

Geprüft: fünf Wettertests, TypeScript/Produktionsbuild, getrennte Wetterregler einschließlich Aus/Ein, gespeicherte Werte nach Neuladen und mehrfacher Wechsel zwischen den Städten ohne JavaScript-Laufzeitfehler. Desktop und emulierte Mobilansicht wurden am Produktionsbuild erneut geprüft: drei bedienbare Wetterregler, kein horizontales Überlaufen und beide Städte nach dem ersten Laden offline erreichbar; keine JavaScript-Laufzeitfehler.

Recherchegrundlage für den transparenten Dampf: https://doc.babylonjs.com/features/featuresDeepDive/particles/particle_system/ramps_and_blends/ und https://doc.babylonjs.com/features/featuresDeepDive/particles/particle_system/particle_system_intro/ .

Die Städte bleiben stilisierte, überwiegend aus einfachen geometrischen Bauteilen zusammengesetzte Prototypen. Für den vom Nutzer gewünschten größeren Sprung zur Qualität der Spielreferenzen sind ausgearbeitete Gebäude-Assets, detaillierte Oberflächentexturen und eine weitere Beleuchtungsrunde erforderlich.

## Vertikaler Hafen „NOX / PORT 09“ — 8. November 2026

Nox wurde um einen sichtbaren Verkehrsknoten neu aufgebaut. Ein leicht nach innen geneigter Wohn- und Industrieturm und ein zylindrischer Konzernturm rahmen einen schwebenden Bahnhof. Darunter liegen industrielle Sockelbauten; an der mittleren Ebene hängen Wohnterrassen. Der Bahnhof enthält Plattformen, Bänke, Anzeigen, Gleisunterbau und eine teilweise offene, gebogene Dachkonstruktion. Das vorgelagerte Aerocab-Terminal enthält Ladebuchten, Geländer, Ladestationen, Entwässerung, Frachtbehälter und technische Ausrüstung. Die Startkamera zeigt Landebucht, Bahnhof und Türme gemeinsam.

72 Flugfahrzeuge folgen geschlossenen, gebogenen Routen. Ein Shuttle startet am Terminal und kehrt zurück, ein Taxi bleibt angedockt. Zwei vierteilige Züge bremsen am Bahnhof, halten mit geöffneten Türen und fahren wieder ab. Die Fahrzeug- und Zugbewegung pausiert bei reduzierter Bewegung. Es gibt keine Personen. Yoru bleibt separat auswählbar.

Metall- und Betonoberflächen nutzen lokal gespeicherte Farb-, Normal- und kombinierte Materialtexturen von Poly Haven. Eine lokal gespeicherte HDR-Umgebung liefert Reflexionen; ein gerichteter Scheinwerfer wirft Schatten auf das Terminal. Oberflächennässe beeinflusst nun auch die Hafenmaterialien. Herkunft, CC0-Lizenz und Prüfsummen stehen in `neon-district/docs/harbor-assets.json`.

Erfolgreiche Prüfungen:

- Neun automatisierte Tests: Wettersteuerung sowie Fahrtrichtung, Bahnsteighalt, Türverhalten und Zugwechsel außerhalb des sichtbaren Gleisbereichs.
- TypeScript und Produktionsbuild.
- Desktop 1440 × 1000 und emulierte Mobilansicht 390 × 844 ohne horizontales Überlaufen.
- Hafen-/Bahnhof-/Gesamtansicht, Wetterregler, Grafikqualität und mehrfacher Wechsel zwischen Nox und Yoru.
- Offline-Neuladen der Hafenansicht einschließlich nachweislich gecachter Normaltextur.
- Keine JavaScript-Laufzeitfehler oder Browserwarnungen während der Produktionsprüfungen.

Der Offline-Cache umfasst jetzt etwa 7,1 MB einschließlich lokalem Bildmaterial. Die Mobilprüfung erfolgte in Browseremulation, nicht auf einem physischen Smartphone.

Die endgültige lokale Vorschau nutzt `npm run preview -- --port 4190 --strictPort`. Ein vorübergehender Verbindungsabbruch beim parallelen Nachladen über den einfachen Python-Testserver wurde durch den Wechsel auf den Projektserver behoben. Danach wurde zusätzlich ein frischer Aufruf ohne vorhandenen Browsercache geprüft.

## NOX harbor wear pass — 2026-11-08

Implemented localized transparent grime overlays: oil and wheel scuffs on bays, coolant around chargers, rust below joints and repair plates, exhaust soot above vents, fine cracks and chipped markings. Added bolted deck patches, chipped terminal edges, blocked bay 03, hazard barricades, a maintenance trolley with opened lift turbine, detached cowling, tools, hose and parts cabinet. Added waste hoppers/bags, scattered wet paper, clogged gutters, patched HVAC facade panels, service doors, cable runs and layered notices. Corporate tower has service-level exhaust staining. Vehicles have exhaust collars, worn sills, fasteners and replacement panels; trains have access panels and lower grime strips. Window highlights are softer. Sign failure and a service beacon animate without changing shared light materials and respect reduced motion. Puddles follow the wetness control. Megacity rain uses finer/dimmer streaks and steam originates at terminal/station equipment. No people added.

Validation: production build succeeds; all 9 behavior tests pass. Fresh desktop browser checked both city scenes, station view, rain/smoke/wetness minimum and maximum values, low quality and offline reload. No browser warnings or errors. Mobile 390×844 loads without runtime errors or horizontal overflow. Screenshots saved under neon-district/artifacts/harbor-wear-{desktop,station,mobile}.png. Local preview: http://localhost:4191/?scene=megacity .

## Close-up model refinement — 2026-11-08

Replaced the foreground coupe and motorcycle with authored assemblies rather than adding more boxes to their previous geometry. Coupe has a profiled monocoque, separate open arch strips, curved tire carcasses with sipes, spokes/rotors/calipers, inset optics, glass, seats, dashboard, gaskets and body seams. Motorcycle has rounded tire profiles, brake hardware, a visible chain/sprocket, coil spring, exhaust headers, fuel filler, saddle, fork sleeves and hydraulic lines. The original clone/motion roots remain compatible.

Nox foreground aerocab and shuttle now have larger profiled pressure hulls, four ducted lift fans with individual pitched blades, cockpit/seats, landing struts, steps, radiator fins, removable access panels and lights. Added articulated dock equipment with charging umbilical, train bogies/flanged wheels, air bellows, coupling lines and roof cooling assemblies. Foreground station span has I-beam flanges/webs, stiffeners, rail clips and rib connection plates. Distant traffic retains simpler geometry.

KISEKI ground-floor shell is opened to reveal a workshop with lift, hydraulic rams, workbench drawers, sockets/spanners, diagnostic console, spare tires, gas bottles and pneumatic hose. Ground access ladder is moved beside the opening. Small geometry is consolidated by material into a few mesh groups and gets distance-based LOD. PBR paint/steel/rubber are distinct, with linear-space colors and fine enamel wear. Added local receiving/cast shadows for the street hero assemblies and softened oversized harbor scratch marks.

New camera presets: Werkstatt (Yoru) and Andockplatz (Nox). They allow closer inspection, use a reduced zoom step nearby and disable collision obstruction while inspecting the detail view. Portrait framing targets the vehicles and uses a wider distance for the aerocab. Existing city presets remain available.

Verification: TypeScript and production build pass; 9 train/weather tests pass. Production desktop checks cover scene switching, both detail views, all weather control extremes and quality switches, with zero browser warnings/errors. Mobile 390×844 checks cover both detail views, four camera buttons, no horizontal overflow, offline reload and offline scene switching. Reduced-motion contexts produce identical canvas frames over time in both scenes, with no runtime errors. Captures: neon-district/artifacts/models-{yoru,nox}-{close,mobile}.png. Final local preview: http://localhost:4192/ . This pass upgrades the approved foreground subjects; distant buildings and other background objects remain simpler.

## Scene-wide materials, practical lighting, motion and secondary assets — 2026-11-08

Lighting: authored vehicle sockets now drive moving headlights and rear-light spill. Sign color, road lights, station fixtures and vending lights feed a fixed pool of nearby real point/spot lights (six high, three low); one selected beam has local shadows. Physical light falloff, shader light limits and priorities are explicit. Emissive lenses still provide their visible source, while real lights illuminate surfaces. The road water film now uses the same live light data for wet highlights, replacing fixed colored spills at old coordinates. Planar reflections include the grouped vehicle optics and reverse sign faces. Base ambient illumination is reduced to retain local contrast.

Materials: shared deterministic albedo/normal/roughness textures cover paint, metal, concrete, rubber, upholstery and asphalt. Opaque legacy structural materials are migrated to PBR while authored color textures/prints remain. Corrected a concrete configuration bug: Babylon defaults roughness sampling to alpha; green-channel ARM textures require explicitly disabling alpha sampling. The green channel is now actually selected on vehicle and harbor materials. Deck paint, aggregate paving and soft oil staining replace plank-like landing surfaces and hard-edged circular stains. Avoided cloning DynamicTextures for new deck materials, which had produced unready GPU textures and blocked scene readiness; fresh scene audit reports zero unready textures.

Motion: model consolidation now respects separate articulated parents. Coupe and van wheel assemblies, motorcycle wheels, train wheels and lift fans have proper pivots. The moving coupe and trains roll by signed travel/radius; stationary vehicles do not roll. Lift fans, roof rotors and ventilation equipment animate independently. Reduced motion freezes these updates. Runtime checks measured coupe rolling error 5.6e-15 m and train error 0 m across samples; 32 wheels per train are bound. Fan rotation changed during the ordinary runtime check.

Secondary models: delivery van rebuilt with profiled hull, separate glazing, interior, door locks/hinges/gaskets, rims, optics and roof rails. Structural cases/towers/cabinets use shared beveled solids where appropriate. Added sign housings/brackets, facade cassettes/fasteners/flanges, roof fans and access hatches, stocked vending machines behind glass, cabinet doors/locks, refuse-bin hinges/casters, skybridge glazing/interior/joists, charger controls/cables, platform bench backs/armrests, console controls and station service covers/conduits. No people added.

Verification: final production build passes and all 13 tests pass, including new circumference/direction, recycling, rotor-reduced-motion and light-ranking cases. Browser geometry audit confirms the beveled unit solid has 44 triangles, outward normals and closed manifold edges. An A/B rendering check in a static scene disabled only practical lights, preserving emissive optics, and confirmed a changed canvas image; captures lights-on.png and lights-off.png show actual illumination. Desktop production checks cover weather extremes, high/low quality, both scenes and detail/station views without warnings/errors. Mobile 390×844 has no overflow or warnings/errors; offline reload and scene switching pass. Final mobile scenes also load with corrected roughness sampling. Reduced-motion production contexts produce identical canvas frames over time in both scenes.

Final local preview: http://localhost:4193/ . Key captures: neon-district/artifacts/lighting-{yoru,nox}-{desktop,mobile}.png and delivery-van-detail.png. Practical lighting prioritizes nearby sources to bound rendering cost; this is not full-scene global illumination. Existing PWA asset precache remains local and includes every texture dependency.

Reference used for light limits and material behavior: https://doc.babylonjs.com/features/featuresDeepDive/lights/lights_introduction/ . The installed Babylon.js shader source was checked for ARM channel precedence.

## Misplaced sign housings fixed — 2026-11-08

The apparent wall across Yoru's road was overlapping sign housings and reverse faces created near the scene origin. The new sign refinement read a lazy world matrix without forcing its initial update. It now forces the sign world transform and keeps a cloned snapshot before creating/merging attachments. Visual comparison confirms the block is gone. Runtime attachment audit: all 18 Yoru and 17 Nox reverse faces sit 0.29 m behind their matching sign, and none remain near the origin. Both scenes load after the correction. Diagnostic ray module removed after use. Screenshot: neon-district/artifacts/wall-fixed.png.


## ARES / OUTPOST 07 — Marsbasis

Drittes, separat geladenes Diorama mit reliefiertem Gelände und geometrischem Detailfeld, sechs Fahrzeugen, sechs Astronauten, begehbar wirkenden Basisbauten und Gewächshaus, zwei Rampen und wiederholbarem Raketenstart. Roverräder rollen streckenabhängig, Figuren bewegen Glieder und erzeugen zusammen mit den Fahrzeugen neue Oberflächenspuren. Die bounded Instanzpuffer fassen 1300 Stiefel- und 2800 Reifenmarken; Wind beschleunigt ihr Verblassen. Keine dauerhafte Geländeverschiebung. Rauch und Staub verwenden weich auslaufende, transparente Partikel; Flammen sind animierte räumliche Shadergeometrie, Hitzeflimmern ist ein örtlicher Bildschirmfilter. Kein vollständiges Strömungsmodell.

Validierung: Alle 19 Verhaltenstests und TypeScript/Produktionsbuild erfolgreich. Desktop 1440×1000: Startphasen einschließlich Armrückzug, Zündung, Abheben und Aufstieg, Kamerafolgen und Neustart geprüft. Vier Kameraansichten, Wind/Staub/Tageszeit mit Minimal- und Maximalwerten, hohe/sparsame Qualität und drei Szenenwechsel ohne Laufzeitfehler oder Browserwarnungen. Laufzeitaudit bestätigt zunehmende Spuren und aktive Rauch-/Staubpartikel. Nahansicht zeigt Reifenprofile, Raumanzüge, Sandrippen und Spuren sowie tatsächliche Scheinwerferbeleuchtung.

Emuliertes Mobilgerät 390×844: Szene und Regler bedienbar, kein horizontales Überlaufen. Startkarte und Zoomtasten räumlich getrennt. Nach vollständigem Laden funktionieren Offline-Neuladen und Wechsel zwischen Yoru, Nox und Ares ohne Laufzeitfehler. Reduzierte Bewegung: identische Canvasbilder über 600 ms und deaktivierter Startknopf. Die mobile Prüfung ersetzt keinen Test auf einem physischen Gerät. Aufwendige Nahgeometrie und Schatten können die Bildrate auf schwachen Geräten begrenzen; sparsame Qualität ist mobil voreingestellt.

Lokale Vorschau: http://localhost:4195/?scene=mars . Bilder: `neon-district/artifacts/mars-launch-production.png`, `mars-eva-production.png` und `mars-mobile.png`. Keine Veröffentlichung oder Quellcodeübertragung ausgeführt.


## BOREAL / Station 12 — 9. November 2026

Viertes separat geladenes Diorama an einer Polarküste auf der Erde. Enthalten sind erhöhte Forschungs- und Wohnmodule, ausgebaute Werkstatt, Versorgungshafen mit Eisbrecher und beweglichem Kran, Bohr-/Probenstation, Tank-/Generatoranlage, alte Schutzhütte, sechs Bodenfahrzeuge einschließlich zweier Schneemobile und sieben Forscher. Ergänzte Baugruppen: Fassadenkassetten, offene Seitenverglasung, Leitungs-/Kabeltrassen, Wartungsstege, Laborschränke, Dachlüfter, Hebezeug, Werkzeuge, Tankleitern, Manometer, Schiffstreppen, Deckausrüstung und Fahrzeughydraulik. Die Figuren besitzen geformte Parkas, Falten, Nähte, Kapuzenbesatz, Schutzbrillen, Funkgerät, Rucksäcke, Handschuhe und Sohlen sowie eigene Knie-/Ellenbogengelenke.

Nach Nutzerkritik wurde das ursprüngliche eigene Flugzeug durch die frei herunterladbare Hercules C.3 von mgg8 / Aviation Gazetteer (CC0) ersetzt. Die ursprünglich zusammengefassten Propeller und Räder wurden in vier bzw. sechs bewegliche Baugruppen getrennt; ein Skifahrwerk und eine Ladeplattform ergänzen die Szene. Der Landeablauf umfasst Anflug, Abbremsen, Taxi und Rampenöffnung und lässt sich wiederholen. Die Kufen verursachen echte lokale Höhenänderungen in einem begrenzten Pistenfeld: bis zu 13 cm tiefe Rinnen und aufgeschobene seitliche Wälle, dazu Oberflächenspuren und Partikel direkt an den Kufen, auch beim Taxi. Das Feld hält seine Form während der Sitzung. Übrige Fahrzeug-/Fußabdrücke sind begrenzte, windabhängig verblassende Oberflächenmarken.

Bergdurchflug korrigiert: Gletscher und Bergfeld verwenden dieselbe 52 m breite freie Anflugzone mit weichen seitlichen Übergängen. Der Test tastet den Anflug im Abstand von 0,025 s für Nase, Kufen, Heck und beide Flügelenden ab. Das ist eine Prüfung der vorgegebenen Flugbahn, kein allgemeines physikalisches Kollisionssystem für frei gesteuerte Flugzeuge.

Modellrecherche: ausschließlich Downloads ohne Anmeldung, entsprechend der zuletzt ausdrücklich genannten Vorgabe. Herkunft/Prüfsummen und Änderungen stehen in `neon-district/public/models/polar/credits.json`, Auswahl und abgelehnte Kandidaten in `docs/boreal-model-sources.md`. Die Polarforscher von ChloeRobynSmith benötigen für den Download eine Anmeldung und wurden nicht importiert. Figuren und Eisbrecher bleiben ausgearbeitete eigene Geometrie; ein externer Qualitätsersatz ist für diese Modelle noch offen. Kein Kauf und keine Kontoerstellung. Lokale Poly-Haven-Schneeoberflächen und eine polare HDR-Umgebung verbessern Materialdetails; der Schnee-Shader begrenzt die Farbkontraste des Scans zugunsten von frischem Pulverschnee.

Validierung: 26 Verhaltenstests erfolgreich, TypeScript und finaler Produktionsbuild erfolgreich. Laufzeitaudit: vier importierte Propeller, sechs Radbaugruppen, sieben Figuren, vollständige Vertex-/UV-Puffer; keine WebGL-Warnungen nach der Rumpf-UV-Korrektur. Gemessenes Pistenbeispiel: Kufenrille bei Y=0,982 gegenüber unverformtem Feld Y=1,112. Desktop: alle vier Szenen, Wetterregler an beiden Enden, hohe/sparsame Qualität, Flugverfolgung und Neustart ohne JavaScript-Fehler. Reduzierte Bewegung: identische Canvasbilder über 600 ms, Landungsknopf deaktiviert. Emuliertes Mobilgerät 390×844: kein horizontales Überlaufen, Startkarte/Zoomtasten getrennt; Offline-Neuladen und Offline-Wechsel zwischen allen vier Szenen erfolgreich. Der abschließende frische Cache enthält nachweislich Hercules, Decoder, Schnee-Farb-/Normal-/ARM-Texturen und polare Lichtumgebung; Offline-Neuladen des finalen Builds erfolgreich. Reale Mobilgeräte sind nicht geprüft. Je nach Ansicht liegt die auf diesem Desktop beobachtete Bildrate ungefähr bei 30–45 FPS; schwächere Geräte können deutlich langsamer sein.

Die PWA hält jetzt etwa 13,3 MiB in 41 Dateien vor. Der vorhandene Babylon-Größenhinweis bleibt; der Build ist erfolgreich. Keine Veröffentlichung und kein automatischer Commit. Lokale Vorschau: http://127.0.0.1:4197/?scene=polar . Bilder: `neon-district/artifacts/boreal-final-details.png`, `boreal-final-aircraft.png`, `boreal-mobile.png`.

### BOREAL — Schneeschicht, Versorgungsrouten und Eisbrecher

Die Stationsfläche besitzt jetzt ein gemeinsames verformbares Schneefeld mit 162.175 Punkten über 162 × 249 m. Zusätzliches Pulverschneevolumen, durchgehende Verwehungen an Gebäuden und weiche Räumkanten ersetzen die früheren einzelnen Schneekugeln. Der Kontrast der gescannten Schneefarbe und Normalen wurde reduziert. Fuß-, Raupen- und Kufenspuren verändern die Höhe derselben Oberfläche; Raupen drücken bis zu 17 cm ein und schieben kleine seitliche Wülste auf. Fahrzeuge und Forscher folgen der verformten Höhe, die Oberflächenmarkierungen werden nachgeführt. Wind füllt ältere Eindrücke langsam auf. Nur betroffene Normalen und ihre Nachbarn werden neu berechnet; das große Schneefeld wirft keinen eigenen Schatten auf sich selbst.

Drei geschlossene, nach Weglänge abgetastete Versorgungsrouten ersetzen die engen Kreise: ungefähr 314 m Schneepflug, 304 m Transporter und 368 m Schneemobil. Anfahren, Bremsen und Ladepausen sind Teil des Ablaufs. Die Routen führen zwischen Hafen, Werkstatt, Flugzeugvorfeld, Tankbereich und Außenstation. Tests prüfen nahtlose Rundenschlüsse, Geschwindigkeitsgrenzen sowie Abstand zu den großen Gebäuden und dem geparkten Flugzeug. Das ist keine allgemeine dynamische Verkehrs-Kollisionssimulation.

Der selbst modellierte Eisbrecher besitzt einen dichter abgetasteten gerundeten Rumpf, über die gesamte Schiffslänge ausgerichtete Zweifarblackierung mit Schweißnähten und Salz-/Abriebspuren, abgestufte abgeschrägte Aufbauten, umlaufende Fensterbänder, eine ausgestellte Brückenfront, zwei geneigte Abgasschächte und korrekt angeschlossene Radar-/Suchscheinwerferstützen. Die Kennung ist als eigene Fläche lesbar. Die Kranleine folgt dem angepassten Hubablauf.

Validierung: 29 Verhaltenstests erfolgreich; TypeScript und Produktionsbuild erfolgreich. Der Anflug-Freiraumtest besteht weiterhin. Desktop-Laufzeitaudit: alle Schneepositionen und Normalen endlich, keine nicht bereiten Modelle, keine Browserwarnungen/-fehler; Station, Werkstatt und Eishafen visuell kontrolliert. Die Hafenansicht erreichte nach dem Laden ungefähr 37 FPS auf diesem Desktop. Bild: `neon-district/artifacts/boreal-ship-refined.png`. Neue lokale Vorschau: http://127.0.0.1:4198/?scene=polar .

Abschließende Prüfung dieses Builds: 4.627 tatsächlich veränderte Schneepunkte im Laufzeitaudit, gemessene maximale Rinne 16,95 cm und aufgeschobene Schulter 10,64 cm. Mobil (emuliert, 390 × 844): Szene bereit, kein horizontales Überlaufen, Offline-Neuladen erfolgreich, keine JavaScript-Fehler. Ein beim Laden in sparsamer Qualität gefundener Bereitschafts-Wartezustand wurde behoben: Die fertige Szene rendert während der Grafikvorbereitung zunächst ohne fortschreitenden Bewegungsablauf. Danach beginnt die normale Simulation. Der finale Produktionsbuild ist geprüft; reale Mobilgeräte bleiben ungeprüft.

## BOREAL — massenerhaltende Schneesimulation und Shader

Der frühere Stempel mit fest vorgegebenen Vertiefungen/Wülsten wurde im laufenden Schneesystem durch `SnowPhysics` ersetzt. 647.053 Zellen (649 × 997) auf einem 25-cm-Raster speichern unveränderlichen Untergrund, Schneemasse, Verdichtung und Störungszustand. Die Dichte variiert zwischen 120 und 450 kg/m³; die Oberfläche folgt der Masse und Dichte. Raupen, Kufen und Stiefel verdichten unter Last und übertragen eine gemessene Masse an ihre Ränder. Der abgesenkte, leicht angestellte Pflugschild bearbeitet seine überstrichene Fläche, schiebt eine Welle nach vorn und entlädt Material nach rechts. Ein Reibungs-/Kohäsionsmodell lässt zu steile Haufen abrutschen. Schwerkraft, Luftwiderstand, Landung und Rückgabe der Masse werden für bis zu 900 räumliche Schneeklumpen berechnet, in sparsamer Qualität bis zu 350. Bei ausgeschöpfter Kapazität wird übrige Masse direkt abgelagert und geht nicht verloren. Wind transportiert vorhandenes Material; Neuschnee ist ein separat bilanzierter Zufluss. Ruhende Bereiche schlafen ein. Sichtbare Wolken/Fahnen bleiben ergänzende Effekte; die kg-Bilanz betrifft Schneeschicht und massive Klumpen.

Die Berechnung läuft deterministisch mit festen Zeitschritten in TypeScript. Eine gepackte RGBA-Zustandstextur treibt die Verformung auf der GPU an. Das PBR-Material rekonstruiert Oberflächennormalen aus dieser Höhe und berechnet mehrskalige Körnung, unregelmäßige Windrippen, verdichtungsabhängige Rauheit/Farbe und lichtabhängige Kristallreflexe ohne selbstleuchtenden Schnee. Ein 32-m-Detailfeld um den Blickpunkt hat 12,5-cm-Geometrie, sparsam 25 cm; die übrige Fläche verwendet ein gröberes Netz mit demselben Materialzustand. `ShadowDepthWrapper` berücksichtigt die tatsächliche Verformung auch in der Schattenkarte. Separate große Spur-Decals sind entfernt.

„Schneeräumen“ folgt dem arbeitenden Pflug; manuelle Kamerabewegungen beenden die Verfolgung. Ein bereits vorhandener Fehler beim Wechsel des Kameraziels wurde korrigiert: Die Kamera behält beim Aktualisieren des Ziels ihren eingestellten Abstand. In den Atmosphäreeinstellungen stellt „Frischen Schnee auflegen“ die Ausgangsschicht wieder her. Das Hauptfahrzeug und die Forscher richten sich nach dem veränderten Schnee; das Flugzeug wird am Boden von seinen drei Kufenpositionen getragen. Fahrzeuge berücksichtigen aufgeschobene Haufen über geringere Fahrtgeschwindigkeit und nachgiebige Haltung. Ein vorausschauender Vorrang beim Kreuzen der Versorgungsrouten verhindert das in der Nahansicht aufgefallene Durchfahren des Pflugs; der mobile Startpunkt ist vom geparkten Schneemobil abgerückt.

Grenzen: Dies ist ein physikalisch basiertes, reduziertes Schichtmodell mit räumlichen Klumpen, keine vollständig volumetrische elasto-plastische MPM-Simulation wie Disneys Matterhorn. Es modelliert keine überhängenden Schneehöhlen, volumetrischen Brüche, Schmelz-/Gefrierthermodynamik oder frei dynamisch gesteuerte Fahrzeuge. Der Rechenkern läuft auf der CPU, Darstellung und Verformung im Shader; es ist kein WebGPU-Compute-Solver. Die bestehende WebGL-PWA bleibt erhalten.

Validierung: 39 Tests erfolgreich, einschließlich Massenbilanz bei Verdichtung, Pflügen, Hangrutschung, Wind, Niederschlag, Partikelgrenze und Rückablagerung; Wiederholungsüberfahrten, Untergrundgrenze, Randkontakte, extreme Zeitschritte, Stillstand, explizites Zurücksetzen und Verkehrsvorrang. Der bestehende Anflug-Freiraumtest besteht weiterhin. TypeScript und finaler Produktionsbuild erfolgreich, vorhandener Babylon-Größenhinweis unverändert. Im Laufzeitaudit waren sämtliche Zellen endlich und keine Masse negativ. Beispiel: 2.781.937,58 kg Ausgangsschnee, 8.722,12 kg Neuschnee, 33,96 kg in der Luft, Bilanzabweichung unter 0,000001 kg. Keine flachen Fahrspur-Decals mehr, keine Shader-/WebGL-Warnungen im geprüften Desktoplauf. Gemessene Bildraten je nach Nahansicht und Umgebung etwa 14–25 FPS in hoher Qualität auf dieser Maschine; keine Zusage von 60 FPS. Die Nahsimulation ist ressourcenintensiv.

Technische Referenzen: [Babylon Material Plugins](https://doc.babylonjs.com/features/featuresDeepDive/materials/using/materialPlugins/), [Babylon: Shadows / ShadowDepthWrapper](https://doc.babylonjs.com/features/featuresDeepDive/lights/shadows), [Interactive Generation of Time-Evolving Snow-Covered Landscapes with Avalanches](https://pubs.cs.uct.ac.za/id/eprint/1288/), [Disney Matterhorn](https://disneyanimation.com/technology/matterhorn/). Keine fremden Modell-Downloads oder neue Anmeldung nötig. Keine Veröffentlichung und kein automatischer Commit.

Finaler Build `createPolarScene-Djn-Ni_g.js`: emuliertes Mobilgerät 390 × 844 ohne horizontales Überlaufen, „Schneeräumen“ auswählbar, Offline-Neuladen mit Szene bereit, keine JavaScript-Fehler. Reduzierte Bewegung: identische Canvasbilder über 650 ms und deaktivierter Landungsneustart, keine JavaScript-Fehler. „Frischen Schnee auflegen“ und Umschalten der Grafikqualität in der Oberfläche geprüft. Die mobile Prüfung ersetzt kein physisches Gerät. Finale lokale Vorschau unter http://127.0.0.1:4200/?scene=polar ; die neue Adresse vermeidet den alten PWA-Zwischenspeicher.

Beim abschließenden Szenenwechsel wurde derselbe Bereitschafts-Wartezustand auch in Ares gefunden. Eine eng begrenzte Initialisierungskorrektur rendert dort ebenfalls während der Grafikvorbereitung. Danach geprüft: Eisbasis → Marsbasis → Eisbasis im frischen Browserkontext, beide Male Szene bereit, keine JavaScript-Fehler. Letzter Produktionsbuild nach dieser Korrektur: `createPolarScene-Cc7knWQa.js`, `createMarsScene-C4NqwGeR.js`. Die Schneeimplementierung ist dabei unverändert; erneuter Build erfolgreich.
