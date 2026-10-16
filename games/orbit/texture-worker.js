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
  const canvas = new OffscreenCanvas(2048, 1024);
  canvas.width = 2048;
  canvas.height = 1024;
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
      const fine = noise(nx * 100 + 20, ny * 100 + 20, nz * 100 + 20);
      r += (fine - 0.5) * 16;
      g += (fine - 0.5) * 16;
      b += (fine - 0.5) * 16;
      const i = (y * canvas.width + x) * 4;
      image.data[i] = r;
      image.data[i + 1] = g;
      image.data[i + 2] = b;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.transferToImageBitmap();
}

self.onmessage = () => {
  try {
    for (const type of ["gas"]) {
      const image = planetTexture(type);
      self.postMessage({ type, image }, [image]);
    }
  } catch (error) {
    self.postMessage({ error: String(error) });
  }
};
