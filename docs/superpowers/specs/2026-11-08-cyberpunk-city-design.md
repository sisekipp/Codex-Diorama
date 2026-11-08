# Cyberpunk-Stadtviertel – Entwurf

Stand: 8. November 2026. Die gestalterische Richtung wurde im Chat bestätigt.

## Ziel

Eine installierbare React-PWA zeigt ein frei erfundenes, detailliertes Cyberpunk-Stadtviertel bei Nacht. Nutzer können die echte 3D-Szene mit Maus und Touch drehen und zoomen. Die Stimmung orientiert sich an Cyberpunk 2077 und den verlinkten Babylon.js-Beispielen; die Stadt erhält eine eigene Gestaltung.

## Szene und Gestaltung

Im Mittelpunkt steht eine kompakte Straßenschlucht mit mehreren begehbar wirkenden Ebenen: Ladengeschäfte im Erdgeschoss, dicht bebaute Obergeschosse, Stege und eine Skyline im Hintergrund. Fassaden erhalten Fensterrahmen, Leuchtreklamen, Rohre, Kabel, Klimaanlagen und Dachaufbauten. Straßenobjekte und ein Fahrzeug liefern Größenbezug und Details im Vordergrund.

Petrolfarbene Schatten, cyanfarbene und magentafarbene Neonlichter sowie einzelne warme Ladenfenster bestimmen die Farbwelt. Nebel schafft Tiefe; Regen, dampfende Lüftungen und zurückhaltende Animationen beleben die Szene. Nasser Asphalt nimmt die Farben der Lichtquellen auf. Die Erstansicht zeigt das Viertel aus einer leicht erhöhten Perspektive mit klar erkennbarem Vordergrund.

Die Oberfläche bleibt der Szene untergeordnet: Name des Viertels, Ladezustand, knappe Bedienhinweise und kompakte Bedienelemente. Sichtbare Texte sind deutsch. Auf kleinen Bildschirmen schrumpft die Oberfläche, ohne wichtige Bedienelemente zu verdecken.

## Modelle und Qualitätsgrenze

Die Stadtanordnung und wiederkehrende Bauteile entstehen eigens für die Anwendung. Verfügbare hochwertige, rechtmäßig nutzbare Modelle ergänzen besonders sichtbare Straßenobjekte. Externe Modelle werden nur mit nachvollziehbarer Herkunft und passender Lizenz übernommen; erforderliche Credits stehen in der Anwendung und im Projekt.

Die erste Version ist ein hochwertiger Web-Prototyp. AAA-Detailqualität kann ohne passende Modell- und Texturpakete nicht zugesichert werden. Fehlende externe Modelle dürfen den Start der Szene nicht verhindern; selbst erstellte Geometrie bleibt als funktionierende Grundlage erhalten. Verwendete Modelle und verbleibende Qualitätsgrenzen werden bei der Übergabe benannt.

## Bedienung

- Ziehen mit Maus oder Finger dreht die Kamera um das Viertel.
- Mausrad und Zwei-Finger-Geste verändern den Abstand.
- Sichtbare Plus- und Minus-Tasten ermöglichen zusätzliches Zoomen.
- Eine Taste stellt die Startansicht wieder her.
- Eine optionale langsame Kamerafahrt kann ein- und ausgeschaltet werden und stoppt bei manueller Bedienung.
- Kameragrenzen verhindern Fahrten unter den Boden und durch die zentrale Bebauung.
- Schalter steuern Regen und Grafikqualität. Reduzierte Bewegung wird berücksichtigt.

## Architektur

React und TypeScript übernehmen die Oberfläche. Vite erzeugt die statische Anwendung. Babylon.js übernimmt Szene, Materialien, Beleuchtung, Effekte und eine Orbit-Kamera mit Maus- und Touchsteuerung.

Die 3D-Laufzeit liegt außerhalb des React-Renderzyklus und wird beim Verlassen sauber beendet. Szenenaufbau, wiederverwendbare Bauteile, Materialien und Atmosphäreneffekte sind getrennte Module. Die Oberfläche übergibt Änderungen über eine kleine Steuerungsschnittstelle; Kamerabewegungen lösen keine React-Neuberechnung pro Bild aus.

Die Szene nutzt wiederverwendete Geometrien und Materialien. Die Bildschirmauflösung wird begrenzt; eine sparsame Einstellung reduziert Effekte und Auflösung für Mobilgeräte. Während des Ladens erscheint ein verständlicher Status. Bei fehlender WebGL-Unterstützung oder einem Ladefehler erklärt eine Fehlermeldung die Ursache und bietet erneutes Laden an.

## PWA

Ein Manifest mit Namen, Farben und eigenen Icons ermöglicht die Installation auf unterstützten Browsern. Ein Service Worker speichert die Anwendung und ihre lokalen Szenenressourcen nach dem ersten vollständigen Laden für spätere Offline-Aufrufe. Installationsmöglichkeiten werden nur angezeigt, wenn der Browser sie unterstützt. Updates dürfen keine gemischten Versionen von Anwendung und Ressourcen hinterlassen.

## Prüfung und Abnahme

Der Produktionsbuild und die TypeScript-Prüfung müssen erfolgreich sein. Die Szene wird in einem Browser visuell auf Desktop- und Mobilformat geprüft. Getestet werden Drehen, Zoomen, Kamerarücksetzung, Regenumschaltung und Grafikqualität. Es dürfen keine unbehandelten Laufzeitfehler auftreten.

Manifest, Icons und Service-Worker-Registrierung werden geprüft. Nach einem vollständigen ersten Laden wird ein erneuter Aufruf ohne Netzwerk getestet. Die tatsächliche Installierbarkeit bleibt von Browser und sicherem Ursprung abhängig.

## Umfang

Eine Szene, eine Kamera, lokale Einstellungen und PWA-Funktionalität. Kein Benutzerkonto, kein Backend und keine Spiellogik. Die Umsetzung erfolgt im aktuellen Projektordner. Eine Veröffentlichung wird nach erfolgreicher lokaler Prüfung gemäß den verfügbaren Hosting-Möglichkeiten vorbereitet.
