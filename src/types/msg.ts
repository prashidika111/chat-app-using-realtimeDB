export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  type: "text" | "image";
  content: string;
  timestamp: number;
}
