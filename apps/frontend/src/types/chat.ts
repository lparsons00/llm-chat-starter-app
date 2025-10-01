export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ConversationState {
  sessions: ChatSession[];
  currentSessionId: string | null;
}
