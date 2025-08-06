'use server';

/**
 * @fileOverview A flow for sending a warranty policy email to a customer.
 *
 * - sendPolicyEmail - A function that generates and sends a policy email using Resend.
 * - SendPolicyEmailInput - The input type for the sendPolicyEmail function.
 * - SendPolicyEmailOutput - The return type for the sendPolicyEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { Resend } from 'resend';
import React from 'react';
import ReactMarkdown from 'react-markdown';

const SendPolicyEmailInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  customerEmail: z.string().describe('The email address of the customer.'),
  policyDocument: z.string().describe('The full text of the warranty policy document in Markdown format.'),
});
export type SendPolicyEmailInput = z.infer<typeof SendPolicyEmailInputSchema>;

const SendPolicyEmailOutputSchema = z.object({
  success: z.boolean().describe("Whether the email was sent successfully."),
  emailContent: z.string().describe("The generated content of the email body (for logging)."),
});
export type SendPolicyEmailOutput = z.infer<typeof SendPolicyEmailOutputSchema>;


export async function sendPolicyEmail(input: SendPolicyEmailInput): Promise<SendPolicyEmailOutput> {
  return sendPolicyEmailFlow(input);
}

const emailPrompt = ai.definePrompt({
    name: 'sendPolicyEmailPrompt',
    input: {schema: SendPolicyEmailInputSchema},
    // We ask the LLM just for the subject and body, not the full email.
    output: { schema: z.object({
        subject: z.string().describe("The subject line for the email."),
        body: z.string().describe("The body of the email in Markdown format. This should be a friendly message informing the user that their policy document is included below."),
    })},
    prompt: `You are an assistant for a tire warranty company. Your task is to compose a friendly and professional email to a customer, informing them that their new warranty policy document is ready.

    The customer's name is {{customerName}}.

    Generate a suitable subject line and a brief, friendly body for the email. The full policy document will be appended after your generated text.
    `,
});

const sendPolicyEmailFlow = ai.defineFlow(
  {
    name: 'sendPolicyEmailFlow',
    inputSchema: SendPolicyEmailInputSchema,
    outputSchema: SendPolicyEmailOutputSchema,
  },
  async (input) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // 1. Generate the email subject and introductory body text.
    const llmResponse = await emailPrompt(input);
    const { subject, body } = llmResponse.output!;

    // 2. Combine the generated body with the full policy document.
    const fullEmailMarkdown = `${body}\n\n---\n\n${input.policyDocument}`;

    try {
      // 3. Send the email using Resend.
      await resend.emails.send({
        from: 'TireSafe Warranty <onboarding@resend.dev>', // Replace with your desired "from" address
        to: [input.customerEmail],
        subject: subject,
        // Using Markdown directly in the html field. Resend handles conversion.
        // For more complex templates, you'd use a React component.
        html: `<div style="font-family: sans-serif; line-height: 1.6;">${new ReactMarkdown({children: fullEmailMarkdown}).props.children}</div>`, 
      });

      return {
          success: true,
          emailContent: fullEmailMarkdown, // Return the full content for logging/debugging
      };

    } catch (error) {
      console.error("Error sending email with Resend:", error);
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);