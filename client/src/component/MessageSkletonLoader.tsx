import React from 'react';

const MessageSkeleton: React.FC = () => (
  <>
    {[1, 2, 3].map((i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[75%] p-3 rounded-xl shadow-sm animate-pulse
            ${i % 2 === 0 ? 'bg-blue-100' : 'bg-gray-200'}`}
        >
          <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    ))}
  </>
);

export default MessageSkeleton;
