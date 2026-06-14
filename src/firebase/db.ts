import { ref, push, set, onValue, onChildAdded, off, query, orderByChild, limitToLast, onDisconnect, get, serverTimestamp } from "firebase/database";
import { db } from "./config";
import type { Message } from "@/types/msg";
import type { User } from "@/types/person";

export async function makeRoom(roomId: string) {
  const roomRef = ref(db, "rooms/" + roomId);
  const dataToSave = {
    createdAt: serverTimestamp(),
  };
  await set(roomRef, dataToSave);
}

export async function exists(roomId: string) {
  const roomRef = ref(db, "rooms/" + roomId);
  const snapshot = await get(roomRef);
  let doesExist = false;
  if (snapshot.exists() === true) {
    doesExist = true;
  } else {
    doesExist = false;
  }
  return doesExist;
}

export async function join(roomId: string, user: User) {
  const userString = "rooms/" + roomId + "/users/" + user.id;
  const userRef = ref(db, userString);
  onDisconnect(userRef).update({ online: false });
  const userData = {
    id: user.id,
    name: user.name,
    initials: user.initials,
    joinedAt: user.joinedAt,
    online: true,
  };
  
  await set(userRef, userData);
}

export async function leave(roomId: string, userId: string) {
  const path = "rooms/" + roomId + "/users/" + userId;
  const userRef = ref(db, path);
  await set(userRef, null);
}

export function listenUsers(roomId: string, callback: (users: User[]) => void) {
  const path = "rooms/" + roomId + "/users";
  const usersRef = ref(db, path);
  
  const unsubscribe = onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
    if (data === null || data === undefined) {
      callback([]);
    } else {
      const usersList: User[] = [];
      const keys = Object.keys(data);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        usersList.push(data[key]);
      }
      callback(usersList);
    }
  });
  return function() {
    off(usersRef, "value", unsubscribe);
  };
}
export async function sendGroup(roomId: string, senderId: string, senderName: string, text: string) {
  const path = "rooms/" + roomId + "/messages";
  const messagesRef = ref(db, path);
  const newMsgRef = push(messagesRef);
  const theKey = newMsgRef.key;
  if (theKey !== null) {
    const messageData = {
      id: theKey,
      senderId: senderId,
      senderName: senderName,
      text: text,
      timestamp: serverTimestamp(),
    };
    await set(newMsgRef, messageData);
  }
}
export function listenGroup(roomId: string, callback: (message: Message) => void) {
  const path = "rooms/" + roomId + "/messages";
  const messagesRef = ref(db, path);
  const recentQuery = query(messagesRef, orderByChild("timestamp"), limitToLast(100));
  const unsubscribe = onChildAdded(recentQuery, (snapshot) => {
    const msg = snapshot.val() as Message;
    let ts = msg.timestamp;
    if (!ts) {
      ts = Date.now();
    }
    const newMessage = {
      id: msg.id,
      senderId: msg.senderId,
      senderName: msg.senderName,
      text: msg.text,
      timestamp: ts
    };
    callback(newMessage);
  });
  
  return function() {
    off(recentQuery, "child_added", unsubscribe);
  };
}

export function getKey(userId1: string, userId2: string) {
  let first = "";
  let second = "";
  if (userId1 < userId2) {
    first = userId1;
    second = userId2;
  } else {
    first = userId2;
    second = userId1;
  }
  return first + "_" + second;
}

export async function sendPrivate(roomId: string, conversationKey: string, senderId: string, senderName: string, text: string) {
  const path = "rooms/" + roomId + "/privateMessages/" + conversationKey;
  const messagesRef = ref(db, path);
  const newMsgRef = push(messagesRef);
  
  const theKey = newMsgRef.key;
  if (theKey !== null) {
    const messageData = {
      id: theKey,
      senderId: senderId,
      senderName: senderName,
      text: text,
      timestamp: serverTimestamp(),
    };
    await set(newMsgRef, messageData);
  }
}

export function listenPrivate(roomId: string, conversationKey: string, callback: (message: Message) => void) {
  const path = "rooms/" + roomId + "/privateMessages/" + conversationKey;
  const messagesRef = ref(db, path);
  const recentQuery = query(messagesRef, orderByChild("timestamp"), limitToLast(100));
  
  const unsubscribe = onChildAdded(recentQuery, (snapshot) => {
    const msg = snapshot.val() as Message;
    let ts = msg.timestamp;
    if (!ts) {
      ts = Date.now();
    }
    const newMessage = {
      id: msg.id,
      senderId: msg.senderId,
      senderName: msg.senderName,
      text: msg.text,
      timestamp: ts
    };
    callback(newMessage);
  });
  
  return function() {
    off(recentQuery, "child_added", unsubscribe);
  };
}
