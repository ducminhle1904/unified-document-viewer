import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

export default defineConfig({
  testDir: "./src/e2e",
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5199",
    trace: "on-first-retry"
  },
  webServer: [
    {
      command: "PORT=3199 DATABASE_URL=./data/playwright-e2e.sqlite npm run start",
      cwd: repoRoot,
      url: "http://127.0.0.1:3199/health",
      reuseExistingServer: false,
      timeout: 120_000
    },
    {
      command: "VITE_API_BASE_URL=http://127.0.0.1:3199 npm run web:dev -- --host 127.0.0.1 --port 5199",
      cwd: repoRoot,
      url: "http://127.0.0.1:5199",
      reuseExistingServer: false,
      timeout: 120_000
    }
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
