import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_PROXY_TARGET ?? `http://localhost:${env.PORT ?? "3001"}`;
  const host = env.VITE_HOST ?? "127.0.0.1";
  const port = Number(env.VITE_PORT ?? 5173);

  return {
    plugins: [react()],
    server: {
      host,
      port,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true
        }
      }
    }
  };
});
