import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { tools } from './tools';
import { config } from 'dotenv';
import { PromptManager } from './prompt/PromptManager';
import { MessageManager } from './services/messageManager';

import { gpt4ominiModal as model } from './tools/llm';

config();

// Initialize the prompt manager
const promptManager = new PromptManager(tools);

export const agent = createReactAgent({
  llm: model,
  tools: tools,
});

export const getFormattedPrompt = async (input: string, context: any = {}) => {
  return await promptManager.formatPrompt(input, context);
};
