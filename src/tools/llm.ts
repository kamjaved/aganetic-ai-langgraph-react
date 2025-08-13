// import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';

// export const geminiModal = new ChatGoogleGenerativeAI({
//   apiKey: process.env.GOOGLE_API_KEY,
//   model: 'gemini-2.5-flash',
//   maxOutputTokens: 2500,
//   temperature: 0.7,
//   maxRetries: 3,
//   convertSystemMessageToHumanContent: true,
// });

export const gpt4ominiModal = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini',
  maxTokens: 2500,
  temperature: 0.5,
  maxRetries: 3,
});
