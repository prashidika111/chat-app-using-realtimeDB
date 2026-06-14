import { useState } from "react";
import { SendHorizontal } from "lucide-react";

interface MessageInputProps {
  onSend: (text: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

export function InputBox({ onSend, placeholder = "Type a message…", disabled = false }: MessageInputProps) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let canSend = true;
    if (text.trim() === "") {
      canSend = false;
    }
    if (isSending === true) {
      canSend = false;
    }
    if (disabled === true) {
      canSend = false;
    }

    if (canSend === true) {
      try {
        setIsSending(true);
        await onSend(text);
        setText("");
      } catch (error) {
        console.log(error);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (e.shiftKey === false) {
        e.preventDefault();
        handleSubmit(e);
      }
    }
  };

  const btnDisabled = text.trim() === "" || isSending || disabled;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-2xl p-1.5"
      style={{
        background: "oklch(0.97 0.01 75)",
        border: "1.5px solid oklch(0.86 0.02 75)",
        transition: "border-color 0.15s",
      }}
      onFocusCapture={(e) => {
        e.currentTarget.style.borderColor = "oklch(0.62 0.14 42)";
      }}
      onBlurCapture={(e) => {
        e.currentTarget.style.borderColor = "oklch(0.86 0.02 75)";
      }}
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isSending}
        autoComplete="off"
        className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none disabled:opacity-50"
        style={{ color: "oklch(0.28 0.04 55)" }}
      />
      <button
        type="submit"
        disabled={btnDisabled}
        className="shrink-0 h-9 w-9 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-30"
        style={{
          background: "oklch(0.62 0.14 42)",
          color: "white",
        }}
      >
        <SendHorizontal className="w-4 h-4 ml-0.5" />
      </button>
    </form>
  );
}
