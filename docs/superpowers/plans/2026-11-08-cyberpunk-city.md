# Cyberpunk City Implementation Plan

**Goal:** Deliver the approved interactive cyberpunk React PWA.
**Architecture:** A static Vite/React application owns accessible controls; an isolated Babylon engine owns instanced city geometry, orbit camera and atmosphere. Local assets and a generated service worker provide offline support.
**Tech Stack:** React, TypeScript, Vite, Babylon.js, vite-plugin-pwa.
**Spec:** ../specs/2026-11-08-cyberpunk-city-design.md

## Global constraints

- German UI, original fictional district, no game assets.
- Rotate and zoom with mouse/touch and visible controls.
- Local scene resources, bounded resolution, reduced motion support.
- Production build, desktop/mobile browser checks and offline reload verification.

## Tasks

- [x] Set up `neon-district/package.json`, Vite, TypeScript, React entry point and PWA configuration. Install dependencies and verify TypeScript/build tooling.
- [x] Implement `src/scene/materials.ts`, `city.ts`, `atmosphere.ts`, `createScene.ts`. Use shared geometry instances for windows, architectural trim, equipment and street details. Add emissive signs, reflective road treatments, rain and drifting steam. Expose zoom, reset, preset, rain, orbit, and quality controls through a typed scene controller. Dispose all scene and DOM resources on unmount.
- [x] Implement `src/App.tsx` and `src/styles.css`: full-screen scene, restrained cyan/magenta explorer HUD, camera presets, rain/quality/orbit/fullscreen controls, load/error state and install action. Ensure keyboard focus, touch sizing, responsive layout and reduced motion.
- [x] Create local icons, manifest and generated service worker using `vite-plugin-pwa`. Add README with run/build instructions and asset provenance.
- [x] Build and run production preview. Verify desktop and mobile viewport, zoom/orbit/reset/presets, atmosphere controls, lack of errors, service-worker activation and offline reload. Fix observed issues, then prepare private hosting if supported.

## Verification details

Run `npm run build` (TypeScript then Vite). Browser assertions inspect canvas size, scene-ready status, preset labels and control state after clicks. Camera movement is checked against a read-only runtime diagnostic snapshot. Screenshot QA must show recognizable detailed facades and readable controls at desktop and mobile sizes. Offline test waits for a controlling service worker, reloads with networking disabled and checks scene-ready status.

## Ergebnis

Implementierung und lokale Prüfungen abgeschlossen. Private Veröffentlichung bleibt bis zur ausdrücklichen Zustimmung offen; die automatische Freigabeprüfung hat die Übertragung des Quellcodes blockiert. Siehe `docs/verification.md`.
