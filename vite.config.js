import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      // Temporarily disable Fast Refresh to avoid HMR invalidations
      fastRefresh: false,
    }),
  ],
  base: "/Triply-v2.4/",
  server: {
    host: true,
    port: 5173,
    fs: {
      // Prevent Vite from serving files outside this root to avoid pulling in the nested project
      strict: true,
      allow: [path.resolve(__dirname)],
    },
  },
  resolve: {
    // Ensure only one React instance is bundled to avoid "Invalid hook call"
    dedupe: ["react", "react-dom", "react-router-dom", "react-router-hash-link"],
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "react-router-hash-link"],
    force: true,
  },
});
