import axios from 'axios';
import type { ApiMessage, Message } from '../../constant';

const API_BASE_URL = 'http://localhost:3000';

/**
 * API service to handle all backend communications
 */
export const apiService = {
  /**
   * Fetch all messages for a specific thread
   * @param threadId - The ID of the thread to fetch messages for
   * @returns Promise with the messages
   */
  fetchMessages: async (threadId: string): Promise<Message[]> => {
    try {
      const response = await axios.get<ApiMessage[]>(`${API_BASE_URL}/messages/${threadId}`);
      return response.data.map((msg: ApiMessage) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.sender as 'error' | 'user' | 'agent',
        timestamp: new Date(msg.timestamp),
        threadId: msg.threadId,
        isMarkdown: msg.isMarkdown,
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  /**
   * Send a message to the agent and get a response
   * @param message - The user message text
   * @param threadId - The thread ID
   * @param username - The username
   * @param userRole - The user role
   * @returns Promise with the agent's response
   */
  sendMessageToAgent: async (
    message: string,
    threadId: string,
    username: string,
    userRole: string
  ): Promise<string> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/agent`, {
        message,
        threadId,
        username,
        userRole,
      });
      return response.data.ai_message || 'No response from agent.';
    } catch (error) {
      console.error('Error sending message to agent:', error);
      throw error;
    }
  },
};
