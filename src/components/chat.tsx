import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bubble } from "./bubble";
import { InputBox } from "./input";
import type { Message } from "@/types/msg";
import { Users, User as UserIcon } from "lucide-react";

interface ChatWindowProps {
  title: string;
  subtitle?: string;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (text: string) => Promise<void>;
  isGroupChat?: boolean;
}

export function Chat({ title, subtitle, messages, currentUserId, onSendMessage, isGroupChat = false }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let el = scrollRef.current;
    if (el !== null) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden" style={{ background: "oklch(0.98 0.008 75)" }}>

      <div
        className="px-6 py-4 shrink-0 flex flex-col justify-center"
        style={{
          background: "oklch(0.99 0.005 75)",
          borderBottom: "1px solid oklch(0.88 0.02 75)",
        }}
      >
        <h2 className="text-base font-semibold leading-tight" style={{ color: "oklch(0.28 0.04 55)" }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: "oklch(0.58 0.02 65)" }}>
            {subtitle}
          </p>
        )}
      </div>

      <ScrollArea className="flex-1 px-4 sm:px-6" ref={scrollRef}>
        <div className="flex flex-col gap-3 py-6 min-h-[calc(100vh-8rem)]">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center m-auto gap-3">
              <div style={{ color: "oklch(0.75 0.02 65)" }}>
                {isGroupChat ? <Users className="w-7 h-7" /> : <UserIcon className="w-7 h-7" />}
              </div>
              <p className="text-sm" style={{ color: "oklch(0.65 0.02 65)" }}>
                No conversation yet. Start typing. 
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              let isOwnMessage = false;
              if (msg.senderId === currentUserId) {
                isOwnMessage = true;
              }

              let prevMsg = null;
              if (index > 0) {
                prevMsg = messages[index - 1];
              }

              let showAvatar = true;
              if (isOwnMessage) {
                showAvatar = false;
              } else {
                if (prevMsg !== null) {
                  if (prevMsg.senderId === msg.senderId) {
                    showAvatar = false;
                  }
                }
              }

              return (
                <Bubble
                  key={msg.id}
                  text={msg.text}
                  senderName={msg.senderName}
                  timestamp={msg.timestamp}
                  isOwnMessage={isOwnMessage}
                  showAvatar={showAvatar}
                />
              );
            })
          )}
        </div>
      </ScrollArea>

      <div
        className="px-4 sm:px-6 py-4 shrink-0"
        style={{ borderTop: "1px solid oklch(0.88 0.02 75)", background: "oklch(0.99 0.005 75)" }}
      >
        <InputBox onSend={onSendMessage} placeholder={`Message ${title}…`} />
      </div>
    </div>
  );
}
