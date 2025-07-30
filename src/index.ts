import express, { Request, Response, Application } from 'express';
import { config } from 'dotenv';
import { agent, setupCheckpointer } from './agent';
import { HumanMessage } from '@langchain/core/messages';
import cors from 'cors';
import prisma from './db';

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

app.post('/agent', async (req: Request, res: Response) => {
  try {
    const threadId = req.body.threadId || 'default-chat-thread-123';
    console.log('Human Message: ', req.body.message);
    console.log('Thread ID: ', threadId);

    const config = { configurable: { thread_id: threadId } };

    const result = await agent.invoke(
      {
        messages: [new HumanMessage(req.body.message)],
      },
      config
    );
    console.log('AI REPLY: ', result.messages[result.messages.length - 1].content);
    res.send({
      status: 200,
      ai_message: result.messages[result.messages.length - 1].content,
    });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

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
