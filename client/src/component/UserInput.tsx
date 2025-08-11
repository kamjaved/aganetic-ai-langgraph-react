import type { UserInputProps } from '../constant';
import UserSelector from './UserSelector';

const UserInput: React.FC<UserInputProps> = ({
  inputMessage,
  setInputMessage,
  sendMessage,
  handleKeyPress,
  isLoading,
  textareaRef,
  users,
  selectedUser,
  onSelectUser,
}) => (
  <div className="p-4 border-t border-gray-200 flex items-end space-x-3 bg-white">
    <textarea
      ref={textareaRef}
      className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 resize-none overflow-hidden min-h-[48px] max-h-[200px]"
      placeholder="Type your message..."
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      onKeyPress={handleKeyPress}
      disabled={isLoading}
      rows={1}
    />
    <UserSelector users={users} selectedUser={selectedUser} onSelectUser={onSelectUser} />

    <button
      onClick={sendMessage}
      disabled={isLoading || inputMessage.trim() === ''}
      className="bg-blue-600 text-white p-3 rounded-xl shadow-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </button>
  </div>
);

export default UserInput;
