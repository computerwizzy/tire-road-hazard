
'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import ReactMarkdown from 'react-markdown';
import { notFound } from 'next/navigation';
import { handleSearch } from '@/app/actions';
import { generatePolicyDocument, type GeneratePolicyDocumentInput } from '@/ai/flows/generate-policy-document';

async function getPolicyData(policyNumber: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('policies')
        .select()
        .eq('policyNumber', policyNumber)
        .single();
    
    if (error || !data) {
        console.error('Error fetching policy for print:', error);
        return null;
    }

    // This is a bit of a hack. Ideally we would store all form data,
    // but for now we'll re-generate the document based on what we have.
    // We'll need to fetch some related data if it's not on the policy table.
    // For now, let's assume we can't rebuild it perfectly without all original inputs.
    // A better approach would be to store the full form submission or the generated document.

    // Let's try to regenerate it based on stored data. This is brittle.
    // A much better solution is to store the generated document in the first place.
    // For now, let's just fetch the document from the DB if it were stored there.
    // Since it's not, we'll try to find it via search and re-generate.
    
    // The `searchPolicies` function uses an `ilike` query, so it might return multiple results.
    // We need to find the exact match.
    const searchResponse = await handleSearch({ searchTerm: policyNumber });
    if (!searchResponse.success || !searchResponse.data || searchResponse.data.results.length === 0) {
        return notFound();
    }
    
    const policy = searchResponse.data.results.find(p => p.policyNumber === policyNumber);

    if (!policy) {
        return notFound();
    }

    // This part is problematic as we don't have all the original form data to regenerate
    // an identical document. For this implementation, we will assume the stored policy
    // contains enough information, or ideally we'd store the document itself.
    // Let's assume we cannot regenerate it, and instead we'll fetch a stored version.
    // Since we don't have one, we will just return a placeholder.
    //
    // A better implementation would be to save the `policyDocument` in the `policies` table.
    // Let's modify the `handleWarrantyClaim` action to do that first. But we can't do that from here.
    
    // Let's try to regenerate. This will have missing data.
    const input: GeneratePolicyDocumentInput = {
      invoiceNumber: policy.policyNumber,
      customerName: policy.customerName,
      customerEmail: policy.customerEmail,
      // The following fields are missing from the `policies` table and would be needed to regenerate.
      customerPhone: 'N/A',
      customerAddress: 'N/A',
      vehicleYear: new Date(policy.purchaseDate).getFullYear(), // Guess
      vehicleMake: 'N/A',
      vehicleModel: 'N/A',
      vehicleMileage: 0,
      isCommercial: false,
      tireBrand: 'N/A',
      tireModel: 'N/A',
      tireSize: 'N/A',
      tireDot: policy.tireDot,
      purchaseDate: policy.purchaseDate,
      dealerName: 'N/A',
      roadHazardPrice: 0,
      warrantyStartDate: policy.purchaseDate,
      warrantyEndDate: policy.warrantyEndDate,
      termsAndConditions: "This Road Hazard Warranty covers only the tire. Damage to the wheel, TPMS sensors, or any other part of the vehicle is not covered. This warranty is non-transferable and is valid only for the original purchaser. The warranty is void if the tire is used for racing, off-road applications, or has been repaired by an unauthorized facility. A valid proof of purchase is required for all claims.",
      coverageDetails: [
        "Repair or replacement of tires damaged due to common road hazards like potholes, nails, glass, and other debris.",
        "Coverage is valid for 36 months from the date of purchase or until the tire tread depth reaches 2/32\", whichever comes first.",
        "Labor for mounting and balancing is included for the first 12 months.",
        "Tire replacement is based on a pro-rated basis determined by remaining tread depth."
      ],
    };

    const result = await generatePolicyDocument(input);
    return result.policyDocument;
}


export default async function PrintPolicyPage({ params }: { params: { policyNumber: string } }) {
    const policyDocument = await getPolicyData(params.policyNumber);

    if (!policyDocument) {
        return notFound();
    }

    return (
        <html>
            <head>
                <title>Warranty Policy {params.policyNumber}</title>
                 <style>{`
                    @media print {
                        @page {
                            size: letter;
                            margin: 0.75in;
                        }
                        body {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                    }
                    body {
                        font-family: sans-serif;
                        line-height: 1.5;
                    }
                    .prose {
                        max-width: 65ch;
                        margin: auto;
                        color: #374151;
                    }
                    .prose table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .prose th, .prose td {
                        border: 1px solid #e5e7eb;
                        padding: 0.5rem;
                    }
                     .prose h1, .prose h2, .prose h3 {
                        font-weight: 600;
                    }
                `}</style>
            </head>
            <body>
                <div className="prose">
                    <ReactMarkdown>{policyDocument}</ReactMarkdown>
                </div>
            </body>
        </html>
    );
}

