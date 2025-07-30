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
