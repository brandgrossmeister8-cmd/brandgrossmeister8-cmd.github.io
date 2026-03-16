import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: '/',
  server: {
    host: "127.0.0.1",
    port: 8091,
    hmr: {
      overlay: false,
    },
    headers: {
      'Cache-Control': 'no-store',
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
