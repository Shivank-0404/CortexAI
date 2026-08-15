import Conversation
from "../models/conversation.model.js";

export const createConversation =async(req,res)=>{

 try{
 const userId =req.headers["x-user-id"];
 console.log("userId",userId)
  const conversation =await Conversation.create({
   userId:userId
  });

  res.json(
   conversation
  );

 }catch(error){

  res.status(500).json({
   message:error.message
  });

 }

}


export const getConversations =async(req,res)=>{

 try{
 const userId =req.headers["x-user-id"];
  const conversations =await Conversation.find({

   userId:userId

  })
  .sort({
   updatedAt:-1
  });

  res.json(
   conversations
  );

 }catch(error){

  res.status(500).json({
   message:error.message
  });

 }

}

import Message
from "../models/message.model.js";

export const saveMessage =async(req,res)=>{

 try{

  const {
   conversationId,
   role,
   content,
   images,
  artifacts
  } = req.body;

  const message =await Message.create({

   conversationId,

   role,
  images,
   content,
   artifacts:
  artifacts || []

  });

  res.json(
   message
  );

 }catch(error){

  res.status(500).json({
   message:error.message
  });

 }

}



export const getMessages =async(req,res)=>{

 try{

  const userId = req.headers["x-user-id"];

  // Verify the requester actually owns this conversation before
  // returning its messages — conversationId alone is guessable/enumerable.
  const conversation = await Conversation.findOne({
   _id: req.params.id,
   userId
  });

  if(!conversation){

   return res.status(404).json({
    message:"Conversation not found"
   });

  }

  const messages =await Message.find({

   conversationId:
   req.params.id

  })
  .sort({
   createdAt:1
  });

  res.json(
   messages
  );

 }catch(error){

  res.status(500).json({
   message:error.message
  });

 }

}


export const updateConversation=async (req,res)=>{
try {
    const {conversationId,title}=req.body
    const userId = req.headers["x-user-id"];

    // Only allow updating a conversation that belongs to the requester.
    const conversation=await Conversation.findOneAndUpdate(
        {_id: conversationId, userId},
        {title},
        {new: true}
    )

    if(!conversation){

        return res.status(404).json({
            message:"Conversation not found"
        });

    }

     res.json(
   conversation
  );

 }catch(error){

  res.status(500).json({
   message:error.message
  });

}
}