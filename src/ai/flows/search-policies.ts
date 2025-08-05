
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
import fs from 'fs/promises';
import path from 'path';

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

const dbPath = path.resolve(process.cwd(), 'src/data/db.json');

async function readPolicies(): Promise<z.infer<typeof PolicySchema>[]> {
    try {
        const data = await fs.readFile(dbPath, 'utf-8');
        const db = JSON.parse(data);
        return db.policies || [];
    } catch (error) {
        // If the file doesn't exist, return an empty array
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

async function writePolicies(policies: z.infer<typeof PolicySchema>[]): Promise<void> {
    const db = { policies };
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf-8');
}


export async function addPolicy(policy: z.infer<typeof PolicySchema>) {
    const policies = await readPolicies();
    // Prevent duplicates
    if (!policies.some(p => p.policyNumber === policy.policyNumber)) {
        policies.unshift(policy);
        await writePolicies(policies);
    }
}


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
        const policies = await readPolicies();
        const query = input.query.toLowerCase();
        const results = policies.filter(p => 
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
