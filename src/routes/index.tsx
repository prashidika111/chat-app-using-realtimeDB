import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { makeRoom, exists } from "@/firebase/db";

function makeCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const Route = createFileRoute("/")({
  component: WelcomePage,
});

function WelcomePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [making, setMaking] = useState(false);
  const [entering, setEntering] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const makeNewRoomClick = async () => {
    setMaking(true);
    try {
      const newRoomCode = makeCode();
      await makeRoom(newRoomCode);
      navigate({ to: "/room/$roomId", params: { roomId: newRoomCode } });
    } catch (error) {
      console.log("Failed to create room", error);
    }
    setMaking(false);
  };

  const joinBtnClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code !== "") {
      if (code.trim() !== "") {
        setEntering(true);
        setErrorMsg("");
        let upperCode = code.toUpperCase().trim();
        try {
          const itExists = await exists(upperCode);
          if (itExists === true) {
            navigate({ to: "/room/$roomId", params: { roomId: upperCode } });
          } else {
            setErrorMsg("That room doesn't exist. Double-check the code.");
          }
        } catch (error) {
          console.log("Failed to join room", error);
          setErrorMsg("Something went wrong. Please try again.");
        }
        setEntering(false);
      }
    }
  };

  const createBtnDisabled = making;
  const joinBtnDisabled = code.length < 6 || entering;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "oklch(0.97 0.012 75)" }}>
      <div className="w-full max-w-sm flex flex-col gap-10">

        <div className="text-center">
          <h1 className="text-3xl font-semibold" style={{ color: "oklch(0.28 0.04 55)", letterSpacing: "-0.02em" }}>
            Chat Room
          </h1>
          <p className="mt-2 text-sm" style={{ color: "oklch(0.52 0.02 65)" }}>
            Join or start a conversation.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "oklch(0.55 0.04 55)" }}>
            Start a new conversation.
          </p>
          <button
            onClick={makeNewRoomClick}
            disabled={createBtnDisabled}
            className="w-full h-12 rounded-2xl font-medium text-sm transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            style={{
              background: "oklch(0.62 0.14 42)",
              color: "oklch(0.98 0.01 75)",
            }}
          >
            {making ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create a room"}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: "oklch(0.85 0.02 75)" }} />
          <span className="text-xs" style={{ color: "oklch(0.60 0.02 65)" }}>or join an existing room ↓</span>
          <div className="flex-1 h-px" style={{ background: "oklch(0.85 0.02 75)" }} />
        </div>

        <form onSubmit={joinBtnClick} className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "oklch(0.55 0.04 55)" }}>
            Enter the room's code.
          </p>
          <input
            placeholder="Enter your 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            autoComplete="off"
            className="w-full h-12 rounded-2xl px-0.5 text-center font-mono text-xl tracking-[0.25em] uppercase bg-white border focus:outline-none transition-shadow"
            style={{
              border: "1.5px solid oklch(0.85 0.02 75)",
              color: "oklch(0.28 0.04 55)",
              boxShadow: "none",
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = "0 0 0 3px oklch(0.62 0.14 42 / 0.18)";
              e.target.style.border = "1.5px solid oklch(0.62 0.14 42)";
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = "none";
              e.target.style.border = "1.5px solid oklch(0.85 0.02 75)";
            }}
          />
          {errorMsg !== "" && (
            <p className="text-sm text-center" style={{ color: "oklch(0.52 0.18 27)" }}>
              {errorMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={joinBtnDisabled}
            className="w-full h-12 rounded-2xl font-medium text-sm transition-opacity disabled:opacity-40"
            style={{
              background: "transparent",
              border: "1.5px solid oklch(0.62 0.14 42)",
              color: "oklch(0.62 0.14 42)",
            }}
          >
            {entering ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Join room"}
          </button>
        </form>

      </div>
    </div>
  );
}
