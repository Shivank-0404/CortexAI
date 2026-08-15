import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { detectLanguage } from "../detectLanguage.js";

describe("detectLanguage", () => {

  const cases = [
    ["index.html", "html"],
    ["style.css", "css"],
    ["script.js", "javascript"],
    ["App.jsx", "javascript"],
    ["main.ts", "typescript"],
    ["App.tsx", "typescript"],
    ["data.json", "json"],
    ["main.py", "python"],
    ["Main.java", "java"],
    ["main.cpp", "cpp"],
    ["main.c", "c"]
  ];

  for (const [fileName, expected] of cases) {
    test(`maps ${fileName} -> ${expected}`, () => {
      assert.equal(detectLanguage(fileName), expected);
    });
  }

  test("is case-insensitive", () => {
    assert.equal(detectLanguage("MAIN.PY"), "python");
  });

  test("falls back to plaintext for an unknown extension", () => {
    assert.equal(detectLanguage("README.md"), "plaintext");
  });

  test("falls back to plaintext when called with no filename", () => {
    assert.equal(detectLanguage(), "plaintext");
  });
});
