import { ChatGoogleGenerativeAI }
  from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq"
import dotenv from "dotenv"
dotenv.config()
import { ChatOpenRouter } from "@langchain/openrouter";

function wrapModel(model, modelName) {
  const originalInvoke = model.invoke.bind(model);
  model.invoke = async function(input, options) {
    const key = modelName === "gemini" ? process.env.GOOGLE_API_KEY : 
                modelName === "groq" ? process.env.GROQ_API_KEY : 
                process.env.OPENROUTER_API_KEY;
                
    const isPlaceholder = !key || key.startsWith("add ") || key.startsWith("Add ");
    if (isPlaceholder) {
      console.log(`[Mock Mode] Mocking response for model ${modelName}`);
      let promptText = "";
      if (typeof input === "string") {
        promptText = input;
      } else if (Array.isArray(input)) {
        promptText = input.map(m => m.content || m[1] || "").join("\n");
      } else {
        promptText = JSON.stringify(input);
      }
      
      // If it's the router agent, return one of the expected words
      if (promptText.includes("Return ONLY one word")) {
        const promptLower = promptText.toLowerCase();
        if (promptLower.includes("code") || promptLower.includes("program") || promptLower.includes("function")) {
          return { content: "coding" };
        } else if (promptLower.includes("search") || promptLower.includes("weather") || promptLower.includes("news")) {
          return { content: "search" };
        } else if (promptLower.includes("pdf")) {
          return { content: "pdf" };
        } else if (promptLower.includes("ppt")) {
          return { content: "ppt" };
        }
        return { content: "chat" };
      }
      
      return {
        content: `Hello! I am a simulated response from Cortex AI (${modelName}) because the corresponding API keys are not configured. How can I help you?`
      };
    }
    return originalInvoke(input, options);
  };
  return model;
}

const openRouterRaw = new ChatOpenRouter({
  model: "deepseek/deepseek-chat",
  temperature: 0,
  maxTokens:2500
});

const geminiRaw = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: (process.env.GOOGLE_API_KEY && !process.env.GOOGLE_API_KEY.startsWith("add ")) ? process.env.GOOGLE_API_KEY : "dummy-key"
});

const groqRaw = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
  apiKey: (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.startsWith("add ")) ? process.env.GROQ_API_KEY : "dummy-key"
});

const openRouter = wrapModel(openRouterRaw, "openrouter");
export const gemini = wrapModel(geminiRaw, "gemini");
const groq = wrapModel(groqRaw, "groq");

export const getModel =
  (agent) => {

    switch (agent) {

      case "coding":
        return openRouter;

      case "image":
        return groq;

      case "search":
        return groq;

      case "chat":
        return groq;
      case "vision":
        return gemini;
      default:
        return groq;

    }

  }