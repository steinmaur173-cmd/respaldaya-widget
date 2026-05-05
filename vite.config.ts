import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "RespaldayaWidget",
      fileName: () => "widget.js",
      formats: ["iife"],
    },
    outDir: "dist",
    minify: "terser",
    terserOptions: {
      compress: { drop_console: true },
      format: { comments: /^!/ }, // preserve license comment
    },
    rollupOptions: {
      output: {
        // No external dependencies — everything bundled
        inlineDynamicImports: true,
      },
    },
  },
});
