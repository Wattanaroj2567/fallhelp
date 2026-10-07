import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: { port: 5175, strictPort: true, host: "127.0.0.1" },
  test: { environment: "node", include: ["src/**/__tests__/**/*.test.ts"] },
});
