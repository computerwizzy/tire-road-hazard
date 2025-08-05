
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
    vehicleMakes: [
        'Acura', 'Alfa Romeo', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 
        'Chrysler', 'Dodge', 'Fiat', 'Ford', 'GMC', 'Genesis', 'Honda', 'Hyundai', 
        'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Lincoln', 
        'Maserati', 'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 
        'Porsche', 'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
    ],
    vehicleModels: {
        'Acura': {
            'ILX': ['Base', 'Premium', 'A-Spec'],
            'TLX': ['Base', 'Technology', 'A-Spec', 'Advance'],
            'RDX': ['Base', 'Technology', 'A-Spec', 'Advance'],
            'MDX': ['Base', 'Technology', 'A-Spec', 'Advance']
        },
        'Audi': {
            'A3': ['Premium', 'Premium Plus', 'Prestige'],
            'A4': ['Premium', 'Premium Plus', 'Prestige'],
            'Q5': ['Premium', 'Premium Plus', 'Prestige'],
            'Q7': ['Premium', 'Premium Plus', 'Prestige']
        },
        'BMW': {
            '3 Series': ['330i', 'M340i'],
            '5 Series': ['530i', '540i', 'M550i'],
            'X3': ['sDrive30i', 'xDrive30i', 'M40i'],
            'X5': ['sDrive40i', 'xDrive40i', 'M50i']
        },
        'Chevrolet': {
            'Malibu': ['L', 'LS', 'RS', 'LT'],
            'Equinox': ['L', 'LS', 'LT', 'Premier'],
            'Silverado 1500': ['WT', 'Custom', 'LT', 'RST', 'LTZ', 'High Country'],
            'Silverado 2500HD': ['WT', 'Custom', 'LT', 'LTZ', 'High Country'],
            'Silverado 3500HD': ['WT', 'LT', 'LTZ', 'High Country'],
            'Tahoe': ['LS', 'LT', 'RST', 'Z71', 'Premier', 'High Country'],
            'Suburban': ['LS', 'LT', 'RST', 'Z71', 'Premier', 'High Country'],
            'Traverse': ['L', 'LS', 'LT', 'RS', 'Premier', 'High Country'],
        },
        'Dodge': {
            'Charger': ['SXT', 'GT', 'R/T', 'Scat Pack', 'SRT Hellcat'],
            'Challenger': ['SXT', 'GT', 'R/T', 'Scat Pack', 'SRT Hellcat'],
            'Durango': ['SXT', 'GT', 'R/T', 'Citadel', 'SRT'],
        },
        'Ford': {
            'Focus': ['S', 'SE', 'SEL', 'Titanium'],
            'Fusion': ['S', 'SE', 'SEL', 'Titanium'],
            'Escape': ['S', 'SE', 'SEL', 'Titanium'],
            'Explorer': ['Base', 'XLT', 'Limited', 'ST', 'Platinum'],
            'F-150': ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited', 'Raptor'],
            'F-250 Super Duty': ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum'],
            'F-350 Super Duty': ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum'],
            'F-450 Super Duty': ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum'],
            'Mustang': ['EcoBoost', 'EcoBoost Premium', 'GT', 'GT Premium', 'Mach 1', 'Shelby GT500'],
            'Bronco': ['Base', 'Big Bend', 'Black Diamond', 'Outer Banks', 'Badlands', 'Wildtrak'],
        },
        'GMC': {
            'Sierra 1500': ['Pro', 'SLE', 'Elevation', 'SLT', 'AT4', 'Denali'],
            'Sierra 2500HD': ['Pro', 'SLE', 'SLT', 'AT4', 'Denali'],
            'Sierra 3500HD': ['Pro', 'SLE', 'SLT', 'AT4', 'Denali'],
            'Yukon': ['SLE', 'SLT', 'AT4', 'Denali'],
            'Yukon XL': ['SLE', 'SLT', 'AT4', 'Denali'],
            'Acadia': ['SLE', 'SLT', 'AT4', 'Denali'],
            'Terrain': ['SL', 'SLE', 'SLT', 'Denali'],
        },
        'Honda': {
            'Civic': ['LX', 'Sport', 'EX', 'Touring', 'Si'],
            'Accord': ['LX', 'Sport', 'EX-L', 'Touring'],
            'CR-V': ['LX', 'EX', 'EX-L', 'Touring'],
            'Pilot': ['LX', 'EX', 'EX-L', 'Touring', 'Elite', 'Black Edition']
        },
        'Hyundai': {
            'Elantra': ['SE', 'SEL', 'N Line', 'Limited'],
            'Sonata': ['SE', 'SEL', 'SEL Plus', 'N Line', 'Limited'],
            'Tucson': ['SE', 'Value', 'SEL', 'Sport', 'Limited', 'Ultimate'],
            'Santa Fe': ['SE', 'SEL', 'Limited', 'Calligraphy']
        },
        'Jeep': {
            'Wrangler': ['Sport', 'Willys', 'Sport S', 'Sahara', 'Rubicon', '4xe', '392'],
            'Grand Cherokee': ['Laredo', 'Altitude', 'Limited', 'Trailhawk', 'Overland', 'Summit', 'SRT'],
            'Cherokee': ['Latitude', 'Latitude Plus', 'Limited', 'Trailhawk'],
            'Gladiator': ['Sport', 'Willys', 'Overland', 'Rubicon', 'Mojave'],
        },
        'Kia': {
            'Forte': ['FE', 'LXS', 'GT-Line', 'EX'],
            'Optima': ['LX', 'S', 'EX', 'SX'],
            'Sorento': ['L', 'LX', 'S', 'EX', 'SX'],
            'Telluride': ['LX', 'S', 'EX', 'SX']
        },
        'Lexus': {
            'IS': ['IS 300', 'IS 350 F Sport'],
            'ES': ['ES 250', 'ES 350', 'ES 300h'],
            'RX': ['RX 350', 'RX 450h', 'RX 350 F Sport'],
            'NX': ['NX 300', 'NX 300h', 'NX 300 F Sport']
        },
        'Mazda': {
            'Mazda3': ['Select', 'Preferred', 'Premium', 'Turbo'],
            'Mazda6': ['Sport', 'Touring', 'Grand Touring', 'Signature'],
            'CX-5': ['Sport', 'Touring', 'Grand Touring', 'Signature'],
            'CX-9': ['Sport', 'Touring', 'Grand Touring', 'Signature']
        },
        'Mercedes-Benz': {
            'C-Class': ['C 300', 'AMG C 43', 'AMG C 63'],
            'E-Class': ['E 350', 'E 450', 'AMG E 53'],
            'GLC': ['GLC 300', 'AMG GLC 43'],
            'GLE': ['GLE 350', 'GLE 450', 'AMG GLE 53']
        },
        'Nissan': {
            'Sentra': ['S', 'SV', 'SR'],
            'Altima': ['S', 'SV', 'SR', 'SL', 'Platinum'],
            'Rogue': ['S', 'SV', 'SL', 'Platinum'],
            'Titan': ['S', 'SV', 'Pro-4X', 'SL', 'Platinum Reserve'],
            'Frontier': ['S', 'SV', 'PRO-X', 'PRO-4X'],
        },
        'Ram': {
            '1500': ['Tradesman', 'Big Horn', 'Laramie', 'Rebel', 'Limited', 'TRX'],
            '2500': ['Tradesman', 'Big Horn', 'Laramie', 'Power Wagon', 'Limited'],
            '3500': ['Tradesman', 'Big Horn', 'Laramie', 'Limited'],
        },
        'Subaru': {
            'Impreza': ['Base', 'Premium', 'Sport', 'Limited'],
            'Outback': ['Base', 'Premium', 'Limited', 'Touring', 'Onyx Edition XT'],
            'Forester': ['Base', 'Premium', 'Sport', 'Limited', 'Touring'],
            'Ascent': ['Base', 'Premium', 'Limited', 'Touring']
        },
        'Tesla': {
            'Model 3': ['Standard Range Plus', 'Long Range', 'Performance'],
            'Model Y': ['Long Range', 'Performance'],
            'Model S': ['Long Range', 'Plaid'],
            'Model X': ['Long Range', 'Plaid']
        },
        'Toyota': {
            'Corolla': ['L', 'LE', 'SE', 'XLE', 'XSE'],
            'Camry': ['LE', 'SE', 'XLE', 'XSE', 'TRD'],
            'RAV4': ['LE', 'XLE', 'XLE Premium', 'Adventure', 'Limited', 'TRD Off-Road'],
            'Highlander': ['L', 'LE', 'XLE', 'Limited', 'Platinum'],
            'Tacoma': ['SR', 'SR5', 'TRD Sport', 'TRD Off-Road', 'Limited', 'TRD Pro'],
            'Tundra': ['SR', 'SR5', 'Limited', 'Platinum', '1794 Edition', 'TRD Pro', 'Capstone']
        },
        'Volkswagen': {
            'Jetta': ['S', 'SE', 'R-Line', 'SEL', 'SEL Premium'],
            'Passat': ['S', 'SE', 'R-Line', 'SEL'],
            'Tiguan': ['S', 'SE', 'SE R-Line Black', 'SEL', 'SEL Premium R-Line'],
            'Atlas': ['S', 'SE', 'SEL', 'SEL Premium']
        }
    },
    tireBrands: [
        'BFGoodrich', 'Bridgestone', 'Continental', 'Cooper', 'Dunlop', 
        'Falken', 'Firestone', 'General', 'Goodyear', 'Hankook', 'Kumho', 
        'Michelin', 'Nitto', 'Pirelli', 'Toyo', 'Yokohama'
    ],
    commonTireSizes: [
        '205/55R16', '215/55R17', '225/45R17', '225/65R17', '235/40R18',
        '235/65R17', '245/45R18', '265/70R17', '275/55R20', '275/65R18'
    ]
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


export async function savePolicy(policy: Omit<Policy, 'id'>): Promise<void> {
    const { error } = await supabase.from('policies').insert(policy);
     if (error) {
         console.error('Error saving policy to Supabase:', error);
         throw new Error('Failed to save policy.');
     }
}

