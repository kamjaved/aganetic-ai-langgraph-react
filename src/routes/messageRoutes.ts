import express, { Request, Response } from 'express';
import prisma from '../db';

const router = express.Router();

// Get messages by threadId
router.get('/:threadId', async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        threadId,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Could not fetch messages' });
  }
});

// Create a new message
router.post('/', async (req: Request, res: Response) => {
  try {
    const { text, sender, threadId, username, isMarkdown, userRole } = req.body;

    const message = await prisma.message.create({
      data: {
        text,
        sender,
        threadId,
        username,
        isMarkdown: isMarkdown || false,
        userRole,
        timestamp: new Date(),
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Could not create message' });
  }
});

export default router;
