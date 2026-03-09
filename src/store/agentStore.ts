import { create } from 'zustand';
import { Message, ToolCall } from '../types/agent';

interface AgentStore {
  messages: Message[];
  isLoading: boolean;
  currentToolCall: ToolCall | null;
  addMessage: (message: Omit<Message, 'id'>) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setCurrentToolCall: (toolCall: ToolCall | null) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  messages: [],
  isLoading: false,
  currentToolCall: null,

  addMessage: (message: Omit<Message, 'id'>) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
      ],
    })),

  clearMessages: () =>
    set({
      messages: [],
      isLoading: false,
      currentToolCall: null,
    }),

  setLoading: (loading: boolean) =>
    set({
      isLoading: loading,
    }),

  setCurrentToolCall: (toolCall: ToolCall | null) =>
    set({
      currentToolCall: toolCall,
    }),
}));
