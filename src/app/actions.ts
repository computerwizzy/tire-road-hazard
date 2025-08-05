
"use server";

import { z } from "zod";
import { generatePolicyDocument, type GeneratePolicyDocumentInput } from "@/ai/flows/generate-policy-document";
import { searchPolicies, type SearchPoliciesOutput, type Policy } from "@/ai/flows/search-policies";
import { sendPolicyEmail, type SendPolicyEmailInput } from "@/ai/flows/send-policy-email";
import { getInitialFormData, type DataForForm, savePolicy, addUser, deleteUser, getUsers, getModelsForMake, getSubmodelsForModel } from "@/data/db-actions";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";


const WarrantyClaimSchema = z.object({
  customerName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  customerEmail: z.string().email({ message: "Invalid email address." }),
  customerPhone: z.string().min(10, { message: "Phone number is required." }),
  customerAddress: z.string().min(10, { message: "A complete address is required."}),
  vehicleYear: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  vehicleMake: z.string().min(2, { message: "Vehicle make is required." }),
  vehicleModel: z.string().min(1, { message: "Vehicle model is required." }),
  vehicleSubmodel: z.string().optional(),
  vehicleMileage: z.coerce.number().min(0, { message: "Mileage must be a positive number."}),
  tireBrand: z.string().min(2, { message: "Tire brand is required." }),
  tireModel: z.string().min(1, { message: "Tire model is required." }),
  tireSize: z.string().min(5, { message: "Tire size is required." }),
  tireDot: z.string().min(7).max(13),
  purchaseDate: z.date(),
  dealerName: z.string().min(2, { message: "Dealer name is required." }),
});

export async function handleWarrantyClaim(values: z.infer<typeof WarrantyClaimSchema>, receiptData: { buffer: string, contentType: string, fileName: string } | null) {
  try {
    const policyNumber = `WP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
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


    const input: GeneratePolicyDocumentInput = {
      ...values,
      policyNumber,
      purchaseDate: values.purchaseDate.toISOString().split('T')[0],
      warrantyStartDate: warrantyStartDate.toISOString().split('T')[0],
      warrantyEndDate: warrantyEndDate.toISOString().split('T')[0],
      termsAndConditions: "This Road Hazard Warranty covers only the tire. Damage to the wheel, TPMS sensors, or any other part of the vehicle is not covered. This warranty is non-transferable and is valid only for the original purchaser. The warranty is void if the tire is used for racing, off-road applications, or has been repaired by an unauthorized facility. A valid proof of purchase is required for all claims.",
      coverageDetails: [
        "Repair or replacement of tires damaged due to common road hazards like potholes, nails, glass, and other debris.",
        "Coverage is valid for 36 months from the date of purchase or until the tire tread depth reaches 2/32\", whichever comes first.",
        "Labor for mounting and balancing is included for the first 12 months.",
        "Tire replacement is based on a pro-rated basis determined by remaining tread depth."
      ],
    };

    const result = await generatePolicyDocument(input);

    await savePolicy({
        policyNumber,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        tireDot: values.tireDot,
        purchaseDate: values.purchaseDate.toISOString().split('T')[0],
        warrantyEndDate: warrantyEndDate.toISOString().split('T')[0],
        receiptUrl: receiptUrl
    });


    return { success: true, data: {...result, customerName: values.customerName, customerEmail: values.customerEmail, policyNumber, formData: values} };

  } catch (error) {
    console.error("Error generating policy document:", error);
    return { success: false, error: "Failed to generate policy document. Please try again." };
  }
}

const SearchSchema = z.object({
  searchTerm: z.string().min(1, { message: "Please enter a search term." }),
});


export async function handleSearch(values: z.infer<typeof SearchSchema>): Promise<{
  success: boolean;
  data?: SearchPoliciesOutput;
  error?: string;
}> {
  try {
    const result = await searchPolicies({ query: values.searchTerm });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error searching policies:", error);
    return { success: false, error: "Failed to search policies. Please try again." };
  }
}

const EmailSchema = z.object({
  customerName: z.string(),
  customerEmail: z.string().email(),
  policyDocument: z.string(),
});

export async function handleSendEmail(values: z.infer<typeof EmailSchema>): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const input: SendPolicyEmailInput = {
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      policyDocument: values.policyDocument,
    };
    const result = await sendPolicyEmail(input);
    return { success: result.success };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email. Please try again." };
  }
}


export { getInitialFormData, getModelsForMake, getSubmodelsForModel };

export async function getAllPolicies(page: number = 1, limit: number = 10): Promise<{
  success: boolean;
  data?: Policy[];
  count?: number;
  error?: string;
}> {
    try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from('policies')
            .select('*', { count: 'exact' })
            .order('purchaseDate', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Error fetching policies from Supabase:', error);
            if (error.code === '42501') { // RLS error
                 return { success: false, error: "Permission denied. Please check your Row Level Security (RLS) policies on the 'policies' table in your Supabase dashboard." };
            }
            throw error; // Re-throw other errors
        }
        
        return { success: true, data: data || [], count: count || 0 };
    } catch(e) {
        const error = e as Error;
        console.error('A critical error occurred while trying to load policies:', error.message);
        let errorMessage = 'An unexpected error occurred. Please check the server console for more details.';
         if (error.message.includes("relation \"policies\" does not exist")) {
            errorMessage = "The 'policies' table does not exist. Please create it in your Supabase dashboard to continue.";
        }
        return { success: false, error: errorMessage, data: [], count: 0 };
    }
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
    const today = new Date().toISOString();

    const { count: totalPolicies, error: totalError } = await supabase
        .from('policies')
        .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    const { count: activePolicies, error: activeError } = await supabase
        .from('policies')
        .select('*', { count: 'exact', head: true })
        .gt('warrantyEndDate', today);
    
    if (activeError) throw activeError;

    const { count: expiredPolicies, error: expiredError } = await supabase
        .from('policies')
        .select('*', { count: 'exact', head: true })
        .lt('warrantyEndDate', today);

    if (expiredError) throw expiredError;
    
    // Supabase doesn't have a direct distinct count, so we fetch the data and count in code.
    // This is not ideal for very large datasets, but ok for thousands of records.
    // For larger scale, a PostgREST function would be better.
    const { data: customers, error: customerError } = await supabase
        .from('policies')
        .select('customerEmail');

    if (customerError) throw customerError;

    const totalCustomers = new Set(customers.map(c => c.customerEmail)).size;
    
    return {
        totalPolicies: totalPolicies ?? 0,
        activePolicies: activePolicies ?? 0,
        expiredPolicies: expiredPolicies ?? 0,
        totalCustomers: totalCustomers ?? 0,
    }
}


export { addUser, deleteUser, getUsers };
export type { DataForForm, User };
    
