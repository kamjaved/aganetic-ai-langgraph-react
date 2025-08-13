import { add } from './../tools/mathTool';
import { StateGraph, Annotation } from '@langchain/langgraph';
import { START, END } from '@langchain/langgraph';
import { AIMessage, HumanMessage, BaseMessage } from '@langchain/core/messages';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { searchTool } from '../tools/searchTools';
import { gpt4ominiModal as model } from '../tools/llm';

// 1. Define State Schema
const ResearchStateSchema = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (curr, next) => curr.concat(next),
    default: () => [],
  }),
  status: Annotation<string>,
  aiResponse: Annotation<string>({
    reducer: (curr, next) => curr + next,
    default: () => 'Default Comprehensive summary of the AI news...',
  }),
});

// 2. Create Search Tool
const toolForSearch = new DynamicStructuredTool({
  name: 'search',
  description: 'Search for information on a topic',
  schema: z.object({
    query: z.string().describe('The search query to use'),
  }),
  func: async ({ query }) => {
    // Mock implementation
    return await searchTool.invoke({ query });
  },
});

const tools = [toolForSearch];
const toolNode = new ToolNode(tools);

const boundModel = model.bindTools(tools);

// 4. Define agent nodes
const firstAgent = async (state: typeof ResearchStateSchema.State) => {
  const lastMessage = state.messages[state.messages.length - 1];
  const query = lastMessage.content;

  return {
    messages: [
      new AIMessage({
        content: '',
        tool_calls: [
          {
            name: 'search',
            args: { query },
            id: 'initial_search',
          },
        ],
      }),
    ],
    status: 'searching',
  };
};

// 4.1 Summarization Agent Nodes
const summarizeAgent = async (state: typeof ResearchStateSchema.State) => {
  try {
    // Find the ToolMessage containing search results
    const toolMessage = state.messages.find(
      (msg) => 'tool_call_id' in msg && msg.tool_call_id === 'initial_search'
    ) as any;

    if (!toolMessage) {
      return {
        messages: [new AIMessage({ content: 'No search results found' })],
        status: 'complete',
        aiResponse: 'No search results found',
      };
    }

    // Parse the JSON content from ToolMessage
    const searchData = JSON.parse(toolMessage.content);

    if (!searchData.results || searchData.results.length === 0) {
      return {
        messages: [new AIMessage({ content: 'No results in search data' })],
        status: 'complete',
        aiResponse: 'No results in search data',
      };
    }

    // Format search results for summarization
    const formattedResults = searchData.results
      .map(
        (result: any) => `
        Title: ${result.title}
        Content: ${result.content}
        URL: ${result.url}
      `
      )
      .join('\n\n');

    // Create a comprehensive summarization prompt
    const summarizationPrompt = `Please provide a comprehensive summary of these news results:
    ${formattedResults}
    Please format the summary in a clear, organized way.`;

    const response = await model.invoke(summarizationPrompt);

    console.log('RESPONSE', response);

    // Explicitly create new state with all required fields
    return {
      messages: [new AIMessage({ content: response.content })],
      status: 'complete',
      aiResponse: response.content, // Make sure this is set
    };
  } catch (error) {
    console.error('Error in summarization:', error);
    return {
      messages: [new AIMessage({ content: 'Error processing search results' })],
      status: 'complete',
      aiResponse: 'Error processing search results',
    };
  }
};

// Regular Agent Node
const regularAgent = async (state: typeof ResearchStateSchema.State) => {
  const response = await boundModel.invoke(state.messages);
  return {
    messages: [response],
    status: 'processing',
  };
};

// 5. Define conditional logic Nodes
const shouldContinue = (state: typeof ResearchStateSchema.State) => {
  // First check if we have search results and haven't summarized yet
  const hasSearchResults = state.messages.some(
    (msg) => 'tool_call_id' in msg && msg.tool_call_id === 'initial_search'
  );

  if (hasSearchResults && !state.aiResponse) {
    return 'summarize';
  }

  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  if (!lastMessage.tool_calls || lastMessage.tool_calls.length === 0) {
    return 'end';
  }

  return 'continue';
};

// 6. Create and configure the graph
export function createResearchGraph() {
  const workflow = new StateGraph(ResearchStateSchema)
    // add Nodes
    .addNode('first_agent', firstAgent)
    .addNode('agent', regularAgent)
    .addNode('action', toolNode)
    .addNode('summarize', summarizeAgent)

    // Set initial edge from START to first_agent
    .addEdge(START, 'first_agent')

    // Add conditional edges
    .addConditionalEdges('agent', shouldContinue, {
      continue: 'action',
      summarize: 'summarize',
      end: END,
    })

    // Add edges
    .addEdge('first_agent', 'action')
    .addEdge('action', 'agent')
    .addEdge('summarize', END);

  return workflow.compile();
}

// 7. Usage example
export async function runResearch(query: string) {
  const graph = createResearchGraph();

  const result = await graph.invoke({
    messages: [new HumanMessage(query)],
    status: 'start',
    aiResponse: '',
  });

  return {
    query,
    result: {
      messages: result.messages,
      status: result.status,
      aiResponse: result.aiResponse,
    },
  };
}
