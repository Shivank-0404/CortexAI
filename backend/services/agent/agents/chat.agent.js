import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getMemory } from "../utils/memory.js";
import { getModel } from "../utils/model.js";
import { checkAgentLimit } from "../config/agentRateLimit.js";
import { deductCredits, refundCredits } from "../utils/deductCredits.js";


export const chatAgent =
async(state)=>{

await checkAgentLimit(
    state.userId,
    "chat"
  );

   await deductCredits(

        state.userId,

        "chat"

    );

try{

 const llm =
 getModel("chat");

 const history =
 await getMemory(
  state.conversationId,
  state.userId
 );

 

const searchContext = state.searchResults
  ? `
Web Search Results:

${state.searchResults}

Answer the user using only the above search results.
`
  : ""




 const messages = [

  new SystemMessage(
`
You are CortexAI, an intelligent AI assistant.

${searchContext}



If searchContext exists:

- Use search results to answer.
- Do not mention internal tools.

Rules:

- For simple questions, greetings, and short queries, respond naturally in plain text.
- For technical, educational, coding, or detailed topics, use clean Markdown.

Formatting:

- Use # for titles and ## for sections.
- Leave a blank line after headings.
- Use bullet points for lists.
- Use numbered lists for steps.
- Use fenced code blocks with language tags for code.
- Keep paragraphs short and readable.
- Never write headings and content on the same line.
- Never generate large walls of text.




`
  )

 ];

 // `history` already includes the current user turn — it was written to
 // the conversation cache/DB by the controller before this agent ran —
 // so we build the message list from history alone instead of also
 // pushing state.prompt again (that was sending the latest message to
 // the LLM twice on every turn).
 history.forEach((msg)=>{

  if(
   msg.role === "user"
  ){

   messages.push(

    new HumanMessage(
     msg.content
    )

   );

  }

  if(
   msg.role === "assistant"
  ){

   messages.push(

    new AIMessage(
     msg.content
    )

   );

  }

 });

 if(
  messages.length === 1
 ){

  // Fallback: history didn't come through for some reason
  // (e.g. cache/DB miss) — make sure the current prompt is still sent.
  messages.push(

   new HumanMessage(
    state.prompt
   )

  );

 }

 const response = await llm.invoke(messages);



const images = state.searchResults?.images || [];



return {
  ...state,

  response:response.content,
  images:images
  
};

}catch(error){

 await refundCredits(
  state.userId,
  "chat"
 );

 throw error;

}

};