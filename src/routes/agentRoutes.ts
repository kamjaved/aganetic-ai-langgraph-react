import { HumanMessage } from '@langchain/core/messages';
import express, { Request, Response } from 'express';
import { agent, getFormattedPrompt } from '../agent';
import { MessageManager } from '../services/messageManager';
import { countTokens } from '../services/tokenCounter';

const router = express.Router();
const messageManager = new MessageManager();

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

    // 1. First, save the user's message to the database
    await messageManager.saveMessage(message, 'user', chatThreadId, username || 'anonymous', false, userRole);

    //2- Get optimized message context
    const optimizedContext = await messageManager.getOptimizedContext(chatThreadId);

    // Log token usage before adding current message
    const contextText = optimizedContext.map((msg) => msg.content).join('\n');
    console.log(`Base context size: ~${countTokens(contextText)} tokens`);

    // 3. Add the current user message to context
    optimizedContext.push(new HumanMessage(message));

    // 4. Format the prompt with the optimized context
    const formattedPrompt = await getFormattedPrompt(message, {
      context: {
        username,
        userRole,
      },
      history: optimizedContext,
    });

    console.log('Formatted Prompt: ', formattedPrompt);

    // Call agent with formatted prompt
    const result = await agent.invoke({
      messages: formattedPrompt,
    });
    // 6. Extract AI response
    const aiResponse = String(result.messages[result.messages.length - 1].content);
    console.log('AI REPLY: ', aiResponse);

    // 7. Save the AI response to the database
    await messageManager.saveMessage(aiResponse, 'agent', chatThreadId, 'AI', true);
    res.send({
      status: 200,
      threadId: chatThreadId,
      ai_message: aiResponse,
    });
  } catch (error) {
    console.error('Error in agent route:', error);
    res.status(500).send({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
