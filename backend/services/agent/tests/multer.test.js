import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { generateSafeFilename } from "../config/multer.js";

describe("generateSafeFilename", () => {

  test("strips directory traversal components from a malicious originalname", () => {
    const result = generateSafeFilename("../../../../etc/cron.d/evil.pdf");

    assert.ok(!result.includes(".."));
    assert.ok(!result.includes("/"));
    assert.ok(result.endsWith(".pdf"));
  });

  test("drops an unrecognized/dangerous extension entirely rather than passing it through", () => {
    const result = generateSafeFilename("resume.exe");

    assert.ok(!result.endsWith(".exe"));
  });

  test("keeps a legitimate pdf extension", () => {
    const result = generateSafeFilename("report.PDF");

    assert.ok(result.endsWith(".pdf"));
  });

  test("keeps a legitimate image extension", () => {
    const result = generateSafeFilename("photo.jpeg");

    assert.ok(result.endsWith(".jpeg"));
  });

  test("never reuses the client-supplied base name, only the extension", () => {
    const result = generateSafeFilename("some user supplied name with spaces.png");

    assert.ok(!result.includes("some user supplied name"));
    assert.ok(result.endsWith(".png"));
  });

  test("two calls never collide, even in the same millisecond", () => {
    const a = generateSafeFilename("a.png");
    const b = generateSafeFilename("a.png");

    assert.notEqual(a, b);
  });

  test("handles a missing extension without throwing", () => {
    const result = generateSafeFilename("noextension");

    assert.ok(typeof result === "string" && result.length > 0);
  });
});
