import axios from "axios";

export const getConversationHistory =
async(conversationId, userId)=>{

 const response =
 await axios.get(

 `${process.env.CHAT_SERVICE}/get-messages/${conversationId}`,

 {

  headers: {

   "x-user-id": userId

  }

 }

 );

 return response.data;

};