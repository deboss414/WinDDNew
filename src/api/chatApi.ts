import { Task } from '../types/task';

interface ChatMessage {
  id: string;
  text: string;
  createdAt: string;
  createdBy: string;
  taskId: string;
}

interface ChatResponse {
  messages: ChatMessage[];
  task: Task;
}

interface Conversation {
  id: string;
  taskId: string;
  taskTitle: string;
  taskStatus: string;
  participants: Array<{ id: string; name: string; email: string; role: 'member' }>;
  lastMessage?: {
    id: string;
    content: string;
    senderName: string;
    createdAt: string;
  };
  updatedAt: string;
  unreadCount: number;
}

// Mock conversations data
const mockConversations: Conversation[] = [
  {
    id: '1',
    taskId: '1',
    taskTitle: 'Project Planning',
    taskStatus: 'in progress',
    participants: [
      { id: '1', name: 'John Doe', email: 'john.doe@example.com', role: 'member' },
      { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'member' }
    ],
    lastMessage: {
      id: '1',
      content: 'Let\'s discuss the project timeline',
      senderName: 'John Doe',
      createdAt: new Date().toISOString()
    },
    updatedAt: new Date().toISOString(),
    unreadCount: 2
  },
  {
    id: '2',
    taskId: '2',
    taskTitle: 'Design System',
    taskStatus: 'completed',
    participants: [
      { id: '1', name: 'John Doe', email: 'john.doe@example.com', role: 'member' },
      { id: '3', name: 'Alice Johnson', email: 'alice@example.com', role: 'member' }
    ],
    lastMessage: {
      id: '2',
      content: 'The design system is ready for review',
      senderName: 'Alice Johnson',
      createdAt: new Date().toISOString()
    },
    updatedAt: new Date().toISOString(),
    unreadCount: 0
  }
];

// Mock messages data
const mockMessages: Record<string, ChatMessage[]> = {
  '1': [
    {
      id: '1',
      text: 'Let\'s discuss the project timeline',
      createdAt: new Date().toISOString(),
      createdBy: 'john.doe@example.com',
      taskId: '1'
    },
    {
      id: '2',
      text: 'I\'ve prepared a draft timeline',
      createdAt: new Date().toISOString(),
      createdBy: 'jane.smith@example.com',
      taskId: '1'
    }
  ],
  '2': [
    {
      id: '3',
      text: 'The design system is ready for review',
      createdAt: new Date().toISOString(),
      createdBy: 'alice@example.com',
      taskId: '2'
    }
  ]
};

export const chatApi = {
  // Get all conversations
  getConversations: async (): Promise<Conversation[]> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockConversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Get a single conversation with its messages
  getConversation: async (conversationId: string): Promise<{ messages: ChatMessage[]; participants: Array<{ id: string; name: string; email: string; role: 'member' }> }> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      const conversation = mockConversations.find(c => c.id === conversationId);
      const messages = mockMessages[conversationId] || [];
      return { 
        messages,
        participants: conversation?.participants || []
      };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  // Get chat messages for a task
  getChatMessages: async (taskId: string): Promise<ChatResponse> => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/tasks/${taskId}/chat`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat messages');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  },

  // Send a new message
  sendMessage: async (taskId: string, text: string): Promise<ChatMessage> => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/tasks/${taskId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Delete a message
  deleteMessage: async (taskId: string, messageId: string): Promise<void> => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/tasks/${taskId}/chat/${messageId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  // Edit a message
  editMessage: async (taskId: string, messageId: string, text: string): Promise<ChatMessage> => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/tasks/${taskId}/chat/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        throw new Error('Failed to edit message');
      }
      return await response.json();
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  },

  // Subscribe to chat updates
  subscribeToChat: (taskId: string, onMessage: (message: ChatMessage) => void): (() => void) => {
    // TODO: Implement WebSocket or real-time subscription
    const mockInterval = setInterval(() => {
      // Simulate receiving new messages
      const mockMessage: ChatMessage = {
        id: Date.now().toString(),
        text: 'Mock message',
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        taskId,
      };
      onMessage(mockMessage);
    }, 5000);

    return () => clearInterval(mockInterval);
  },

  getOrCreateConversation: async (
    taskId: string,
    taskTitle: string,
    participants: Array<{ id: string; name: string; email: string; role: 'member' }>
  ) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/conversations/${taskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskTitle, participants }),
      });
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },
};
