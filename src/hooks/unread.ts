import { useState, useEffect, useRef } from 'react';
import type { User } from '@/types/person';
import { getKey, listenPrivate, listenGroup } from '@/firebase/db';
import type { ChatType } from '@/components/panel';

export function useUnread(roomId: string, currentUserId: string, users: User[], activeChat: ChatType) {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const activeChatRef = useRef(activeChat);

  useEffect(() => {
    activeChatRef.current = activeChat;

    if (activeChat.type === 'group') {
      setUnreadCounts(prev => ({ ...prev, group: 0 }));
    } else if (activeChat.type === 'private') {
      setUnreadCounts(prev => {
        if (!prev[activeChat.userId]) return prev;
        return { ...prev, [activeChat.userId]: 0 };
      });
    }
  }, [activeChat]);

  const userIds = users.map(u => u.id).sort().join(',');

  useEffect(() => {
    if (!currentUserId) return;

    const unsubs: (() => void)[] = [];
    const startTime = Date.now();

    const unsubGroup = listenGroup(roomId, (msg) => {
      if (msg.timestamp < startTime) return;
      if (msg.senderId === currentUserId) return; 
      if (activeChatRef.current.type !== 'group') {
        setUnreadCounts(prev => ({ ...prev, group: (prev['group'] || 0) + 1 }));
      }
    });
    unsubs.push(unsubGroup);

    users.forEach(user => {
      if (user.id === currentUserId) return;
      const conversationKey = getKey(currentUserId, user.id);
      const unsub = listenPrivate(roomId, conversationKey, (msg) => {
        if (msg.timestamp < startTime) return;
        if (msg.senderId === currentUserId) return; 
        
        const currentActive = activeChatRef.current;
        if (currentActive.type === 'private' && currentActive.userId === user.id) {
          return;
        }
        
        setUnreadCounts(prev => ({ ...prev, [user.id]: (prev[user.id] || 0) + 1 }));
      });
      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [roomId, currentUserId, userIds]);

  return unreadCounts;
}
