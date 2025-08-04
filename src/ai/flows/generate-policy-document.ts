'use server';

/**
 * @fileOverview Policy document generation flow.
 *
 * - generatePolicyDocument - A function that generates a personalized warranty policy document.
 * - GeneratePolicyDocumentInput - The input type for the generatePolicyDocument function.
 * - GeneratePolicyDocumentOutput - The return type for the generatePolicyDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePolicyDocumentInputSchema = z.object({
  policyNumber: z.string().describe('The policy number for the warranty.'),
  customerName: z.string().describe('The name of the customer.'),
  customerPhone: z.string().describe('The phone number of the customer.'),
  customerEmail: z.string().describe('The email address of the customer.'),
  vehicleYear: z.number().describe('The year the vehicle was manufactured.'),
  vehicleMake: z.string().describe('The make of the vehicle.'),
  vehicleModel: z.string().describe('The model of the vehicle.'),
  tireBrand: z.string().describe('The brand of the tire.'),
  tireModel: z.string().describe('The model of the tire.'),
  tireSize: z.string().describe('The size of the tire.'),
  purchaseDate: z.string().describe('The date the tire was purchased.'),
  dealerName: z.string().describe('The name of the dealer.'),
  warrantyStartDate: z.string().describe('The start date of the warranty.'),
  warrantyEndDate: z.string().describe('The end date of the warranty.'),
  termsAndConditions: z.string().describe('The terms and conditions of the warranty.'),
  coverageDetails: z.array(z.string()).describe('Details of what the warranty covers.'),
});

export type GeneratePolicyDocumentInput = z.infer<typeof GeneratePolicyDocumentInputSchema>;

const GeneratePolicyDocumentOutputSchema = z.object({
  policyDocument: z.string().describe('The generated policy document.'),
});

export type GeneratePolicyDocumentOutput = z.infer<typeof GeneratePolicyDocumentOutputSchema>;

export async function generatePolicyDocument(input: GeneratePolicyDocumentInput): Promise<GeneratePolicyDocumentOutput> {
  return generatePolicyDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePolicyDocumentPrompt',
  input: {schema: GeneratePolicyDocumentInputSchema},
  output: {schema: GeneratePolicyDocumentOutputSchema},
  prompt: `You are an expert at writing warranty policy documents. Using the information provided, generate a well-written and easy-to-understand policy document.

Policy Number: {{policyNumber}}
Customer Name: {{customerName}}
Customer Phone: {{customerPhone}}
Customer Email: {{customerEmail}}
Vehicle Year: {{vehicleYear}}
Vehicle Make: {{vehicleMake}}
Vehicle Model: {{vehicleModel}}
Tire Brand: {{tireBrand}}
Tire Model: {{tireModel}}
Tire Size: {{tireSize}}
Purchase Date: {{purchaseDate}}
Dealer Name: {{dealerName}}
Warranty Start Date: {{warrantyStartDate}}
Warranty End Date: {{warrantyEndDate}}
Terms and Conditions: {{termsAndConditions}}
Coverage Details: {{#each coverageDetails}}- {{{this}}}\n{{/each}}`,
});

const generatePolicyDocumentFlow = ai.defineFlow(
  {
    name: 'generatePolicyDocumentFlow',
    inputSchema: GeneratePolicyDocumentInputSchema,
    outputSchema: GeneratePolicyDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
