
'use server';

import type { Policy } from '@/ai/flows/search-policies';
import { supabase } from '@/lib/supabase';


export type DataForForm = {
    vehicleMakes: string[];
    tireBrands: string[];
    commonTireSizes: string[];
    vehicleModels: { [make: string]: { [model: string]: string[] } };
}

// In-memory store for dropdowns
let formStore: DataForForm = {
    vehicleMakes: ['Honda', 'Toyota', 'Ford', 'Tesla'],
    vehicleModels: {
        'Honda': { 'Accord': ['EX', 'LX'], 'Civic': ['Sport', 'Touring'] },
        'Toyota': { 'Camry': ['LE', 'XSE'], 'Corolla': ['L', 'SE'] },
        'Ford': { 'F-150': ['XL', 'XLT'], 'Mustang': ['GT', 'EcoBoost'] },
        'Tesla': { 'Model 3': ['Standard Range', 'Long Range'], 'Model Y': ['Long Range', 'Performance'] },
    },
    tireBrands: ['Michelin', 'Goodyear', 'Bridgestone'],
    commonTireSizes: ['225/45R17', '235/40R18', '205/55R16']
};


export async function getDataForForm(): Promise<DataForForm> {
    // Return a copy to prevent mutation
    return JSON.parse(JSON.stringify(formStore));
}

export async function addDropdownOption(list: 'vehicleMakes' | 'tireBrands' | 'commonTireSizes', value: string): Promise<void> {
    const collection = formStore[list] as string[];
    if (!collection.includes(value)) {
        collection.push(value);
        collection.sort();
    }
}

export async function addVehicleModel(make: string, model: string): Promise<void> {
    if (!formStore.vehicleModels[make]) {
        formStore.vehicleModels[make] = {};
    }
    if (!formStore.vehicleModels[make][model]) {
        formStore.vehicleModels[make][model] = [];
    }
}

export async function addVehicleSubmodel(make: string, model: string, submodel: string): Promise<void> {
    if (formStore.vehicleModels[make] && formStore.vehicleModels[make][model]) {
        if (!formStore.vehicleModels[make][model].includes(submodel)) {
            formStore.vehicleModels[make][model].push(submodel);
            formStore.vehicleModels[make][model].sort();
        }
    }
}


export async function getPolicies(): Promise<Policy[]> {
    const { data, error } = await supabase.from('policies').select();
    if (error) {
        console.error('Error fetching policies from Supabase:', error);
        throw new Error('Failed to fetch policies.');
    }
    return data;
}

export async function savePolicy(policy: Policy): Promise<void> {
    const { error } = await supabase.from('policies').insert(policy);
     if (error) {
         console.error('Error saving policy to Supabase:', error);
         throw new Error('Failed to save policy.');
     }
 }
