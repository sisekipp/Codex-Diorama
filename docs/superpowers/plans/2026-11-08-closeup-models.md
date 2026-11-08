# Close-up model refinement implementation plan

**Goal:** Make the approved foreground subjects convincing at close range in both existing scenes.
**Architecture:** Shared local-frame modeling helpers build profiled hulls, lathed parts, swept cables and material-grouped assemblies. Separate street, aerial and infrastructure factories integrate into the existing scene lifecycles. Detailed geometry is restricted to foreground subjects and uses distance LOD for small parts; existing distant traffic remains lightweight.
**Tech Stack:** React, TypeScript, Babylon.js 8, Vite PWA.
**Spec:** User-approved design in chat: Yoru coupe/motorcycle/workshop; Nox aerocab/dock, train/station section; material and wear refinement, distance simplification.

## Constraints
- Preserve both scenes, weather controls, camera motion, offline operation and reduced motion.
- No people. No external publication. No new dependency or remote asset requirement.
- Use the existing checkout and inline execution. User has authorized implementation.

## Tasks
- [x] Create modelAssembly.ts: reusable profile/lathe/tube/patch helpers, physical vehicle palette and material-group merging with distance LOD.
- [x] Create streetModels.ts: replace the coupe and bike with sculpted body/fender assemblies, exposed mechanics, detailed wheels and actual interior. Retain existing placement and motion through root handles and clones.
- [x] Create harborModels.ts: replace foreground taxi and shuttle; keep distant cars lightweight. Add lift turbines, landing struts, cockpit and access panels.
- [x] Create closeupInfrastructure.ts: workshop lift/tools/frontage, connected terminal docking machinery, train bogies/roof equipment, structural rail fasteners. Refine oversized wear patterns.
- [x] Integrate close-up camera presets and bounded zoom for inspecting authored geometry. Verify desktop and mobile layout.
- [x] Run TypeScript/production build, existing motion/weather tests, and fresh browser checks for both scenes, close-ups, scene switching, weather extremes, low graphics, reduced motion, offline reload and console errors. Save screenshots and record results.

Visual modeling is verified through rendered close-up inspection rather than tests which duplicate geometric constants. Existing behavioral tests cover train and weather state. No commit is available in this folder because it is not a Git checkout.
