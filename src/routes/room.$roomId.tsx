import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { exists } from '@/firebase/db';
import { group } from '@/hooks/group';
import { priv } from '@/hooks/private';
import { useUnread } from '@/hooks/unread';
import { Panel, type ChatType } from '@/components/panel';
import { Chat } from '@/components/chat';

export const Route = createFileRoute('/room/$roomId')({
  component: RoomPage,
});

function RoomPage() {
  const { roomId } = Route.useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ChatType>({ type: 'group' });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    exists(roomId).then((isThere) => {
      if (isThere === false) {
        navigate({ to: '/' });
      } else {
        setLoading(false);
      }
    });
  }, [roomId, navigate]);

  const { me, users, messages: groupMsgs, send: sendGroupMsg } = group(roomId);

  let isPrivate = false;
  if (tab.type === 'private') {
    isPrivate = true;
  }
  
  let targetId = "";
  if (isPrivate === true) {
    if (tab.type === 'private') {
      targetId = tab.userId;
    }
  }
  
  let targetPerson = undefined;
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === targetId) {
      targetPerson = users[i];
    }
  }
  
  let myId = "";
  let myName = "";
  if (me !== null) {
    myId = me.id;
    myName = me.name;
  }

  const unreadCounts = useUnread(roomId, myId, users, tab);

  const { messages: privateMsgs, send: sendPrivateMsg } = priv(
    roomId,
    myId,
    myName,
    targetId
  );

  if (loading === true) {
    return <div className="h-screen w-full flex items-center justify-center text-base animate-pulse" style={{ background: "oklch(0.97 0.012 75)", color: "oklch(0.55 0.03 60)" }}>Loading…</div>;
  }

  const selectTab = (t: ChatType) => {
    setTab(t);
    setMenuOpen(false);
  };

  let currentMsgs = groupMsgs;
  if (isPrivate === true) {
    currentMsgs = privateMsgs;
  }
  
  let sendFn = sendGroupMsg;
  if (isPrivate === true) {
    sendFn = sendPrivateMsg;
  }
  
  let titleStr = 'Group Chat';
  if (isPrivate === true) {
    if (targetPerson !== undefined) {
      titleStr = targetPerson.name;
    } else {
      titleStr = 'Private Chat';
    }
  }
  
  let subStr = "";
  subStr = users.length + " users in room";
  if (isPrivate === true) {
    if (targetPerson !== undefined) {
      if (targetPerson.online === true) {
        subStr = "Online";
      } else {
        subStr = "Offline";
      }
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "oklch(0.97 0.012 75)" }}>
      <div className="hidden md:block">
        <Panel 
          roomId={roomId} 
          currentUser={me} 
          users={users} 
          activeChat={tab} 
          onSelectChat={selectTab} 
          unreadCounts={unreadCounts}
        />
      </div>

      <div className="flex-1 flex flex-col relative min-w-0">
        <div className="md:hidden absolute top-3 left-4 z-20">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="h-10 w-10 flex items-center justify-center rounded-xl"
                style={{ background: "oklch(0.99 0.005 75)", border: "1px solid oklch(0.88 0.02 75)", color: "oklch(0.45 0.03 60)" }}
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72" style={{ borderRight: "1px solid oklch(0.88 0.02 75)" }}>
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <Panel 
                roomId={roomId} 
                currentUser={me} 
                users={users} 
                activeChat={tab} 
                onSelectChat={selectTab} 
                unreadCounts={unreadCounts}
              />
            </SheetContent>
          </Sheet>
        </div>

        <Chat
          title={titleStr}
          subtitle={subStr}
          messages={currentMsgs}
          currentUserId={myId}
          onSendMessage={sendFn}
          isGroupChat={!isPrivate}
        />
      </div>
    </div>
  );
}
