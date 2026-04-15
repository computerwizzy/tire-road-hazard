
'use server';

import { z } from 'zod';
import { Resend } from 'resend';

const SendPolicyEmailInputSchema = z.object({
  customerName: z.string(),
  customerEmail: z.string(),
  policyUrl: z.string().url(),
  policyDocument: z.string(),
});
export type SendPolicyEmailInput = z.infer<typeof SendPolicyEmailInputSchema>;

const SendPolicyEmailOutputSchema = z.object({
  success: z.boolean(),
});
export type SendPolicyEmailOutput = z.infer<typeof SendPolicyEmailOutputSchema>;

export async function sendPolicyEmail(input: SendPolicyEmailInput): Promise<SendPolicyEmailOutput> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const subject = `Your TireSafe Warranty Policy is Ready`;
  const html = `
    <div style="font-family: sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${input.customerName},</h2>
      <p>Your TireSafe road hazard warranty policy document is ready.</p>
      <p>
        <a href="${input.policyUrl}" style="background: #1d4ed8; color: #fff; padding: 10px 20px; border-radius: 4px; text-decoration: none;">
          View Your Policy
        </a>
      </p>
      <p>You can also view, download, or print your policy by visiting the link below:</p>
      <p><a href="${input.policyUrl}">${input.policyUrl}</a></p>
      <p>Please keep this for your records.</p>
      <p>Thank you for choosing TireSafe Warranty.</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'TireSafe Warranty <onboarding@resend.dev>',
      to: [input.customerEmail],
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending email with Resend:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
