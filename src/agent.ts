import { createReactAgent } from '@langchain/langgraph/prebuilt';

import { ChatOpenAI } from '@langchain/openai';
import { tools } from './tools';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { Pool } from 'pg';
import { config } from 'dotenv';
import { PromptManager } from './prompt/PromptManager';
config();

// Initialize the prompt manager
const promptManager = new PromptManager(tools);

console.log('DB URL', process.env.DB_URL);

const pgPool = new Pool({
  connectionString: process.env.DB_URL,
});

export const checkpointer = new PostgresSaver(pgPool);

export const setupCheckpointer = async () => {
  await checkpointer.setup();
};

const modal = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini',
});

export const agent = createReactAgent({
  llm: modal,
  tools: tools,
  checkpointSaver: checkpointer,
});

export const getFormattedPrompt = async (input: string, context: any = {}) => {
  return await promptManager.formatPrompt(input, context);
};
