import { TavilySearch } from '@langchain/tavily';
import { config } from 'dotenv';
config();

export const searchTool = new TavilySearch({
  tavilyApiKey: process.env.TAVILY_API_KEY,
  maxResults: 2,
  topic: 'general',
  description:
    'A search engine useful for when you need to answer questions about current events or real-time information. Input should be a search query.',
  // includeAnswer: false,
  // includeRawContent: false,
  // includeImages: false,
  // includeImageDescriptions: false,
  // searchDepth: "basic",
  // timeRange: "day",
  // includeDomains: [],
  // excludeDomains: [],
});
