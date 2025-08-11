import express, { Request, Response } from 'express';
import prisma from '../db';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
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

export default router;
