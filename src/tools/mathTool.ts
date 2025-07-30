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
