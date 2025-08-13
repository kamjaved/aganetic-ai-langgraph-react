import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { promptTemplates } from './index';
import { StructuredTool } from 'langchain/tools';

interface PromptContext {
  input?: string;
  context?: any;
  history?: Array<{ type: string; content: string }> | string;
  [key: string]: any;
}

export class PromptManager {
  private tools: StructuredTool[];

  constructor(tools: StructuredTool[]) {
    this.tools = tools;
  }

  private analyzeInput(input: string): 'employee' | 'math' | 'currency' | 'news' | 'default' {
    // Create a map of tool descriptions and their keywords
    const toolPatterns = this.tools.map((tool) => ({
      name: tool.name,
      pattern: new RegExp(
        tool.description
          .toLowerCase()
          .split(' ')
          .filter((word) => word.length > 3)
          .join('|'),
        'i'
      ),
    }));

    // Find matching tools based on input
    const matches = toolPatterns.filter(({ pattern }) => pattern.test(input)).map(({ name }) => name);

    // Return the most appropriate tool type or default
    if (matches.includes('getUsersByName')) return 'employee';
    if (matches.includes('multiply') || matches.includes('add')) return 'math';
    if (matches.includes('convertCurrency')) return 'currency';
    if (matches.includes('searchTool')) return 'news';
    return 'default';
  }

  public async formatPrompt(input: string, context: PromptContext): Promise<BaseMessage[]> {
    const toolType = this.analyzeInput(input);
    const template = promptTemplates[toolType];

    // Extract history from context if available
    const history = context.history || [];

    // Properly type check and convert history to string if needed
    const historyText = Array.isArray(history)
      ? history
          .map((msg) => {
            // Type guard to check if msg has type and content properties
            if (typeof msg === 'object' && msg !== null && 'type' in msg && 'content' in msg) {
              return `${msg.type === 'human' ? 'Human' : 'AI'}: ${msg.content}`;
            }
            // Handle BaseMessage objects like SystemMessage, AIMessage, HumanMessage
            if (typeof msg === 'object' && msg !== null && '_getType' in msg && 'content' in msg) {
              const messageObj = msg as BaseMessage;
              const type = messageObj._getType();
              return `${type === 'human' ? 'Human' : type === 'ai' ? 'AI' : 'System'}: ${messageObj.content}`;
            }
            return String(msg);
          })
          .join('\n')
      : String(history);

    // Prepare base formatting parameters
    const formatParams = {
      input,
      context: JSON.stringify(context.context || {}),
      history: historyText,
      ...this.getToolSpecificParams(toolType, input, context),
    };

    try {
      // If we have history messages and they're BaseMessage objects
      if (
        Array.isArray(history) &&
        history.length > 0 &&
        typeof history[0] === 'object' &&
        history[0] !== null &&
        ('type' in history[0] || '_getType' in history[0])
      ) {
        // Only include the system message from the template
        const systemMessages = (await template.formatMessages(formatParams)).filter(
          (msg) => typeof msg._getType === 'function' && msg._getType() === 'system'
        );

        // Use the original history messages if they're already BaseMessage objects
        const historyMessages = history.map((msg): BaseMessage => {
          // If it's already a BaseMessage, return it directly
          if (msg instanceof BaseMessage) {
            return msg;
          }
          // If it has type and content properties
          if (typeof msg === 'object' && msg !== null && 'type' in msg && 'content' in msg) {
            return new HumanMessage({ content: msg.content });
          }
          // Otherwise convert to HumanMessage
          return new HumanMessage({ content: String(msg) });
        });

        // Return system messages followed by history
        return [...systemMessages, ...historyMessages];
      }

      // Otherwise use the template with formatted history as text
      return await template.formatMessages(formatParams);
    } catch (error) {
      console.warn(`Failed to format ${toolType} prompt, falling back to default`, error);
      return await promptTemplates.default.formatMessages({
        input,
        context: JSON.stringify(context.context || {}),
        history: historyText,
      });
    }
  }
  private getToolSpecificParams(
    toolType: 'employee' | 'math' | 'currency' | 'news' | 'default',
    input: string,
    context: PromptContext
  ) {
    switch (toolType) {
      case 'math':
        return {
          operation_type: this.detectMathOperation(input),
        };
      case 'currency':
        return {
          currency_info: this.extractCurrencyInfo(input),
        };
      case 'news':
        return {
          params: this.extractSearchParams(input),
        };
      default:
        return {};
    }
  }

  private detectMathOperation(input: string): string {
    const operations = {
      add: /\b(add|sum|plus|\+)\b/i,
      multiply: /\b(multiply|times|\*)\b/i,
      subtract: /\b(subtract|minus|-)\b/i,
      divide: /\b(divide|divided by|\/)\b/i,
    };

    for (const [op, pattern] of Object.entries(operations)) {
      if (pattern.test(input)) return op;
    }
    return 'unknown';
  }

  private extractCurrencyInfo(input: string): string {
    // Add currency extraction logic
    return JSON.stringify({
      type: 'conversion',
      amount: 0,
      from: 'unknown',
      to: 'unknown',
    });
  }

  private extractSearchParams(input: string): string {
    return JSON.stringify({
      query: input,
      timeRange: 'recent',
    });
  }
}
