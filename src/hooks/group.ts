import { useState, useEffect } from "react";
import type { Message } from "@/types/msg";
import type { User } from "@/types/person";
import { join, leave, listenGroup, listenUsers, sendGroup } from "@/firebase/db";

const names = [
  "Harleigh Bradford", "Amaia Shah", "Ander Herrera", "Ximena Valencia", "Dax West", "David Lee",
  "Avery Jordan", "Riley Casey", "Quinn Taylor", "Rowan Blake", "Morgan Reese", "Jordan Peyton",
  "Casey Alex", "Jamie Drew", "Taylor Finley", "Cameron Jules", "Skyler Kendall", "Logan Parker",
  "Devin Sage", "Bailey Spencer", "Emerson Micah", "River Sawyer", "Hayden Ashton", "Charlie Kai",
  "Dakota Riley", "Dylan Sage", "Elliott Wren", "Frankie Blair", "Jesse Lane", "Kendall Reese"
];

function makeName(): string {
  const randomIndex = Math.floor(Math.random() * names.length);
  return names[randomIndex];
}

function letters(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function group(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [me, setMe] = useState<User | null>(null);

  useEffect(() => {
    let theUserId = sessionStorage.getItem("chat_userId");
    let theUserName = sessionStorage.getItem("chat_userName");

    if (theUserId === null || theUserName === null) {
      theUserId = crypto.randomUUID();
      theUserName = makeName();
      sessionStorage.setItem("chat_userId", theUserId);
      sessionStorage.setItem("chat_userName", theUserName);
    }

    const myUser = {
      id: theUserId,
      name: theUserName,
      initials: letters(theUserName),
      joinedAt: Date.now(),
      online: true,
    };

    setMe(myUser);

    join(roomId, myUser).catch((err) => {
      console.log("error joining room", err);
    });

    const unsubUsers = listenUsers(roomId, (usersList) => {
      setUsers(usersList);
    });

    const unsubMessages = listenGroup(roomId, (newMessage) => {
      setMessages((oldMessages) => {
        let isDuplicate = false;
        for (let i = 0; i < oldMessages.length; i++) {
          if (oldMessages[i].id === newMessage.id) {
            isDuplicate = true;
          }
        }
        
        if (isDuplicate) {
          return oldMessages;
        } else {
          const newArray = [];
          for (let i = 0; i < oldMessages.length; i++) {
            newArray.push(oldMessages[i]);
          }
          newArray.push(newMessage);
          return newArray;
        }
      });
    });

    return function cleanup() {
      leave(roomId, myUser.id).catch((err) => {
        console.log("error leaving room", err);
      });
      unsubUsers();
      unsubMessages();
      setMessages([]);
    };
  }, [roomId]);

  const send = async (text: string) => {
    if (me !== null) {
      if (text !== "") {
        if (text.trim() !== "") {
          try {
            await sendGroup(roomId, me.id, me.name, text);
          } catch (e) {
            console.log("failed to send", e);
          }
        }
      }
    }
  };

  return { me, users, messages, send };
}
