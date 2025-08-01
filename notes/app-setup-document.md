---

# Building an Agentic AI with LangGraph and Node.js

This document outlines the architecture and development process of an intelligent agent backend. The application is built using **Node.js** and **Express**, with its core intelligence powered by **LangChain.js** and **LangGraph**. The agent is designed to be extensible, capable of using various tools to perform tasks like mathematical calculations, web searches, database queries, and currency conversions.

We will explore the construction of this application in several stages:

- **Initial Structure & Basic Tools:** Setting up the agent with simple math capabilities.
- **Adding Web Search:** Integrating the Tavily search tool for real-time information.
- **Connecting to a Database:** Implementing tools to query a user database with Prisma.
- **Using External APIs:** Creating a tool for currency conversion.
- **Implementing Memory:** Enabling conversational context and follow-up questions.

Let's begin with the foundational structure.

---

## Part 1: Initial Structure & Math Tools

The first version of our agent is simple. It can only perform basic arithmetic. This helps us understand the core components without unnecessary complexity.

### 1\. Project Setup

The backend is a standard Node.js application using TypeScript. The main logic resides in the `src` directory.

- `src/index.ts`: The main entry point. It sets up an Express server to expose our agent via an API endpoint.
- `src/agent.ts`: This is where the agent's brain is configured. We define the LLM, the tools it can use, and its core logic.
- `src/tools/`: A directory to hold all the individual tools our agent can use.

Key dependencies in `package.json` for this initial step are:

- `express`: For the web server.
- `@langchain/openai`: To use OpenAI's models.
- `@langchain/langgraph`: The core library for building the agent.
- `@langchain/core`: Provides core abstractions like messages and tools.
- `zod`: For defining tool input schemas.

### 2\. Creating a Basic Tool: `mathTool.ts`

A "**tool**" is a function the agent can decide to call to get information or perform an action. We start by giving our agent `add` and `multiply` tools.

`/home/kamran/WORK/LANGCHAIN AND GENRATIVE AI/Agentic-AI/level2-langraph/src/tools/mathTool.ts`

```typescript
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
// import { prisma } from '../lib/prisma';

export const multiply = tool(
  async ({ a, b }: { a: number; b: number }) => {
    console.log('MULTIPLY TOOLS CALLED');
    return a * b;
  },
  {
    name: 'multiply',
    description: 'Multiply two numbers.',
    schema: z.object({
      a: z.number().describe('First operand'),
      b: z.number().describe('Second operand'),
    }),
  }
);

export const add = tool(
  async ({ a, b }: { a: number; b: number }) => {
    console.log('ADD TOOLS CALLED');
    return a + b;
  },
  {
    name: 'add',
    description: 'Add two numbers.',
    schema: z.object({
      a: z.number().describe('First operand'),
      b: z.number().describe('Second operand'),
    }),
  }
);
```

**Key Concepts:**

- The `tool` function from `@langchain/core/tools` is a convenient way to create a tool.
- The first argument is an async function containing the tool's logic.
- The second argument is a configuration object that describes the tool to the LLM.
  - `name`: A unique name for the tool.
  - `description`: A clear, concise explanation of what the tool does. The LLM uses this to decide when to use the tool.
  - `schema`: Defined with `zod`, this specifies the inputs the tool expects. The `.describe()` calls are crucial as they provide hints to the LLM on what each parameter means.

### 3\. Aggregating Tools

To keep things organized, we use a central file to export all our tools in a single array.

`/home/kamran/WORK/LANGCHAIN AND GENRATIVE AI/Agentic-AI/level2-langraph/src/tools/index.ts (Initial Version)`

```typescript
import { add, multiply } from './mathTool';

// Export all tools as a single array for the agent
export const tools = [add, multiply];
```

### 4\. Building the Agent

Now we assemble the agent. We use `createReactAgent`, a pre-built agent from LangGraph that implements the ReAct (Reasoning and Acting) logic. This allows the agent to reason about which tool to use, use it, observe the result, and repeat until it can answer the user's question.

`/home/kamran/WORK/LANGCHAIN AND GENRATIVE AI/Agentic-AI/level2-langraph/src/agent.ts (Initial Version)`

```typescript
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { tools } from './tools';
import { config } from 'dotenv';
config();

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini',
});

export const agent = createReactAgent({
  llm: model,
  tools: tools,
  // checkpointSaver will be added later for memory
});
```

Here, we instantiate the `ChatOpenAI` model and pass it to `createReactAgent` along with our array of tools.

### 5\. Exposing the Agent via an API

Finally, we use Express to create a simple API endpoint that our frontend can call.

`/home/kamran/WORK/LANGCHAIN AND GENRATIVE AI/Agentic-AI/level2-langraph/src/index.ts (Initial Version)`

```typescript
import express, { Request, Response, Application } from 'express';
import { config } from 'dotenv';
import { agent } from './agent';
import { HumanMessage } from '@langchain/core/messages';
import cors from 'cors';

config();

const app: Application = express();
app.use(express.json());
app.use(cors());

const port: string | number = process.env.PORT || 3001;

app.post('/agent', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    console.log('Human Message: ', message);

    const result = await agent.invoke({
      messages: [new HumanMessage(message)],
    });

    const aiResponse = result.messages[result.messages.length - 1].content;
    console.log('AI REPLY: ', aiResponse);
    res.send({
      status: 200,
      ai_message: aiResponse,
    });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```

When a POST request hits `/agent`, we take the user's message, pass it to `agent.invoke()`, and return the agent's final response. At this stage, our agent can answer questions like "What is 123 \* 456?".

---

## Part 2: Integrating a Web Search Tool

To answer questions about current events or topics beyond its training data, the agent needs to be able to search the web. We use the pre-built `TavilySearch` tool for this.

### 1\. Creating the Search Tool

`/home/kamran/WORK/LANGCHAIN AND GENRATIVE AI/Agentic-AI/level2-langraph/src/tools/searchTools.ts`

```typescript
import { TavilySearch } from '@langchain/tavily';
import { config } from 'dotenv';
config();

export const searchTool = new TavilySearch({
  tavilyApiKey: process.env.TAVILY_API_KEY,
  maxResults: 2,
  topic: 'general',
  description:
    'A search engine useful for when you need to answer questions about current events or real-time information. Input should be a search query.',
});
```

This tool is an instance of the `TavilySearch` class. It's configured with an API key from a `.env` file. The `description` is important, as it tells the agent when this tool is appropriate to use.

### 2\. Adding to the Agent

We simply import the new tool and add it to our tools array.

`/home/kamran/WORK/LANGCHAIN AND GENRATIVE AI/Agentic-AI/level2-langraph/src/tools/index.ts (Updated)`

```typescript
import { add, multiply } from './mathTool';
import { searchTool } from './searchTools';

// Export all tools as a single array for the agent
export const tools = [add, multiply, searchTool];
```

No other code changes are needed. The agent automatically gains the ability to search the web. It can now answer questions like "What is the weather in San Francisco?".

---

## Part 3: Setting up Database Tools with Prisma

To give the agent access to our application's data, we create tools that query a PostgreSQL database using the **Prisma ORM**.

### 1\. Prisma Setup

Prisma is used to interact with our database in a type-safe way.

- `schema.prisma` (not shown, but essential): This file defines our database schema (e.g., the `User` model).
- `src/db.ts`: This file ensures we use a single, shared instance of the Prisma client, which is a best practice to avoid exhausting database connections.

`/home/kamran/WORK/LANGCHAIN AND GENRATIVE AI/Agentic-AI/level2-langraph/src/db.ts`

```typescript
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
```

### 2\. Common Prisma Commands

During development, these commands are used to manage the database:

- `npx prisma generate`: Generates the Prisma Client from your `schema.prisma` file.
- `npx prisma migrate dev`: Creates and applies database migrations to keep the schema in sync.
- `npx prisma db seed`: Runs a seed script (e.g., `prisma/seed.ts`) to populate the database with initial data.

### 3\. Creating Database Tools

We create several tools for querying the `User` table. Each tool is specific to a certain query type. This is more effective than one generic query tool, as it gives the LLM clearer choices.

`/home/kamran/WORK/LANGCHAIN AND GENRATIVE AI/Agentic-AI/level2-langraph/src/tools/dbTools.ts`

```typescript
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import prisma from '../db';

// Tool to find users by name
export const getUsersByName = tool(
  async ({ name }: { name: string }) => {
    try {
      const users = await prisma.user.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
      });

      return users.length > 0 ? JSON.stringify(users) : `No users found with name containing "${name}"`;
    } catch (error) {
      console.error('Error searching users by name:', error);
      return 'Failed to search users by name';
    }
  },
  {
    name: 'getUsersByName',
    description: 'Search for users by name (case insensitive, partial matches)',
    schema: z.object({
      name: z.string().describe('The name or part of name to search for'),
    }),
  }
);

// ... other tools like getUsersByProfession, getUsersByCity, etc.

// Tool for advanced search with multiple criteria
export const searchUsers = tool(
  async ({
    name,
    profession,
  }: // ... other criteria
  {
    name?: string;
    profession?: string;
    // ...
  }) => {
    try {
      const whereClause: any = {};

      if (name) whereClause.name = { contains: name, mode: 'insensitive' };
      if (profession) whereClause.jobTitle = { contains: profession, mode: 'insensitive' };
      // ... build whereClause

      const users = await prisma.user.findMany({
        where: whereClause,
      });

      return users.length > 0 ? JSON.stringify(users) : 'No users found matching the criteria';
    } catch (error) {
      console.error('Error performing advanced search:', error);
      return 'Failed to perform advanced search';
    }
  },
  {
    name: 'searchUsers',
    description: 'Advanced search for users with multiple optional criteria',
    schema: z.object({
      name: z.string().optional().describe('User name (partial match)'),
      profession: z.string().optional().describe('Job title/profession (partial match)'),
      // ... other schema definitions
    }),
  }
);
```

**Key Concepts:**

- Each function uses the `prisma` client to perform a database query.
- The results are returned as a JSON string. This is important because the agent's context is text-based. A structured string like JSON is easier for the LLM to parse and understand than a raw JavaScript object.
- The `searchUsers` tool is more advanced, accepting multiple optional parameters. This allows the agent to handle more complex queries like "Find all software engineers in London".

### 4\. Adding to the Agent

Again, we just update our central tools file.

`/home/kamran/WORK/LANGCHAIN AND GENRATIVE AI/Agentic-AI/level2-langraph/src/tools/index.ts (Updated)`

```typescript
import { add, multiply } from './mathTool';
import { searchTool } from './searchTools';
import {
  getUserById,
  getUsersByCity,
  getUsersByCountry,
  getUsersByDepartment,
  getUsersByName,
  getUsersByProfession,
} from './dbTools';

// Export all tools as a single array for the agent
export const tools = [
  add,
  multiply,
  searchTool,
  getUserById,
  getUsersByCity,
  getUsersByCountry,
  getUsersByDepartment,
  getUsersByName,
  getUsersByProfession,
];
```

---

## Part 4: Integrating an External API Tool

Our final tool for this guide will call a third-party API to perform currency conversions.

### 1\. Creating the Currency Tool

This tool uses `fetch` to call the Free Currency API.

`/home/kamran/WORK/LANGCHAIN AND GENRATIVE AI/Agentic-AI/level2-langraph/src/tools/currencyTools.ts`

```typescript
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const convertCurrency = tool(
  async ({
    fromCurrency,
    toCurrency,
    amount,
  }: {
    fromCurrency: string;
    toCurrency: string;
    amount: number;
  }) => {
    console.log('Converting currency...');

    const apiKey = process.env.EXCHANGE_API_KEY;

    const response = await fetch(
      `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&base_currency=${fromCurrency}&currencies=${toCurrency}`
    );

    const data = await response.json();

    const exchangeRate = data.data[toCurrency];
    const convertedAmount = exchangeRate * amount;

    console.log('Currency converted successfully!');

    return {
      fromCurrency,
      toCurrency,
      amount,
      convertedAmount,
      exchangeRate,
    };
  },
  {
    name: 'convertCurrency',
    description: 'Convert a currency to another currency',
    schema: z.object({
      fromCurrency: z.string().describe('The currency to convert from'),
      toCurrency: z.string().describe('The currency to convert to'),
      amount: z.number().describe('The amount to convert'),
    }),
  }
);
```

### 2\. Adding to the Agent

We complete our toolset by adding the `convertCurrency` tool.

`/home/kamran/WORK/LANGCHAIN AND GENRATIVE AI/Agentic-AI/level2-langraph/src/tools/index.ts (Final)`

```typescript
import { add, multiply } from './mathTool';
import { searchTool } from './searchTools';
import { convertCurrency } from './currencyTools';
import {
  getUserById,
  getUsersByCity,
  getUsersByDepartment,
  getUsersByName,
  getUsersByProfession,
  // Removed `convertCurrency` from this list as it's directly imported above
} from './dbTools';

// Export all tools as a single array for the agent
export const tools = [
  add,
  multiply,
  searchTool,
  convertCurrency, // Added here
  getUserById,
  getUsersByCity,
  getUsersByDepartment,
  getUsersByName,
  getUsersByProfession,
];
```

With this final tool, our agent is now a versatile assistant capable of handling a wide range of requests.

---

## Next Steps: Adding Memory for Conversational Context

Currently, our agent is stateless. It treats every request as a brand new conversation and has no memory of past interactions. This means you can't ask follow-up questions like "And what about for 200 EUR?".

The next major enhancement is to add a **checkpointer**, which gives the agent memory.

In `src/agent.ts`, we've already set up the foundation for this using `@langchain/langgraph-checkpoint-postgres`:

`/home/kamran/WORK/LANGCHAIN AND GENRATIVE AI/Agentic-AI/level2-langraph/src/agent.ts`

```typescript
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { Pool } from 'pg';

// ...

const pgPool = new Pool({
  connectionString: process.env.DB_URL,
});

const checkpointer = new PostgresSaver(pgPool);

// ...

export const agent = createReactAgent({
  llm: model,
  tools: tools,
  checkpointSaver: checkpointer, // This line enables memory
});
```

And in `src/index.ts`, we handle a `threadId` to manage separate conversation histories:

`/home/kamran/WORK/LANGCHAIN AND GENRATIVE AI/Agentic-AI/level2-langraph/src/index.ts`

```typescript
app.post('/agent', async (req: Request, res: Response) => {
  // ...
  const threadId = req.body.threadId || 'default-chat-thread-123';
  const config = { configurable: { thread_id: threadId } };

  const result = await agent.invoke(
    {
      messages: [new HumanMessage(req.body.message)],
    },
    config // Pass the thread_id to the agent
  );
  // ...
});
```

A detailed guide on how the checkpointer works, how to set up the required database tables, and how it enables our agent to have meaningful, multi-turn conversations will be covered in the next part of this documentation.
