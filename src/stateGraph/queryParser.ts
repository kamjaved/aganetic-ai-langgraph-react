import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { gpt4ominiModal as model } from '../tools/llm';

// Define the expected output schema
const CurrencyQuerySchema = z.object({
  amountInUSD: z.number().describe('The amount in USD to convert'),
  targetCurrency: z.enum(['INR', 'EUR', 'USD']).describe('The target currency to convert to'),
  confidence: z.number().min(0).max(1).describe('Confidence level of the extraction (0-1)'),
});

type CurrencyQuery = z.infer<typeof CurrencyQuerySchema>;

// Create the structured output parser
const parser = StructuredOutputParser.fromZodSchema(CurrencyQuerySchema);

// Create the prompt template
const queryParsingPrompt = PromptTemplate.fromTemplate(`
You are a currency conversion query parser. Extract the amount in USD and target currency from the user's natural language query.

Rules:
1. If the amount is already in USD, use it directly
2. If the amount is in another currency, you need to identify it but assume the user wants to convert FROM that currency TO the target
3. Support these currencies: INR, EUR, USD
4. Set confidence based on how clear the query is (1.0 = very clear, 0.5 = somewhat unclear, 0.0 = cannot parse)

Examples:
- "what will be INR for 1000USD?" → amountInUSD: 1000, targetCurrency: "INR"
- "convert 500 dollars to euros" → amountInUSD: 500, targetCurrency: "EUR"
- "how much is 2000 USD in Indian rupees?" → amountInUSD: 2000, targetCurrency: "INR"

Query: {query}

{format_instructions}
`);

// Create the parsing chain
const parsingChain = queryParsingPrompt.pipe(model).pipe(parser);

export async function parseNaturalLanguageQuery(query: string): Promise<CurrencyQuery> {
  try {
    const result = await parsingChain.invoke({
      query,
      format_instructions: parser.getFormatInstructions(),
    });

    return result;
  } catch (error) {
    console.error('Error parsing query:', error);
    throw new Error('Could not parse the currency conversion query');
  }
}
