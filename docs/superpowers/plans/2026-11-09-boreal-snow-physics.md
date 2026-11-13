# BOREAL Physical Snow Implementation Plan

> Execute inline in this authorized checkout, in dependency order; verify each deliverable before integration.

**Goal:** Make snow a conserved movable material, with connected physical contacts and state-driven shading.
**Architecture:** Deterministic granular layer solver plus ballistic clumps; packed GPU state and local detail mesh; contacts share one surface. WebGL2 rendering remains compatible with the existing PWA.
**Tech Stack:** TypeScript, Babylon.js 8.56, GLSL PBR plugins, node:test.
**Spec:** docs/superpowers/specs/2026-11-09-boreal-snow-physics-design.md

## Global Constraints
No login assets, no publication/automatic commit, preserve all scenes and the clear aircraft approach. Reduced motion stops simulation. Do not describe the reduced solver as a full volumetric MPM solver.

- [x] Pure solver (`snowPhysics.ts`): test kg mass conservation across compaction, blade transfer, avalanches, particles and wind; test density response, bed constraints, closed bounds, timestep safety. Implement `SnowPhysics` with `contact`, `plow`, `step`, `height`, `massBalance` and particle state.
- [x] Rendering (`snowMaterial.ts`, `snowDeformation.ts`, `snowClumps.ts`): encode height/packing/disturbance into RGBA texture, GPU displacement/normal reconstruction, local fine mesh, lit ballistic clumps. Keep bounded buffers and no per-frame full geometry rebuild.
- [x] Integration (`actors.ts`, `tracks.ts`, `vehicleDetails.ts`, `createPolarScene.ts`, `effects.ts`, `terrain.ts`): swept blade contacts, lower articulated blade to its real cut plane, contact-height vehicle suspension, aircraft ground alignment, weather input, contact-driven powder, remove painted track rectangles.
- [x] Verification: existing tests plus solver properties, TypeScript/build, browser shader/position/mass audit, visual closeups, emulated mobile/offline and reduced-motion checks. Record measured performance and solver limits in docs/verification.md.
