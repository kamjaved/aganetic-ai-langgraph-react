// src/component/UserSelector.tsx
import React, { useState, useRef, useEffect } from 'react';
import userIcon from '../assets/User.svg';
import type { User } from '../constant';

interface UserSelectorProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({ users, selectedUser, onSelectUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-xl bg-gray-200 hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
        aria-label="Select user"
      >
        <img src={userIcon} alt="User" className="h-6 w-6" />
        {selectedUser && <span className="ml-2 text-sm font-medium text-gray-700">{selectedUser.name}</span>}
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg p-2 w-48 z-10 border border-gray-200">
          <div className="py-1 text-sm text-gray-700 font-semibold border-b border-gray-200 mb-1 px-2">
            Select User
          </div>
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                onSelectUser(user);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                selectedUser?.id === user.id ? 'bg-blue-100 text-blue-800 font-medium' : 'hover:bg-gray-100'
              }`}
            >
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-gray-500">{user.role}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSelector;
