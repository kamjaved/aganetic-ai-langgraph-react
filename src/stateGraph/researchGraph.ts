// src/stateGraph/researchGraph.ts
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { searchTool } from '../tools/searchTools';
import { ChatOpenAI } from '@langchain/openai';

// Define our state interface
const ResearchStateSchema = Annotation.Root({
  query: Annotation<string>,
  searchResults: Annotation<string[]>,
  analysis: Annotation<string>,
  summary: Annotation<string>,
  status: Annotation<'searching' | 'analyzing' | 'summarizing' | 'complete'>,
});

type ResearchState = typeof ResearchStateSchema.State;

// Initialize LLM
const llm = new ChatOpenAI({
  model: 'gpt-4o-mini',
  maxTokens: 1500,
  temperature: 0.7,
});

// Define node functions
async function searchNode(state: ResearchState): Promise<Partial<ResearchState>> {
  const results = await searchTool.invoke({
    query: state.query,
  });
  return {
    searchResults: Array.isArray(results) ? results : [results],
    status: 'analyzing',
  };
}

async function analyzeNode(state: ResearchState): Promise<Partial<ResearchState>> {
  const analysis = await llm.invoke(
    `Analyze these search results and extract key points:\n${state.searchResults.join('\n')}`
  );
  return {
    analysis: String(analysis.content),
    status: 'summarizing',
  };
}

async function summarizeNode(state: ResearchState): Promise<Partial<ResearchState>> {
  const summary = await llm.invoke(`Create a concise summary based on this analysis:\n${state.analysis}`);
  return {
    summary: String(summary.content),
    status: 'complete',
  };
}

// Create and configure the graph
// export function createResearchGraph() {
//   const workflow = new StateGraph(ResearchStateSchema);

//   // Add nodes
//   workflow.addNode('search', searchNode);
//   workflow.addNode('analyze', analyzeNode);
//   workflow.addNode('summarize', summarizeNode);

//   // Define edges
//   workflow.addEdge('search', 'analyze');
//   workflow.addEdge('analyze', 'summarize');
//   workflow.addEdge(START, searchNode);
//   workflow.addEdge(summarizeNode, END);

//   // Set conditional edges based on status
//   workflow.addConditionalEdges((state) => {
//     switch (state.status) {
//       case 'searching':
//         return 'search';
//       case 'analyzing':
//         return 'analyze';
//       case 'summarizing':
//         return 'summarize';
//       case 'complete':
//         return null; // End the workflow
//       default:
//         return 'search';
//     }
//   });

//   return workflow.compile();
// }
