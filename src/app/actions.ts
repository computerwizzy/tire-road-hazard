
"use server";

import { z } from "zod";
import fs from 'fs/promises';
import path from 'path';
import { sendPolicyEmail, type SendPolicyEmailInput } from "@/ai/flows/send-policy-email";
import { savePolicy, addUser, deleteUser, getUsers, getAllPoliciesFromDb, getDashboardStatsFromDb, getFullPolicyFromDb } from "@/data/db-actions";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Policy } from "@/ai/flows/search-policies";


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
  roadHazardPrice: z.coerce.number().min(0, { message: "Price must be a positive number."}),
  tireDot1: z.string().min(7).max(13),
  tireDot2: z.string().optional(),
  tireDot3: z.string().optional(),
  tireDot4: z.string().optional(),
  tireDot5: z.string().optional(),
  tireDot6: z.string().optional(),
  purchaseDate: z.date(),
  dealerName: z.string().min(2, { message: "Dealer name is required." }),
});

// This new schema defines the full data needed for regeneration.
const FullPolicyDataSchema = WarrantyClaimSchema.extend({
    policyNumber: z.string(),
    warrantyEndDate: z.string(),
    receiptUrl: z.string().nullable(),
});

type FullPolicyData = z.infer<typeof FullPolicyDataSchema>;


async function generatePolicyDocument(values: FullPolicyData): Promise<{ policyDocument: string }> {
  const templatePath = path.join(process.cwd(), 'src', 'data', 'policy-template.md');
  const template = await fs.readFile(templatePath, 'utf-8');
  
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

  const headerTable = `
| Policy Details | Customer Information | Vehicle Information | Tire Information |
| :--- | :--- | :--- | :--- |
| **Policy #:** ${policyData.policyNumber}<br>**Invoice:** ${policyData.invoiceNumber}<br>**Road Hazard Price:** $${policyData.roadHazardPrice.toFixed(2)}<br>**Plan ID:** TMX1392090<br>**Date:** ${policyData.purchaseDate} | **Name:** ${policyData.customerName}<br>**Phone:** ${policyData.customerPhone}<br>**Address:**<br>${policyData.customerFullAddress} | **Vehicle:** ${policyData.fullVehicle}<br>**Mileage:** ${policyData.vehicleMileage} | **Tires Purchased:** ${policyData.tireQuantity}<br>**Brand & Model:** ${policyData.tireBrand} ${policyData.tireModel}<br>**Size:** ${policyData.tireSize}<br>**DOT Number:** ${allTireDots[0] || ''} |
`;
  
  let coveredTiresTable = `\n### Covered Tires\n\n| Brand & Model | Size | DOT Number |\n| :--- | :--- | :--- |\n`;
  allTireDots.forEach((dot: string) => {
      if (dot && dot.trim()) {
          coveredTiresTable += `| ${policyData.tireBrand} ${policyData.tireModel} | ${policyData.tireSize} | ${dot.trim()} |\n`;
      }
  });

  const policyHeader = headerTable + (allTireDots.length > 0 ? coveredTiresTable : '');
  let compiled = template.replace('{{policyHeader}}', policyHeader);

  const commercialText = policyData.isCommercial 
      ? "**This vehicle has been registered as a commercial vehicle and is therefore excluded from coverage under this plan.**"
      : "";
  compiled = compiled.replace('{{commercialExclusion}}', commercialText);

  return { policyDocument: compiled };
}


export async function handleWarrantyClaim(values: z.infer<typeof WarrantyClaimSchema>, receiptData: { buffer: string, contentType: string, fileName: string } | null) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const policyNumber = `TS-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const warrantyStartDate = new Date(values.purchaseDate);
    const warrantyEndDate = new Date(warrantyStartDate);
    warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + 3);

    let receiptUrl = null;

    if (receiptData) {
        const filePath = `public/${policyNumber}-${receiptData.fileName}`;
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

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('policies')
        .select('*')
        .or(`policyNumber.ilike.%${searchTerm}%,customerName.ilike.%${searchTerm}%,tireDot1.ilike.%${searchTerm}%`);

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
        policyNumber: item.policyNumber,
        customerName: item.customerName,
        customerEmail: item.customerEmail,
        tireDot: item.tireDot1 || '', 
        purchaseDate: item.purchaseDate,
        warrantyEndDate: item.warrantyEndDate,
        receiptUrl: item.receiptUrl,
        policyDocument: item.policyDocument,
        vehicleYear: item.vehicleYear,
        vehicleMake: item.vehicleMake,
        vehicleModel: item.vehicleModel,
        vehicleMileage: item.vehicleMileage,
        dealerName: item.dealerName,
        invoiceNumber: item.invoiceNumber,
        roadHazardPrice: item.roadHazardPrice,
    })) : [];


    return { success: true, data: { results: results as Policy[] } };
  } catch (error) {
    console.error("Error in handleSearch:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: message };
  }
}

const EmailSchema = z.object({
  policyNumber: z.string(),
});

export async function handleSendEmail(values: z.infer<typeof EmailSchema>): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const policyData = await getFullPolicyFromDb(values.policyNumber);
    if (!policyData) {
        return { success: false, error: 'Policy not found.' };
    }

    const docResult = await generatePolicyDocument(policyData);
    if (!docResult.policyDocument) {
        return { success: false, error: 'Failed to regenerate policy document.'};
    }

    const policyUrl = new URL(`/policy/${values.policyNumber}`, process.env.NEXT_PUBLIC_APP_URL).toString();
    const input: SendPolicyEmailInput = {
      customerName: policyData.customerName,
      customerEmail: policyData.customerEmail,
      policyDocument: docResult.policyDocument,
      policyUrl: policyUrl,
    };
    const result = await sendPolicyEmail(input);
    return { success: result.success };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email. Please try again." };
  }
}

const DownloadSchema = z.object({
    policyNumber: z.string(),
});

export async function handleDownloadWord(values: z.infer<typeof DownloadSchema>): Promise<{ success: boolean; data?: string; error?: string; }> {
    try {
        const policyData = await getFullPolicyFromDb(values.policyNumber);
        if (!policyData) {
            return { success: false, error: 'Policy not found.' };
        }
        
        const docResult = await generatePolicyDocument(policyData);
        const { policyDocument } = docResult;

        let htmlContent = policyDocument
            .replace(/# (.*)/g, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\|(.*?)\|/g, '') 
            .replace(/:---/g, '')
            .replace(/\r\n/g, '<br/>')
            .replace(/<br\/><br\/>/g, '<p>');

        const styledHtml = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Warranty Policy</title>
                    <style>
                        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; }
                        h1 { text-align: center; font-size: 16pt; }
                        strong { font-weight: bold; }
                        hr { border: 1px solid #ccc; }
                        p { margin: 1em 0; }
                    </style>
                </head>
                <body>
                    ${htmlContent}
                </body>
            </html>
        `;
        
        const base64 = Buffer.from(styledHtml).toString('base64');
        return { success: true, data: base64 };

    } catch (error) {
        console.error("Error generating Word document:", error);
        return { success: false, error: "Failed to generate document." };
    }
}


export async function getAllPolicies(page: number = 1, limit: number = 10): Promise<{
  success: boolean;
  data?: Policy[];
  count?: number;
  error?: string;
}> {
    return getAllPoliciesFromDb(page, limit);
}


// Auth Actions
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required." }),
});

export async function handleLogin(values: z.infer<typeof LoginSchema>) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

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
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  redirect('/login');
}

export type DashboardStats = {
    totalPolicies: number;
    activePolicies: number;
    expiredPolicies: number;
    totalCustomers: number;
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

    