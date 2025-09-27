
'use server';

import type { Policy, Claim } from '@/ai/flows/search-policies';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DashboardStats } from '@/app/actions';
import { parseISO, isBefore } from 'date-fns';

// Existing functions (savePolicy, getFullPolicyFromDb) remain unchanged...

export async function savePolicy(policyData: any): Promise<void> {
    const supabase = createClient();
    const dataToSave = {
        ...policyData,
        tireDot: policyData.tireDot1,
    };
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
    const supabase = createClient();
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
    id: string; // Should be string (UUID) from auth.users
    email: string;
    role: 'admin' | 'member';
    created_at: string;
}

export async function getUsers(): Promise<User[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        console.error('Error fetching users:', error);
        if (error.code === '42501') {
            throw new Error("Permission denied. Check RLS policies on 'users' table.");
        }
        throw new Error('Failed to fetch users.');
    }
    return data || [];
}

export async function addUser(email: string, role: 'admin' | 'member'): Promise<User> {
    const supabaseAdmin = createAdminClient();

    // Step 1: Create the user in Supabase Auth.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true, // User will be invited and must confirm their email.
    });

    if (authError) {
        console.error('Error creating auth user:', authError);
        throw new Error(`Failed to create user in auth system: ${authError.message}`);
    }

    const newUser = authData.user;
    if (!newUser) {
        throw new Error('User was not created, but no error was returned.');
    }

    // Step 2: Insert the user's metadata (including role) into the public 'users' table.
    const { data: profileData, error: profileError } = await supabaseAdmin
        .from('users')
        .insert({
            id: newUser.id, // Link to the auth user
            email: newUser.email,
            role: role,
        })
        .select()
        .single();

    if (profileError) {
        console.error('Error inserting user profile:', profileError);
        // If profile insertion fails, attempt to clean up the created auth user.
        await supabaseAdmin.auth.admin.deleteUser(newUser.id);
        throw new Error(`Failed to save user profile: ${profileError.message}`);
    }

    // The type assertion is safe because we are returning the data from the 'users' table.
    return profileData as User;
}

export async function deleteUser(id: string): Promise<void> { // ID is likely a UUID string now
    const supabaseAdmin = createAdminClient();
    
    // First, delete from the custom 'users' table.
    const { error: profileError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', id);

    if (profileError) {
        console.error('Error deleting user profile:', profileError);
        throw new Error(`Failed to delete user profile: ${profileError.message}`);
    }

    // Then, delete the user from Supabase Auth.
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) {
        console.error('Error deleting auth user:', authError);
        // This is a problem, as the profile is gone but the auth user remains.
        // You might want to add logic to handle this case.
        throw new Error(`Failed to delete user from auth system: ${authError.message}`);
    }
}

// Other functions (getAllPoliciesFromDb, getDashboardStatsFromDb, getAllClaims) remain unchanged...

export async function getAllPoliciesFromDb(page: number = 1, limit: number = 10, status: 'all' | 'active' | 'expired' | null = 'all', dateRange?: { from: Date, to: Date }): Promise<{
  success: boolean;
  data?: Policy[];
  count?: number;
  error?: string;
}> {
    const supabase = createClient();
    try {
        let query = supabase
            .from('policies')
            .select('*', { count: 'exact' });
            
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (status === 'active') {
            const todayISO = today.toISOString().split('T')[0];
            query = query.gte('warrantyEndDate', todayISO);
        } else if (status === 'expired') {
            const todayISO = today.toISOString().split('T')[0];
            query = query.lt('warrantyEndDate', todayISO);
        }
        
        if (dateRange) {
            query = query.gte('purchaseDate', dateRange.from.toISOString().split('T')[0]);
            query = query.lte('purchaseDate', dateRange.to.toISOString().split('T')[0]);
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;
        
        const { data, error, count } = await query
            .order('purchaseDate', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Error fetching policies from Supabase:', error);
            if (error.code === '42501') { 
                 return { success: false, error: "Permission denied. Please check your Row Level Security (RLS) policies on the 'policies' table." };
            }
             if (error.code === '42P01') { 
                return { success: false, error: "The 'policies' table does not exist." };
            }
            throw error;
        }
        
        const policies = data ? data.map(item => ({...item, tireDot: item.tireDot1 || ''})) as Policy[] : [];

        return { success: true, data: policies, count: count || 0 };
    } catch(e) {
        const error = e as Error;
        console.error('A critical error occurred while trying to load policies:', error.message);
        return { success: false, error: 'An unexpected error occurred.', data: [], count: 0 };
    }
}


export async function getDashboardStatsFromDb(dateRange?: { from: Date, to: Date }): Promise<DashboardStats> {
    const supabase = createClient();
    try {
        let policiesQuery = supabase
            .from('policies')
            .select('customerEmail, warrantyEndDate, roadHazardPrice, purchaseDate');

        if (dateRange) {
            policiesQuery = policiesQuery.gte('purchaseDate', dateRange.from.toISOString().split('T')[0]);
            policiesQuery = policiesQuery.lte('purchaseDate', dateRange.to.toISOString().split('T')[0]);
        }

        const { data: allPolicies, error: totalError } = await policiesQuery;

        if (totalError) throw totalError;

        if (!allPolicies) {
             return { totalPolicies: 0, activePolicies: 0, expiredPolicies: 0, totalCustomers: 0, totalClaims: 0, totalSales: 0 };
        }

        let activePolicies = 0;
        let expiredPolicies = 0;
        let totalSales = 0;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const policy of allPolicies) {
            const warrantyEndDate = parseISO(policy.warrantyEndDate);
            if (isBefore(warrantyEndDate, today)) {
                expiredPolicies++;
            } else {
                activePolicies++;
            }
            totalSales += policy.roadHazardPrice || 0;
        }
        
        const totalCustomers = new Set(allPolicies.map(c => c.customerEmail)).size;
        
        let claimsQuery = supabase
            .from('claims')
            .select('*', { count: 'exact', head: true });

        if (dateRange) {
            claimsQuery = claimsQuery.gte('created_at', dateRange.from.toISOString());
            claimsQuery = claimsQuery.lte('created_at', dateRange.to.toISOString());
        }

        const { count: totalClaims, error: claimsError } = await claimsQuery;

        if (claimsError && claimsError.code !== '42P01') {
            throw claimsError;
        }

        return {
            totalPolicies: allPolicies.length,
            activePolicies: activePolicies,
            expiredPolicies: expiredPolicies,
            totalCustomers: totalCustomers,
            totalClaims: totalClaims ?? 0,
            totalSales: totalSales,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return { totalPolicies: 0, activePolicies: 0, expiredPolicies: 0, totalCustomers: 0, totalClaims: 0, totalSales: 0 };
    }
}


export async function getAllClaims(page: number = 1, limit: number = 10): Promise<{
    success: boolean;
    data?: (Claim & { policies: { customerName: string } })[];
    count?: number;
    error?: string;
}> {
    const supabase = createClient();
    try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from('claims')
            .select('*, policies!inner(customerName)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Error fetching claims from Supabase:', error);
            if (error.code === '42501') {
                return { success: false, error: "Permission denied. Check RLS policies on 'claims'." };
            }
            if (error.code === '42P01') {
                return { success: false, error: "The 'claims' table does not exist." };
            }
            throw error;
        }
        
        return { success: true, data: data as any, count: count || 0 };
    } catch (e) {
        const error = e as Error;
        return { success: false, error: error.message };
    }
}
