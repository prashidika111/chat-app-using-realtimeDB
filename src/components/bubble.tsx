import { Pic } from "./pic";
import { cn } from "@/lib/utils";

function letters(name: string): string {
  if (!name) return "";
  return name.split(" ").map((word) => word[0]).join("").toUpperCase();
}

interface MessageBubbleProps {
  text: string;
  senderName: string;
  timestamp: number;
  isOwnMessage: boolean;
  showAvatar?: boolean;
}

export function Bubble({
  text,
  senderName,
  timestamp,
  isOwnMessage,
  showAvatar = true
}: MessageBubbleProps) {
  let timeString = "";
  const d = new Date(timestamp);
  let hours = d.getHours();
  let minutes = d.getMinutes();
  let ampm = "AM";

  if (hours >= 12) {
    ampm = "PM";
  }
  if (hours > 12) {
    hours = hours - 12;
  }
  if (hours === 0) {
    hours = 12;
  }

  let minsStr = minutes.toString();
  if (minutes < 10) {
    minsStr = "0" + minutes;
  }
  timeString = hours + ":" + minsStr + " " + ampm;

  // Warm terracotta for own messages, soft parchment for others
  const ownBubbleStyle = {
    background: "oklch(0.62 0.14 42)",
    color: "oklch(0.98 0.01 75)",
    borderRadius: "1.25rem 1.25rem 0.3rem 1.25rem",
  };
  const otherBubbleStyle = {
    background: "oklch(0.99 0.005 75)",
    color: "oklch(0.25 0.03 60)",
    border: "1px solid oklch(0.88 0.02 75)",
    borderRadius: "1.25rem 1.25rem 1.25rem 0.3rem",
  };

  return (
    <div className={cn("flex w-full animate-in fade-in slide-in-from-bottom-2 duration-200", isOwnMessage ? "justify-end" : "justify-start")}>

      {!isOwnMessage && showAvatar && (
        <div className="flex-shrink-0 mt-auto mr-2">
          <Pic
            name={senderName}
            initials={letters(senderName)}
            showStatus={false}
            className="h-8 w-8"
          />
        </div>
      )}

      {!isOwnMessage && !showAvatar && (
        <div className="w-8 mr-2" />
      )}

      <div className={cn("flex flex-col max-w-[72%]", isOwnMessage ? "items-end" : "items-start")}>
        {!isOwnMessage && showAvatar && (
          <span className="text-xs font-medium mb-1 ml-1" style={{ color: "oklch(0.52 0.04 55)" }}>
            {senderName}
          </span>
        )}

        <div
          className="px-4 py-2.5 text-[15px] leading-relaxed break-words"
          style={isOwnMessage ? ownBubbleStyle : otherBubbleStyle}
        >
          {text}
        </div>

        <span
          className={cn("text-[10px] mt-1 select-none", isOwnMessage ? "mr-1" : "ml-1")}
          style={{ color: "oklch(0.65 0.02 65)" }}
        >
          {timeString}
        </span>
      </div>
    </div>
  );
}
