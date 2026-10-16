import * as THREE from "three";
import {
  groundMaterial,
  forest,
  stationConfig,
  hologram,
} from "./surface-art.js";

// Separate local coordinates keep human-scale movement precise on enormous worlds.
export class SurfaceWorld {
  constructor({ renderer, ship, worlds, onExit, onDiscover }) {
    Object.assign(this, {
      renderer,
      shipTemplate: ship,
      worlds,
      onExit,
      onDiscover,
    });
    this.active = false;
    this.keys = new Set();
    this.touch = new Set();
    const ui = document.createElement("section");
    ui.id = "surface-ui";
    ui.hidden = true;
    ui.innerHTML = `<header><div><span id="surface-location"></span><h1 id="surface-title"></h1></div><div class="surface-actions"><button id="board-ship">Enter spaceship ↑</button></div></header><aside class="surface-story"><span id="surface-chapter">Field notes</span><h2 id="surface-heading"></h2><p id="surface-copy"></p><a id="surface-link" target="_blank" rel="noopener noreferrer" hidden>Read more ↗</a></aside><div class="surface-objective"><strong id="surface-progress"></strong><div id="surface-stations"></div><span id="surface-hint">W/S walk · A/D turn · Drag to look · Explore the holograms beside your ship</span><button id="surface-read">Read planet dossier</button></div><div class="surface-pad"><button data-walk="left" aria-label="Walk left">←</button><button data-walk="forward" aria-label="Walk forward">↑</button><button data-walk="right" aria-label="Walk right">→</button><button data-walk="backward" aria-label="Walk backward">↓</button></div>`;
    document.body.append(ui);
    this.ui = ui;
    document.getElementById("board-ship").onclick = () => this.exit();
    document.getElementById("surface-read").onclick = () =>
      this.onDiscover(this.world.id);
    const mapping = {
      KeyW: "forward",
      ArrowUp: "forward",
      KeyS: "backward",
      ArrowDown: "backward",
      KeyA: "left",
      ArrowLeft: "left",
      KeyD: "right",
      ArrowRight: "right",
      ShiftLeft: "run",
      ShiftRight: "run",
    };
    window.addEventListener(
      "keydown",
      (e) => {
        if (
          !this.active ||
          document.querySelector("dialog[open]") ||
          e.target.matches("input,textarea,select")
        )
          return;
        if (mapping[e.code]) {
          e.preventDefault();
          e.stopImmediatePropagation();
          this.keys.add(mapping[e.code]);
        }
        if (e.code === "Escape") {
          e.preventDefault();
          this.exit();
        }
      },
      true,
    );
    window.addEventListener("keyup", (e) => {
      if (mapping[e.code]) this.keys.delete(mapping[e.code]);
    });
    window.addEventListener("blur", () => {
      this.keys.clear();
      this.touch.clear();
    });
    for (const b of ui.querySelectorAll("[data-walk]")) {
      b.onpointerdown = (e) => {
        e.preventDefault();
        b.setPointerCapture(e.pointerId);
        this.touch.add(b.dataset.walk);
      };
      const release = () => this.touch.delete(b.dataset.walk);
      b.onpointerup = release;
      b.onpointercancel = release;
      b.onlostpointercapture = release;
    }
    this.cameraYaw = 0;
    this.cameraPitch = 0.35;
    this.cameraDrag = false;
    const canvas = renderer.domElement;
    canvas.addEventListener("pointerdown", (e) => {
      if (!this.active || document.querySelector("dialog[open]")) return;
      this.cameraDrag = true;
      this.dragX = e.clientX;
      this.dragY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!this.active || !this.cameraDrag) return;
      this.cameraYaw -= (e.clientX - this.dragX) * 0.006;
      this.cameraPitch = THREE.MathUtils.clamp(
        this.cameraPitch + (e.clientY - this.dragY) * 0.004,
        0.1,
        0.9,
      );
      this.dragX = e.clientX;
      this.dragY = e.clientY;
    });
    for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
      canvas.addEventListener(event, () => (this.cameraDrag = false));
    this.move = new THREE.Vector3();
    this.camGoal = new THREE.Vector3();
    this.lookGoal = new THREE.Vector3();
  }
  height(x, z) {
    return (
      -0.9 +
      Math.sin(x * 0.045) * Math.cos(z * 0.055) * 1.9 +
      Math.sin(x * 0.11 + z * 0.07) * 0.35
    );
  }
  mesh(g, m, x, y, z) {
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(x, y, z);
    this.scene.add(mesh);
    return mesh;
  }
  enter(world, reduced) {
    this.world = world;
    this.reduced = reduced;
    this.active = true;
    this.time = 0;
    this.cameraYaw = 0;
    this.cameraPitch = 0.35;
    this.cameraDrag = false;
    this.found = new Set();
    this.keys.clear();
    this.touch.clear();
    this.lastNote = -1;
    this.ui.hidden = false;
    document.body.classList.add("on-surface");
    this.scene = new THREE.Scene();
    const earth = world.type === "earth",
      ice = world.type === "ice";
    this.scene.background = new THREE.Color(
      earth ? "#abc9d3" : ice ? "#182b49" : "#d7a477",
    );
    this.scene.fog = new THREE.Fog(this.scene.background, 75, 230);
    this.camera = new THREE.PerspectiveCamera(
      54,
      innerWidth / innerHeight,
      0.1,
      900,
    );
    this.scene.add(
      new THREE.HemisphereLight(
        earth ? "#e7f6ff" : "#b6d6ff",
        earth ? "#4c6344" : "#555169",
        ice ? 1.1 : 2.3,
      ),
    );
    const light = new THREE.DirectionalLight(
      ice ? "#a5c6ef" : "#ffe0b0",
      ice ? 1.6 : 3.5,
    );
    light.position.set(-30, 65, -40);
    this.scene.add(light);
    const terrain = new THREE.PlaneGeometry(450, 450, 160, 160);
    terrain.rotateX(-Math.PI / 2);
    const vertices = terrain.attributes.position;
    for (let i = 0; i < vertices.count; i++)
      vertices.setY(i, this.height(vertices.getX(i), vertices.getZ(i)));
    terrain.computeVertexNormals();
    this.mesh(terrain, groundMaterial(world.type), 0, 0, 0);
    // Repeated scenery is instanced to keep render calls bounded.
    const rockGeo = new THREE.IcosahedronGeometry(1, 2),
      rockMat = new THREE.MeshStandardMaterial({
        color: ice ? "#8aacc1" : earth ? "#667365" : "#8d6d57",
        roughness: 0.9,
      });
    const rockVertices = rockGeo.attributes.position;
    for (let i = 0; i < rockVertices.count; i++) {
      const x = rockVertices.getX(i),
        y = rockVertices.getY(i),
        z = rockVertices.getZ(i),
        f = 1 + Math.sin(x * 7 + y * 3) * Math.cos(z * 9) * 0.12;
      rockVertices.setXYZ(i, x * f, y * f, z * f);
    }
    rockGeo.computeVertexNormals();
    const rocks = new THREE.InstancedMesh(rockGeo, rockMat, 100);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 100; i++) {
      const a = i * 2.399,
        r = 28 + (i % 15) * 6,
        x = Math.cos(a) * r,
        z = Math.sin(a) * r;
      dummy.position.set(x, this.height(x, z) + 0.6, z);
      dummy.scale.set(1 + (i % 3), 0.9 + (i % 5) * 0.4, 1 + (i % 2));
      dummy.rotation.set(i * 0.1, i, 0);
      dummy.updateMatrix();
      rocks.setMatrixAt(i, dummy.matrix);
    }
    this.scene.add(rocks);
    if (earth) forest(this.scene, (x, z) => this.height(x, z));
    if (ice) {
      const crystals = new THREE.InstancedMesh(
        new THREE.CylinderGeometry(0.15, 0.8, 7, 6, 2),
        new THREE.MeshStandardMaterial({
          color: "#80b9dc",
          metalness: 0.35,
          roughness: 0.22,
          emissive: "#1b365c",
        }),
        40,
      );
      for (let i = 0; i < 40; i++) {
        const a = i * 2.399,
          r = 26 + (i % 8) * 6,
          x = Math.cos(a) * r,
          z = Math.sin(a) * r;
        dummy.position.set(x, this.height(x, z) + 2, z);
        dummy.scale.setScalar(0.7 + (i % 4) * 0.4);
        dummy.rotation.set(0.1, i, 0.2);
        dummy.updateMatrix();
        crystals.setMatrixAt(i, dummy.matrix);
      }
      this.scene.add(crystals);
    }
    const padMat = new THREE.MeshStandardMaterial({
      color: "#263a45",
      metalness: 0.5,
      roughness: 0.6,
    });
    const pad = this.mesh(
      new THREE.CylinderGeometry(8, 8, 0.6, 48),
      padMat,
      0,
      1,
      0,
    );
    const ring = this.mesh(
      new THREE.TorusGeometry(6.8, 0.12, 6, 64),
      new THREE.MeshBasicMaterial({ color: world.color }),
      0,
      1.33,
      0,
    );
    ring.rotation.x = Math.PI / 2;
    this.lander = this.shipTemplate.clone(true);
    this.lander.position.set(0, 2, 0);
    this.lander.rotation.set(0, 0, 0);
    this.lander.scale.setScalar(1);
    this.lander.traverse((o) => {
      if (o.isSprite || o.geometry?.type === "ConeGeometry") o.visible = false;
    });
    this.scene.add(this.lander);
    this.player = new THREE.Group();
    this.scene.add(this.player);
    const suit = new THREE.MeshStandardMaterial({
        color: "#e4ddd0",
        roughness: 0.8,
      }),
      joint = new THREE.MeshStandardMaterial({ color: "#283b49" }),
      visor = new THREE.MeshStandardMaterial({
        color: "#244c63",
        metalness: 0.85,
        roughness: 0.2,
      });
    const limb = (g, m, x, y, z) => {
      const a = new THREE.Mesh(g, m);
      a.position.set(x, y, z);
      this.player.add(a);
      return a;
    };
    limb(new THREE.CapsuleGeometry(0.33, 0.6, 4, 8), suit, 0, 1.3, 0);
    limb(new THREE.SphereGeometry(0.36, 16, 12), suit, 0, 2, 0);
    limb(new THREE.SphereGeometry(0.28, 12, 8), visor, 0, 2, -0.17).scale.set(
      1,
      0.65,
      0.7,
    );
    limb(new THREE.BoxGeometry(0.55, 0.7, 0.25), joint, 0, 1.4, 0.35);
    this.legs = [
      limb(new THREE.CapsuleGeometry(0.12, 0.5, 3, 6), joint, -0.2, 0.55, 0),
      limb(new THREE.CapsuleGeometry(0.12, 0.5, 3, 6), joint, 0.2, 0.55, 0),
    ];
    this.arms = [
      limb(new THREE.CapsuleGeometry(0.1, 0.5, 3, 6), suit, -0.5, 1.25, 0),
      limb(new THREE.CapsuleGeometry(0.1, 0.5, 3, 6), suit, 0.5, 1.25, 0),
    ];
    this.player.position.set(reduced ? 6 : 0, 1.35, 0);
    this.player.scale.setScalar(1);
    this.stations = stationConfig(world);
    const locations = [
      [-3, -21],
      [7, -23],
      [17, -21],
    ];
    this.beacons = locations.map(([x, z], i) => {
      const y = this.height(x, z);
      this.mesh(
        new THREE.CylinderGeometry(1.4, 1.6, 0.45, 48),
        padMat,
        x,
        y + 0.25,
        z,
      );
      return { ...hologram(this.scene, this.stations[i], x, y, z), id: i };
    });
    const menu = document.getElementById("surface-stations");
    menu.replaceChildren();
    this.stations.forEach((station, i) => {
      const button = document.createElement("button");
      button.textContent = station.name;
      button.onclick = () => this.note(i, true);
      menu.append(button);
    });
    if (!earth) {
      const planet = this.mesh(
        new THREE.SphereGeometry(55, 48, 32),
        new THREE.MeshStandardMaterial({ color: world.color, roughness: 0.9 }),
        -130,
        110,
        -260,
      );
      const r = this.mesh(
        new THREE.RingGeometry(75, 105, 80),
        new THREE.MeshBasicMaterial({
          color: "#cebea7",
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5,
        }),
        -130,
        110,
        -260,
      );
      r.rotation.x = 1.15;
      r.rotation.z = 0.3;
    }
    document.getElementById("surface-location").textContent =
      world.type === "gas"
        ? "Workshop · floating surface outpost"
        : world.name + " · surface expedition";
    document.getElementById("surface-title").textContent =
      world.category === "THE PERSON"
        ? "Walk through my story"
        : world.id === "projects"
          ? "Explore the workshop"
          : "Explore the relay";
    this.note(-1);
    this.camera.position.set(15, 10, 20);
  }
  note(index, manual = false) {
    this.manualNote = manual;
    this.lastNote = index;
    const w = this.world,
      detail = this.stations[index]?.detail;
    document.getElementById("surface-chapter").textContent = detail
      ? detail[0]
      : this.world.category;
    document.getElementById("surface-heading").textContent = detail
      ? detail[1]
      : w.title;
    document.getElementById("surface-copy").textContent = detail
      ? detail[2]
      : w.description;
    const a = document.getElementById("surface-link");
    a.hidden = !detail?.[3];
    if (detail?.[3]) {
      a.href = detail[3];
      a.textContent = `Open ${this.stations[index].name} ↗`;
    }
    document
      .querySelectorAll("#surface-stations button")
      .forEach((b, i) => b.classList.toggle("selected", i === index));
  }
  update(dt) {
    this.time += dt;
    const automatic = this.time < 1.25 && !this.reduced;
    const x =
        (this.keys.has("right") || this.touch.has("right") ? 1 : 0) -
        (this.keys.has("left") || this.touch.has("left") ? 1 : 0),
      z =
        (this.keys.has("backward") || this.touch.has("backward") ? 1 : 0) -
        (this.keys.has("forward") || this.touch.has("forward") ? 1 : 0);
    if (!automatic) this.cameraYaw -= x * dt * 2.2;
    if (!automatic && x) this.player.rotation.y = this.cameraYaw;
    this.move.set(
      automatic ? 1 : Math.sin(this.cameraYaw) * z,
      0,
      automatic ? 0 : Math.cos(this.cameraYaw) * z,
    );
    const moving = this.move.lengthSq() > 0;
    if (moving) {
      this.manualNote = false;
      this.move.normalize();
      this.player.position.addScaledVector(
        this.move,
        dt * (this.keys.has("run") ? 9 : 5),
      );
      this.player.rotation.y = automatic
        ? Math.atan2(-this.move.x, -this.move.z)
        : this.cameraYaw;
    }
    this.player.position.x = THREE.MathUtils.clamp(
      this.player.position.x,
      -65,
      65,
    );
    this.player.position.z = THREE.MathUtils.clamp(
      this.player.position.z,
      -65,
      65,
    );
    const onPad =
      Math.hypot(this.player.position.x, this.player.position.z) < 8;
    this.player.position.y = onPad
      ? 1.35
      : this.height(this.player.position.x, this.player.position.z) + 0.1;
    const gait = moving && !this.reduced ? Math.sin(this.time * 12) * 0.55 : 0;
    this.legs[0].rotation.x = gait;
    this.legs[1].rotation.x = -gait;
    this.arms[0].rotation.x = -gait;
    this.arms[1].rotation.x = gait;
    let nearest = null,
      dist = Infinity;
    for (const b of this.beacons) {
      const d = Math.hypot(
        this.player.position.x - b.x,
        this.player.position.z - b.z,
      );
      if (d < dist) {
        dist = d;
        nearest = b;
      }
      b.panel.quaternion.copy(this.camera.quaternion);
      if (!this.reduced)
        b.panel.rotateY(Math.sin(this.time * 0.4 + b.id) * 0.2);
      b.uniforms.time.value = this.reduced ? 0 : this.time;
      b.scan.visible = !this.reduced;
      b.scan.position.y =
        b.baseY + 0.7 + ((this.time * 0.4 + b.id * 0.3) % 1) * 4;
      b.panel.position.y =
        this.height(b.x, b.z) +
        3.6 +
        (this.reduced ? 0 : Math.sin(this.time * 0.8 + b.id) * 0.12);
    }
    if (
      nearest &&
      dist < 4.2 &&
      !this.manualNote &&
      nearest.id !== this.lastNote
    )
      this.note(nearest.id);
    document.getElementById("surface-progress").textContent = nearest
      ? `${nearest.config.name} · ${Math.round(dist)} m away`
      : "Explore at your own pace";
    const distance = innerWidth < 700 ? 9 : 10;
    this.camGoal.copy(this.player.position);
    this.camGoal.x += Math.sin(this.cameraYaw) * distance;
    this.camGoal.z += Math.cos(this.cameraYaw) * distance;
    this.camGoal.y += 2 + Math.sin(this.cameraPitch) * distance;
    this.camGoal.y = Math.max(
      this.camGoal.y,
      this.height(this.camGoal.x, this.camGoal.z) + 2,
    );
    this.camera.position.lerp(this.camGoal, 1 - Math.exp(-dt * 3));
    this.lookGoal.copy(this.player.position);
    this.lookGoal.y += innerWidth < 700 ? 2.8 : 1.4;
    this.camera.lookAt(this.lookGoal);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  }
  exit() {
    if (!this.active) return;
    this.active = false;
    this.keys.clear();
    this.touch.clear();
    this.ui.hidden = true;
    document.body.classList.remove("on-surface");
    const shared = new Set();
    this.lander.traverse((o) => {
      if (o.geometry) shared.add(o.geometry);
      if (o.material) {
        shared.add(o.material);
        if (o.material.map) shared.add(o.material.map);
        if (o.material.bumpMap) shared.add(o.material.bumpMap);
      }
    });
    const disposed = new Set();
    this.scene.traverse((o) => {
      for (const asset of [
        o.geometry,
        o.material?.map,
        o.material?.bumpMap,
        ...(Array.isArray(o.material) ? o.material : [o.material]),
      ])
        if (asset && !shared.has(asset) && !disposed.has(asset)) {
          asset.dispose();
          disposed.add(asset);
        }
    });
    this.onExit();
  }
}
