
'use server';

/**
 * @fileOverview Defines the types for warranty policies.
 *
 * - Policy - The type definition for a policy object.
 * - Claim - The type definition for a claim object.
 */

import { z } from 'zod';

const ClaimSchema = z.object({
    id: z.bigint(),
    created_at: z.string(),
    policy_number: z.string(),
    incident_description: z.string(),
    photo_urls: z.array(z.string()).nullable(),
    status: z.string(),
});
export type Claim = z.infer<typeof ClaimSchema>;


const PolicySchema = z.object({
    policyNumber: z.string(),
    customerName: z.string(),
    customerEmail: z.string(),
    customerPhone: z.string().optional(),
    tireDot: z.string(),
    purchaseDate: z.string(),
    warrantyEndDate: z.string(),
    receiptUrl: z.string().url().nullable(),
    policyDocument: z.string().nullable(),
    // Add all the other fields to be displayed
    vehicleYear: z.number().optional(),
    vehicleMake: z.string().optional(),
    vehicleModel: z.string().optional(),
    vehicleSubmodel: z.string().optional(),
    vehicleMileage: z.number().optional(),
    isCommercial: z.boolean().optional(),
    tireBrand: z.string().optional(),
    tireModel: z.string().optional(),
    tireSize: z.string().optional(),
    dealerName: z.string().optional(),
    invoiceNumber: z.string().optional(),
    roadHazardPrice: z.number().optional(),
    pricePerTire: z.number().optional(),
    tireQuantity: z.number().optional(),
    policyDuration: z.number().optional(),
    tireDot1: z.string().optional(),
    tireDot2: z.string().optional(),
    tireDot3: z.string().optional(),
    tireDot4: z.string().optional(),
    tireDot5: z.string().optional(),
    tireDot6: z.string().optional(),
    claims: z.array(ClaimSchema).optional(),
});
export type Policy = z.infer<typeof PolicySchema>;

    
