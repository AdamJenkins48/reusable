import { cpSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.join(root, "index.html"),
        "professional-retraining": path.join(root, "professional-retraining.html"),
        "advanced-training": path.join(root, "advanced-training.html"),
      },
    },
  },
  plugins: [
    {
      name: "copy-program-data",
      closeBundle() {
        cpSync(path.join(root, "data"), path.join(root, "dist/data"), {
          recursive: true,
        });
      },
    },
  ],
});
