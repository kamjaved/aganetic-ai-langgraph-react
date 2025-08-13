import { BaseMessage } from '@langchain/core/messages';
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from '@langchain/core/prompts';

// Create a base system message that defines core capabilities
const baseSystemPrompt = SystemMessagePromptTemplate.fromTemplate(`
You are a helpful AI assistant with access to various tools and capabilities.
Your primary functions include:
- Accessing and querying employee database
- Performing mathematical calculations
- Searching real-time news and information
- Converting currencies and handling financial calculations

Guidelines:
- Analyze user requests carefully to determine the appropriate tool
- Provide clear, concise responses
- Ask for clarification if needed
- Maintain professionalism and data privacy
`);

// Define structured prompt templates for each tool type
export const promptTemplates = {
  employee: ChatPromptTemplate.fromMessages([
    baseSystemPrompt,
    HumanMessagePromptTemplate.fromTemplate(
      'User Query: {input}\nContext: {context}\nPrevious Conversation:\n{history}'
    ),
  ]),

  math: ChatPromptTemplate.fromMessages([
    baseSystemPrompt,
    HumanMessagePromptTemplate.fromTemplate(
      'User Query: {input}\nMath Operation Type: {operation_type}\nContext: {context}\nPrevious Conversation:\n{history}'
    ),
  ]),

  news: ChatPromptTemplate.fromMessages([
    baseSystemPrompt,
    HumanMessagePromptTemplate.fromTemplate(
      'User Query: {input}\nSearch Parameters: {params}\nContext: {context}\nPrevious Conversation:\n{history}'
    ),
  ]),

  currency: ChatPromptTemplate.fromMessages([
    baseSystemPrompt,
    HumanMessagePromptTemplate.fromTemplate(
      'User Query: {input}\nCurrency Details: {currency_info}\nContext: {context}\nPrevious Conversation:\n{history}'
    ),
  ]),

  default: ChatPromptTemplate.fromMessages([
    baseSystemPrompt,
    HumanMessagePromptTemplate.fromTemplate(
      'User Query: {input}\nContext: {context}\nPrevious Conversation:\n{history}'
    ),
  ]),
};
