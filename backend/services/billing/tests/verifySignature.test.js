import { test, describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

import { verifyRazorpaySignature } from "../utils/verifySignature.js";

const KEY_SECRET = "test-key-secret";

function sign(orderId, paymentId, keySecret = KEY_SECRET) {
  return crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

describe("verifyRazorpaySignature", () => {

  test("accepts a correctly signed payload", () => {
    const orderId = "order_123";
    const paymentId = "pay_456";
    const signature = sign(orderId, paymentId);

    const result = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature,
      keySecret: KEY_SECRET
    });

    assert.equal(result, true);
  });

  test("rejects a tampered signature", () => {
    const orderId = "order_123";
    const paymentId = "pay_456";
    const signature = sign(orderId, paymentId).slice(0, -1) + "0";

    const result = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature,
      keySecret: KEY_SECRET
    });

    assert.equal(result, false);
  });

  test("rejects a signature computed with the wrong key secret", () => {
    const orderId = "order_123";
    const paymentId = "pay_456";
    const signature = sign(orderId, paymentId, "wrong-secret");

    const result = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature,
      keySecret: KEY_SECRET
    });

    assert.equal(result, false);
  });

  test("rejects a signature for a different order/payment id pair", () => {
    const signature = sign("order_123", "pay_456");

    const result = verifyRazorpaySignature({
      orderId: "order_999",
      paymentId: "pay_456",
      signature,
      keySecret: KEY_SECRET
    });

    assert.equal(result, false);
  });

  test("does not throw when signature length differs from the expected hex length (regression: naive timingSafeEqual throws on length mismatch)", () => {
    assert.doesNotThrow(() => {
      verifyRazorpaySignature({
        orderId: "order_123",
        paymentId: "pay_456",
        signature: "short",
        keySecret: KEY_SECRET
      });
    });
  });

  test("rejects a non-string signature without throwing", () => {
    assert.doesNotThrow(() => {
      const result = verifyRazorpaySignature({
        orderId: "order_123",
        paymentId: "pay_456",
        signature: undefined,
        keySecret: KEY_SECRET
      });
      assert.equal(result, false);
    });
  });
});
