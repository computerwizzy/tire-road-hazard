
"use server";

import { z } from "zod";
import fs from 'fs/promises';
import path from 'path';
import { sendPolicyEmail, type SendPolicyEmailInput } from "@/ai/flows/send-policy-email";
import { savePolicy, addUser, deleteUser, getUsers, getAllPoliciesFromDb, getDashboardStatsFromDb } from "@/data/db-actions";
import { createClient as createServerClient } from "@/lib/supabase/server";
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

function compileTemplate(template: string, data: Record<string, any>): string {
    let compiled = template;

    // Handle the simple placeholders
    for (const key in data) {
        if (key !== 'tireDots' && key !== 'isCommercial') {
            const regex = new RegExp(`{{${key}}}`, 'g');
            compiled = compiled.replace(regex, String(data[key]));
        }
    }
    
    // Handle the tireDots loop
    const tireRows = data.tireDots.map((dot: string, index: number) => {
        return `| ${data.tireBrand} ${data.tireModel} | ${data.tireSize} | ${dot} |`;
    }).join('\n');
    compiled = compiled.replace('{{#each tireDots}}', tireRows);

    // Handle isCommercial conditional
    const commercialText = data.isCommercial 
        ? "**This vehicle has been registered as a commercial vehicle and is therefore excluded from coverage under this plan.**" 
        : "";
    compiled = compiled.replace('{{#if isCommercial}}...{{/if}}', commercialText);

    return compiled;
}


async function generatePolicyDocument(values: z.infer<typeof WarrantyClaimSchema>): Promise<{ policyDocument: string }> {
  const templatePath = path.join(process.cwd(), 'src', 'data', 'policy-template.md');
  const template = await fs.readFile(templatePath, 'utf-8');

  const allTireDots = [
      values.tireDot1,
      values.tireDot2,
      values.tireDot3,
      values.tireDot4,
      values.tireDot5,
      values.tireDot6
  ].filter((dot): dot is string => !!dot && dot.length > 0);

  const policyData = {
      ...values,
      tireDots: allTireDots,
      purchaseDate: values.purchaseDate.toISOString().split('T')[0],
      fullVehicle: `${values.vehicleYear} ${values.vehicleMake} ${values.vehicleModel} ${values.vehicleSubmodel || ''}`.trim(),
  };

  const policyDocument = compileTemplate(template, policyData);
  return { policyDocument };
}

export async function handleWarrantyClaim(values: z.infer<typeof WarrantyClaimSchema>, receiptData: { buffer: string, contentType: string, fileName: string } | null) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

    const policyNumber = values.invoiceNumber;
    const warrantyStartDate = new Date();
    const warrantyEndDate = new Date();
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

    const result = await generatePolicyDocument(values);
    if (!result?.policyDocument) {
      throw new Error("Failed to generate the policy document from the template.");
    }

    await savePolicy({
        policyNumber,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        tireDot: values.tireDot1, // Keep the primary DOT for simple display
        purchaseDate: values.purchaseDate.toISOString().split('T')[0],
        warrantyEndDate: warrantyEndDate.toISOString().split('T')[0],
        receiptUrl: receiptUrl,
        policyDocument: result.policyDocument
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
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

    const { data, error } = await supabase
        .from('policies')
        .select('*')
        .or(`policyNumber.ilike.%${searchTerm}%,customerName.ilike.%${searchTerm}%,tireDot.ilike.%${searchTerm}%`);

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
    
    return { success: true, data: { results: data || [] } };
  } catch (error) {
    console.error("Error in handleSearch:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: message };
  }
}

const EmailSchema = z.object({
  customerName: z.string(),
  customerEmail: z.string().email(),
  policyDocument: z.string(),
  policyNumber: z.string(),
});

export async function handleSendEmail(values: z.infer<typeof EmailSchema>): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const policyUrl = new URL(`/policy/${values.policyNumber}`, process.env.NEXT_PUBLIC_APP_URL).toString();
    const input: SendPolicyEmailInput = {
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      policyDocument: values.policyDocument,
      policyUrl: policyUrl,
    };
    const result = await sendPolicyEmail(input);
    return { success: result.success };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email. Please try again." };
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
  const supabase = createServerClient(cookieStore);

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
  const supabase = createServerClient(cookieStore);
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


export { addUser, deleteUser, getUsers };
