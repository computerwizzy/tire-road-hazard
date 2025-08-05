
"use server";

import { z } from "zod";
import { generatePolicyDocument, type GeneratePolicyDocumentInput } from "@/ai/flows/generate-policy-document";
import { searchPolicies, type SearchPoliciesOutput, type Policy } from "@/ai/flows/search-policies";
import { sendPolicyEmail, type SendPolicyEmailInput } from "@/ai/flows/send-policy-email";
import { savePolicy, addUser, deleteUser, getUsers, getAllPoliciesFromDb, getDashboardStatsFromDb } from "@/data/db-actions";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";


const WarrantyClaimSchema = z.object({
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

export async function handleWarrantyClaim(values: z.infer<typeof WarrantyClaimSchema>, receiptData: { buffer: string, contentType: string, fileName: string } | null) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

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

    const fullAddress = `${values.customerStreet}, ${values.customerCity}, ${values.customerState} ${values.customerZip}`;
    const allDots = [values.tireDot1, values.tireDot2, values.tireDot3, values.tireDot4, values.tireDot5, values.tireDot6].filter(Boolean).join(', ');


    const input: GeneratePolicyDocumentInput = {
      policyNumber,
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      customerEmail: values.customerEmail,
      customerAddress: fullAddress,
      vehicleYear: values.vehicleYear,
      vehicleMake: values.vehicleMake,
      vehicleModel: values.vehicleModel,
      vehicleSubmodel: values.vehicleSubmodel,
      vehicleMileage: values.vehicleMileage,
      isCommercial: values.isCommercial,
      tireBrand: values.tireBrand,
      tireModel: values.tireModel,
      tireSize: values.tireSize,
      tireDot: allDots,
      dealerName: values.dealerName,
      purchaseDate: values.purchaseDate.toISOString().split('T')[0],
      roadHazardPrice: values.roadHazardPrice,
      warrantyStartDate: warrantyStartDate.toISOString().split('T')[0],
      warrantyEndDate: warrantyEndDate.toISOString().split('T[0]'),
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
        tireDot: values.tireDot1,
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
export type { User } from "@/data/db-actions";
