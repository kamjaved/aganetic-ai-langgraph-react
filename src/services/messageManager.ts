// src/services/messageManager.ts
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import prisma from '../db';

// Configuration for our window + summary approach
const CONFIG = {
  recentMessagesCount: 4, // Keep last 4 messages in full
  summarizationThreshold: 8, // Summarize when we have more than 8 messages
  summarizationModel: 'gpt-4o-mini', // Use a smaller model for summaries
  maxTokens: 4000, // Maximum tokens for context
};

export class MessageManager {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: CONFIG.summarizationModel,
      temperature: 0.1,
    });
  }

  /**
   * Save a message to the database
   */
  async saveMessage(
    text: string,
    sender: string,
    threadId: string,
    username: string,
    isMarkdown: boolean = false,
    userRole?: string
  ): Promise<any> {
    return await prisma.message.create({
      data: {
        text,
        sender,
        threadId,
        username,
        isMarkdown,
        userRole,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Get all messages for a thread
   */
  async getMessages(threadId: string): Promise<any[]> {
    return await prisma.message.findMany({
      where: { threadId },
      orderBy: { timestamp: 'asc' },
    });
  }

  /**
   * Get optimized context for a conversation thread
   */
  async getOptimizedContext(threadId: string): Promise<BaseMessage[]> {
    // Get all messages for this thread
    const messages = await this.getMessages(threadId);

    console.log(`Thread ${threadId} has ${messages.length} total messages`);

    // If under threshold, return all messages
    if (messages.length <= CONFIG.summarizationThreshold) {
      console.log(`Using all ${messages.length} messages directly (under threshold)`);
      return this.convertToBaseMessages(messages);
    }

    // Split into older and recent messages
    const recentMessages = messages.slice(-CONFIG.recentMessagesCount);
    const olderMessages = messages.slice(0, -CONFIG.recentMessagesCount);

    console.log(
      `Split into ${olderMessages.length} older messages and ${recentMessages.length} recent messages`
    );

    // Get or create summary of older messages
    const summary = await this.summarizeMessages(olderMessages, threadId);

    // Create context with summary + recent messages
    const context = [
      new SystemMessage(`CONVERSATION HISTORY SUMMARY: ${summary}`),
      ...this.convertToBaseMessages(recentMessages),
    ];

    // Log token usage
    const contextText = context.map((msg) => msg.content).join('\n');
    console.log(`Context size: approximately ${this.estimateTokens(contextText)} tokens`);

    return context;
  }

  /**
   * Convert database messages to LangChain BaseMessage format
   */
  private convertToBaseMessages(messages: any[]): BaseMessage[] {
    return messages.map((msg) => {
      if (msg.sender === 'user') {
        return new HumanMessage(msg.text);
      } else {
        return new AIMessage(msg.text);
      }
    });
  }

  /**
   * Summarize older messages
   */
  private async summarizeMessages(messages: any[], threadId: string): Promise<string> {
    // Try to find existing summary
    const existingSummary = await prisma.conversationSummary.findFirst({
      where: {
        threadId,
        messageCount: { lte: messages.length },
      },
      orderBy: { createdAt: 'desc' },
    });

    let existingSummaryText = '';
    let messagesToSummarize = messages;

    if (existingSummary && existingSummary.messageCount > 0) {
      console.log(`Found existing summary covering ${existingSummary.messageCount} messages`);
      existingSummaryText = existingSummary.summary;
      messagesToSummarize = messages.slice(existingSummary.messageCount);
    }

    if (messagesToSummarize.length === 0) {
      console.log('No new messages to summarize, using existing summary');
      return existingSummaryText;
    }

    console.log(`Summarizing ${messagesToSummarize.length} new messages`);

    // Format messages for summarization
    const messagesText = messagesToSummarize
      .map((msg) => `${msg.sender === 'user' ? `${msg.username || 'Human'}` : 'AI'}: ${msg.text}`)
      .join('\n\n');

    // Create the summarization prompt
    const prompt = existingSummaryText
      ? `Previous conversation summary:\n\n${existingSummaryText}\n\nNew messages:\n\n${messagesText}\n\nProvide an updated comprehensive summary of the entire conversation. Focus on key information, questions, and decisions.`
      : `Summarize this conversation concisely, capturing key points, questions, and information:\n\n${messagesText}`;

    // Generate summary
    const response = await this.model.invoke(prompt);
    const newSummary = String(response.content);

    // Store the summary
    await prisma.conversationSummary.create({
      data: {
        threadId,
        summary: newSummary,
        messageCount: messages.length,
      },
    });

    console.log(`Created new summary for ${messages.length} messages`);

    return newSummary;
  }

  /**
   * Estimate token count in text
   */
  private estimateTokens(text: string): number {
    // Rough estimate: ~4 chars per token
    return Math.ceil(text.length / 4);
  }
}
