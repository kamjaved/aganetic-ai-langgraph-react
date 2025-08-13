import { createReactAgent } from '@langchain/langgraph/prebuilt';

import { tools } from './tools';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { Pool } from 'pg';
import { config } from 'dotenv';
import { PromptManager } from './prompt/PromptManager';
import { gpt4ominiModal as model } from './tools/llm';

config();

// Initialize the prompt manager
const promptManager = new PromptManager(tools);

const pgPool = new Pool({
  connectionString: process.env.DB_URL,
});

export const checkpointer = new PostgresSaver(pgPool);

export const setupCheckpointer = async () => {
  await checkpointer.setup();
};

export const agent = createReactAgent({
  llm: model,
  tools: tools,
  checkpointSaver: checkpointer,
});

export const getFormattedPrompt = async (input: string, context: any = {}) => {
  return await promptManager.formatPrompt(input, context);
};
