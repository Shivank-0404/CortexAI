import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { routerNode } from "../graph/router.node.js";

// routerNode has three branches before it ever falls through to the LLM
// call: explicit agent override, image file -> vision, pdf file -> pdf_rag.
// All three are pure/deterministic and don't touch the network, so they're
// tested directly here. The LLM-routing fallback (no explicit agent, no
// file) needs a real or mocked model call and is intentionally left to
// integration testing.

describe("routerNode", () => {

  test("honors an explicit non-auto agent over any file present", async () => {
    const state = {
      agent: "chat",
      file: { mimetype: "image/png" },
      prompt: "hello"
    };

    const result = await routerNode(state);

    assert.equal(result.agent, "chat");
  });

  test("routes an image file to the vision agent when agent is 'auto'", async () => {
    const state = {
      agent: "auto",
      file: { mimetype: "image/jpeg" },
      prompt: "what is this?"
    };

    const result = await routerNode(state);

    assert.equal(result.agent, "vision");
  });

  test("routes a PDF file to pdf_rag when agent is 'auto'", async () => {
    const state = {
      agent: "auto",
      file: { mimetype: "application/pdf" },
      prompt: "summarize this"
    };

    const result = await routerNode(state);

    assert.equal(result.agent, "pdf_rag");
  });

  test("routes an image file to vision even when no agent field is present at all", async () => {
    const state = {
      file: { mimetype: "image/gif" },
      prompt: "describe"
    };

    const result = await routerNode(state);

    assert.equal(result.agent, "vision");
  });

  test("preserves the rest of state unchanged alongside the routing decision", async () => {
    const state = {
      agent: "coding",
      prompt: "build me a todo app",
      conversationId: "abc123",
      userId: "user1"
    };

    const result = await routerNode(state);

    assert.equal(result.agent, "coding");
    assert.equal(result.prompt, state.prompt);
    assert.equal(result.conversationId, state.conversationId);
    assert.equal(result.userId, state.userId);
  });
});
