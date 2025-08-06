
'use server';

/**
 * @fileOverview A flow for searching warranty policies.
 *
 * - searchPolicies - A function that searches for policies based on a query.
 * - SearchPoliciesInput - The input type for the searchPolicies function.
 * - SearchPoliciesOutput - The return type for the searchPolicies function.
 */

import { z } from 'genkit';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

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
    policyDocument: z.string().nullable(),
});
export type Policy = z.infer<typeof PolicySchema>;


const SearchPoliciesOutputSchema = z.object({
  results: z.array(PolicySchema).describe('A list of matching warranty policies.'),
});
export type SearchPoliciesOutput = z.infer<typeof SearchPoliciesOutputSchema>;

export async function searchPolicies(input: SearchPoliciesInput): Promise<SearchPoliciesOutput> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('policies')
        .select()
        .or(`policyNumber.ilike.%${input.query}%,tireDot.ilike.%${input.query}%`);

    if (error) {
        console.error('Error searching policies in Supabase:', error);
        throw new Error('Failed to search policies.');
    }

    // Supabase returns an array of objects. We need to ensure they match the Policy schema.
    const validatedData = z.array(PolicySchema).safeParse(data);
    
    if (!validatedData.success) {
        console.error("Supabase data failed validation:", validatedData.error);
        throw new Error("Data from database does not match expected format.");
    }
    
    return { results: validatedData.data || [] };
}
