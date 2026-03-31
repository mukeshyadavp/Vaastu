import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  resolve: {
    dedupe: ["react", "react-dom"]
  },

  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime"]
  },

  build: {
    rollupOptions: {
      external: [] // 🔥 VERY IMPORTANT (prevents react from being externalized)
    },
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
});