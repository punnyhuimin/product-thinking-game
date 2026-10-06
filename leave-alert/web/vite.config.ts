import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The Node backend listens on 8787; the dev server forwards /api to it.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
