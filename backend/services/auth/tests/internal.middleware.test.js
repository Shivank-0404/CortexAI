import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import { requireInternalSecret } from "../middlewares/internal.middleware.js";

// Minimal fake req/res so we don't need a real Express app or HTTP server
// just to exercise the middleware's branching logic.
function makeReq(headers = {}) {
  return { headers };
}

function makeRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
  return res;
}

describe("requireInternalSecret", () => {

  const ORIGINAL_SECRET = process.env.INTERNAL_SERVICE_SECRET;

  afterEach(() => {
    process.env.INTERNAL_SERVICE_SECRET = ORIGINAL_SECRET;
  });

  test("fails closed (500) when INTERNAL_SERVICE_SECRET is not configured, instead of silently allowing the request through", () => {
    delete process.env.INTERNAL_SERVICE_SECRET;

    const req = makeReq({ "x-internal-secret": "anything" });
    const res = makeRes();
    let nextCalled = false;

    requireInternalSecret(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 500);
  });

  test("rejects (403) a request with no secret header", () => {
    process.env.INTERNAL_SERVICE_SECRET = "correct-secret";

    const req = makeReq({});
    const res = makeRes();
    let nextCalled = false;

    requireInternalSecret(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
  });

  test("rejects (403) a request with the wrong secret", () => {
    process.env.INTERNAL_SERVICE_SECRET = "correct-secret";

    const req = makeReq({ "x-internal-secret": "wrong-secret" });
    const res = makeRes();
    let nextCalled = false;

    requireInternalSecret(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
  });

  test("calls next() when the secret matches", () => {
    process.env.INTERNAL_SERVICE_SECRET = "correct-secret";

    const req = makeReq({ "x-internal-secret": "correct-secret" });
    const res = makeRes();
    let nextCalled = false;

    requireInternalSecret(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, null);
  });
});
