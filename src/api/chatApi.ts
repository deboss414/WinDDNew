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

export const chatApi = {
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
};
