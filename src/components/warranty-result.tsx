
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Mail, Loader2, FileText } from 'lucide-react';
import { handleSendEmail } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from './ui/button';

// This schema is not strictly needed anymore since the invoice is gone,
// but it doesn't hurt to keep for typing the formData.
const InvoiceFormDataSchema = z.object({
  customerName: z.string(),
  customerPhone: z.string(),
  vehicleYear: z.any(),
  vehicleMake: z.string(),
  vehicleModel: z.string(),
  vehicleSubmodel: z.string().optional(),
  vehicleMileage: z.any(),
  tireBrand: z.string(),
  tireModel: z.string(),
  tireSize: z.string(),
  tireDot1: z.string(),
  purchaseDate: z.date(),
});

export type PolicyData = {
  policyDocument: string;
  customerName: string;
  customerEmail: string;
  policyNumber: string;
  formData: z.infer<typeof InvoiceFormDataSchema> & { [key: string]: any }; // Allow extra fields
};

interface WarrantyResultProps {
  result: PolicyData;
  onReset: () => void;
}

export function WarrantyResult({ result, onReset }: WarrantyResultProps) {
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const { toast } = useToast();

    async function onSendEmail() {
        if (!result) return;
        setIsSendingEmail(true);
        const response = await handleSendEmail({
            customerName: result.customerName,
            customerEmail: result.customerEmail,
            policyDocument: result.policyDocument,
        });
        if (response.success) {
            toast({
                title: "Email Sent",
                description: `The warranty policy has been sent to ${result.customerEmail}.`,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: response.error || "Failed to send email.",
            });
        }
        setIsSendingEmail(false);
    }
  
    return (
        <div className="space-y-8">
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <FileText className="text-primary" />
                        Your Warranty Policy is Ready
                    </CardTitle>
                    <CardDescription>
                        Thank you for registering, {result.customerName}. You can email or print the policy document.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-sm max-w-none bg-muted p-4 rounded-lg printable-area">
                        <ReactMarkdown>{result.policyDocument}</ReactMarkdown>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 print-hidden">
                    <div className="flex gap-4">
                        <Button onClick={onSendEmail} disabled={isSendingEmail}>
                            {isSendingEmail ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Email to Customer
                                </>
                            )}
                        </Button>
                        <Button variant="outline" onClick={() => window.print()}>Print Policy</Button>
                    </div>
                    <Button variant="secondary" onClick={onReset}>Create New Warranty</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
