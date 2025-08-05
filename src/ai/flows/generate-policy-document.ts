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
  customerAddress: z.string().describe('The full address of the customer.'),
  vehicleYear: z.number().describe('The year the vehicle was manufactured.'),
  vehicleMake: z.string().describe('The make of the vehicle.'),
  vehicleModel: z.string().describe('The model of the vehicle.'),
  vehicleSubmodel: z.string().optional().describe('The submodel of the vehicle.'),
  vehicleMileage: z.number().describe('The current mileage of the vehicle.'),
  tireBrand: z.string().describe('The brand of the tire.'),
  tireModel: z.string().describe('The model of the tire.'),
  tireSize: z.string().describe('The size of the tire.'),
  tireDot: z.string().describe('The DOT number of the tire.'),
  purchaseDate: z.string().describe('The date the tire was purchased.'),
  dealerName: z.string().describe('The name of the dealer.'),
  warrantyStartDate: z.string().describe('The start date of the warranty.'),
  warrantyEndDate: z.string().describe('The end date of the warranty.'),
  termsAndConditions: z.string().describe('The terms and conditions of the warranty.'),
  coverageDetails: z.array(z.string()).describe('Details of what the warranty covers.'),
});

export type GeneratePolicyDocumentInput = z.infer<typeof GeneratePolicyDocumentInputSchema>;

const GeneratePolicyDocumentOutputSchema = z.object({
  policyDocument: z.string().describe('The generated policy document in Markdown format.'),
});

export type GeneratePolicyDocumentOutput = z.infer<typeof GeneratePolicyDocumentOutputSchema>;

export async function generatePolicyDocument(input: GeneratePolicyDocumentInput): Promise<GeneratePolicyDocumentOutput> {
  return generatePolicyDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePolicyDocumentPrompt',
  input: {schema: GeneratePolicyDocumentInputSchema},
  output: {schema: GeneratePolicyDocumentOutputSchema},
  prompt: `You are an expert at writing warranty policy documents. Using the information provided, generate a well-written and easy-to-understand policy document in Markdown format. The document should match the structure and content of the provided example.

# NATIONWIDE LIMITED ROAD HAZARD WARRANTY
************************************************************************

| | | | |
| :--- | :--- | :--- | :--- |
| **Invoice:** {{policyNumber}} | **Covered Tires** | **Plan ID:** TMX1392090 | **Road Hazard** S_______ |
| **Issuing Dealer:** | {{tireBrand}} {{tireModel}} | **Date:** {{purchaseDate}} | **Purchase Price** |
| {{dealerName}} | **Comfort Size:** {{tireSize}} | **Name:** {{customerName}} | |
| 3031 Pelham PKWY | | **Phone:** {{customerPhone}} | |
| Pelham, AL 35124 | | **Vehicle:** {{vehicleYear}} {{vehicleMake}} {{vehicleModel}} | |
| (205) 620-3311 | | **Mileage:** {{vehicleMileage}} | |


This Road Hazard Plan ("Plan") is afforded to You with the purchase of Your tires provided by ABS Risk, LLC (also referred to herein as "Obligor", "We", "Us", and "Our"), Administrative Office: 10170 Church Ranch Way, Suite 320, Westminster, CO 80021, (888) 268-4888, and administered by Automotive Business Solutions ("Program Administrator") P.O. Box 33535, Denver, CO 80233. This Plan covers only the eligible tires You purchased and installed on the vehicle identified on the original purchase receipt. This Plan only applies to passenger and light truck tires, which become unserviceable because of a road hazard. A road hazard occurs when a tire fails due to a puncture, bruise or break incurred during the course of normal driving on a maintained road. Nails, glass, and potholes would be the most common examples of road hazard damage.

### WHAT YOU MUST DO TO OBTAIN SERVICE
If possible, you should return to the selling dealer where you originally purchased this Plan, for tire repair or replacement. If you are away from the original selling dealer, you must contact the Program Administrator by calling 866-830-4189 for assistance in locating the nearest participating facility. A prior authorization number must be obtained from the Program Administrator to replace a tire damaged by a road hazard. **YOU MUST PRESENT THE ORIGINAL INVOICE SHOWING THE PURCHASE OF THE TIRE(S).** The damaged tire must be made available for inspection by the repair facility and/or the Program Administrator. All claims and any required documentation must be submitted to the Program Administrator within sixty (60) days of the date of road hazard damage and/or service. This Plan does not have a deductible.

### WHAT IS COVERED BY THE PLAN
This Plan is valid for thirty-six (36) months from the purchase date of Your eligible tire(s), as stated on the original purchase receipt, or until any portion of the tire treadwear is worn 2/32 of an inch or less, whichever occurs first (the "Coverage Period"). **Tire Replacement:** If an eligible tire becomes unserviceable because of a road hazard, and cannot be safely repaired per the manufacturer's guidelines, during the Coverage Period, this Plan will cover the cost of the replacement as follows:
- If the tire failure occurs within the first twelve (12) months following the Plan Purchase Date, an exact make and model replacement tire will be installed. If not available, this Plan will cover the cost, up to one hundred percent (100%) of the retail price paid (as stated on the original sales invoice) for the original tire, of a comparable quality tire.
- If the tire failure occurs after the first twelve (12) months following the Plan Purchase Date, you will be charged for the consumed time (months) on the original tire, times the original selling price of the tire (as stated on the original sales invoice). This plan will cover the remainder of the retail price paid for the original tire (as stated on the original sales invoice) of a comparable quality tire. You will be responsible for any taxes, mounting, balancing, and any other miscellaneous fees. This Plan does not transfer to the replacement tire.

**Tire Repair:** If your tire is damaged due to a road hazard and can be safely repaired, the tire will be repaired per manufacturer's guidelines at any participating facility. The Plan will cover up $20.00 to have the tire repaired. The Plan will remain in effect.

### FLAT TIRE CHANGING ASSISTANCE
For thirty-six (36) months from the Plan Purchase Date, you may receive flat tire changing assistance by calling the service provider of your choice. If you need assistance in locating a service provider in your area, you may call 866-830-4189. You will be reimbursed up to $75 for eligible expenses incurred for flat tire changing assistance. Flat tire changing assistance is strictly limited to the installation of your useable spare tire. If you require a tow or any other service you are solely responsible for those charges. This benefit applies only to motorized passenger vehicles and specifically excludes trailers or those vehicles listed under the exclusions and limitations. The following documentation must be to the Program Administrator within 60 days of service to receive a reimbursement:
1. A photocopy of the original invoice showing the purchase of the Plan and your complete name, address, and telephone number.
2. A photocopy of the paid invoice for spare tire installation from a valid auto service provider. This paid invoice must detail the name, address, and telephone number of the service provider.

Submit the above documentation to: Road Hazard Plan Roadside Assistance, P.O. Box 33535 Denver, CO 80233.

### EXCLUSIONS AND LIMITATIONS
The following vehicles are not eligible for Plan coverage: Vehicles with a manufacturer's load rating capacity of greater than one (1) ton. Vehicles used for farm or agricultural purpose. Any emergency service vehicle, any vehicle used for hire (including Lyft, Uber or similar type of service), towing, construction, postal service, off-road service or commercial purposes. Coverage excludes damage from off-road use, collision, fire, vandalism, theft, snow chains, manufacturer's defects, abuse and neglect (i.e., improper application, improper inflation, overloading, brake lock up, wheel spinning, torque snags, etc.), cosmetic damage, sidewall abrasions or other appearance items that do not affect the safety or performance of the tire. Tires with torn beads. Also excluded are damages or irregular wear caused by misalignment, mechanical failures or interference with vehicle components, tires that have been repaired in a manner other than per manufacturer's guidelines. This Plan covers only the eligible tires installed on the vehicle registered to the customer and listed on the original purchase receipt. **CONSEQUENTIAL AND INCIDENTAL DAMAGES ARE EXCLUDED.** Some states do not allow the exclusion or limitation of consequential and incidental damages; therefore, such limitations or exclusions may not apply to you. No expressed guarantees given other than that stated herein. This Plan gives You specific legal rights; You may have other rights, which vary from state to state.

**THE PROGRAM ADMINISTRATOR RESERVES THE RIGHT TO DENY ANY CLAIM SUBMITTED WITH FALSE OR MISLEADING INFORMATION, OR IF THE DOCUMENTATION DOES NOT CLEARLY IDENTIFY THE ORIGINAL PURCHASER, VEHICLE OR TIRES. ANY PERSON WHO KNOWINGLY AND WITH INTENT TO INJURE, DEFRAUD, OR...**
`,
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
