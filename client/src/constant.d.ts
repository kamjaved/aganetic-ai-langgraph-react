export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'error';
  timestamp: Date;
  isMarkdown?: boolean;
  threadId?: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
  threadId: string;
}

export interface UserInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  sendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
}
