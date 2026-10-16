# Orbit — Jaimin Patel

A playable companion to [jaimin-patel.me](https://www.jaimin-patel.me/). Fly a lightweight spacecraft through a small solar system, discover three portfolio destinations, and recover six navigation signals. Visitors can take guided flights or open content instantly.

This directory is also the editable Orbit source embedded in `personalweb`: run `bun run build` from the portfolio root to build and package both sites together. For detailed install, deployment, and navigation instructions, see [INTEGRATION.md](INTEGRATION.md).

## Run locally

Requires Node.js 20.19+ or 22+ and npm.

```sh
npm ci
npm run dev
```

Open the address printed by Vite, normally http://127.0.0.1:5173/.

```sh
npm run build
npm start
```

The production build is in `dist/`. All three standalone destination pages are included. Assets use relative URLs, so the build can be hosted in a subdirectory. Serve it through HTTP; do not open `index.html` with `file://`.

## Play

- **W / S** or **↑ / ↓**: forward / reverse thrust.
- **A / D** or **← / →**: steer.
- **Space / C**: ascend / descend.
- **Shift**: boost while thrusting.
- **Drag the scene**: change heading and pitch.
- **F**: explore the nearest world when in range.
- **R**: return to launch position.
- **Escape**: close an open panel.

On small screens, use the touch controls after launch. Select a named destination for guided flight; use its ↗ button to read immediately. Discover all three worlds and collect the six gold signal buoys near them. Progress and preferences are saved only in this browser's local storage. No account is required. Reset progress through Graphics settings.

## Worlds

- **Origin**: background, education, and current focus.
- **Workshop**: Polarline Markets / Scout, Finny, and research / open-source work.
- **Relay**: calendar, LinkedIn, and GitHub links.

`portfolio.js` is the shared source of content for in-game panels and `planets/*.html`. External project and contact links open separately. The main portfolio links to the compiled game under `/game/index.html`.

## Rendering and performance

- Procedural planet textures generated locally once at startup (768 × 384); no remote textures, font services, or model downloads.
- Lightweight original craft assembled from primitives. The legacy 28 MB GLB and large textures remain in the repository but are not imported or copied into the build.
- Shared planet geometry, one star point cloud, no realtime shadows or fullscreen postprocessing.
- Pixel ratio capped at 1.6 in Auto, 2 in High, and 1 in Low. Auto reduces rendering resolution if sustained animation pacing falls below its threshold.
- Time-based flight acceleration, drag, steering, camera smoothing, bounded simulation delta, and soft surface collisions.
- Rendering and simulation pause while a panel is open or the tab is hidden. HUD updates are throttled separately.
- Reduced motion disables camera banking, sun/planet animation, and signal spinning. It respects the initial system preference.
- A WebGL failure shows standalone destination links. Graphics quality can be changed in settings.

Performance varies by GPU, display resolution, and browser. Auto quality reduces load; it cannot guarantee a fixed frame rate on every device.

## Source map

- `main.js`: scene, procedural assets, flight, navigation, collectibles, progress, settings.
- `style.css`: responsive interface and standalone content pages.
- `portfolio.js`: portfolio copy and dossier markup.
- `page.js`, `planets/*.html`: standalone versions of each world.
- `vite.config.js`: multi-page production build and vendor chunk.

## Original issues addressed

Frame-dependent movement, disconnected vertical controls, incorrect world-coordinate arrival checks, a broken Projects route, empty Projects / Contact pages, unbounded device pixel ratio, unnecessary model / texture downloads, missing onboarding and mobile controls, and automatic page redirects without confirmation from the player.

## Challenges and landing

Open Challenges for Signal sprint (3 signals in 60 seconds) or Planet hopper (land on 3 worlds in 90 seconds). Timers pause in reading and settings panels. World-entry arrows and nearby-world docking run the visible landing-pad descent before revealing the destination. Reduced motion shortens the sequence.

Solar hazard: entering the sun’s 38-unit danger radius destroys the ship, plays a short burst, ends the active challenge, and resets flight. Discovery progress is preserved. Reduced motion uses a quiet fade instead of particles.

## Playable surfaces and HD assets

Landing now leads into a separate human-scale surface scene. The astronaut walks out of the ship, explores three field-note beacons, and reads world-specific portfolio text during play. WASD / arrows move, Shift runs, and touch buttons support phones. Exit planet returns to the saved orbital flight position; a dossier button keeps all links accessible. Origin has grass and trees, Workshop a rocky fictional outpost, and Relay ice crystals. These are stylized environments, not astronomical surface simulations.

Origin uses the repository's Earth map optimized to 4096×2048; Relay uses an optimized 2048×1024 ice map. Workshop's 2048×1024 bands are generated in a background worker. Low-resolution placeholders keep the first frame available while HD resources arrive. Sun detail is procedural. Space distances remain compressed for playability; surface scenes establish a readable person/ship scale.

Signal collection uses a 14-unit swept pickup radius so boost cannot skip a signal between simulation frames. Rings face the camera; Find signal guides the ship to the nearest available pickup. Distance and altitude guidance explain why an aligned marker may still be far away. Run `node --test tests/pickups.test.js` for the pickup boundary and fly-through checks.

## Short surface visit and chase camera

Enter spaceship returns to orbit from person mode. The three notes form a short path beside the ship (a few seconds of walking). W/S walk forward/back; A/D turn the character and following camera. Drag on the scene to orbit the camera and adjust its pitch.

World entry is a 2.5-second approach toward the planetary horizon, framing both craft and globe, followed by the local surface scene (0.8 seconds with reduced motion). It no longer places a giant landing pad onto the space globe. Planet radii and orbital positions are enlarged, the sun is enlarged, and the orbit craft is much smaller. These remain cinematic proportions, not literal astronomical units.

## Current planet displays

Surfaces now use custom 3D hologram destinations rather than collectible checkpoints. Relay has calendar, LinkedIn, and GitHub projections. Workshop has Scout, Finny, and Research. Origin has About Jaimin, Waterloo, and Résumé. Walk closer or use the destination buttons to view details, then explicitly open a link. Enter spaceship is the sole on-screen return action.

The projections use SVG-derived extruded meshes / tubes, additive translucent shaders, scan bands, luminous edges, and upward projector beams. Reduced motion freezes the scanning and bobbing. Earth scenery uses instanced branches, textured foliage, grass, grain-textured ground, and smoother deformed rocks. These are procedural game environments.

Tabler icon assets are MIT licensed; the full notice ships in public/THIRD_PARTY_NOTICES.txt and the production output.
