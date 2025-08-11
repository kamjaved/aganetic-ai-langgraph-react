import express, { Request, Response } from 'express';
import { agent, getFormattedPrompt } from '../agent';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, threadId, username, userRole } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const chatThreadId = threadId || 'default-chat-thread-125';
    console.log('Human Message: ', message);
    console.log('Thread ID: ', chatThreadId);
    console.log('User: ', username, `(${userRole})`);

    // Format prompt using the new PromptManager
    const formattedPrompt = await getFormattedPrompt(message, {
      context: {
        ...req.body.context,
        username,
        userRole,
      },
      history: req.body.history,
    });

    console.log('Formatted Prompt: ', formattedPrompt);

    const config = { configurable: { thread_id: chatThreadId } };

    const result = await agent.invoke(
      {
        messages: formattedPrompt,
      },
      config
    );

    console.log('AI REPLY: ', result.messages[result.messages.length - 1].content);

    res.send({
      status: 200,
      threadId: chatThreadId,
      ai_message: result.messages[result.messages.length - 1].content,
    });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
