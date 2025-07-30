export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'error';
  timestamp: Date;
  isMarkdown?: boolean;
  threadId?: string;
}

export interface UserInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  sendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}
