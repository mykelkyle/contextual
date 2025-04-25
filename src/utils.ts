export interface Message {
  role: "user" | "assistant" | "developer" | "system";
  content: string;
}
