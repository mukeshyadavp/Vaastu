import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: "frontend",

  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    }
  },

  build: {
    outDir: "../backend/static",
    emptyOutDir: true,
    sourcemap: false
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "frontend/src")
    }
  }
});