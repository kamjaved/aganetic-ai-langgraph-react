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

export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  threadId?: string;
  isMarkdown?: boolean;
  userRole?: string;
}
export interface ApiMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  threadId: string;
  isMarkdown?: boolean;
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
