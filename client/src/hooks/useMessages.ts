import { useState, useEffect } from 'react';
import { apiService } from '../services/api/apiService';
import type { Message, User } from '../constant';

/**
 * Custom hook to manage messages for a chat
 * @param selectedUser - The currently selected user
 */
export const useMessages = (selectedUser: User | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load messages when user is selected
  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.threadId);
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  /**
   * Load messages for a specific thread from the database
   * @param threadId - The ID of the thread to load messages for
   */
  const loadMessages = async (threadId: string) => {
    try {
      const loadedMessages = await apiService.fetchMessages(threadId);
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  /**
   * Send a message to the agent and handle the response
   * @param inputMessage - The message text to send
   */
  const sendMessage = async (inputMessage: string) => {
    if (inputMessage.trim() === '' || !selectedUser) return;

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      threadId: selectedUser.threadId,
    };

    // Add user message to UI
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      // Save user message to database
      await apiService.saveMessage(userMessage, selectedUser.name, selectedUser.role);

      // Send message to agent and get response
      const agentResponseText = await apiService.sendMessageToAgent(
        inputMessage,
        selectedUser.threadId,
        selectedUser.name,
        selectedUser.role
      );

      // Create agent message
      const agentMessage: Message = {
        id: Date.now().toString() + '-agent',
        text: agentResponseText,
        sender: 'agent',
        timestamp: new Date(),
        isMarkdown: true,
        threadId: selectedUser.threadId,
      };

      // Add agent message to UI
      setMessages((prevMessages) => [...prevMessages, agentMessage]);

      // Save agent message to database
      await apiService.saveMessage(agentMessage, selectedUser.name, selectedUser.role);
    } catch (error) {
      // Handle errors
      console.error('Error in message flow:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        text: 'Oops! Something went wrong. Please try again.',
        sender: 'error',
        timestamp: new Date(),
        threadId: selectedUser.threadId,
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);

      // Save error message to database
      await apiService.saveMessage(errorMessage, selectedUser.name, selectedUser.role);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, sendMessage };
};
