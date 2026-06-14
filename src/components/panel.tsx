import { Copy, Hash, Users, MessageCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pic } from "./pic";
import type { User } from "@/types/person";

export type ChatType = { type: 'group' } | { type: 'private', userId: string };

interface SidebarProps {
  roomId: string;
  currentUser: User | null;
  users: User[];
  activeChat: ChatType;
  onSelectChat: (chat: ChatType) => void;
  unreadCounts?: Record<string, number>;
}

export function Panel({ roomId, currentUser, users, activeChat, onSelectChat, unreadCounts = {} }: SidebarProps) {
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
  };

  const otherUsers = [];
  for (let i = 0; i < users.length; i++) {
    if (currentUser !== null) {
      if (users[i].id !== currentUser.id) {
        otherUsers.push(users[i]);
      }
    } else {
      otherUsers.push(users[i]);
    }
  }

  return (
    <div
      className="w-64 sm:w-72 h-full flex flex-col"
      style={{ background: "oklch(0.96 0.015 75)", borderRight: "1px solid oklch(0.88 0.02 75)" }}
    >
      <div className="px-5 pt-6 pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "oklch(0.55 0.03 60)" }}>
          Room
        </p>
        <div className="flex items-center justify-between">
          <span className="font-mono font-semibold tracking-widest text-base" style={{ color: "oklch(0.30 0.04 55)" }}>
            {roomId}
          </span>
          <button
            onClick={copyRoomCode}
            title="Copy code"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "oklch(0.58 0.04 55)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(0.90 0.02 75)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        {currentUser !== null && (
          <div className="flex items-center gap-2.5 mt-4 pt-4" style={{ borderTop: "1px solid oklch(0.88 0.02 75)" }}>
            <Pic name={currentUser.name} initials={currentUser.initials} online={true} />
            <div>
              <p className="text-sm font-medium leading-tight" style={{ color: "oklch(0.28 0.04 55)" }}>
                {currentUser.name}
              </p>
              <p className="text-[11px]" style={{ color: "oklch(0.58 0.02 65)" }}>
                You
              </p>
            </div>
          </div>
        )}
      </div>

      <div style={{ height: "1px", background: "oklch(0.88 0.02 75)" }} />

      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => onSelectChat({ type: 'group' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors"
          style={{
            background: activeChat.type === "group" ? "oklch(0.90 0.04 60)" : "transparent",
            color: activeChat.type === "group" ? "oklch(0.28 0.04 55)" : "oklch(0.45 0.03 60)",
          }}
          onMouseEnter={(e) => {
            if (activeChat.type !== "group") e.currentTarget.style.background = "oklch(0.92 0.02 75)";
          }}
          onMouseLeave={(e) => {
            if (activeChat.type !== "group") e.currentTarget.style.background = "transparent";
          }}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium flex-1">Everyone</span>
          {unreadCounts['group'] > 0 && (
            <span
              className="text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-full"
              style={{ background: "oklch(0.62 0.14 42)", color: "white" }}
            >
              {unreadCounts['group']}
            </span>
          )}
        </button>
      </div>

      <div className="mx-3 my-2" style={{ height: "1px", background: "oklch(0.88 0.02 75)" }} />

      <div className="flex-1 overflow-hidden flex flex-col">
        <p className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "oklch(0.55 0.03 60)" }}>
          All users
        </p>

        <ScrollArea className="flex-1 px-3">
          <div className="flex flex-col gap-0.5 pb-4">
            {otherUsers.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: "oklch(0.65 0.02 65)" }}>
                No one joined yet.
              </p>
            ) : (
              otherUsers.map((user) => {
                let isThisPrivate = false;
                if (activeChat.type === "private") {
                  if (activeChat.userId === user.id) {
                    isThisPrivate = true;
                  }
                }

                return (
                  <button
                    key={user.id}
                    onClick={() => onSelectChat({ type: 'private', userId: user.id })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors"
                    style={{
                      background: isThisPrivate ? "oklch(0.90 0.04 60)" : "transparent",
                      color: isThisPrivate ? "oklch(0.28 0.04 55)" : "oklch(0.40 0.03 60)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isThisPrivate) e.currentTarget.style.background = "oklch(0.92 0.02 75)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isThisPrivate) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Pic name={user.name} initials={user.initials} online={user.online} />
                    <div className="flex flex-col items-start flex-1 overflow-hidden">
                      <span className="text-sm font-medium truncate w-full">{user.name}</span>
                      <span className="text-[11px] flex items-center gap-1" style={{ color: "oklch(0.60 0.02 65)" }}>
                        <MessageCircle className="w-3 h-3" />
                        message
                      </span>
                    </div>
                    {unreadCounts[user.id] > 0 && (
                      <span
                        className="text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-full shrink-0"
                        style={{ background: "oklch(0.62 0.14 42)", color: "white" }}
                      >
                        {unreadCounts[user.id]}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
