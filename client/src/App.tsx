import React, { useRef, useEffect, useState } from 'react';
import './App.css';
import type { User } from './constant';

// Components
import AgentMessage from './component/AgentMessage';
import UserMessage from './component/UserMessages';
import UserInput from './component/UserInput';

// Custom Hooks
import { useMessages } from './hooks/useMessages';
import { useUserSelection } from './hooks/useUserSelection';
import MessageSkeleton from './component/MessageSkletonLoader';

// Predefined users for the application
const PREDEFINED_USERS: User[] = [
  { id: '1', name: 'Allan', role: 'HR', threadId: 'thread-allan-hr' },
  { id: '2', name: 'Joe', role: 'Employee', threadId: 'thread-joe-employee' },
  { id: '3', name: 'Chris', role: 'Manager', threadId: 'thread-chris-manager' },
];

/**
 * Main App component for the chat application
 * Manages the user interface and coordinates between different parts of the application
 */
const App: React.FC = () => {
  // State for the input message
  const [inputMessage, setInputMessage] = useState<string>('');

  // Refs for UI manipulation
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Custom hooks for user selection and message management
  const { selectedUser, handleUserSelect } = useUserSelection();
  const { messages, isLoading, sendMessage, isSwitchingUser } = useMessages(selectedUser);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  /**
   * Handle sending a message
   * Calls the sendMessage function from useMessages hook
   */
  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || !selectedUser) return;
    await sendMessage(inputMessage);
    setInputMessage('');
  };

  /**
   * Handle key press events in the input field
   * Sends the message on Enter key (without Shift)
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-inter">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl flex flex-col h-[90vh] overflow-hidden border border-gray-200">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <h1 className="text-2xl font-bold text-gray-800">AI Agentic Chat</h1>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4 bg-gray-50">
          {!selectedUser ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">Select a user to start chatting</p>
                <p className="text-sm">Choose from Allan (HR), Joe (Employee), or Chris (Manager)</p>
              </div>
            </div>
          ) : isSwitchingUser ? (
            <MessageSkeleton />
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">No messages yet</p>
                <p className="text-sm">Start a conversation with the AI assistant</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <React.Fragment key={msg.id}>
                {msg.sender === 'user' ? <UserMessage message={msg} /> : <AgentMessage message={msg} />}
              </React.Fragment>
            ))
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[75%] p-3 rounded-xl shadow-sm bg-gray-800 text-white rounded-bl-none">
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-gray-300" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Agent is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Area */}
        <UserInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          sendMessage={handleSendMessage}
          handleKeyPress={handleKeyPress}
          isLoading={isLoading}
          textareaRef={textareaRef}
          users={PREDEFINED_USERS}
          selectedUser={selectedUser}
          onSelectUser={handleUserSelect}
        />
      </div>
    </div>
  );
};

export default App;
