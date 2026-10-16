import "./style.css";
import { worlds, dossierMarkup } from "./portfolio.js";
const id = document.body.dataset.world;
const world = worlds.find((w) => w.id === id) || worlds[0];
document.title = `${world.name} — Orbit / Jaimin Patel`;
document.body.innerHTML = `<a class="page-back" href="../index.html">← Return to the universe</a><main class="dossier">${dossierMarkup(world)}</main>`;
