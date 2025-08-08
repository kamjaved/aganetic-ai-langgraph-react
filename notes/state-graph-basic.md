<h1><a href="https://langchain-ai.github.io/langgraphjs/concepts/low_level/#compiling-your-graph"> Recommended Read: LangGraph Offical Docs Examples </a></h1>

---

# StateGraph Implementation Guide: **SNGEC**

## What is StateGraph?

StateGraph is a paradigm for building workflows as directed graphs, where each node represents a step and edges define transitions based on state. It’s great for orchestrating multi-step logic, agents, or toolchains.

---

## **SNGEC**: The Five Steps

### **S** — State: Define Your State Schema

Start by describing the shape of your workflow’s state. This is the data that flows and evolves through your graph.

```typescript
const PortfolioSchema = Annotation.Root({
  targetCurrency: Annotation<Currency>,
  totalAmount: Annotation<number>,
  amountInUSD: Annotation<number>,
  formatReply: Annotation<string>,
});
```

---

### **N** — Node: Implement Node Functions

Each node is a function that receives the current state and returns the next state (or a partial update). Nodes represent steps in your workflow.

```typescript
const getAmountOnUSD = (state: typeof PortfolioSchema.State) => state;

const convertToINR = (state: typeof PortfolioSchema.State) => {
  state.totalAmount = state.amountInUSD * 85;
  state.targetCurrency = Currency.INR;
  return state;
};

const convertToEUR = (state: typeof PortfolioSchema.State) => {
  state.totalAmount = state.amountInUSD * 0.95;
  state.targetCurrency = Currency.EUR;
  return state;
};

const formattedReply = (state: typeof PortfolioSchema.State) => {
  state.formatReply = `The amount of ${state.amountInUSD} USD has been converted to ${state.totalAmount} ${state.targetCurrency}.`;
  return state;
};
```

---

### **G** — Graph: Create the StateGraph

Initialize the graph with your state schema.

```typescript
const workflow = new StateGraph(PortfolioSchema);
```

---

### **E** — Edge: Connect Nodes with Edges

Edges define the flow between nodes. Use conditional edges for branching logic.

```typescript
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
  .addEdge('convertToINR', 'formattedReply')
  .addEdge('convertToEUR', 'formattedReply')
  .addEdge('formattedReply', END);
```

---

### **C** — Compile & Run: Compile the Graph and Invoke

Compile your workflow and run it with initial state.

```typescript
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
```

---

## **Summary Table**

| Step | Action        | Example/Tip                                    |
| ---- | ------------- | ---------------------------------------------- |
| S    | State         | Define schema with `Annotation.Root`           |
| N    | Node          | Write node functions for each workflow step    |
| G    | Graph         | Create `StateGraph` with your schema           |
| E    | Edge          | Connect nodes with `.addEdge` and conditionals |
| C    | Compile & Run | Compile and invoke with initial state          |

---

## **Tips & Gotchas**

- Always connect all nodes; unreachable nodes cause errors.
- Use conditional edges for branching logic.
- State is immutable between nodes—return a new or updated state object.
- Use clear, descriptive node names.

---

## **Example Use Case**

Currency conversion: User provides an amount and target currency, the graph routes through conversion nodes and returns a formatted reply.

---

This **SNGEC** technique helps you remember the essential steps for building any StateGraph workflow. Use this as a template for your own projects and training!
