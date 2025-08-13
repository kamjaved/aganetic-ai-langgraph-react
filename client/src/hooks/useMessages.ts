// client/src/hooks/useMessages.ts
import { useState, useEffect } from 'react';
import { apiService } from '../services/api/apiService';
import type { Message, User } from '../constant';

export const useMessages = (selectedUser: User | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitchingUser, setIsSwitchingUser] = useState<boolean>(false);

  // Load messages when user is selected
  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.threadId);
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  const loadMessages = async (threadId: string) => {
    setIsSwitchingUser(true);
    try {
      const loadedMessages = await apiService.fetchMessages(threadId);
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setIsSwitchingUser(false);
    }
  };

  const sendMessage = async (inputMessage: string) => {
    if (inputMessage.trim() === '' || !selectedUser) return;

    // Create user message for UI
    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      threadId: selectedUser.threadId,
    };

    // Add user message to UI immediately
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      // Send to agent - message will be saved on server side
      const agentResponseText = await apiService.sendMessageToAgent(
        inputMessage,
        selectedUser.threadId,
        selectedUser.name,
        selectedUser.role
      );

      // Create agent message for UI
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
    } catch (error) {
      console.error('Error sending message to agent:', error);

      // Show error message
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        text: 'Oops! Something went wrong. Please try again.',
        sender: 'error',
        timestamp: new Date(),
        threadId: selectedUser.threadId,
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, sendMessage, isSwitchingUser };
};
