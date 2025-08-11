import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import type { Message, User } from './constant';
import AgentMessage from './component/AgentMessage';
// COMPONENTS
import UserMessage from './component/UserMessages';
import UserInput from './component/UserInput';

const PREDEFINED_USERS: User[] = [
  { id: '1', name: 'Allan', role: 'HR', threadId: 'thread-allan-hr' },
  { id: '2', name: 'Joe', role: 'Employee', threadId: 'thread-joe-employee' },
  { id: '3', name: 'Chris', role: 'Manager', threadId: 'thread-chris-manager' },
];

// Main App component for the chat application
const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  const sendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      threadId: selectedUser?.threadId,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/agent', {
        message: userMessage.text,
        threadId: selectedUser?.threadId, // Send threadId to backend
        username: selectedUser?.name, // Send username to backend
        userRole: selectedUser?.role, // Send userRole to backend
      });

      const agentResponseText = response.data.ai_message || 'No response from agent.';

      const agentMessage: Message = {
        id: Date.now().toString() + '-agent',
        text: agentResponseText,
        sender: 'agent',
        timestamp: new Date(),
        isMarkdown: true,
      };

      setMessages((prevMessages) => [...prevMessages, agentMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        text: 'Oops! Something went wrong. Please try again.',
        sender: 'error',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      sendMessage();
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
          {messages.map((msg) => (
            <React.Fragment key={msg.id}>
              {msg.sender === 'user' ? <UserMessage message={msg} /> : <AgentMessage message={msg} />}
            </React.Fragment>
          ))}
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
          <div ref={messagesEndRef} /> {/* Element to scroll into view */}
        </div>

        {/* Message Input Area */}
        <UserInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          sendMessage={sendMessage}
          handleKeyPress={handleKeyPress}
          isLoading={isLoading}
          textareaRef={textareaRef}
          users={PREDEFINED_USERS}
          selectedUser={selectedUser}
          onSelectUser={(user) => setSelectedUser(user)}
        />
      </div>
    </div>
  );
};

export default App;
