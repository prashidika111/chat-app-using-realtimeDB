import { useState, useRef } from "react";
import { SendHorizontal, ImagePlus } from "lucide-react";

interface MessageInputProps {
  onSend: (text: string) => Promise<void>;
  onImageSelect?: (file: File) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

export function InputBox({
  onSend,
  onImageSelect,
  placeholder = "Type a message…",
  disabled = false,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasText = text.trim() !== "";
  const hasImage = selectedImage !== null;

  const btnDisabled = (!hasText && !hasImage) || isSending || disabled;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const canSend = (hasText || hasImage) && !isSending && !disabled;

    if (!canSend) {
      return;
    }

    try {
      setIsSending(true);

      if (selectedImage && onImageSelect) {
        await onImageSelect(selectedImage);
        window.dispatchEvent(new CustomEvent("chat-send"));
        setSelectedImage(null);
      }

      if (hasText) {
        await onSend(text);
        setText("");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey === false) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    console.log("Selected file:");
    console.log(file);

    setSelectedImage(file);

    e.target.value = "";
  };

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
      {selectedImage && (
        <div
          className="px-3 py-1 text-xs rounded-lg shrink-0"
          style={{
            background: "oklch(0.92 0.02 75)",
            color: "oklch(0.40 0.03 60)",
          }}
        >
          📷 {selectedImage.name}
        </div>
      )}

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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="shrink-0 h-9 w-9 rounded-xl flex items-center justify-center"
        style={{
          background: "oklch(0.92 0.01 75)",
          color: "oklch(0.45 0.03 60)",
        }}
      >
        <ImagePlus className="w-4 h-4" />
      </button>

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
