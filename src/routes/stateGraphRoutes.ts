import express, { Request, Response } from 'express';
import { Currency, runConversion } from '../stateGraph/basic';
import { runResearch } from '../stateGraph/researchGraphSecndry';
import { parseNaturalLanguageQuery } from '../stateGraph/queryParser';

const router = express.Router();

router.post('/research', async (req: Request, res: Response) => {
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

router.post('/convert', async (req: Request, res: Response) => {
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

export default router;
