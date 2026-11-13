# BOREAL: Modelle und Oberflächen

Vorgabe vom Nutzer: ausschließlich Downloads ohne Anmeldung. Keine Käufe, keine Konten, keine Übertragung eigener Dateien an Modellgeneratoren.

| Objekt | Quelle | Ergebnis |
| --- | --- | --- |
| Hercules C.3 | [mgg8 / Aviation Gazetteer](https://airmuseums.co.uk/hangar/lockheed-hercules), [CC0-Erklärung des Autors](https://sketchfab.com/3d-models/lockheed-c-130-hercules-d2f92fa0bc004cbba8d4733b29014588) | Direktdownload ohne Konto, eingebaut. Vier Propeller und sechs Räder aus der zusammengefassten Geometrie in bewegliche Teile überführt; eigenes Skifahrwerk und Ladeplattform ergänzt. |
| Schnee | [Snow 02, Rob Tuytel / Poly Haven](https://polyhaven.com/a/snow_02) | CC0, direkt heruntergeladene Farb-, Normal- und ARM-Karten; im Gelände und in der verformbaren Piste eingesetzt. |
| Polare Lichtumgebung | [Snow Field (Pure Sky), Jarod Guest und Sergej Majboroda / Poly Haven](https://polyhaven.com/a/snow_field_puresky) | CC0, lokale 1K-HDR-Datei, im polaren Diorama eingesetzt. |
| Polarforscher | [Arctic Explorer Male Character, ChloeRobynSmith](https://sketchfab.com/3d-models/arctic-explorer-male-character-edea9d0701044ba3965dfb8cbdd20141) | Passender ausgearbeiteter Kandidat, CC BY. Download öffnet Anmeldefenster; gemäß Vorgabe nicht heruntergeladen oder eingebaut. Pose/Skelett nicht zugesichert. |
| Weiteres Flugzeug | [C130J Super Hercules, KOG_THORNS](https://sketchfab.com/3d-models/lockheed-martin-c130jsuper-hercules-reupload-223b4ff4abb945038fe35726bedd0db1) | CC BY, kontogebunden; nicht verwendet. |
| Schneeraupe | [Snow Groomer, A23D](https://www.a23d.co/3dmodel/snowgroomer-034999A) | Ausgearbeitetes Modell mit PBR-Oberflächen, als Qualitätsreferenz gefunden; kein freier Direktdownload verifiziert, nicht verwendet. |
| Frei verfügbare Low-Poly-Raupe | [3DAssets.dev](https://3dassets.dev/assets/ski-resort-and-snow-park-snow-groomer-bdd05f24) | Direkter CC0-Download, aber nur 800 Dreiecke; erfüllt den gewünschten Detailsprung nicht und wurde nicht eingesetzt. |

Alle übrigen Modelle, einschließlich Figuren und Eisbrecher, sind weiterhin im Projekt erstellte Geometrie. Sie wurden erheblich ausgearbeitet, aber nicht durch externe hochwertige Modelle ersetzt. Die Recherche hat dafür noch keinen überzeugenden, frei zugänglichen Ersatz ohne Anmeldung ergeben.

Dateien, Änderungen und SHA-256-Prüfsummen stehen in `neon-district/public/models/polar/credits.json`. Die bewegliche Hercules-Datei wird mit `node scripts/preparePolarAircraft.cjs SOURCE.glb public/models/polar/hercules-articulated.glb` aus dem unveränderten Direktdownload reproduziert. Der lokale Meshopt-Decoder stammt aus der installierten Babylon-Version, Copyright Arseny Kapoulkine, MIT.
