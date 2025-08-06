
'use server';

/**
 * @fileOverview A function for searching warranty policies.
 *
 * - searchPolicies - A function that searches for policies based on a query.
 * - Policy - The type definition for a policy object.
 * - SearchPoliciesOutput - The return type for the searchPolicies function.
 */

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

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


export type SearchPoliciesOutput = {
  results: Policy[];
};

export async function searchPolicies(query: string): Promise<SearchPoliciesOutput> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('policies')
        .select(`
            policyNumber,
            customerName,
            customerEmail,
            tireDot,
            purchaseDate,
            warrantyEndDate,
            receiptUrl,
            policyDocument
        `)
        .or(`policyNumber.ilike.%${query}%,customerName.ilike.%${query}%,tireDot.ilike.%${query}%`);

    if (error) {
        console.error('Error searching policies in Supabase:', error);
        if (error.code === '42501') {
            throw new Error("Permission denied. Please check your Row Level Security (RLS) policies on the 'policies' table in your Supabase dashboard.");
        }
        if (error.code === '42P01') {
             throw new Error("The 'policies' table does not exist. Please create it in your Supabase dashboard.");
        }
        throw new Error('Failed to search policies. Please check the database connection and permissions.');
    }
    
    return { results: data || [] };
}
