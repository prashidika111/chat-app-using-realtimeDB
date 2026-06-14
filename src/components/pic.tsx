import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  initials: string;
  online?: boolean;
  className?: string;
  showStatus?: boolean;
}

const getColorFromName = (name: string) => {
  if (!name) return "#ef4444";
  let hashValue = 0;
  for (let i = 0; i < name.length; i++) {
    let charCode = name.charCodeAt(i);
    let shifted = hashValue << 5;
    hashValue = charCode + (shifted - hashValue);
  }
  
  let val1 = hashValue;
  if (val1 < 0) {
    val1 = val1 * -1;
  }
  
  const colors = [
    "#c1440e", // terracotta
    "#b45309", // amber brown
    "#78350f", // dark warm brown
    "#a16207", // golden
    "#6b7c3a", // olive green
    "#4a7c59", // sage green
    "#9b6e4e", // warm tan
    "#c05621", // burnt orange
    "#b7503a", // rust
    "#8b6f47", // warm taupe
    "#7a6652", // mocha
    "#a0522d", // sienna
  ];
  
  let index = val1 % colors.length;
  return colors[index];
};

export function Pic({ name, initials, online = false, className, showStatus = true }: UserAvatarProps) {
  const bgColor = getColorFromName(name);
  
  let dotColorClass = "bg-slate-400";
  if (online === true) {
    dotColorClass = "bg-green-500 border border-white";
  }

  return (
    <div className="relative inline-block">
      <Avatar className={cn("h-10 w-10", className)}>
        <AvatarFallback 
          className="text-white font-medium text-sm"
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      {showStatus ? (
        <span 
          className={cn(
            "absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white transition-colors",
            dotColorClass
          )}
        />
      ) : null}
    </div>
  );
}
