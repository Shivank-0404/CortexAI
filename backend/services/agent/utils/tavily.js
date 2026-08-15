import { TavilySearch } from "@langchain/tavily";

const originalSearchTool = new TavilySearch({
  maxResults: 5,
  topic: "general",
  includeImages:true
});

const originalInvoke = originalSearchTool.invoke.bind(originalSearchTool);
originalSearchTool.invoke = async function(input, options) {
  const key = process.env.TAVILY_API_KEY;
  const isPlaceholder = !key || key.startsWith("add ") || key.startsWith("Add ");
  if (isPlaceholder) {
    console.log("[Mock Mode] Mocking Tavily search results");
    return JSON.stringify([
      { title: "Mock Result 1", url: "https://example.com/1", content: `Search result content matching prompt: ${input.query}` },
      { title: "Mock Result 2", url: "https://example.com/2", content: "Local setup running in development mode." }
    ]);
  }
  return originalInvoke(input, options);
};

export const searchTool = originalSearchTool;

