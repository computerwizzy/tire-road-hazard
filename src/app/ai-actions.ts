
"use server";

import { z } from "zod";
import { sendPolicyEmail, type SendPolicyEmailInput } from "@/ai/flows/send-policy-email";
import { getFullPolicyFromDb } from "@/data/db-actions";
import { createClient } from "@/lib/supabase/server";
import { generatePolicyDocument } from "./actions";

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

const NewClaimSchema = z.object({
  policyNumber: z.string(),
  incidentDescription: z.string().min(10, { message: "Please provide a detailed description of the incident." }),
});

export async function handleNewClaim(values: z.infer<typeof NewClaimSchema>, photosData: { buffer: string, contentType: string, fileName: string }[]) {
  try {
    const supabase = createClient();

    const photoUrls: string[] = [];
    for (const [index, photoData] of photosData.entries()) {
        if (photoData) {
            const filePath = `claims/${values.policyNumber}-${Date.now()}-${index + 1}-${photoData.fileName}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('receipts')
                .upload(filePath, Buffer.from(photoData.buffer, 'base64'), {
                    contentType: photoData.contentType,
                    upsert: true,
                });

            if (uploadError) {
                console.error("Error uploading claim photo to Supabase:", uploadError);
                 if (uploadError.message.includes("bucket not found")) {
                     throw new Error("Storage bucket 'receipts' not found. Please ensure it exists in your Supabase project.");
                }
                 if (uploadError.message.includes("Auth") || uploadError.message.includes("policy")) {
                     throw new Error("Failed to upload claim photo. The storage bucket has restrictive policies. Please check your Supabase RLS policies for storage.");
                }
                throw new Error("Failed to upload claim photo.");
            }
            const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(uploadData.path);
            if (urlData) {
                photoUrls.push(urlData.publicUrl);
            }
        }
    }
    
    const claimData = {
      policy_number: values.policyNumber,
      incident_description: values.incidentDescription,
      photo_urls: photoUrls,
    };
    
    const { data: claimResult, error: claimError } = await supabase
        .from('claims')
        .insert(claimData)
        .select('id')
        .single();
    
    if (claimError) {
        console.error('Error saving claim to Supabase:', claimError);
        if (claimError.code === '23503') { // foreign key violation
            throw new Error(`The policy number "${values.policyNumber}" does not exist. Please verify the policy number.`);
        }
        if (claimError.code === '42501') {
            throw new Error("Permission denied. Please check your Row Level Security (RLS) policies on the 'claims' table in your Supabase dashboard.");
        }
        throw new Error(`Failed to save claim. DB Error: ${claimError.message}`);
    }

    return { success: true, data: { claimId: `CL-${claimResult.id}` } };

  } catch (error) {
    console.error("Error handling new claim:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during claim submission.";
    return { success: false, error: errorMessage };
  }
}

    