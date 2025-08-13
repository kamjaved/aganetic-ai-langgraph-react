import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { promptTemplates } from './index';
import { StructuredTool } from 'langchain/tools';
import { MessageFormatter } from '../services/messageFormatter';

interface PromptContext {
  context?: Record<string, any>;
  history?: any[] | string;
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
    // Determine tool type
    const toolType = this.analyzeInput(input);
    const template = promptTemplates[toolType];

    try {
      // Early standardization - convert history to BaseMessage objects
      const history = context.history || [];
      const standardizedHistory = Array.isArray(history) ? MessageFormatter.toBaseMessages(history) : [];

      // Get history in text format for templates that need it
      const historyText = MessageFormatter.toTextFormat(standardizedHistory);

      // Format parameters for the template
      const formatParams = {
        input,
        context: JSON.stringify(context.context || {}),
        history: historyText,
        ...this.getToolSpecificParams(toolType, input, context),
      };

      // Extract system messages from the template
      const systemMessages = (await template.formatMessages(formatParams)).filter(
        (msg) => typeof msg._getType === 'function' && msg._getType() === 'system'
      );

      // Return the system message + standardized history + current message
      return [
        ...systemMessages, // System instructions from the template
        ...standardizedHistory, // Previous conversation history
        new HumanMessage(input), // Current user message
      ];
    } catch (error) {
      console.warn(`Failed to format ${toolType} prompt, falling back to default`, error);

      // Fallback to default template
      const defaultResult = await promptTemplates.default.formatMessages({
        input,
        context: JSON.stringify(context.context || {}),
        history:
          typeof context.history === 'string'
            ? context.history
            : MessageFormatter.toTextFormat(context.history || []),
      });

      return defaultResult;
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
