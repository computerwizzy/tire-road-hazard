
'use server';

// In-memory data store to simulate Firestore
let inMemoryData = {
    vehicles: {
        makes: ['Honda', 'Toyota', 'Ford', 'Tesla'],
        models: {
            'Honda': { 'Accord': ['EX', 'LX'], 'Civic': ['Sport', 'Touring'] },
            'Toyota': { 'Camry': ['LE', 'XSE'], 'Corolla': ['L', 'SE'] },
            'Ford': { 'F-150': ['XL', 'XLT'], 'Mustang': ['GT', 'EcoBoost'] },
            'Tesla': { 'Model 3': ['Standard Range', 'Long Range'], 'Model Y': ['Long Range', 'Performance'] },
        }
    },
    tires: {
        brands: ['Michelin', 'Goodyear', 'Bridgestone'],
        sizes: ['225/45R17', '235/40R18', '205/55R16']
    },
    policies: [
        {
            policyNumber: 'WP-2023-ABC123',
            customerName: 'John Doe',
            customerEmail: 'john.doe@example.com',
            tireDot: 'DOTB3RVY8C',
            purchaseDate: '2023-01-15',
            warrantyEndDate: '2026-01-15'
        }
    ]
};

export type DataForForm = {
    vehicleMakes: string[];
    tireBrands: string[];
    commonTireSizes: string[];
    vehicleModels: { [make: string]: { [model: string]: string[] } };
}

export async function getDataForForm(): Promise<DataForForm> {
    return {
        vehicleMakes: inMemoryData.vehicles.makes,
        vehicleModels: inMemoryData.vehicles.models,
        tireBrands: inMemoryData.tires.brands,
        commonTireSizes: inMemoryData.tires.sizes,
    }
}

export async function addDropdownOption(list: 'vehicleMakes' | 'tireBrands' | 'commonTireSizes', value: string): Promise<void> {
    if (list === 'vehicleMakes') {
        const makes = inMemoryData.vehicles.makes;
        if (!makes.includes(value)) {
            makes.push(value);
            makes.sort();
        }
    } else {
        const key = list === 'tireBrands' ? 'brands' : 'sizes';
        const collection = inMemoryData.tires[key];
        if (!collection.includes(value)) {
            collection.push(value);
            collection.sort();
        }
    }
}

export async function addVehicleModel(make: string, model: string): Promise<void> {
    const models = inMemoryData.vehicles.models;
    if (!models[make]) {
        models[make] = {};
    }
    if (!models[make][model]) {
        models[make][model] = [];
    }
}

export async function addVehicleSubmodel(make: string, model: string, submodel: string): Promise<void> {
    const models = inMemoryData.vehicles.models;
    if (models[make] && models[make][model]) {
        if (!models[make][model].includes(submodel)) {
            models[make][model].push(submodel);
            models[make][model].sort();
        }
    }
}

// Re-exporting types from search-policies to avoid circular dependencies if any
import type { Policy } from '@/ai/flows/search-policies';

export async function getPolicies(): Promise<Policy[]> {
    return inMemoryData.policies;
}

export async function savePolicy(policy: Policy): Promise<void> {
    inMemoryData.policies.push(policy);
}
