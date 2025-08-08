
'use server';

import type { Policy, Claim } from '@/ai/flows/search-policies';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type { DashboardStats } from '@/app/actions';

function getSupabase() {
    const cookieStore = cookies();
    return createClient(cookieStore);
}

// We are now saving the entire form data blob, which includes all fields from WarrantyClaimSchema.
// The Policy type from search-policies.ts is now just a subset of the data stored.
export async function savePolicy(policyData: any): Promise<void> {
    const supabase = getSupabase();

    // Ensure the main 'tireDot' field required by older table structures is populated.
    const dataToSave = {
        ...policyData,
        tireDot: policyData.tireDot1,
    };
    
    // The policyData object now contains all fields needed for regeneration.
    const { error } = await supabase.from('policies').insert(dataToSave);

     if (error) {
         console.error('Error saving policy to Supabase:', error);
         if (error.code === '23505') { 
             throw new Error(`A policy with the policy number "${policyData.policyNumber}" already exists.`);
         }
         throw new Error(`Failed to save policy. DB Error: ${error.message}`);
     }
}


export async function getFullPolicyFromDb(policyNumber: string): Promise<any | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('policies')
        .select('*, claims(*)')
        .eq('policyNumber', policyNumber)
        .single();
    
    if (error) {
        console.error('Error fetching full policy data:', error);
        return null;
    }

    return data;
}


// User Management Actions
export type User = {
    id: number;
    email: string;
    role: 'admin' | 'member';
    created_at: string;
}

export async function getUsers(): Promise<User[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('users')
        .select('*');

    if (error) {
        console.error('Error fetching users:', error);
        if (error.code === '42P01') {
             throw new Error("The 'users' table does not exist. Please create it in your Supabase dashboard.");
        }
        if (error.code === '42501') {
            throw new Error("Permission denied. Please check your Row Level Security (RLS) policies on the 'users' table in your Supabase dashboard.");
        }
        throw new Error('Failed to fetch users.');
    }
    return data || [];
}

export async function addUser(email: string, role: 'admin' | 'member'): Promise<User> {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('users')
        .insert([{ email, role }])
        .select()
        .single();
    
    if (error) {
        console.error('Error adding user:', error);
        if (error.code === '42P01') {
             throw new Error("The 'users' table does not exist. Please create it in your Supabase dashboard.");
        }
        if (error.code === '42501') {
            throw new Error("Permission denied. Please check your Row Level Security (RLS) policies on the 'users' table in your Supabase dashboard.");
        }
        if (error.code === '23505') {
            throw new Error('A user with this email already exists.');
        }
        throw new Error('Failed to add user. Please check database permissions.');
    }
    return data;
}

export async function deleteUser(id: number): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting user:', error);
        if (error.code === '42501') {
            throw new Error("Permission denied. Please check your Row Level Security (RLS) policies on the 'users' table in your Supabase dashboard.");
        }
        throw new Error('Failed to delete user.');
    }
}

export async function getAllPoliciesFromDb(page: number = 1, limit: number = 10): Promise<{
  success: boolean;
  data?: Policy[];
  count?: number;
  error?: string;
}> {
    const supabase = getSupabase();
    try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from('policies')
            .select('*', { count: 'exact' })
            .order('purchaseDate', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Error fetching policies from Supabase:', error);
            if (error.code === '42501') { // RLS error
                 return { success: false, error: "Permission denied. Please check your Row Level Security (RLS) policies on the 'policies' table in your Supabase dashboard. You may need to create a policy that allows authenticated users to select data." };
            }
             if (error.code === '42P01') { // Table does not exist
                return { success: false, error: "The 'policies' table does not exist. Please create it in your Supabase dashboard."};
            }
            throw error; // Re-throw other errors
        }
        
        return { success: true, data: data || [], count: count || 0 };
    } catch(e) {
        const error = e as Error;
        console.error('A critical error occurred while trying to load policies:', error.message);
        let errorMessage = 'An unexpected error occurred. Please check the server console for more details.';
         if (error.message.includes("relation \"public.policies\" does not exist")) {
            errorMessage = "The 'policies' table does not exist. Please create it in your Supabase dashboard to continue.";
        }
        return { success: false, error: errorMessage, data: [], count: 0 };
    }
}


export async function getDashboardStatsFromDb(): Promise<DashboardStats> {
    const supabase = getSupabase();
    const today = new Date().toISOString();

    const { count: totalPolicies, error: totalError } = await supabase
        .from('policies')
        .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    const { count: activePolicies, error: activeError } = await supabase
        .from('policies')
        .select('*', { count: 'exact', head: true })
        .gt('warrantyEndDate', today);
    
    if (activeError) throw activeError;

    const { count: expiredPolicies, error: expiredError } = await supabase
        .from('policies')
        .select('*', { count: 'exact', head: true })
        .lt('warrantyEndDate', today);

    if (expiredError) throw expiredError;
    
    const { data: customers, error: customerError } = await supabase
        .from('policies')
        .select('customerEmail');

    if (customerError) throw customerError;

    const totalCustomers = new Set(customers.map(c => c.customerEmail)).size;
    
    return {
        totalPolicies: totalPolicies ?? 0,
        activePolicies: activePolicies ?? 0,
        expiredPolicies: expiredPolicies ?? 0,
        totalCustomers: totalCustomers ?? 0,
    }
}

export async function saveClaimToDb(claimData: {
  policy_number: string;
  incident_description: string;
  photo_urls: string[];
}): Promise<number> {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('claims')
        .insert(claimData)
        .select('id')
        .single();

    if (error) {
        console.error('Error saving claim to Supabase:', error);
        throw new Error(`Failed to save claim. DB Error: ${error.message}`);
    }

    return data.id;
}
