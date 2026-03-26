import { test, expect } from "@playwright/test";

test("smoke: playwright runner works", async () => {
  // Minimal assertion that does not depend on a running server.
  expect(1 + 1).toBe(2);
});
