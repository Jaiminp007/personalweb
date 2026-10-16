import githubSvg from "./assets/icons/brand-github-filled.svg?raw";
import linkedinSvg from "./assets/icons/brand-linkedin-filled.svg?raw";
import calendarSvg from "./assets/icons/calendar-event.svg?raw";
import schoolSvg from "./assets/icons/school.svg?raw";
import personSvg from "./assets/icons/user-circle.svg?raw";
import resumeSvg from "./assets/icons/file-cv.svg?raw";
import scoutSvg from "./assets/icons/compass.svg?raw";
import finnySvg from "./assets/icons/chart-candle.svg?raw";
import researchSvg from "./assets/icons/flask.svg?raw";
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
function rng(seed = 48) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
}
function texture(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export function groundMaterial(type) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d"),
    r = rng(),
    earth = type === "earth",
    ice = type === "ice";
  ctx.fillStyle = earth ? "#64784a" : ice ? "#a1b7c5" : "#a68565";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 38000; i++) {
    const v = r();
    ctx.strokeStyle = earth
      ? v > 0.5
        ? "#a0a06b"
        : "#3d5433"
      : ice
        ? v > 0.5
          ? "#d1e0e7"
          : "#6d8f9e"
        : v > 0.5
          ? "#c2a787"
          : "#725b48";
    ctx.globalAlpha = 0.2 + r() * 0.4;
    ctx.lineWidth = 0.4 + r();
    const x = r() * 512,
      y = r() * 512;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (r() - 0.5) * 5, y - r() * 5);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const map = texture(c);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(75, 75);
  map.anisotropy = 4;
  return new THREE.MeshStandardMaterial({
    map,
    bumpMap: map,
    bumpScale: 0.08,
    roughness: ice ? 0.42 : 0.96,
    metalness: ice ? 0.12 : 0,
    color: earth ? "#a4b68c" : ice ? "#60849a" : "#ffffff",
  });
}
export function forest(scene, height) {
  const r = rng(73),
    dummy = new THREE.Object3D(),
    up = new THREE.Vector3(0, 1, 0),
    direction = new THREE.Vector3();
  const trunkGeo = new THREE.CylinderGeometry(0.13, 0.27, 4, 10, 3),
    wood = new THREE.MeshStandardMaterial({ color: "#62513c", roughness: 1 });
  const trunks = new THREE.InstancedMesh(trunkGeo, wood, 32);
  const branchGeo = new THREE.CylinderGeometry(0.035, 0.1, 1, 7),
    branches = new THREE.InstancedMesh(branchGeo, wood, 192);
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  for (let i = 0; i < 250; i++) {
    const x = 128 + (r() - 0.5) * 220,
      y = 128 + (r() - 0.5) * 210;
    const edge = ((x - 128) / 120) ** 2 + ((y - 128) / 115) ** 2;
    if (edge > 1) continue;
    ctx.fillStyle = ["#59794d", "#42643a", "#7a965e", "#304f31"][i % 4];
    ctx.beginPath();
    ctx.ellipse(x, y, 3 + r() * 12, 2 + r() * 5, r() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  const leavesMap = texture(c),
    leafMat = new THREE.MeshStandardMaterial({
      map: leavesMap,
      alphaTest: 0.45,
      side: THREE.DoubleSide,
      roughness: 0.95,
    });
  const leaves = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(2.8, 2.8),
    leafMat,
    32 * 48,
  );
  let leafIndex = 0,
    branchIndex = 0;
  for (let i = 0; i < 32; i++) {
    const a = i * 2.399,
      rad = 24 + r() * 67,
      x = Math.cos(a) * rad,
      z = Math.sin(a) * rad,
      h = height(x, z),
      scale = 0.8 + r() * 0.65;
    dummy.position.set(x, h + 2 * scale, z);
    dummy.scale.set(scale, scale, scale);
    dummy.rotation.set(0, a, 0);
    dummy.updateMatrix();
    trunks.setMatrixAt(i, dummy.matrix);
    for (let j = 0; j < 6; j++) {
      const angle = (j * Math.PI) / 3 + i;
      direction.set(Math.cos(angle) * 1.5, 1.8, Math.sin(angle) * 1.5);
      dummy.position.set(
        x + direction.x * 0.5 * scale,
        h + (2 + direction.y * 0.5) * scale,
        z + direction.z * 0.5 * scale,
      );
      dummy.quaternion.setFromUnitVectors(up, direction.clone().normalize());
      dummy.scale.set(scale, direction.length() * scale, scale);
      dummy.updateMatrix();
      branches.setMatrixAt(branchIndex++, dummy.matrix);
    }
    for (let j = 0; j < 48; j++) {
      const theta = r() * Math.PI * 2,
        radial = Math.sqrt(r()) * 2.3 * scale;
      dummy.position.set(
        x + Math.cos(theta) * radial,
        h + (3.5 + r() * 2) * scale,
        z + Math.sin(theta) * radial,
      );
      dummy.rotation.set(r() * Math.PI, r() * Math.PI, r() * Math.PI);
      dummy.scale.setScalar(0.75 + r() * 0.6);
      dummy.updateMatrix();
      leaves.setMatrixAt(leafIndex++, dummy.matrix);
    }
  }
  scene.add(trunks, branches, leaves);
  const bladeGeo = new THREE.PlaneGeometry(0.055, 0.4, 1, 2);
  bladeGeo.translate(0, 0.2, 0);
  const grass = new THREE.InstancedMesh(
    bladeGeo,
    new THREE.MeshStandardMaterial({
      color: "#63824c",
      side: THREE.DoubleSide,
      roughness: 1,
    }),
    7000,
  );
  let n = 0;
  while (n < 7000) {
    const x = (r() - 0.5) * 125,
      z = (r() - 0.5) * 125;
    if (Math.hypot(x, z) < 11) continue;
    dummy.position.set(x, height(x, z), z);
    dummy.rotation.set(0, r() * Math.PI, 0);
    dummy.scale.set(1, 0.5 + r() * 1.5, 1);
    dummy.updateMatrix();
    grass.setMatrixAt(n++, dummy.matrix);
  }
  scene.add(grass);
}
export function stationConfig(world) {
  if (world.id === "contact")
    return [
      {
        name: "Book a chat",
        icon: "calendar",
        color: "#79e2b6",
        detail: world.details[0],
      },
      {
        name: "LinkedIn",
        icon: "linkedin",
        color: "#55b5ff",
        detail: world.details[1],
      },
      {
        name: "GitHub",
        icon: "github",
        color: "#e3dff8",
        detail: world.details[2],
      },
    ];
  if (world.id === "projects")
    return [
      {
        name: "Scout",
        icon: "scout",
        color: "#f3c17a",
        detail: world.details[0],
      },
      {
        name: "Finny",
        icon: "finny",
        color: "#8de0ce",
        detail: world.details[1],
      },
      {
        name: "Research",
        icon: "research",
        color: "#b3b7f5",
        detail: world.details[2],
      },
    ];
  return [
    {
      name: "About Jaimin",
      icon: "person",
      color: "#91d7c8",
      detail: [
        "ABOUT JAIMIN",
        "Meet Jaimin",
        world.description,
        "https://www.jaimin-patel.me/about",
      ],
    },
    {
      name: "Waterloo",
      icon: "school",
      color: "#f2d281",
      detail: [
        "EDUCATION",
        "Computing × finance",
        "I study Computing and Financial Management at the University of Waterloo.",
        "https://uwaterloo.ca/computing-financial-management/",
      ],
    },
    {
      name: "Résumé",
      icon: "resume",
      color: "#b6c8ef",
      detail: [
        "MY EXPERIENCE",
        "Résumé",
        "Read my experience and background in the full résumé.",
        "https://www.jaimin-patel.me/resume.pdf",
      ],
    },
  ];
}
const iconSources = {
  github: githubSvg,
  linkedin: linkedinSvg,
  calendar: calendarSvg,
  school: schoolSvg,
  person: personSvg,
  resume: resumeSvg,
  scout: scoutSvg,
  finny: finnySvg,
  research: researchSvg,
};
export function hologram(scene, config, x, y, z) {
  const group = new THREE.Group();
  group.position.set(x, y + 3.6, z);
  scene.add(group);
  const uniforms = {
    time: { value: 0 },
    tint: { value: new THREE.Color(config.color) },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    vertexShader: `varying vec3 vP;varying vec3 vN;varying vec3 vV;void main(){vP=position;vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,
    fragmentShader: `uniform float time;uniform vec3 tint;varying vec3 vP;varying vec3 vN;varying vec3 vV;void main(){float rim=pow(1.-abs(dot(normalize(vN),normalize(vV))),1.5);float scan=.7+.3*smoothstep(-.2,.2,sin(vP.y*85.-time*2.));float shimmer=.96+.04*sin(time*1.7+vP.y*9.);gl_FragColor=vec4(tint*(1.2+rim*1.8),(.26+rim*.5)*scan*shimmer);}`,
  });
  const data = new SVGLoader().parse(iconSources[config.icon]);
  for (const path of data.paths) {
    const style = path.userData.style;
    if (style.fill && style.fill !== "none") {
      for (const shape of SVGLoader.createShapes(path)) {
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: 2.8,
          bevelEnabled: true,
          bevelSize: 0.12,
          bevelThickness: 0.12,
          bevelSegments: 2,
          curveSegments: 20,
          steps: 1,
        });
        geometry.translate(-12, -12, -1.4);
        geometry.scale(0.12, -0.12, 0.12);
        group.add(new THREE.Mesh(geometry, material));
        const outline = new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry, 30),
          new THREE.LineBasicMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false,
          }),
        );
        group.add(outline);
      }
    } else
      for (const sub of path.subPaths) {
        const points = sub
          .getPoints(32)
          .map(
            (p) => new THREE.Vector3((p.x - 12) * 0.12, (12 - p.y) * 0.12, 0),
          );
        if (points.length > 1) {
          const curve = new THREE.CatmullRomCurve3(points);
          group.add(
            new THREE.Mesh(
              new THREE.TubeGeometry(
                curve,
                Math.min(120, points.length * 2),
                0.065,
                6,
                false,
              ),
              material,
            ),
          );
        }
      }
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.textAlign = "center";
  ctx.fillStyle = "#e7fbff";
  ctx.font = "600 92px system-ui";
  ctx.fillText(config.name, 512, 112);
  ctx.font = "30px system-ui";
  ctx.fillStyle = config.color;
  ctx.fillText("Explore this connection", 512, 182);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(3.7, 0.925),
    new THREE.MeshBasicMaterial({
      map: texture(canvas),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      fog: false,
      side: THREE.DoubleSide,
    }),
  );
  label.position.y = -2;
  group.add(label);
  const beamMat = new THREE.ShaderMaterial({
    uniforms: { tint: uniforms.tint },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    vertexShader: `varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 tint;varying vec2 vU;void main(){float ray=.6+.4*pow(abs(sin(vU.x*32.)),10.);gl_FragColor=vec4(tint,ray*.2*pow(1.-vU.y,1.4));}`,
  });
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 0.07, 3.2, 48, 1, true),
    beamMat,
  );
  beam.position.set(x, y + 1.9, z);
  scene.add(beam);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 1.1, 0.22, 48),
    new THREE.MeshStandardMaterial({
      color: "#12252e",
      metalness: 0.8,
      roughness: 0.3,
    }),
  );
  base.position.set(x, y + 0.4, z);
  scene.add(base);
  for (const radius of [1.1, 0.8, 0.4]) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.035, 6, 64),
      new THREE.MeshBasicMaterial({ color: config.color, toneMapped: false }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, y + 0.55, z);
    scene.add(ring);
  }
  const scan = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.015, 4, 80),
    new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  scan.rotation.x = Math.PI / 2;
  scan.position.set(x, y + 2, z);
  scene.add(scan);
  return { panel: group, beam, scan, uniforms, baseY: y, x, z, config };
}
