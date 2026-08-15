// Single source of truth for per-agent credit cost. Previously this table
// was copy-pasted inline into both deductCredits and refundCredits — a
// change to one without the other would have let a deduction and its
// matching refund silently drift out of sync.
export const AGENT_COST = {

    chat: 1,

    search: 5,

    coding: 10,

    pdf: 10,

    ppt: 10,

    image: 10

};

export const getAgentCost = (agent) => AGENT_COST[agent] || 1;
