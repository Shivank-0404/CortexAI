import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { getAgentCost, AGENT_COST } from "../config/agentCost.js";

describe("getAgentCost", () => {

  test("returns the configured cost for each known agent", () => {
    for (const [agent, cost] of Object.entries(AGENT_COST)) {
      assert.equal(getAgentCost(agent), cost);
    }
  });

  test("defaults to 1 for an unknown agent", () => {
    assert.equal(getAgentCost("some_future_agent"), 1);
  });

  test("defaults to 1 when agent is undefined", () => {
    assert.equal(getAgentCost(undefined), 1);
  });

  test("deduct and refund always agree, since both read from the same table", () => {
    // Regression guard for the original bug: deductCredits and
    // refundCredits each had their own copy-pasted COST object, which
    // could silently drift apart. Now that both import getAgentCost,
    // this is trivially true — but it stays true specifically *because*
    // there's only one table left to edit.
    for (const agent of Object.keys(AGENT_COST)) {
      const deductAmount = getAgentCost(agent);
      const refundAmount = getAgentCost(agent);
      assert.equal(deductAmount, refundAmount);
    }
  });
});
