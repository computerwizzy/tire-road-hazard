
'use server';

import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

export type DataForForm = {
    vehicleMakes: string[];
    tireBrands: string[];
    commonTireSizes: string[];
    vehicleModels: { [make: string]: { [model: string]: string[] } };
}

async function getDocument(collectionName: string, docName: string): Promise<any> {
    const docRef = doc(db, collectionName, docName);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
}

async function updateDocument(collectionName: string, docName: string, data: any): Promise<void> {
    const docRef = doc(db, collectionName, docName);
    await setDoc(docRef, data, { merge: true });
}


export async function getDataForForm(): Promise<DataForForm> {
    const vehicleData = await getDocument('appData', 'vehicles');
    const tireData = await getDocument('appData', 'tires');

    return {
        vehicleMakes: vehicleData?.makes || [],
        vehicleModels: vehicleData?.models || {},
        tireBrands: tireData?.brands || [],
        commonTireSizes: tireData?.sizes || [],
    }
}

export async function addDropdownOption(list: 'vehicleMakes' | 'tireBrands' | 'commonTireSizes', value: string): Promise<void> {
    if (list === 'vehicleMakes') {
        const vehicleData = await getDocument('appData', 'vehicles') || { makes: [] };
        if (!vehicleData.makes.includes(value)) {
            vehicleData.makes.push(value);
            vehicleData.makes.sort();
            await updateDocument('appData', 'vehicles', { makes: vehicleData.makes });
        }
    } else {
        const tireData = await getDocument('appData', 'tires') || { brands: [], sizes: [] };
        const key = list === 'tireBrands' ? 'brands' : 'sizes';
        if (!tireData[key].includes(value)) {
            tireData[key].push(value);
            tireData[key].sort();
            await updateDocument('appData', 'tires', { [key]: tireData[key] });
        }
    }
}

export async function addVehicleModel(make: string, model: string): Promise<void> {
    const vehicleData = await getDocument('appData', 'vehicles') || { models: {} };
    if (!vehicleData.models[make]) {
        vehicleData.models[make] = {};
    }
    if (!vehicleData.models[make][model]) {
        vehicleData.models[make][model] = [];
        await updateDocument('appData', 'vehicles', { models: vehicleData.models });
    }
}

export async function addVehicleSubmodel(make: string, model: string, submodel: string): Promise<void> {
    const vehicleData = await getDocument('appData', 'vehicles') || { models: {} };
    if (vehicleData.models[make] && vehicleData.models[make][model]) {
        if (!vehicleData.models[make][model].includes(submodel)) {
            vehicleData.models[make][model].push(submodel);
            vehicleData.models[make][model].sort();
            await updateDocument('appData', 'vehicles', { models: vehicleData.models });
        }
    }
}
