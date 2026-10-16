import * as THREE from "three";
import { SurfaceWorld } from "./surface.js";
import { inPickupRange } from "./pickups.js";
import "./style.css";
import { worlds, dossierMarkup } from "./portfolio.js";

for (const world of worlds) {
  world.position = world.position.map((v) => v * 3);
  world.radius *= 3;
}
const $ = (id) => document.getElementById(id);
document
  .querySelectorAll("[data-home]")
  .forEach(
    (a) =>
      (a.href = location.pathname.startsWith("/game/")
        ? "/"
        : "https://www.jaimin-patel.me/"),
  );
const storage = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(`orbit:${key}`)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`orbit:${key}`, JSON.stringify(value));
    } catch {
      /* Private browsing can disable persistence. */
    }
  },
};
const discovered = new Set(
  storage.get("worlds", []).filter((id) => worlds.some((w) => w.id === id)),
);
const recovered = new Set(
  storage
    .get("signals", [])
    .filter((id) => Number.isInteger(id) && id >= 0 && id < 6),
);
let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas: $("space-scene"),
    antialias: false,
    powerPreference: "high-performance",
  });
} catch {
  $("fallback").hidden = false;
  throw new Error(
    "WebGL rendering unavailable; destination links are available in the fallback.",
  );
}
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
const scene = new THREE.Scene();
scene.background = new THREE.Color("#050a12");
scene.fog = new THREE.FogExp2("#050a12", 0.00032);
const camera = new THREE.PerspectiveCamera(
  58,
  innerWidth / innerHeight,
  0.25,
  2600,
);
const clock = new THREE.Clock();
const sunPosition = new THREE.Vector3(-35, 5, -210);
const state = {
  launched: false,
  autopilot: null,
  near: null,
  yaw: 0,
  pitch: 0,
  sensitivity: Number(storage.get("sensitivity", 1)),
  reduced: storage.get(
    "reduced",
    matchMedia("(prefers-reduced-motion: reduce)").matches,
  ),
  quality: storage.get("quality", "auto"),
};
const keys = new Set();
const held = new Set();
const position = new THREE.Vector3(0, 10, 110);
const velocity = new THREE.Vector3();
const forward = new THREE.Vector3(),
  desired = new THREE.Vector3(),
  cameraTarget = new THREE.Vector3(),
  lookTarget = new THREE.Vector3(),
  temp = new THREE.Vector3(),
  projected = new THREE.Vector3();
let landing = null,
  challenge = null,
  explosion = null;
let toastTimer,
  routeWaypoint = null,
  hudElapsed = 0,
  qualityElapsed = 0,
  qualityFrames = 0,
  autoRatio = Math.min(devicePixelRatio, 1.6),
  paused = false,
  visible = !document.hidden;
function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("visible"), 4500);
}
function updateProgress() {
  $("progress").textContent = `${discovered.size} / 3 worlds`;
  $("progress-bar").style.width = `${(discovered.size / 3) * 100}%`;
  $("signals").textContent = `${recovered.size} / 6 signals recovered`;
  document
    .querySelectorAll(".destination")
    .forEach((el) =>
      el.classList.toggle("visited", discovered.has(el.dataset.world)),
    );
}
$("destination-list").innerHTML = worlds
  .map(
    (w) =>
      `<div class="destination" data-world="${w.id}"><span class="world-dot" style="--world-color:${w.color}"></span><button data-course="${w.id}" aria-label="Fly to ${w.name}"><strong>${w.name}</strong><small>${w.category}</small></button><button class="instant" data-open="${w.id}" aria-label="Land on ${w.name}">↗</button></div>`,
  )
  .join("");
$("map-worlds").innerHTML = worlds
  .map(
    (w) =>
      `<circle cx="${90 + w.position[0] * 0.4}" cy="${70 + (w.position[2] + 210) * 0.2}" r="3" fill="${w.color}"/>`,
  )
  .join("");
updateProgress();

// Seeded, local procedural textures: no network requests or heavy model downloads.
function random(seed = 3471) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
}
const rand = random();
function hash(x, y, z) {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return n - Math.floor(n);
}
function noise(x, y, z) {
  const a = Math.floor(x),
    b = Math.floor(y),
    c = Math.floor(z);
  let u = x - a,
    v = y - b,
    w = z - c;
  u = u * u * (3 - 2 * u);
  v = v * v * (3 - 2 * v);
  w = w * w * (3 - 2 * w);
  const mix = (a, b, t) => a + (b - a) * t;
  return mix(
    mix(
      mix(hash(a, b, c), hash(a + 1, b, c), u),
      mix(hash(a, b + 1, c), hash(a + 1, b + 1, c), u),
      v,
    ),
    mix(
      mix(hash(a, b, c + 1), hash(a + 1, b, c + 1), u),
      mix(hash(a, b + 1, c + 1), hash(a + 1, b + 1, c + 1), u),
      v,
    ),
    w,
  );
}
function fbm(x, y, z) {
  return (
    noise(x, y, z) * 0.57 +
    noise(x * 2, y * 2, z * 2) * 0.28 +
    noise(x * 4, y * 4, z * 4) * 0.15
  );
}
function planetTexture(type) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) {
    const lat = (y / canvas.height) * Math.PI;
    for (let x = 0; x < canvas.width; x++) {
      const lon = (x / canvas.width) * Math.PI * 2;
      const nx = Math.sin(lat) * Math.cos(lon),
        ny = Math.cos(lat),
        nz = Math.sin(lat) * Math.sin(lon);
      const n = fbm(nx * 3 + 8, ny * 3 + 8, nz * 3 + 8);
      let r, g, b;
      if (type === "earth") {
        const land = n > 0.51;
        const ice = Math.abs(ny) > 0.88 + n * 0.1;
        const cloud = fbm(nx * 7 + 20, ny * 7, nz * 7) > 0.64;
        r = ice ? 190 : land ? 47 + n * 55 : 14 + n * 12;
        g = ice ? 207 : land ? 70 + n * 70 : 47 + n * 37;
        b = ice ? 208 : land ? 51 + n * 45 : 79 + n * 65;
        if (cloud) {
          r = r * 0.4 + 135;
          g = g * 0.4 + 142;
          b = b * 0.4 + 150;
        }
      } else if (type === "gas") {
        const band = Math.sin(ny * 42 + n * 6) * 0.5 + 0.5;
        r = 133 + band * 60 + n * 35;
        g = 95 + band * 47 + n * 20;
        b = 67 + band * 35 + n * 10;
        const storm = Math.exp(
          -(
            (nx - 0.5) ** 2 * 100 +
            (ny + 0.2) ** 2 * 220 +
            (nz - 0.8) ** 2 * 90
          ),
        );
        r += storm * 40;
        g -= storm * 30;
      } else {
        const cracks = Math.sin((n + ny * 0.1) * 70);
        r = 91 + n * 74;
        g = 112 + n * 80;
        b = 152 + n * 85;
        if (cracks > 0.91) {
          r *= 0.67;
          g *= 0.74;
          b *= 0.8;
        }
      }
      const i = (y * canvas.width + x) * 4;
      image.data[i] = r;
      image.data[i + 1] = g;
      image.data[i + 2] = b;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,234,190,1)");
  grad.addColorStop(0.12, "rgba(255,173,66,.65)");
  grad.addColorStop(0.35, "rgba(255,108,24,.16)");
  grad.addColorStop(1, "rgba(255,71,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
const glow = glowTexture();
scene.add(new THREE.HemisphereLight("#a5bddb", "#171320", 1.35));
const sunlight = new THREE.PointLight("#ffe3bb", 9500, 1400, 1.45);
sunlight.position.copy(sunPosition);
scene.add(sunlight);
const fill = new THREE.DirectionalLight("#a6c9f4", 1.6);
fill.position.set(80, 100, 120);
scene.add(fill);
const sunUniforms = { time: { value: 0 } };
const sunMaterial = new THREE.ShaderMaterial({
  uniforms: sunUniforms,
  vertexShader: `varying vec3 vP; varying vec3 vN; void main(){vP=position;vN=normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader: `varying vec3 vP;varying vec3 vN;uniform float time;float h(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}void main(){vec3 p=normalize(vP);float t=n(p*22.+vec3(time*.08));float cell=n(p*120.+t*2.);float dark=n(p*8.+time*.015);vec3 c=mix(vec3(.9,.16,.025),vec3(1.,.78,.23),t*.35+cell*.65);c*=.75+smoothstep(.22,.48,dark)*.5;gl_FragColor=vec4(c*1.45,1.);}`,
});
const sun = new THREE.Mesh(new THREE.SphereGeometry(90, 64, 48), sunMaterial);
sun.position.copy(sunPosition);
scene.add(sun);
const corona = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: glow,
    color: "#ffbd73",
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
);
corona.position.copy(sunPosition);
corona.scale.set(660, 660, 1);
scene.add(corona);
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(2400 * 3),
  starColors = new Float32Array(2400 * 3);
const starColor = new THREE.Color();
for (let i = 0; i < 2400; i++) {
  const a = rand() * Math.PI * 2,
    z = rand() * 2 - 1,
    r = 900 + rand() * 800,
    s = Math.sqrt(1 - z * z);
  starPositions.set([Math.cos(a) * s * r, z * r, Math.sin(a) * s * r], i * 3);
  starColor.setHSL(
    0.52 + rand() * 0.13,
    0.08 + rand() * 0.3,
    0.35 + rand() * 0.5,
  );
  starColors.set([starColor.r, starColor.g, starColor.b], i * 3);
}
starGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(starPositions, 3),
);
starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
const stars = new THREE.Points(
  starGeometry,
  new THREE.PointsMaterial({
    size: 1.5,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  }),
);
scene.add(stars);
// Low-cost atmospheric limb glow, with no fullscreen postprocessing passes.
const atmosphereMaterial = new THREE.ShaderMaterial({
  transparent: true,
  side: THREE.BackSide,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: { tint: { value: new THREE.Color("#72b5e4") } },
  vertexShader: `varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,
  fragmentShader: `varying vec3 n;varying vec3 v;uniform vec3 tint;void main(){float f=pow(max(0.,1.+dot(normalize(n),normalize(v))),3.);gl_FragColor=vec4(tint,f*.48);}`,
});
const planetGeometry = new THREE.SphereGeometry(1, 96, 64);
const bodies = worlds.map((w) => {
  const group = new THREE.Group();
  group.position.fromArray(w.position);
  group.rotation.z = w.id === "projects" ? 0.3 : 0.12;
  const mesh = new THREE.Mesh(
    planetGeometry,
    new THREE.MeshStandardMaterial({
      map: planetTexture(w.type),
      roughness: 0.94,
      metalness: 0,
    }),
  );
  mesh.scale.setScalar(w.radius);
  group.add(mesh);
  const material = atmosphereMaterial.clone();
  material.uniforms.tint.value = new THREE.Color(w.color);
  const atmosphere = new THREE.Mesh(planetGeometry, material);
  atmosphere.scale.setScalar(w.radius * 1.045);
  group.add(atmosphere);
  if (w.type === "gas") {
    const geometry = new THREE.RingGeometry(w.radius * 1.35, w.radius * 2, 100);
    const material = new THREE.MeshBasicMaterial({
      color: "#bfa98c",
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    for (const scale of [1.5, 1.68, 1.87]) {
      const fine = new THREE.Mesh(
        new THREE.RingGeometry(
          w.radius * scale,
          w.radius * (scale + 0.016),
          100,
        ),
        new THREE.MeshBasicMaterial({
          color: "#e4c9a0",
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.4,
          depthWrite: false,
        }),
      );
      fine.rotation.x = Math.PI / 2;
      group.add(fine);
    }
  }
  scene.add(group);
  const orbit = [];
  for (let i = 0; i <= 160; i++) {
    const a = (i / 160) * Math.PI * 2;
    const r = group.position.distanceTo(sunPosition);
    orbit.push(
      new THREE.Vector3(
        sunPosition.x + Math.cos(a) * r,
        w.position[1] - w.radius - 3,
        sunPosition.z + Math.sin(a) * r,
      ),
    );
  }
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(orbit),
    new THREE.LineBasicMaterial({
      color: w.color,
      transparent: true,
      opacity: 0.065,
    }),
  );
  scene.add(line);
  return { ...w, group, mesh, position: group.position };
});
const hdImages = {
  earth: new URL("./assets/earth-hd.jpg", import.meta.url).href,
  ice: new URL("./assets/ice-hd.jpg", import.meta.url).href,
};
for (const [type, url] of Object.entries(hdImages)) {
  new THREE.TextureLoader().load(
    url,
    (map) => {
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      const body = bodies.find((b) => b.type === type);
      body.mesh.material.map.dispose();
      body.mesh.material.map = map;
      body.mesh.material.needsUpdate = true;
      renderer.domElement.dataset["texture" + type] =
        `${map.image.width}×${map.image.height}`;
    },
    undefined,
    () => {},
  );
}
// Upgrade local textures asynchronously; flight never waits for the high-resolution pass.
if (typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined") {
  const textureWorker = new Worker(
    new URL("./texture-worker.js", import.meta.url),
    { type: "module" },
  );
  textureWorker.onmessage = ({ data }) => {
    if (data.image) {
      const body = bodies.find((b) => b.type === data.type);
      const map = new THREE.Texture(data.image);
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      map.needsUpdate = true;
      renderer.domElement.dataset.textureResolution = `${data.image.width}×${data.image.height}`;
      body.mesh.material.map.dispose();
      body.mesh.material.map = map;
      body.mesh.material.needsUpdate = true;
    }
    if (data.type === "gas" || data.error) textureWorker.terminate();
  };
  textureWorker.postMessage({});
}
// A compact reconnaissance craft: shaped fuselage, swept wings, and twin nacelles.
const ship = new THREE.Group();
const hullMaterial = new THREE.MeshStandardMaterial({
  color: "#929da6",
  metalness: 0.78,
  roughness: 0.34,
});
const darkMaterial = new THREE.MeshStandardMaterial({
  color: "#17232f",
  metalness: 0.7,
  roughness: 0.35,
});
const trimMaterial = new THREE.MeshStandardMaterial({
  color: "#ed9c48",
  metalness: 0.55,
  roughness: 0.36,
});
function part(geometry, material, x, y, z, rx = 0) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.rotation.x = rx;
  ship.add(mesh);
  return mesh;
}
const profile = [
  [0, -3.9],
  [0.18, -3.5],
  [0.58, -2],
  [0.76, -0.4],
  [0.68, 1.4],
  [0.45, 2.4],
  [0, 2.55],
].map(([x, y]) => new THREE.Vector2(x, y));
part(new THREE.LatheGeometry(profile, 16), hullMaterial, 0, 0, 0, Math.PI / 2);
const canopy = part(
  new THREE.SphereGeometry(0.63, 20, 12),
  new THREE.MeshStandardMaterial({
    color: "#185a72",
    emissive: "#0e3548",
    emissiveIntensity: 0.7,
    metalness: 0.85,
    roughness: 0.16,
  }),
  0,
  0.52,
  -1.5,
);
canopy.scale.set(0.7, 0.48, 1.8);
const wing = new THREE.Shape();
wing.moveTo(0.35, -1.6);
wing.lineTo(4.3, 2.2);
wing.lineTo(4.1, 2.75);
wing.lineTo(1.1, 1.8);
wing.lineTo(0.35, 2.2);
wing.closePath();
const wingGeometry = new THREE.ExtrudeGeometry(wing, {
  depth: 0.16,
  bevelEnabled: true,
  bevelSegments: 1,
  steps: 1,
  bevelSize: 0.05,
  bevelThickness: 0.04,
});
for (const side of [-1, 1]) {
  const w = part(wingGeometry, hullMaterial, 0, -0.13, 0, Math.PI / 2);
  w.scale.x = side;
  const stripe = part(
    new THREE.BoxGeometry(0.13, 0.08, 1.8),
    trimMaterial,
    side * 2.3,
    0.03,
    1.2,
  );
  stripe.rotation.y = side * -0.7;
  const fin = part(
    new THREE.BoxGeometry(0.1, 1.3, 1.5),
    darkMaterial,
    side * 1.35,
    0.65,
    1.7,
  );
  fin.rotation.z = side * -0.35;
  part(
    new THREE.CylinderGeometry(0.43, 0.5, 2.8, 16),
    darkMaterial,
    side * 1.35,
    -0.05,
    1.25,
    Math.PI / 2,
  );
  part(
    new THREE.TorusGeometry(0.34, 0.085, 6, 20),
    trimMaterial,
    side * 1.35,
    -0.05,
    2.69,
  );
}
const engines = [];
for (const x of [-1.35, 1.35]) {
  const e = part(
    new THREE.ConeGeometry(0.3, 2.5, 12),
    new THREE.MeshBasicMaterial({
      color: "#8ae6ff",
      transparent: true,
      opacity: 0.8,
    }),
    x,
    -0.05,
    3.65,
    -Math.PI / 2,
  );
  engines.push(e);
  const light = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glow,
      color: "#56bfff",
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  );
  light.scale.set(1.6, 1.6, 1);
  light.position.set(x, -0.05, 2.8);
  ship.add(light);
}
ship.scale.setScalar(0.25);
scene.add(ship);
const landingPad = new THREE.Group();
const pad = new THREE.Mesh(
  new THREE.CylinderGeometry(7, 7, 0.3, 48),
  new THREE.MeshStandardMaterial({
    color: "#17252f",
    metalness: 0.65,
    roughness: 0.5,
  }),
);
landingPad.add(pad);
const padRing = new THREE.Mesh(
  new THREE.TorusGeometry(5.7, 0.12, 8, 64),
  new THREE.MeshBasicMaterial({ color: "#77dcdf" }),
);
padRing.rotation.x = Math.PI / 2;
padRing.position.y = 0.2;
landingPad.add(padRing);
for (let i = 0; i < 8; i++) {
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 6),
    new THREE.MeshBasicMaterial({ color: "#ffcb7b" }),
  );
  lamp.position.set(
    Math.cos((i * Math.PI) / 4) * 6.4,
    0.5,
    Math.sin((i * Math.PI) / 4) * 6.4,
  );
  landingPad.add(lamp);
}
landingPad.visible = false;
scene.add(landingPad);
const signalGeometry = new THREE.OctahedronGeometry(2);
const signalMaterial = new THREE.MeshStandardMaterial({
  color: "#f4c97d",
  emissive: "#d88d2d",
  emissiveIntensity: 1.4,
  metalness: 0.4,
  roughness: 0.3,
});
const signals = [];
bodies.forEach((body, i) => {
  for (let j = 0; j < 2; j++) {
    const id = i * 2 + j;
    const mesh = new THREE.Mesh(signalGeometry, signalMaterial);
    mesh.position
      .copy(body.position)
      .add(new THREE.Vector3(j ? 25 : -25, body.radius + 12, j ? 30 : 55));
    mesh.visible = !recovered.has(id);
    scene.add(mesh);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(5, 0.14, 8, 48),
      new THREE.MeshBasicMaterial({
        color: "#eec379",
        transparent: true,
        opacity: 0.6,
      }),
    );
    ring.position.copy(mesh.position);
    ring.visible = mesh.visible;
    scene.add(ring);
    signals.push({ id, mesh, ring });
  }
});

const surfaceWorld = new SurfaceWorld({
  renderer,
  ship,
  worlds,
  onExit: () => {
    keys.clear();
    held.clear();
    velocity.set(0, 0, 0);
    toast("Back in orbit. Choose another world.");
    updateHUD();
  },
  onDiscover: openWorld,
});
function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  applyQuality();
}
function applyQuality() {
  const ratio =
    state.quality === "low"
      ? Math.min(devicePixelRatio, 1)
      : state.quality === "high"
        ? Math.min(devicePixelRatio, 2)
        : autoRatio;
  renderer.setPixelRatio(ratio);
  $("quality-label").textContent = `${state.quality.toUpperCase()} QUALITY`;
  stars.material.size = state.quality === "low" ? 1.8 : 1.5;
}
$("quality").value = state.quality;
$("sensitivity").value = state.sensitivity;
$("reduced-motion").checked = state.reduced;
$("quality").addEventListener("change", (e) => {
  state.quality = e.target.value;
  storage.set("quality", state.quality);
  applyQuality();
});
$("sensitivity").addEventListener("input", (e) => {
  state.sensitivity = Number(e.target.value);
  storage.set("sensitivity", state.sensitivity);
});
$("reduced-motion").addEventListener("change", (e) => {
  state.reduced = e.target.checked;
  storage.set("reduced", state.reduced);
});
let previousFocus;
function showDialog(dialog) {
  previousFocus = document.activeElement;
  keys.clear();
  held.clear();
  paused = true;
  dialog.showModal();
}
for (const dialog of document.querySelectorAll("dialog")) {
  dialog.querySelector("[data-close]").onclick = () => dialog.close();
  dialog.addEventListener("close", () => {
    paused = false;
    clock.getDelta();
    previousFocus?.focus();
  });
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        dialog.close();
    }
  });
}
$("help-button").onclick = () => {
  if (!explosion) showDialog($("help"));
};
$("settings-button").onclick = () => showDialog($("settings"));
$("challenges-button").onclick = () => showDialog($("challenges"));
function finishChallenge(won) {
  const name = challenge.type === "signals" ? "Signal sprint" : "Planet hopper";
  challenge = null;
  $("challenge-status").hidden = true;
  toast(
    won
      ? name + " complete. Nicely flown!"
      : name + " ended. Choose Challenges to try again.",
  );
  signals.forEach(
    (s) => (s.mesh.visible = s.ring.visible = !recovered.has(s.id)),
  );
}
function checkChallenge() {
  if (challenge && challenge.hits.size >= 3) finishChallenge(true);
}
for (const button of document.querySelectorAll("[data-challenge]"))
  button.onclick = () => {
    const type = button.dataset.challenge;
    $("challenges").close();
    launch();
    challenge = { type, time: type === "signals" ? 60 : 90, hits: new Set() };
    $("challenge-status").hidden = false;
    if (type === "signals")
      signals.forEach((s) => (s.mesh.visible = s.ring.visible = true));
    toast(
      type === "signals"
        ? "Recover 3 gold signals in 60 seconds. Follow the gold rings."
        : "Land on all 3 worlds in 90 seconds. Choose a world to begin.",
    );
  };
$("end-challenge").onclick = () => finishChallenge(false);
function beginLanding(id) {
  clearTimeout(toastTimer);
  $("toast").classList.remove("visible");
  const body = bodies.find((w) => w.id === id);
  if (!body || landing || paused || explosion || surfaceWorld.active) return;
  launch();
  state.autopilot = null;
  keys.clear();
  held.clear();
  velocity.set(0, 0, 0);
  const original = position.clone(),
    originalCamera = camera.position.clone();
  const normal = position.clone().sub(body.position).normalize();
  if (normal.lengthSq() < 0.1) normal.set(0, 0.2, 1);
  normal.y = Math.max(normal.y, 0.15);
  normal.normalize();
  const tangent = new THREE.Vector3()
    .crossVectors(new THREE.Vector3(0, 1, 0), normal)
    .normalize();
  const right = new THREE.Vector3().crossVectors(normal, tangent).normalize();
  const start =
    original.distanceTo(body.position) < body.radius * 5
      ? original.clone()
      : body.position
          .clone()
          .addScaledVector(normal, body.radius * 3.4)
          .addScaledVector(right, body.radius * 0.5);
  const end = body.position
    .clone()
    .addScaledVector(normal, body.radius * 1.12)
    .addScaledVector(tangent, body.radius * 0.2);
  landingPad.visible = false;
  landing = {
    id,
    body,
    time: 0,
    duration: state.reduced ? 0.8 : 2.5,
    tangent,
    right,
    start,
    end,
    original,
    originalCamera,
    normal,
  };
  ship.scale.setScalar(0.38);
  camera.fov = 64;
  camera.updateProjectionMatrix();
  camera.position
    .copy(start)
    .addScaledVector(normal, 12)
    .addScaledVector(right, 10);
  document.body.classList.add("landing");
  $("landing-name").textContent = body.name;
  $("landing-sequence").hidden = false;
}
function animateLanding(dt) {
  const l = landing;
  if (!l) return;
  l.time += dt;
  const t = Math.min(1, l.time / l.duration),
    ease = t * t * (3 - 2 * t);
  position.lerpVectors(l.start, l.end, ease);
  ship.position.copy(position);
  const heading = l.body.position.clone().sub(position).normalize();
  ship.rotation.set(
    Math.asin(heading.y),
    Math.atan2(-heading.x, -heading.z),
    0,
    "YXZ",
  );
  temp
    .copy(position)
    .addScaledVector(l.normal, 8)
    .addScaledVector(l.right, 7)
    .addScaledVector(l.tangent, 2);
  camera.position.lerp(temp, 1 - Math.exp(-dt * 4));
  const composition = position.clone().lerp(l.body.position, 0.08);
  camera.lookAt(composition);
  engines.forEach((e) => {
    e.visible = true;
    e.scale.y = 0.35 + (1 - t) * 0.6;
  });
  $("landing-phase").textContent =
    t < 0.35
      ? "Setting course for the planet"
      : t < 0.75
        ? "Cruising toward the horizon"
        : "Entering " + l.body.name;
  $("landing-sequence").style.setProperty("--landing-progress", t);
  $("landing-fill").style.width = `${t * 100}%`;
  if (t === 1) {
    const id = l.id;
    position.copy(l.original);
    camera.position.copy(l.originalCamera);
    landing = null;
    ship.scale.setScalar(0.25);
    camera.fov = 58;
    camera.updateProjectionMatrix();
    landingPad.visible = false;
    if (challenge?.type === "landing") {
      challenge.hits.add(id);
      checkChallenge();
    }
    document.body.classList.remove("landing");
    $("landing-sequence").hidden = true;
    const world = worlds.find((w) => w.id === id);
    discovered.add(id);
    storage.set("worlds", [...discovered]);
    updateProgress();
    surfaceWorld.enter(world, state.reduced);
  }
}
function openWorld(id) {
  const world = worlds.find((w) => w.id === id);
  if (!world) return;
  $("dossier-content").innerHTML = dossierMarkup(world);
  if (!discovered.has(id)) {
    discovered.add(id);
    storage.set("worlds", [...discovered]);
    updateProgress();
    toast(
      discovered.size === 3
        ? "All three worlds discovered. There’s more beyond this orbit."
        : "Discovery logged · " + world.name,
    );
  }
  state.autopilot = null;
  showDialog($("dossier"));
  updateHUD();
}
function launch() {
  if (state.launched) return;
  state.launched = true;
  $("intro").hidden = true;
  $("flight-status").hidden = false;
  $("reticle").hidden = false;
  document.body.classList.add("launched");
  toast("Flight controls active · W / S thrust · Space / C up & down");
}
$("launch").onclick = launch;
function setCourse(id) {
  if (explosion || landing) return;
  launch();
  const body =
    bodies.find((b) => b.id === id) ||
    signals
      .filter((s) => s.mesh.visible)
      .map((s) => ({
        id: `signal-${s.id}`,
        name: "Navigation signal",
        subtitle: "Fly through the gold ring to collect it.",
        position: s.mesh.position,
        radius: 0,
        signal: true,
      }))
      .find((s) => s.id === id);
  if (!body) return;
  state.autopilot = body;
  routeWaypoint = null;
  desired
    .copy(body.position)
    .add(
      new THREE.Vector3(
        0,
        body.signal ? 0 : body.radius * 0.45,
        body.signal ? 0 : body.radius + 25,
      ),
    );
  temp.copy(desired).sub(position);
  const routeLength = temp.lengthSq();
  const routeT = routeLength
    ? THREE.MathUtils.clamp(
        new THREE.Vector3().subVectors(sunPosition, position).dot(temp) /
          routeLength,
        0,
        1,
      )
    : 0;
  const closest = position.clone().addScaledVector(temp, routeT);
  if (closest.distanceTo(sunPosition) < 160)
    routeWaypoint = sunPosition.clone().add(new THREE.Vector3(0, 230, 30));
  keys.clear();
  held.clear();
  toast("Guided flight to " + body.name + " · steer to take control");
  updateHUD();
}
$("destination-list").addEventListener("click", (e) => {
  const course = e.target.closest("[data-course]");
  const open = e.target.closest("[data-open]");
  if (course) setCourse(course.dataset.course);
  if (open) beginLanding(open.dataset.open);
});
$("cancel-course").onclick = () => {
  state.autopilot = null;
  toast("Manual control restored");
  updateHUD();
};
$("dock").onclick = () => {
  if (state.near) beginLanding(state.near.id);
};
function reset() {
  position.set(0, 10, 110);
  velocity.set(0, 0, 0);
  state.yaw = 0;
  state.pitch = 0;
  state.autopilot = null;
  camera.position.set(0, 20, 146);
  keys.clear();
  held.clear();
  toast("Ship returned to launch point");
  updateHUD();
}
$("reset").onclick = reset;
$("clear-progress").onclick = () => {
  discovered.clear();
  recovered.clear();
  storage.set("worlds", []);
  storage.set("signals", []);
  signals.forEach((s) => {
    s.mesh.visible = true;
    s.ring.visible = true;
  });
  updateProgress();
  toast("Exploration log cleared");
};
const bindings = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  Space: "up",
  KeyC: "down",
  ShiftLeft: "boost",
  ShiftRight: "boost",
};
window.addEventListener("keydown", (e) => {
  if (
    surfaceWorld.active ||
    explosion ||
    landing ||
    paused ||
    e.target.matches("input,select,textarea") ||
    e.ctrlKey ||
    e.metaKey ||
    e.altKey
  )
    return;
  if (bindings[e.code]) {
    e.preventDefault();
    launch();
    keys.add(e.code);
    state.autopilot = null;
  }
  if (e.code === "KeyF" && !e.repeat && state.near) {
    e.preventDefault();
    beginLanding(state.near.id);
  }
  if (e.code === "KeyR" && !e.repeat) reset();
});
window.addEventListener("keyup", (e) => keys.delete(e.code));
window.addEventListener("blur", () => {
  keys.clear();
  held.clear();
});
const controls = Object.entries(bindings);
function active(name) {
  return (
    held.has(name) ||
    controls.some(([key, value]) => value === name && keys.has(key))
  );
}
for (const button of document.querySelectorAll("[data-control]")) {
  button.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    button.setPointerCapture(e.pointerId);
    launch();
    state.autopilot = null;
    held.add(button.dataset.control);
    button.classList.add("pressed");
  });
  const release = () => {
    held.delete(button.dataset.control);
    button.classList.remove("pressed");
  };
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
}
let dragging = false,
  lastX = 0,
  lastY = 0;
renderer.domElement.addEventListener("pointerdown", (e) => {
  if (paused || landing || explosion || surfaceWorld.active) return;
  launch();
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  renderer.domElement.setPointerCapture(e.pointerId);
});
renderer.domElement.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  state.autopilot = null;
  state.yaw -= (e.clientX - lastX) * 0.004 * state.sensitivity;
  state.pitch = THREE.MathUtils.clamp(
    state.pitch - (e.clientY - lastY) * 0.003 * state.sensitivity,
    -0.7,
    0.7,
  );
  lastX = e.clientX;
  lastY = e.clientY;
});
for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
  renderer.domElement.addEventListener(event, () => (dragging = false));
document.addEventListener("visibilitychange", () => {
  visible = !document.hidden;
  keys.clear();
  held.clear();
  clock.getDelta();
});
window.addEventListener("resize", resize);
renderer.domElement.addEventListener("webglcontextlost", (e) => {
  e.preventDefault();
  visible = false;
  $("fallback").hidden = false;
});
renderer.domElement.addEventListener("webglcontextrestored", () => {
  visible = !document.hidden;
  $("fallback").hidden = true;
  clock.getDelta();
});

// Reused burst buffers keep a crash from allocating objects every frame.
const burstCount = 100,
  burstPositions = new Float32Array(burstCount * 3),
  burstDirections = new Float32Array(burstCount * 3);
for (let i = 0; i < burstCount; i++) {
  const v = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1)
    .normalize()
    .multiplyScalar(8 + rand() * 24);
  burstDirections.set([v.x, v.y, v.z], i * 3);
}
const burstGeometry = new THREE.BufferGeometry();
burstGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(burstPositions, 3).setUsage(THREE.DynamicDrawUsage),
);
const burstMaterial = new THREE.PointsMaterial({
  color: "#ffbc65",
  size: 1.3,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const burst = new THREE.Points(burstGeometry, burstMaterial);
burst.frustumCulled = false;
burst.visible = false;
scene.add(burst);
const blast = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: glow,
    color: "#ffc37a",
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
);
blast.visible = false;
scene.add(blast);
function explode() {
  if (explosion) return;
  explosion = { time: 0, duration: state.reduced ? 1 : 2.2 };
  burst.position.copy(position);
  blast.position.copy(position);
  burstPositions.fill(0);
  burstGeometry.attributes.position.needsUpdate = true;
  burst.visible = !state.reduced;
  blast.visible = true;
  ship.visible = false;
  velocity.set(0, 0, 0);
  keys.clear();
  held.clear();
  dragging = false;
  state.autopilot = null;
  routeWaypoint = null;
  state.near = null;
  if (challenge) finishChallenge(false);
  $("crash").hidden = false;
  document.body.classList.add("crashed");
  $("toast").classList.remove("visible");
}
function updateExplosion(dt) {
  explosion.time += dt;
  const t = explosion.time,
    progress = t / explosion.duration;
  for (let i = 0; i < burstPositions.length; i++)
    burstPositions[i] = burstDirections[i] * t;
  burstGeometry.attributes.position.needsUpdate = true;
  burstMaterial.opacity = Math.max(0, 1 - progress);
  blast.scale.setScalar(state.reduced ? 9 : 8 + t * 28);
  blast.material.opacity = Math.max(0, 1 - progress);
  if (progress >= 1) {
    explosion = null;
    burst.visible = blast.visible = false;
    ship.visible = true;
    $("crash").hidden = true;
    document.body.classList.remove("crashed");
    reset();
    ship.position.copy(position);
    toast("New ship ready. Keep clear of the sun.");
  }
}
const previousPosition = new THREE.Vector3();
const obstacles = bodies;
function flight(dt, time) {
  let throttle = 0,
    turn = 0;
  if (state.autopilot) {
    const body = state.autopilot;
    desired
      .copy(body.position)
      .add(
        new THREE.Vector3(
          0,
          body.signal ? 0 : body.radius * 0.45,
          body.signal ? 0 : body.radius + 25,
        ),
      );
    if (routeWaypoint) {
      if (position.distanceToSquared(routeWaypoint) < 225) routeWaypoint = null;
      else desired.copy(routeWaypoint);
    }
    temp.copy(desired).sub(position);
    const distance = temp.length();
    if (distance < 3) {
      state.autopilot = null;
      velocity.multiplyScalar(0.1);
      toast("Arrived at " + body.name + " · Press F to explore");
    } else {
      temp.normalize();
      const wantedYaw = Math.atan2(-temp.x, -temp.z);
      state.yaw +=
        Math.atan2(
          Math.sin(wantedYaw - state.yaw),
          Math.cos(wantedYaw - state.yaw),
        ) *
        (1 - Math.exp(-dt * 3));
      state.pitch = THREE.MathUtils.lerp(
        state.pitch,
        Math.asin(temp.y),
        1 - Math.exp(-dt * 3),
      );
      const speed = Math.min(220, distance * 1.3);
      velocity.lerp(temp.multiplyScalar(speed), 1 - Math.exp(-dt * 2));
      throttle = 1;
    }
  } else if (state.launched) {
    turn = (active("left") ? 1 : 0) - (active("right") ? 1 : 0);
    state.yaw += turn * dt * 1.5 * state.sensitivity;
    forward.set(
      -Math.sin(state.yaw) * Math.cos(state.pitch),
      Math.sin(state.pitch),
      -Math.cos(state.yaw) * Math.cos(state.pitch),
    );
    throttle = (active("forward") ? 1 : 0) - (active("backward") ? 1 : 0);
    const boost = active("boost");
    velocity.addScaledVector(forward, throttle * (boost ? 65 : 30) * dt);
    velocity.y += ((active("up") ? 1 : 0) - (active("down") ? 1 : 0)) * 30 * dt;
    velocity.multiplyScalar(Math.exp(-dt * (throttle ? 0.65 : 1.45)));
    velocity.clampLength(0, boost ? 125 : 55);
  }
  previousPosition.copy(position);
  position.addScaledVector(velocity, dt);
  if (state.launched && position.distanceToSquared(sunPosition) < 98 * 98) {
    explode();
    return;
  }
  // Soft collision boundaries protect the craft without loading a physics engine.
  for (const body of obstacles) {
    temp.copy(position).sub(body.position);
    const d = temp.length(),
      limit = body.radius + 5;
    if (d < limit) {
      if (d < 0.01) temp.set(0, 1, 0);
      else temp.divideScalar(d);
      position.copy(body.position).addScaledVector(temp, limit);
      const inward = velocity.dot(temp);
      if (inward < 0) velocity.addScaledVector(temp, -inward);
    }
  }
  if (position.length() > 1050) {
    position.clampLength(0, 1030);
    velocity.multiplyScalar(0.2);
    toast("Outer boundary · turn back toward the system");
  }
  ship.position.copy(position);
  ship.rotation.set(
    state.pitch,
    state.yaw,
    state.reduced
      ? 0
      : THREE.MathUtils.lerp(
          ship.rotation.z,
          -turn * 0.28,
          1 - Math.exp(-dt * 5),
        ),
    "YXZ",
  );
  for (const engine of engines) {
    engine.scale.y = throttle > 0 ? (active("boost") ? 1.7 : 1) : 0.25;
    engine.visible = state.launched;
  }
  const cameraDistance = active("boost") ? 10 : 7;
  cameraTarget
    .set(
      Math.sin(state.yaw) * cameraDistance,
      2.5,
      -0 + Math.cos(state.yaw) * cameraDistance,
    )
    .add(position);
  camera.position.lerp(
    cameraTarget,
    1 - Math.exp(-dt * (state.reduced ? 12 : 4)),
  );
  lookTarget.copy(position);
  lookTarget.y += 2;
  camera.lookAt(lookTarget);
  const nextFov = THREE.MathUtils.lerp(
    camera.fov,
    active("boost") ? 67 : 58,
    1 - Math.exp(-dt * 3),
  );
  if (Math.abs(nextFov - camera.fov) > 0.01) {
    camera.fov = nextFov;
    camera.updateProjectionMatrix();
  }
  let near = null,
    nearest = Infinity;
  for (const body of bodies) {
    const distance = position.distanceTo(body.position) - body.radius;
    if (distance < nearest) {
      nearest = distance;
      near = body;
    }
  }
  state.near = nearest < 45 ? near : null;
  for (const signal of signals) {
    if (!signal.mesh.visible) continue;
    if (!state.reduced) {
      signal.mesh.rotation.y = time * 0.7;
      signal.mesh.rotation.z = time * 0.3;
      signal.ring.lookAt(camera.position);
    }
    if (
      state.launched &&
      inPickupRange(previousPosition, position, signal.mesh.position, 14)
    ) {
      if (challenge?.type === "signals") {
        challenge.hits.add(signal.id);
        checkChallenge();
      }
      if (state.autopilot?.id === `signal-${signal.id}`) {
        state.autopilot = null;
        velocity.multiplyScalar(0.3);
      }
      recovered.add(signal.id);
      signal.mesh.visible = signal.ring.visible = false;
      storage.set("signals", [...recovered]);
      updateProgress();
      toast(
        recovered.size === 6
          ? "All six navigation signals recovered. Nice flying."
          : `Signal recovered · ${recovered.size} / 6`,
      );
    }
  }
}
$("find-signal").onclick = () => {
  if (surfaceWorld.active || landing || explosion) return;
  const remaining = signals.filter((s) => s.mesh.visible);
  remaining.sort(
    (a, b) =>
      position.distanceToSquared(a.mesh.position) -
      position.distanceToSquared(b.mesh.position),
  );
  if (remaining[0]) setCourse(`signal-${remaining[0].id}`);
  else toast("All signals recovered. Start Signal sprint to play again.");
};
function updateHUD() {
  const available = signals.filter((s) => s.mesh.visible);
  let closestSignal = null,
    signalDistance = Infinity;
  for (const signal of available) {
    const d = position.distanceTo(signal.mesh.position);
    if (d < signalDistance) {
      closestSignal = signal;
      signalDistance = d;
    }
  }
  const signalLabel = $("signal-label");
  signalLabel.hidden =
    !state.launched || !closestSignal || !!landing || !!explosion;
  if (closestSignal) {
    const dy = closestSignal.mesh.position.y - position.y;
    signalLabel.textContent = `Signal · ${Math.ceil(signalDistance)} m · ${Math.abs(dy) < 6 ? "height aligned" : dy > 0 ? "ascend " + Math.ceil(dy) + " m" : "descend " + Math.ceil(-dy) + " m"}`;
  }
  const target = state.autopilot || state.near;
  $("flight-status").hidden = !target || !state.launched;
  $("flight-mode").textContent = state.autopilot
    ? "GUIDED FLIGHT"
    : state.near
      ? "WITHIN EXPLORATION RANGE"
      : "FREE FLIGHT";
  $("target-name").textContent = target ? target.name : "The open universe";
  $("target-info").textContent = target
    ? state.autopilot
      ? `${Math.round(Math.max(0, position.distanceTo(target.position) - target.radius))} m to destination · enjoy the ride.`
      : target.subtitle
    : "Find three worlds. Follow the golden signals.";
  $("dock").hidden =
    !state.near || (state.autopilot && state.autopilot.id !== state.near.id);
  $("cancel-course").hidden = !state.autopilot;
  $("speed").textContent = String(Math.round(velocity.length())).padStart(
    3,
    "0",
  );
  $("altitude").textContent =
    `ALT ${position.y >= 0 ? "+" : "−"}${String(Math.round(Math.abs(position.y))).padStart(3, "0")}`;
  document
    .querySelectorAll(".destination")
    .forEach((el) =>
      el.classList.toggle("active", el.dataset.world === target?.id),
    );
  const mx = THREE.MathUtils.clamp(90 + position.x * 0.4, 6, 174),
    my = THREE.MathUtils.clamp(70 + (position.z + 210) * 0.2, 6, 134);
  $("map-ship").setAttribute(
    "transform",
    `translate(${mx},${my}) rotate(${(-state.yaw * 180) / Math.PI})`,
  );
  const label = $("planet-label");
  if (target && state.launched) {
    projected.copy(target.position);
    projected.y += target.radius + 5;
    projected.project(camera);
    label.hidden =
      projected.z > 1 ||
      Math.abs(projected.x) > 0.8 ||
      Math.abs(projected.y) > 0.8;
    label.style.left = `${(projected.x * 0.5 + 0.5) * innerWidth}px`;
    label.style.top = `${(-projected.y * 0.5 + 0.5) * innerHeight}px`;
    label.textContent = `${target.name.toUpperCase()} / ${Math.round(position.distanceTo(target.position))} M`;
  } else label.hidden = true;
}
function animate() {
  requestAnimationFrame(animate);
  const rawDelta = clock.getDelta();
  const dt = Math.min(rawDelta, 0.04);
  if (!visible || paused) return;
  if (surfaceWorld.active) {
    surfaceWorld.update(dt);
    return;
  }
  const time = clock.elapsedTime;
  if (challenge) {
    challenge.time -= dt;
    if (challenge.time <= 0) finishChallenge(false);
    else
      $("challenge-text").textContent =
        `${challenge.type === "signals" ? "Signal sprint" : "Planet hopper"} · ${challenge.hits.size}/3 · ${Math.ceil(challenge.time)}s`;
  }

  if (!state.reduced) {
    sunUniforms.time.value = time;
    sun.rotation.y = time * 0.012;
    for (const body of bodies)
      body.mesh.rotation.y = time * (body.id === "projects" ? 0.022 : 0.014);
  }
  if (explosion) updateExplosion(dt);
  else if (landing) animateLanding(dt);
  else flight(dt, time);
  hudElapsed += dt;
  if (hudElapsed > 0.1) {
    updateHUD();
    hudElapsed = 0;
  }
  renderer.render(scene, camera);
  if (state.quality === "auto" && state.launched) {
    qualityElapsed += rawDelta;
    qualityFrames++;
    if (qualityElapsed > 5) {
      if (qualityFrames / qualityElapsed < 43 && autoRatio > 0.8) {
        autoRatio = Math.max(0.8, autoRatio - 0.2);
        applyQuality();
      }
      qualityElapsed = 0;
      qualityFrames = 0;
    }
  }
}
camera.position.set(0, 20, 146);
ship.position.copy(position);
resize();
updateHUD();
animate();
