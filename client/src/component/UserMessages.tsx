// UserMessage Component: Handles rendering of user's messages
import React from 'react';
import type { Message } from '../constant';

interface UserMessageProps {
  message: Message;
}

const UserMessage: React.FC<UserMessageProps> = ({ message }) => (
  <div className="flex justify-end">
    <div className="max-w-[75%] p-3 rounded-xl shadow-sm bg-blue-600 text-white rounded-br-none">
      <p className="text-sm break-words">{message.text}</p>
      <span className="text-xs mt-1 block text-blue-100">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  </div>
);

export default UserMessage;
