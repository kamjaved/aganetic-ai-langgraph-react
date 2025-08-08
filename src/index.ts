import express, { Request, Response, Application } from 'express';
import { config } from 'dotenv';
import { agent, setupCheckpointer, checkpointer } from './agent';
import cors from 'cors';
import prisma from './db';
import { CheckpointListOptions } from '@langchain/langgraph-checkpoint';
import { getFormattedPrompt } from './agent';
import { runResearch } from './stateGraph/researchGraphSecndry';
import { Currency, runConversion } from './stateGraph/basic';
import { parseNaturalLanguageQuery } from './stateGraph/queryParser';

config();
// setup cors

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port: string | number = process.env.PORT || 3001;
app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript in Node.js!');
});

/////////////////////////////////////////////////////////////////
/////////////----- TESTING CHECKPOINTER METHOD-----//////////////
////////////////////////////////////////////////////////////////

app.post('/checpointer', async (req: Request, res: Response) => {
  try {
    const options: CheckpointListOptions = {
      limit: 2,
    };

    const threadId = req.body.threadId || 'default-chat-thread-124';
    const config = { configurable: { thread_id: threadId } };

    // GET
    const checkpointerGet = await checkpointer.get(config);

    // LIST
    const checkpointsList = [];
    for await (const checkpoint of checkpointer.list(config, options)) {
      checkpointsList.push({
        checkpointId: checkpoint?.config?.configurable?.checkpoint_id,
        timestamp: new Date(checkpoint.checkpoint.ts).toLocaleString(),
      });
    }

    // GET NEXT VERSION
    const currentVersion = 8;
    const nextVersion = await checkpointer.getNextVersion(currentVersion);

    res.send({
      status: 200,
      nextVersion: nextVersion,
      checkpointsList: checkpointsList,
      checkpointerGet: checkpointerGet,
    });
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch Checkpointer.' });
  }
});

/////////////////////////////////////////////////////////////////
/////////////----- AGENT ENDPOINT -----//////////////
////////////////////////////////////////////////////////////////

app.post('/agent', async (req: Request, res: Response) => {
  try {
    const threadId = req.body.threadId || 'default-chat-thread-125';
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: 'Message is required' });
    }
    console.log('Human Message: ', userMessage);
    console.log('Thread ID: ', threadId);

    // Format prompt using the new PromptManager
    const formattedPrompt = await getFormattedPrompt(userMessage, {
      context: req.body.context,
      history: req.body.history,
    });

    console.log('Formatted Prompt: ', formattedPrompt);

    const config = { configurable: { thread_id: threadId } };

    const result = await agent.invoke(
      {
        messages: formattedPrompt,
      },
      config
    );

    console.log('AI REPLY: ', result.messages[result.messages.length - 1].content);

    res.send({
      status: 200,
      threadId: threadId,
      ai_message: result.messages[result.messages.length - 1].content,
    });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

/////////////////////////////////////////////////////////////////
/////////////-----PRISMA NEW USER CREATE-----//////////////
////////////////////////////////////////////////////////////////

app.post('/user', async (req: Request, res: Response) => {
  const { name, email, city, country, jobTitle, department, salary, currency, remotePercent } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        city,
        country,
        jobTitle,
        department,
        salary,
        currency,
        remotePercent,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Could not create user.' });
  }
});

/////////////////////////////////////////////////////////////////
////////////////----- STATE GRAPH ENDPOINTS------- //////////////
////////////////////////////////////////////////////////////////

app.post('/state-graph/research', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const result = await runResearch(query);

    res.json({
      query,
      result,
    });
  } catch (error) {
    console.error('Research graph error:', error);
    res.status(500).json({ error: 'Failed to process research query' });
  }
});

app.post('/state-graph/convert', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Query is required. Example: "what will be INR for 1000USD?"',
      });
    }

    // Parse natural language query
    const parsedQuery = await parseNaturalLanguageQuery(query);

    // Check confidence level
    if (parsedQuery.confidence < 0.5) {
      return res.status(400).json({
        error:
          'Could not understand the query. Please be more specific about the amount and target currency.',
        suggestion: 'Try: "Convert 1000 USD to INR" or "What is 500 dollars in euros?"',
      });
    }

    // Validate target currency
    if (!Object.values(Currency).includes(parsedQuery.targetCurrency as Currency)) {
      return res.status(400).json({
        error: 'Invalid target currency. Supported currencies: EUR, INR, USD',
      });
    }
    // Run the conversion using your existing StateGraph
    const result = await runConversion(parsedQuery.amountInUSD, parsedQuery.targetCurrency as Currency);

    res.json({
      originalQuery: query,
      parsedQuery,
      result,
    });
  } catch (error) {
    console.error('Currency conversion error:', error);
    res.status(500).json({
      error: 'Failed to process currency conversion',
    });
  }
});

setupCheckpointer()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to setup checkpointer:', err);
    process.exit(1);
  });
