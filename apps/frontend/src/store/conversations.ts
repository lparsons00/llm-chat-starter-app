import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ChatSession, Message } from "@/types/chat";

interface ConversationsState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  
  // Session management
  createSession: (title?: string) => string;
  deleteSession: (sessionId: string) => void;
  setCurrentSession: (sessionId: string | null) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  
  // Message management
  addMessage: (sessionId: string, message: Message) => void;
  updateLastMessage: (sessionId: string, content: string) => void;
  clearSessionMessages: (sessionId: string) => void;
  
  // Utility functions
  getCurrentSession: () => ChatSession | null;
  getSession: (sessionId: string) => ChatSession | null;
}

const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const generateSessionTitle = (firstMessage: string) => {
  const maxLength = 50;
  const trimmed = firstMessage.trim();
  return trimmed.length > maxLength 
    ? trimmed.substring(0, maxLength) + "..." 
    : trimmed || "New Conversation";
};

export const useConversations = create<ConversationsState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,

      createSession: (title?: string) => {
        const sessionId = generateSessionId();
        const newSession: ChatSession = {
          id: sessionId,
          title: title || "New Conversation",
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: sessionId,
        }));

        return sessionId;
      },

      deleteSession: (sessionId: string) => {
        set((state) => {
          const newSessions = state.sessions.filter(s => s.id !== sessionId);
          const newCurrentSessionId = state.currentSessionId === sessionId 
            ? (newSessions.length > 0 ? newSessions[0].id : null)
            : state.currentSessionId;
          
          return {
            sessions: newSessions,
            currentSessionId: newCurrentSessionId,
          };
        });
      },

      setCurrentSession: (sessionId: string | null) => {
        set({ currentSessionId: sessionId });
      },

      updateSessionTitle: (sessionId: string, title: string) => {
        set((state) => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? { ...session, title, updatedAt: Date.now() }
              : session
          ),
        }));
      },

      addMessage: (sessionId: string, message: Message) => {
        const messageWithTimestamp = { ...message, timestamp: Date.now() };
        
        set((state) => ({
          sessions: state.sessions.map(session => {
            if (session.id === sessionId) {
              const updatedSession = {
                ...session,
                messages: [...session.messages, messageWithTimestamp],
                updatedAt: Date.now(),
              };
              
              // Auto-generate title from first user message if it's still "New Conversation"
              if (session.title === "New Conversation" && message.role === "user") {
                updatedSession.title = generateSessionTitle(message.content);
              }
              
              return updatedSession;
            }
            return session;
          }),
        }));
      },

      updateLastMessage: (sessionId: string, content: string) => {
        set((state) => ({
          sessions: state.sessions.map(session => {
            if (session.id === sessionId) {
              const messages = [...session.messages];
              if (messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                messages[messages.length - 1] = {
                  ...lastMessage,
                  content: lastMessage.content + content,
                };
              }
              
              return {
                ...session,
                messages,
                updatedAt: Date.now(),
              };
            }
            return session;
          }),
        }));
      },

      clearSessionMessages: (sessionId: string) => {
        set((state) => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? { ...session, messages: [], updatedAt: Date.now() }
              : session
          ),
        }));
      },

      getCurrentSession: () => {
        const state = get();
        return state.currentSessionId 
          ? state.sessions.find(s => s.id === state.currentSessionId) || null
          : null;
      },

      getSession: (sessionId: string) => {
        const state = get();
        return state.sessions.find(s => s.id === sessionId) || null;
      },
    }),
    {
      name: "conversations-storage",
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
      }),
    }
  )
);
