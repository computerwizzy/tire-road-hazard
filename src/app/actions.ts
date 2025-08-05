
"use server";

import { z } from "zod";
import { generatePolicyDocument, type GeneratePolicyDocumentInput } from "@/ai/flows/generate-policy-document";
import { searchPolicies, type SearchPoliciesOutput, addPolicy } from "@/ai/flows/search-policies";
import { sendPolicyEmail, type SendPolicyEmailInput } from "@/ai/flows/send-policy-email";
import { getDataForForm, addDropdownOption, addVehicleModel, addVehicleSubmodel, type DataForForm } from "@/data/db-actions";


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

export async function handleWarrantyClaim(values: z.infer<typeof WarrantyClaimSchema>) {
  try {
    const policyNumber = `WP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const warrantyStartDate = new Date();
    const warrantyEndDate = new Date();
    warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + 3); // Updated to 3-year warranty to match prompt

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

    // Add the new policy to our mock database
    await addPolicy({
        policyNumber,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        tireDot: values.tireDot,
        purchaseDate: values.purchaseDate.toISOString().split('T')[0],
        warrantyEndDate: warrantyEndDate.toISOString().split('T')[0]
    });


    return { success: true, data: {...result, customerName: values.customerName, customerEmail: values.customerEmail, policyNumber} };

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


export async function fetchFormData(): Promise<DataForForm> {
    return await getDataForForm();
}

const AddOptionSchema = z.object({
    list: z.enum(['vehicleMakes', 'tireBrands', 'commonTireSizes']),
    value: z.string().min(1, {message: "Value cannot be empty."})
});

export async function handleAddOption(values: z.infer<typeof AddOptionSchema>) {
    try {
        await addDropdownOption(values.list, values.value);
        return { success: true };
    } catch(error) {
        console.error("Error adding dropdown option:", error);
        return { success: false, error: "Failed to add new option." };
    }
}

const AddVehicleModelSchema = z.object({
    make: z.string().min(1),
    model: z.string().min(1)
});

export async function handleAddVehicleModel(values: z.infer<typeof AddVehicleModelSchema>) {
    try {
        await addVehicleModel(values.make, values.model);
        return { success: true };
    } catch (error) {
        console.error("Error adding vehicle model:", error);
        return { success: false, error: "Failed to add new model."};
    }
}

const AddVehicleSubmodelSchema = z.object({
    make: z.string().min(1),
    model: z.string().min(1),
    submodel: z.string().min(1),
});

export async function handleAddVehicleSubmodel(values: z.infer<typeof AddVehicleSubmodelSchema>) {
    try {
        await addVehicleSubmodel(values.make, values.model, values.submodel);
        return { success: true };
    } catch (error) {
        console.error("Error adding vehicle submodel:", error);
        return { success: false, error: "Failed to add new submodel."};
    }
}
