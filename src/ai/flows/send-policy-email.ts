'use server';

/**
 * @fileOverview A flow for sending a warranty policy email to a customer.
 *
 * - sendPolicyEmail - A function that generates and "sends" a policy email.
 * - SendPolicyEmailInput - The input type for the sendPolicyEmail function.
 * - SendPolicyEmailOutput - The return type for the sendPolicyEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SendPolicyEmailInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  customerEmail: z.string().describe('The email address of the customer.'),
  policyDocument: z.string().describe('The full text of the warranty policy document.'),
});
export type SendPolicyEmailInput = z.infer<typeof SendPolicyEmailInputSchema>;

const SendPolicyEmailOutputSchema = z.object({
  success: z.boolean().describe("Whether the email was sent successfully."),
  emailContent: z.string().describe("The generated content of the email body."),
});
export type SendPolicyEmailOutput = z.infer<typeof SendPolicyEmailOutputSchema>;


export async function sendPolicyEmail(input: SendPolicyEmailInput): Promise<SendPolicyEmailOutput> {
  return sendPolicyEmailFlow(input);
}

const emailPrompt = ai.definePrompt({
    name: 'sendPolicyEmailPrompt',
    input: {schema: SendPolicyEmailInputSchema},
    prompt: `You are an assistant for a tire warranty company. Your task is to compose a friendly and professional email to a customer, sending them their new warranty policy.

    The customer's name is {{customerName}}.
    Their email address is {{customerEmail}}.

    The email should have a clear subject line, a friendly greeting, a body that explains that their warranty policy is attached (in the body of this email), and a professional closing.

    Here is the policy document to include:
    ---
    {{policyDocument}}
    ---
    `,
});

const sendPolicyEmailFlow = ai.defineFlow(
  {
    name: 'sendPolicyEmailFlow',
    inputSchema: SendPolicyEmailInputSchema,
    outputSchema: SendPolicyEmailOutputSchema,
  },
  async (input) => {
    const llmResponse = await emailPrompt(input);
    const emailContent = llmResponse.text;

    // In a real application, you would integrate with an email sending service like SendGrid or Resend.
    // For this example, we'll simulate the email sending and assume it's successful.
    console.log(`Simulating sending email to ${input.customerEmail}`);
    console.log(`Email content:\n${emailContent}`);

    return {
        success: true,
        emailContent,
    };
  }
);
