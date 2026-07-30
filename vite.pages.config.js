import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/daily-reset-pwa/",
  plugins: [react()],
  publicDir: "public",
  build: {
    outDir: "pages-dist",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.html",
    },
  },
});
