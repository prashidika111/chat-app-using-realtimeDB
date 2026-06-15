import { useState, useEffect } from "react";
import type { Message } from "@/types/msg";
import { getKey, listenPrivate, sendPrivate } from "@/firebase/db";

export function priv(roomId: string, currentUserId: string, currentUserName: string, targetUserId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  
  let conversationKey = "";
  if (currentUserId !== "" && targetUserId !== "") {
    conversationKey = getKey(currentUserId, targetUserId);
  }

  useEffect(() => {
    setMessages([]);

    if (conversationKey !== "") {
      const unsub = listenPrivate(roomId, conversationKey, (newMessage) => {
        setMessages((oldArray) => {
          let found = false;
          for (let i = 0; i < oldArray.length; i++) {
            if (oldArray[i].id === newMessage.id) {
              found = true;
            }
          }
          if (found) {
            return oldArray;
          }
          
          const newArray = [];
          for (let i = 0; i < oldArray.length; i++) {
            newArray.push(oldArray[i]);
          }
          newArray.push(newMessage);
          return newArray;
        });
      });

      return function cleanup() {
        unsub();
      };
    }
  }, [roomId, conversationKey]);

  const send = async (text: string) => {
    if (text !== "") {
      let t = text;
      t = t.trim();
      if (t !== "") {
        try {
          await sendPrivate(roomId, conversationKey, currentUserId, currentUserName, "text", t);
        } catch (e) {
          console.log("error", e);
        }
      }
    }
  };
  const sendImage = async (imageUrl: string) => {
  try {
    await sendPrivate(
      roomId,
      conversationKey,
      currentUserId,
      currentUserName,
      "image",
      imageUrl
    );
  } catch (e) {
    console.log("error", e);
  }
};

  return { messages, send, sendImage };
}
