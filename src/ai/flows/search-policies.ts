'use server';

/**
 * @fileOverview A flow for searching warranty policies.
 *
 * - searchPolicies - A function that searches for policies based on a query.
 * - SearchPoliciesInput - The input type for the searchPolicies function.
 * - SearchPoliciesOutput - The return type for the searchPolicies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchPoliciesInputSchema = z.object({
  query: z.string().describe('The search query, which could be a policy number or a tire DOT number.'),
});
export type SearchPoliciesInput = z.infer<typeof SearchPoliciesInputSchema>;

const PolicySchema = z.object({
    policyNumber: z.string(),
    customerName: z.string(),
    customerEmail: z.string(),
    tireDot: z.string(),
    purchaseDate: z.string(),
    warrantyEndDate: z.string(),
});

const SearchPoliciesOutputSchema = z.object({
  results: z.array(PolicySchema).describe('A list of matching warranty policies.'),
});
export type SearchPoliciesOutput = z.infer<typeof SearchPoliciesOutputSchema>;

// This is a mock database of policies for demonstration purposes.
// In a real application, this would be a database query.
const mockPolicies = [
    { policyNumber: 'WP-2024-ABC123', customerName: 'Alice Johnson', customerEmail: 'alice@example.com', tireDot: 'DOTB3RVY8C4223', purchaseDate: '2024-01-15', warrantyEndDate: '2026-01-15' },
    { policyNumber: 'WP-2024-DEF456', customerName: 'Bob Williams', customerEmail: 'bob@example.com', tireDot: 'DOTC4SXY9D5323', purchaseDate: '2024-02-20', warrantyEndDate: '2026-02-20' },
    { policyNumber: 'WP-2023-GHI789', customerName: 'Charlie Brown', customerEmail: 'charlie@example.com', tireDot: 'DOTD5TZA0E6422', purchaseDate: '2023-11-10', warrantyEndDate: '2025-11-10' },
];


export async function searchPolicies(input: SearchPoliciesInput): Promise<SearchPoliciesOutput> {
  return searchPoliciesFlow(input);
}

const findPoliciesTool = ai.defineTool(
    {
      name: 'findPoliciesTool',
      description: 'Finds warranty policies based on a policy number or DOT number.',
      inputSchema: SearchPoliciesInputSchema,
      outputSchema: SearchPoliciesOutputSchema,
    },
    async (input) => {
        const query = input.query.toLowerCase();
        const results = mockPolicies.filter(p => 
            p.policyNumber.toLowerCase().includes(query) || 
            p.tireDot.toLowerCase().includes(query)
        );
        return { results };
    }
);


const searchPoliciesFlow = ai.defineFlow(
  {
    name: 'searchPoliciesFlow',
    inputSchema: SearchPoliciesInputSchema,
    outputSchema: SearchPoliciesOutputSchema,
    tools: [findPoliciesTool]
  },
  async (input) => {
    // Directly call the tool to get the results.
    // The previous implementation with an LLM call was unnecessary and causing issues.
    return await findPoliciesTool(input);
  }
);
