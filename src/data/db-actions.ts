
'use server';

import type { Policy } from '@/ai/flows/search-policies';
import { supabase } from '@/lib/supabase';
import { formStore } from './form-data';


export type DataForForm = {
    vehicleMakes: string[];
    tireBrands: string[];
    commonTireSizes: string[];
}

export async function getInitialFormData(): Promise<DataForForm> {
    return {
        vehicleMakes: formStore.vehicleMakes,
        tireBrands: formStore.tireBrands,
        commonTireSizes: formStore.commonTireSizes,
    };
}

export async function getModelsForMake(make: string): Promise<string[]> {
    if (!make || !formStore.vehicleModels[make]) {
        return [];
    }
    return Object.keys(formStore.vehicleModels[make]);
}

export async function getSubmodelsForModel(make: string, model: string): Promise<string[]> {
    if (!make || !model || !formStore.vehicleModels[make]?.[model]) {
        return [];
    }
    return formStore.vehicleModels[make][model];
}


export async function savePolicy(policy: Omit<Policy, 'id'>): Promise<void> {
    const { error } = await supabase.from('policies').insert(policy);
     if (error) {
         console.error('Error saving policy to Supabase:', error);
         throw new Error('Failed to save policy.');
     }
}

// User Management Actions
export type User = {
    id: number;
    email: string;
    role: 'admin' | 'member';
    created_at: string;
}

export async function getUsers(): Promise<User[]> {
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
