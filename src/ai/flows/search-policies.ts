
'use server';

/**
 * @fileOverview A flow for searching warranty policies.
 *
 * - searchPolicies - A function that searches for policies based on a query.
 * - addPolicy - A function to add a new policy to the database.
 * - SearchPoliciesInput - The input type for the searchPolicies function.
 * - SearchPoliciesOutput - The return type for the searchPolicies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';


// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "tiresafe",
  appId: "1:709228917008:web:2e583a3e30904fc942b595",
  storageBucket: "tiresafe.firebasestorage.app",
  apiKey: "AIzaSyCzuGa-CwhbN2E8RktVaBs1wom9D6FnDkY",
  authDomain: "tiresafe.firebaseapp.com",
  messagingSenderId: "709228917008",
};

// This ensures we initialize the app only once.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);


const SearchPoliciesInputSchema = z.object({
  query: z.string().describe('The search query, which could be a policy number or a tire DOT number.'),
});
export type SearchPoliciesInput = z.infer<typeof SearchPoliciesInputSchema>;

const PolicySchema = z.object({
    policyNumber: z.string(),
    customerName: z.string(),
    customerEmail: z.string(),
    tireDot: z.string(),
    purchaseDate: z.string(),
    warrantyEndDate: z.string(),
});
export type Policy = z.infer<typeof PolicySchema>;


const SearchPoliciesOutputSchema = z.object({
  results: z.array(PolicySchema).describe('A list of matching warranty policies.'),
});
export type SearchPoliciesOutput = z.infer<typeof SearchPoliciesOutputSchema>;


export async function addPolicy(policy: Policy) {
    const policyRef = doc(db, "policies", policy.policyNumber);
    await setDoc(policyRef, policy);
}


export async function searchPolicies(input: SearchPoliciesInput): Promise<SearchPoliciesOutput> {
  return searchPoliciesFlow(input);
}

const findPoliciesTool = ai.defineTool(
    {
      name: 'findPoliciesTool',
      description: 'Finds warranty policies based on a policy number or DOT number.',
      inputSchema: SearchPoliciesInputSchema,
      outputSchema: SearchPoliciesOutputSchema,
    },
    async (input) => {
        const policiesCol = collection(db, "policies");
        const lowerCaseQuery = input.query.toLowerCase();
        
        // Firestore doesn't support case-insensitive `in` or `array-contains` queries directly,
        // and a full-text search solution like Algolia/Elasticsearch is out of scope.
        // A common workaround is to store a lower-case version of the fields for searching.
        // However, for simplicity here, we will fetch all and filter client-side.
        // This is NOT performant for large datasets.
        const policySnapshot = await getDocs(policiesCol);
        const allPolicies: Policy[] = [];
        policySnapshot.forEach(doc => {
            allPolicies.push(PolicySchema.parse(doc.data()));
        });

        const results = allPolicies.filter(p => 
            p.policyNumber.toLowerCase().includes(lowerCaseQuery) || 
            p.tireDot.toLowerCase().includes(lowerCaseQuery)
        );

        return { results };
    }
);


const searchPoliciesFlow = ai.defineFlow(
  {
    name: 'searchPoliciesFlow',
    inputSchema: SearchPoliciesInputSchema,
    outputSchema: SearchPoliciesOutputSchema,
    tools: [findPoliciesTool]
  },
  async (input) => {
    return await findPoliciesTool(input);
  }
);
