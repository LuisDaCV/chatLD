import React from 'react';

const TypingIndicator = ({ usernames = [] }) => {
  if (usernames.length === 0) return null;

  const displayText = usernames.length === 1 
    ? `${usernames[0]} está escribiendo...` 
    : `${usernames.join(', ')} están escribiendo...`;

  return (
    <div className="flex justify-start mb-2">
      <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gray-100">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-xs text-gray-500">{displayText}</span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;