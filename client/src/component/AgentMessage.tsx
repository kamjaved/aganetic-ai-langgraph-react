import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../constant';

interface AgentMessageProps {
  message: Message;
}

// AgentMessage Component: Handles rendering of agent's responses (including Markdown)
const AgentMessage: React.FC<AgentMessageProps> = ({ message }) => (
  <div className="flex justify-start">
    <div
      className={`max-w-[75%] p-3 rounded-xl shadow-sm ${
        message.sender === 'agent'
          ? 'bg-gray-800 text-white rounded-bl-none'
          : 'bg-red-500 text-white rounded-bl-none' // Error message styling
      } markdown-content`} /* Apply markdown-content class here */
    >
      {message.isMarkdown && message.sender === 'agent' ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
      ) : (
        <p className="text-sm break-words">{message.text}</p>
      )}
      <span className="text-xs mt-1 block text-gray-300">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  </div>
);

export default AgentMessage;
