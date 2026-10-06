import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The Node backend listens on 8787; the dev server forwards /api to it.
// Production builds are served from https://punnyhuimin.github.io/product-thinking-game/.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/product-thinking-game/" : "/",
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
}));
