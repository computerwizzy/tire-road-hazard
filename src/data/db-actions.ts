
'use server';

import fs from 'fs/promises';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'src/data/db.json');

type DbContent = {
    policies: any[];
    vehicleMakes: string[];
    tireBrands: string[];
    commonTireSizes: string[];
}

export type DropdownOptions = Omit<DbContent, 'policies'>;

async function readDb(): Promise<DbContent> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(data);
    return db;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If the file doesn't exist, return a default structure
      return { policies: [], vehicleMakes: [], tireBrands: [], commonTireSizes: [] };
    }
    throw error;
  }
}

async function writeDb(db: DbContent): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf-8');
}


export async function getDropdownOptions(): Promise<DropdownOptions> {
    const db = await readDb();
    return {
        vehicleMakes: db.vehicleMakes || [],
        tireBrands: db.tireBrands || [],
        commonTireSizes: db.commonTireSizes || [],
    }
}

export async function addDropdownOption(list: keyof DropdownOptions, value: string): Promise<void> {
    const db = await readDb();
    if (db[list] && !db[list].includes(value)) {
        db[list].push(value);
        db[list].sort();
        await writeDb(db);
    }
}
