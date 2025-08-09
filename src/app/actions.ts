
"use server";

import { z } from "zod";
import { savePolicy, addUser, deleteUser, getUsers, getAllPoliciesFromDb, getDashboardStatsFromDb, getFullPolicyFromDb } from "@/data/db-actions";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Policy } from "@/ai/flows/search-policies";
import { policyTemplate } from "@/data/policy-template";


const WarrantyClaimSchema = z.object({
  invoiceNumber: z.string().min(1, { message: "Invoice number is required." }),
  customerName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  customerEmail: z.string().email({ message: "Invalid email address." }),
  customerPhone: z.string().min(10, { message: "Phone number is required." }),
  customerStreet: z.string().min(5, { message: "Street address is required." }),
  customerCity: z.string().min(2, { message: "City is required." }),
  customerState: z.string().min(2, { message: "State is required." }),
  customerZip: z.string().min(5, { message: "Valid ZIP code is required." }),
  vehicleYear: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  vehicleMake: z.string().min(2, { message: "Vehicle make is required." }),
  vehicleModel: z.string().min(1, { message: "Vehicle model is required." }),
  vehicleSubmodel: z.string().optional(),
  vehicleMileage: z.coerce.number().min(0, { message: "Mileage must be a positive number."}),
  isCommercial: z.boolean().default(false),
  tireBrand: z.string().min(2, { message: "Tire brand is required." }),
  tireModel: z.string().min(1, { message: "Tire model is required." }),
  tireSize: z.string().min(5, { message: "Tire size is required." }),
  tireQuantity: z.coerce.number().min(1).max(6),
  pricePerTire: z.coerce.number().min(0),
  roadHazardPrice: z.coerce.number().min(0, { message: "Price must be a positive number."}).optional(),
  tireDot1: z.string().min(7).max(13),
  tireDot2: z.string().optional(),
  tireDot3: z.string().optional(),
  tireDot4: z.string().optional(),
  tireDot5: z.string().optional(),
  tireDot6: z.string().optional(),
  purchaseDate: z.date(),
  dealerName: z.string().min(2, { message: "Dealer name is required." }),
  policyDuration: z.coerce.number().min(1).max(3),
});

// This new schema defines the full data needed for regeneration.
const FullPolicyDataSchema = WarrantyClaimSchema.extend({
    policyNumber: z.string(),
    warrantyEndDate: z.string(),
    receiptUrl: z.string().nullable(),
});

type FullPolicyData = z.infer<typeof FullPolicyDataSchema>;


export async function generatePolicyDocument(values: FullPolicyData): Promise<{ policyDocument: string }> {
  const template = policyTemplate;
  
  const allTireDots = [
      values.tireDot1,
      values.tireDot2,
      values.tireDot3,
      values.tireDot4,
      values.tireDot5,
      values.tireDot6
  ].filter((dot): dot is string => !!dot && dot.trim().length > 0);

  const purchaseDate = values.purchaseDate instanceof Date ? values.purchaseDate : new Date(values.purchaseDate);

  const policyData = {
      ...values,
      purchaseDate: purchaseDate.toISOString().split('T')[0],
      fullVehicle: `${values.vehicleYear} ${values.vehicleMake} ${values.vehicleModel} ${values.vehicleSubmodel || ''}`.trim(),
      customerFullAddress: `${values.customerStreet}<br>${values.customerCity}, ${values.customerState} ${values.customerZip}`
  };

  const planId = `TMX${Math.floor(1000000 + Math.random() * 9000000)}`;

  const headerDetails = `
**Policy #:** ${policyData.policyNumber}
**Invoice:** ${policyData.invoiceNumber}
**Plan ID:** ${planId}
**Date:** ${policyData.purchaseDate}

**Name:** ${policyData.customerName}
**Phone:** ${policyData.customerPhone}
**Address:** ${policyData.customerFullAddress}

**Vehicle:** ${policyData.fullVehicle}
**Mileage:** ${policyData.vehicleMileage?.toLocaleString() || 'N/A'}

**Tires Purchased:** ${policyData.tireQuantity}
**Brand & Model:** ${policyData.tireBrand} ${policyData.tireModel}
**Size:** ${policyData.tireSize}
**Price per tire:** $${policyData.pricePerTire?.toFixed(2) || 'N/A'}
`;
  
  let coveredTiresTable = `\n### Covered Tires\n\n| Brand & Model | Size | DOT Number |\n| :--- | :--- | :--- |\n`;
  allTireDots.forEach((dot: string) => {
      if (dot && dot.trim()) {
          coveredTiresTable += `| ${policyData.tireBrand} ${policyData.tireModel} | ${policyData.tireSize} | ${dot.trim()} |\n`;
      }
  });

  const policyHeader = headerDetails + (allTireDots.length > 0 ? coveredTiresTable : '');
  let compiled = template.replace('{{policyHeader}}', policyHeader);

  const commercialText = policyData.isCommercial 
      ? "**This vehicle has been registered as a commercial vehicle and is therefore excluded from coverage under this plan.**"
      : "";
  compiled = compiled.replace('{{commercialExclusion}}', commercialText);

  return { policyDocument: compiled };
}


export async function handleWarrantyClaim(values: z.infer<typeof WarrantyClaimSchema>, receiptData: { buffer: string, contentType: string, fileName: string } | null) {
  try {
    const supabase = createClient();

    const policyNumber = `TS-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const warrantyStartDate = new Date(values.purchaseDate);
    const warrantyEndDate = new Date(warrantyStartDate);
    warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + values.policyDuration);

    let receiptUrl = null;

    if (receiptData) {
        const filePath = `${policyNumber}-${receiptData.fileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('receipts')
            .upload(filePath, Buffer.from(receiptData.buffer, 'base64'), {
                contentType: receiptData.contentType,
                upsert: true,
            });

        if (uploadError) {
            console.error("Error uploading receipt to Supabase:", uploadError);
            throw new Error("Failed to upload receipt.");
        }

        const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(uploadData.path);
        receiptUrl = urlData.publicUrl;
    }

    const fullPolicyData: FullPolicyData = {
        ...values,
        policyNumber,
        warrantyEndDate: warrantyEndDate.toISOString().split('T')[0],
        receiptUrl: receiptUrl,
    };

    const result = await generatePolicyDocument(fullPolicyData);
    if (!result?.policyDocument) {
      throw new Error("Failed to generate the policy document from the template.");
    }
    
    await savePolicy({
        ...fullPolicyData,
        policyDocument: result.policyDocument,
    });


    return { success: true, data: {...result, customerName: values.customerName, customerEmail: values.customerEmail, policyNumber, formData: values} };

  } catch (error) {
    console.error("Error generating policy document:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during policy generation.";
    return { success: false, error: `Failed to generate policy document. Reason: ${errorMessage}` };
  }
}

export async function handleSearch(searchTerm: string): Promise<{
  success: boolean;
  data?: { results: Policy[] };
  error?: string;
}> {
  try {
    if (typeof searchTerm !== 'string' || !searchTerm.trim()) {
        return { success: false, error: "Invalid search term provided." };
    }

    const supabase = createClient();

    // Select all columns to get the full policy details
    const selectColumns = '*';

    const { data, error } = await supabase
        .from('policies')
        .select(`${selectColumns}, claims(*)`)
        .or(`policyNumber.ilike.%${searchTerm}%,customerName.ilike.%${searchTerm}%,tireDot1.ilike.%${searchTerm}%,customerPhone.ilike.%${searchTerm}%`);

    if (error) {
        console.error('Error searching policies in Supabase:', error);
        if (error.code === '42501') {
            throw new Error("Permission denied. Please check your Row Level Security (RLS) policies on the 'policies' table in your Supabase dashboard.");
        }
        if (error.code === '42P01') {
             throw new Error("The 'policies' table does not exist. Please create it in your Supabase dashboard.");
        }
        throw new Error('Failed to search policies. Please check the database connection and permissions.');
    }
    
    const results = data ? data.map(item => ({
        ...item,
        tireDot: item.tireDot1 || '', 
    })) : [];


    return { success: true, data: { results: results as Policy[] } };
  } catch (error) {
    console.error("Error in handleSearch:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: message };
  }
}

export async function getAllPolicies(page: number = 1, limit: number = 10, status: 'all' | 'active' | 'expired' | null = 'all'): Promise<{
  success: boolean;
  data?: Policy[];
  count?: number;
  error?: string;
}> {
    return getAllPoliciesFromDb(page, limit, status);
}


// Auth Actions
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required." }),
});

export async function handleLogin(values: z.infer<typeof LoginSchema>) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  
  revalidatePath('/admin');
  redirect('/admin');
}


export async function handleLogout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export type DashboardStats = {
    totalPolicies: number;
    activePolicies: number;
    expiredPolicies: number;
    totalCustomers: number;
    totalClaims: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
    return getDashboardStatsFromDb();
}

export async function handleGetPolicyByNumber(policyNumber: string): Promise<{
    success: boolean;
    data?: { policyDocument: string };
    error?: string;
}> {
    try {
        const fullPolicyData = await getFullPolicyFromDb(policyNumber);
        if (!fullPolicyData) {
            return { success: false, error: 'Policy not found.' };
        }
        const result = await generatePolicyDocument(fullPolicyData);
        return { success: true, data: result };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: message };
    }
}


export { addUser, deleteUser, getUsers };
    

    