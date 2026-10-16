import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  cacheDir: ".cache/vite",
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        about: resolve(import.meta.dirname, "planets/about.html"),
        projects: resolve(import.meta.dirname, "planets/projects.html"),
        contact: resolve(import.meta.dirname, "planets/contact.html"),
      },
      output: { manualChunks: { three: ["three"] } },
    },
  },
});
