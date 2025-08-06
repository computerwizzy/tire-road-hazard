
'use server';

/**
 * @fileOverview Defines the types for warranty policies.
 *
 * - Policy - The type definition for a policy object.
 */

import { z } from 'zod';

const PolicySchema = z.object({
    policyNumber: z.string(),
    customerName: z.string(),
    customerEmail: z.string(),
    tireDot: z.string(),
    purchaseDate: z.string(),
    warrantyEndDate: z.string(),
    receiptUrl: z.string().url().nullable(),
    policyDocument: z.string().nullable(),
    // Add all the other fields to be displayed
    vehicleYear: z.number().optional(),
    vehicleMake: z.string().optional(),
    vehicleModel: z.string().optional(),
    vehicleMileage: z.number().optional(),
    dealerName: z.string().optional(),
    invoiceNumber: z.string().optional(),
    roadHazardPrice: z.number().optional(),
});
export type Policy = z.infer<typeof PolicySchema>;
