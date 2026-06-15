import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bubble } from "./bubble";
import { InputBox } from "./input";
import type { Message } from "@/types/msg";
import { Users, User as UserIcon } from "lucide-react";
import { uploadImage } from "@/firebase/storage";

interface ChatWindowProps {
  title: string;
  subtitle?: string;
  messages: Message[];
  currentUserId: string;

  onSendMessage: (text: string) => Promise<void>;
  onSendImage?: (imageUrl: string) => Promise<void>;

  isGroupChat?: boolean;
}

export function Chat({
  title,
  subtitle,
  messages,
  currentUserId,
  onSendMessage,
  onSendImage,
  isGroupChat = false,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      bottomRef.current?.scrollIntoView({behavior: "smooth",});
    };

    window.addEventListener("chat-send", scrollToBottom);

    return () => {
      window.removeEventListener("chat-send", scrollToBottom);
    };
  }, []);

  return (
    <div
      className="flex-1 flex flex-col min-h-0 overflow-hidden"
      style={{
        background: "oklch(0.98 0.008 75)",
      }}
    >
      <div
        className="shrink-0 px-6 py-4"
        style={{
          background: "oklch(0.99 0.005 75)",
          borderBottom: "1px solid oklch(0.88 0.02 75)",
        }}
      >
        <h2
          className="text-base font-semibold leading-tight"
          style={{
            color: "oklch(0.28 0.04 55)",
          }}
        >
          {title}
        </h2>

        {subtitle && (
          <p
            className="text-xs mt-0.5"
            style={{
              color: "oklch(0.58 0.02 65)",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0 px-4 sm:px-6">
        <div className="flex flex-col gap-3 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div
                style={{
                  color: "oklch(0.75 0.02 65)",
                }}
              >
                {isGroupChat ? (
                  <Users className="w-7 h-7" />
                ) : (
                  <UserIcon className="w-7 h-7" />
                )}
              </div>

              <p
                className="text-sm"
                style={{
                  color: "oklch(0.65 0.02 65)",
                }}
              >
                No conversation yet. Start typing.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isOwnMessage = msg.senderId === currentUserId;

              const prevMsg = index > 0 ? messages[index - 1] : null;

              let showAvatar = true;

              if (isOwnMessage) {
                showAvatar = false;
              } else if (prevMsg && prevMsg.senderId === msg.senderId) {
                showAvatar = false;
              }

              return (
                <Bubble
                  key={msg.id}
                  type={msg.type}
                  content={msg.content}
                  senderName={msg.senderName}
                  timestamp={msg.timestamp}
                  isOwnMessage={isOwnMessage}
                  showAvatar={showAvatar}
                />
              );
            })
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div
        className="shrink-0 px-4 sm:px-6 py-4"
        style={{
          borderTop: "1px solid oklch(0.88 0.02 75)",
          background: "oklch(0.99 0.005 75)",
        }}
      >
        <InputBox
          onSend={onSendMessage}
          onImageSelect={async (file) => {
            try {
              const url = await uploadImage(file);

              if (onSendImage) {
                await onSendImage(url);
              }
            } catch (error) {
              console.log(error);
            }
          }}
          placeholder={`Message ${title}…`}
        />
      </div>
    </div>
  );
}
