import { test, describe, mock, afterEach } from "node:test";
import assert from "node:assert/strict";
import axios from "axios";
import { deductCredits, refundCredits } from "../utils/deductCredits.js";

describe("deductCredits and refundCredits", () => {
  const ORIGINAL_SECRET = process.env.INTERNAL_SERVICE_SECRET;
  const ORIGINAL_AUTH_URL = process.env.AUTH_SERVICE;

  afterEach(() => {
    mock.restoreAll();
    process.env.INTERNAL_SERVICE_SECRET = ORIGINAL_SECRET;
    process.env.AUTH_SERVICE = ORIGINAL_AUTH_URL;
  });

  test("deductCredits sends correct headers and body to auth service", async () => {
    process.env.INTERNAL_SERVICE_SECRET = "secret123";
    process.env.AUTH_SERVICE = "http://auth-service";

    let capturedUrl = "";
    let capturedBody = null;
    let capturedConfig = null;

    mock.method(axios, "patch", async (url, body, config) => {
      capturedUrl = url;
      capturedBody = body;
      capturedConfig = config;
      return { data: { success: true } };
    });

    await deductCredits("user1", "coding");

    assert.equal(capturedUrl, "http://auth-service/internal/deduct-credits");
    assert.deepEqual(capturedBody, { userId: "user1", agent: "coding" });
    assert.equal(capturedConfig.headers["x-internal-secret"], "secret123");
  });

  test("deductCredits handles axios errors and wraps them correctly", async () => {
    process.env.INTERNAL_SERVICE_SECRET = "secret123";
    process.env.AUTH_SERVICE = "http://auth-service";

    mock.method(axios, "patch", async () => {
      const err = new Error("Request failed");
      err.response = {
        status: 400,
        data: {
          message: "Insufficient balance",
          title: "Out of credits"
        }
      };
      throw err;
    });

    await assert.rejects(
      async () => {
        await deductCredits("user1", "coding");
      },
      (err) => {
        assert.equal(err.message, "Insufficient balance");
        assert.equal(err.status, 400);
        assert.equal(err.data.title, "Out of credits");
        return true;
      }
    );
  });

  test("refundCredits logs error instead of throwing when auth service fails", async () => {
    process.env.INTERNAL_SERVICE_SECRET = "secret123";
    process.env.AUTH_SERVICE = "http://auth-service";

    mock.method(axios, "patch", async () => {
      throw new Error("Network down");
    });

    // refundCredits shouldn't throw an exception, it should handle it gracefully
    await refundCredits("user1", "coding");
    assert.ok(true);
  });
});
