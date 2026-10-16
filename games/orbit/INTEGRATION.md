## Orbit in personalweb

All Orbit source, textures, SVG icons, Web Worker code, standalone planet pages, and third-party notices live in `games/orbit/`. There is no dependency on the original `space` repository. The portfolio is SvelteKit/TypeScript; Orbit uses Three.js/browser JavaScript. Both compile with Vite, so a rewrite or separate game server is unnecessary.

Use Node 22.14.0 (`../../.nvmrc`), Bun 1.3.5, and npm. From the **personalweb root**:

```sh
bun install --frozen-lockfile
bun run build
PORT=3000 node build
```

The root `build` script explicitly invokes `build:game` before SvelteKit's `vite build`. That command installs exactly the dependencies in this directory's `package-lock.json` using `npm ci`, builds the game into `games/orbit/dist/`, and runs `scripts/sync-orbit.mjs` to replace `static/game/` with the new build. The resulting adapter-node output serves `/` and `/game/index.html` (plus `/game/planets/about.html`, `/game/planets/projects.html`, `/game/planets/contact.html`) as **one application**. All game script, stylesheet, texture, and emitted worker URLs are relative to the game page, enabling hosting under `/game/`.

The generated `dist/` and `static/game/` directories are gitignored. For a fresh checkout, the root build creates them automatically. To preview the game while running the SvelteKit dev server, run `bun run build:game` before `bun run dev` and after each game edit. For standalone Orbit HMR, run `npm ci && npm run dev` inside this directory.

Deploy to a Node server with npm and Bun available at build time. Use `bun install --frozen-lockfile && bun run build` for the build, `node build` for start, and set `PORT` and optional `HOST` for your host. Do not configure a rewrite that catches `/game/*` and sends it to the portfolio HTML route. No separate game service, secrets, or database are needed. Orbit progress and settings live in browser localStorage.

The Game navbar link uses a full document navigation, giving the game its own canvas, styling, renderer, and input lifecycle. The text portfolio does not download Three.js. In the embedded game the topbar Home/Text version links lead back to `/`; on its standalone dev server they lead to the public portfolio domain. No public deployment is performed as part of the local build.
