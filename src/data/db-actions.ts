
'use server';

import { getDb } from '@/lib/firebase-admin';
import type { Policy } from '@/ai/flows/search-policies';

export type DataForForm = {
    vehicleMakes: string[];
    tireBrands: string[];
    commonTireSizes: string[];
    vehicleModels: { [make: string]: { [model: string]: string[] } };
}

async function getDocData(collection: string, docId: string): Promise<any> {
    const db = getDb();
    const docRef = db.collection(collection).doc(docId);
    const doc = await docRef.get();
    return doc.exists ? doc.data() : null;
}

async function updateDoc(collection: string, docId: string, data: any): Promise<void> {
    const db = getDb();
    await db.collection(collection).doc(docId).set(data, { merge: true });
}


export async function getDataForForm(): Promise<DataForForm> {
    const dbData = await getDocData('appData', 'tiresAndVehicles');
    if (!dbData) {
        // Return some default data if nothing is in the database
        return {
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
    }
    return {
        vehicleMakes: dbData.vehicleMakes || [],
        vehicleModels: dbData.vehicleModels || {},
        tireBrands: dbData.tireBrands || [],
        commonTireSizes: dbData.commonTireSizes || [],
    };
}

export async function addDropdownOption(list: 'vehicleMakes' | 'tireBrands' | 'commonTireSizes', value: string): Promise<void> {
    const dbData = await getDocData('appData', 'tiresAndVehicles') || {};
    const collection = dbData[list] || [];
    if (!collection.includes(value)) {
        collection.push(value);
        collection.sort();
        await updateDoc('appData', 'tiresAndVehicles', { [list]: collection });
    }
}

export async function addVehicleModel(make: string, model: string): Promise<void> {
    const dbData = await getDocData('appData', 'tiresAndVehicles') || {};
    const vehicleModels = dbData.vehicleModels || {};
    if (!vehicleModels[make]) {
        vehicleModels[make] = {};
    }
    if (!vehicleModels[make][model]) {
        vehicleModels[make][model] = [];
        await updateDoc('appData', 'tiresAndVehicles', { vehicleModels });
    }
}

export async function addVehicleSubmodel(make: string, model: string, submodel: string): Promise<void> {
    const dbData = await getDocData('appData', 'tiresAndVehicles') || {};
    const vehicleModels = dbData.vehicleModels || {};
    if (vehicleModels[make] && vehicleModels[make][model]) {
        if (!vehicleModels[make][model].includes(submodel)) {
            vehicleModels[make][model].push(submodel);
            vehicleModels[make][model].sort();
            await updateDoc('appData', 'tiresAndVehicles', { vehicleModels });
        }
    }
}


export async function getPolicies(): Promise<Policy[]> {
    const db = getDb();
    const policiesSnapshot = await db.collection('policies').get();
    const policies: Policy[] = [];
    policiesSnapshot.forEach(doc => {
        policies.push(doc.data() as Policy);
    });
    return policies;
}

export async function savePolicy(policy: Policy): Promise<void> {
    const db = getDb();
    await db.collection('policies').doc(policy.policyNumber).set(policy);
}
