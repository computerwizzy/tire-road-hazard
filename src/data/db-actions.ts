
'use server';

import fs from 'fs/promises';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'src/data/db.json');

type VehicleModels = { [make: string]: { [model: string]: string[] } };

type DbContent = {
    policies: any[];
    vehicleMakes: string[];
    tireBrands: string[];
    commonTireSizes: string[];
    vehicleModels: VehicleModels;
}

export type DataForForm = Omit<DbContent, 'policies'>;

async function readDb(): Promise<DbContent> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(data);
    return db;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If the file doesn't exist, return a default structure
      return { policies: [], vehicleMakes: [], tireBrands: [], commonTireSizes: [], vehicleModels: {} };
    }
    throw error;
  }
}

async function writeDb(db: DbContent): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf-8');
}


export async function getDataForForm(): Promise<DataForForm> {
    const db = await readDb();
    return {
        vehicleMakes: db.vehicleMakes || [],
        tireBrands: db.tireBrands || [],
        commonTireSizes: db.commonTireSizes || [],
        vehicleModels: db.vehicleModels || {},
    }
}

export async function addDropdownOption(list: keyof Omit<DataForForm, 'vehicleModels'>, value: string): Promise<void> {
    const db = await readDb();
    if (db[list] && !db[list].includes(value)) {
        (db[list] as string[]).push(value);
        (db[list] as string[]).sort();
        await writeDb(db);
    }
}

export async function addVehicleModel(make: string, model: string): Promise<void> {
    const db = await readDb();
    if (!db.vehicleModels[make]) {
        db.vehicleModels[make] = {};
    }
    if (!db.vehicleModels[make][model]) {
        db.vehicleModels[make][model] = [];
        await writeDb(db);
    }
}

export async function addVehicleSubmodel(make: string, model: string, submodel: string): Promise<void> {
    const db = await readDb();
    if (db.vehicleModels[make] && db.vehicleModels[make][model]) {
        if (!db.vehicleModels[make][model].includes(submodel)) {
            db.vehicleModels[make][model].push(submodel);
            db.vehicleModels[make][model].sort();
            await writeDb(db);
        }
    }
}
