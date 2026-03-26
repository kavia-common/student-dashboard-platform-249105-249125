import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    // No webServer here: keep it minimal and avoid coupling tests to running dev server.
    // We only do a simple static assertion to ensure the runner is wired.
    headless: true,
  },
  reporter: process.env.CI ? "list" : "dot",
});
