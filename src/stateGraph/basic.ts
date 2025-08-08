import { StateGraph, Annotation, START, END } from '@langchain/langgraph';

export enum Currency {
  INR = 'INR',
  EUR = 'EUR',
  USD = 'USD',
}

const PortfolioSchema = Annotation.Root({
  targetCurrency: Annotation<Currency>,
  totalAmount: Annotation<number>,
  amountInUSD: Annotation<number>,
  formatReply: Annotation<string>,
});

//  Node-1
const getAmountOnUSD = (state: typeof PortfolioSchema.State) => {
  return state;
};

// Node-2
const convertToINR = (state: typeof PortfolioSchema.State) => {
  state.totalAmount = state.amountInUSD * 85;
  state.targetCurrency = Currency.INR;
  return state;
};

// NODE-3

const convertToEUR = (state: typeof PortfolioSchema.State) => {
  state.totalAmount = state.amountInUSD * 0.95;
  state.targetCurrency = Currency.EUR;
  return state;
};

// Conditional NODE-4
const conditionalEdge = (state: typeof PortfolioSchema.State): Currency => {
  return state.targetCurrency;
};

// END NODE
const formattedReply = (state: typeof PortfolioSchema.State) => {
  state.formatReply = `The amount of ${state.amountInUSD} USD has been converted to ${state.totalAmount} ${state.targetCurrency}.`;
  return state;
};

const workflow = new StateGraph(PortfolioSchema);

workflow
  .addNode('getAmountOnUSD', getAmountOnUSD)
  .addNode('convertToINR', convertToINR)
  .addNode('convertToEUR', convertToEUR)
  .addNode('formattedReply', formattedReply)

  .addEdge(START, 'getAmountOnUSD')

  .addConditionalEdges('getAmountOnUSD', conditionalEdge, {
    [Currency.INR]: 'convertToINR',
    [Currency.EUR]: 'convertToEUR',
  })

  // edges from conversion nodes to formattedReply
  .addEdge('convertToINR', 'formattedReply')
  .addEdge('convertToEUR', 'formattedReply')

  // edge from formattedReply to END
  .addEdge('formattedReply', END);

export async function runConversion(amount: number, targetCurrency: Currency) {
  const graph = workflow.compile();

  const result = await graph.invoke({
    amountInUSD: amount,
    targetCurrency: targetCurrency,
    totalAmount: 0,
    formatReply: '',
  });
  return {
    inputAmount: amount,
    targetCurrency: result.targetCurrency,
    convertedAmount: result.totalAmount,
    message: result.formatReply,
  };
}
