// src/services/messageFormatter.ts
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

// Clear type definitions
export interface DbMessage {
  id: string;
  text: string;
  sender: string;
  threadId: string;
  username?: string;
  isMarkdown?: boolean;
  userRole?: string;
  timestamp: Date;
}

export interface StandardMessageInput {
  type: 'human' | 'ai' | 'system';
  content: string;
  metadata?: Record<string, any>;
}

/**
 * MessageFormatter handles conversion between different message formats
 * Single responsibility: Convert any message format to standardized BaseMessage objects
 */
export class MessageFormatter {
  /**
   * Convert a single message to a BaseMessage
   */
  static toBaseMessage(message: any): BaseMessage {
    // Already a BaseMessage instance
    if (message instanceof BaseMessage) {
      return message;
    }

    // Database message format
    if ('sender' in message && 'text' in message) {
      if (message.sender === 'user') {
        return new HumanMessage(message.text);
      } else if (message.sender === 'agent') {
        return new AIMessage(message.text);
      } else {
        return new SystemMessage(message.text);
      }
    }

    // StandardMessageInput format
    if ('type' in message && 'content' in message) {
      if (message.type === 'system') {
        return new SystemMessage(message.content);
      } else if (message.type === 'human') {
        return new HumanMessage(message.content);
      } else {
        return new AIMessage(message.content);
      }
    }

    // LangChain message format with _getType
    if (typeof message === 'object' && message !== null && '_getType' in message && 'content' in message) {
      const type = message._getType();
      if (type === 'system') {
        return new SystemMessage(message.content);
      } else if (type === 'human') {
        return new HumanMessage(message.content);
      } else {
        return new AIMessage(message.content);
      }
    }

    // Fallback for unknown formats
    return new HumanMessage(String(message));
  }

  /**
   * Convert an array of messages to BaseMessage objects
   */
  static toBaseMessages(messages: any[]): BaseMessage[] {
    if (!Array.isArray(messages)) {
      return [MessageFormatter.toBaseMessage(messages)];
    }
    return messages.map((msg) => MessageFormatter.toBaseMessage(msg));
  }

  /**
   * Convert messages to text format for display or template usage
   */
  static toTextFormat(messages: any[]): string {
    if (!Array.isArray(messages)) {
      messages = [messages];
    }

    return messages
      .map((msg) => {
        // Handle BaseMessage instances
        if (msg instanceof BaseMessage) {
          const type = msg._getType();
          return `${type === 'human' ? 'Human' : type === 'ai' ? 'AI' : 'System'}: ${msg.content}`;
        }

        // Handle DB message format
        if ('sender' in msg && 'text' in msg) {
          const sender = msg.sender === 'user' ? msg.username || 'Human' : 'AI';
          return `${sender}: ${msg.text}`;
        }

        // Handle StandardMessageInput format
        if ('type' in msg && 'content' in msg) {
          const type = msg.type === 'human' ? 'Human' : msg.type === 'ai' ? 'AI' : 'System';
          return `${type}: ${msg.content}`;
        }

        // Fallback
        return String(msg);
      })
      .join('\n\n');
  }
}
