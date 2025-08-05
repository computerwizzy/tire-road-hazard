
'use server';

/**
 * @fileOverview A flow for searching warranty policies.
 *
 * - searchPolicies - A function that searches for policies based on a query.
 * - SearchPoliciesInput - The input type for the searchPolicies function.
 * - SearchPoliciesOutput - The return type for the searchPolicies function.
 */

import { z } from 'genkit';
import { supabase } from '@/lib/supabase';

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
    receiptUrl: z.string().url().nullable(),
});
export type Policy = z.infer<typeof PolicySchema>;


const SearchPoliciesOutputSchema = z.object({
  results: z.array(PolicySchema).describe('A list of matching warranty policies.'),
});
export type SearchPoliciesOutput = z.infer<typeof SearchPoliciesOutputSchema>;

export async function searchPolicies(input: SearchPoliciesInput): Promise<SearchPoliciesOutput> {
    const { data, error } = await supabase
        .from('policies')
        .select()
        .or(`policyNumber.ilike.%${input.query}%,tireDot.ilike.%${input.query}%`);

    if (error) {
        console.error('Error searching policies in Supabase:', error);
        throw new Error('Failed to search policies.');
    }

    return { results: data || [] };
}
