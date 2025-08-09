
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Mail, Loader2, FileText, Printer, Download } from 'lucide-react';
import { handleSendEmail, handleDownloadWord } from '@/app/ai-actions';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import rehypeRaw from 'rehype-raw';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from './ui/button';

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
  formData: z.infer<typeof InvoiceFormDataSchema> & { [key: string]: any }; 
};

interface WarrantyResultProps {
  result: PolicyData;
  onReset: () => void;
}

export function WarrantyResult({ result, onReset }: WarrantyResultProps) {
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const { toast } = useToast();

    async function onSendEmail() {
        if (!result) return;
        setIsSendingEmail(true);
        const response = await handleSendEmail({
            policyNumber: result.policyNumber,
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

    function handlePrint() {
        const printWindow = window.open(`/policy/${result.policyNumber}/print`, '_blank');
        printWindow?.addEventListener('load', () => {
            setTimeout(() => {
                printWindow?.print();
            }, 100);
        });
    }

    async function handleDownload() {
        if (!result) return;
        setIsDownloading(true);
        const response = await handleDownloadWord({
            policyNumber: result.policyNumber,
        });

        if (response.success && response.data) {
            const byteCharacters = atob(response.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/msword' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Warranty-Policy-${result.policyNumber}.doc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
             toast({
                variant: "destructive",
                title: "Error",
                description: response.error || "Failed to download document.",
            });
        }
        setIsDownloading(false);
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
                        Thank you for registering, {result.customerName}. You can email, print, or download the policy document.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-sm max-w-none bg-muted p-4 rounded-lg border">
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{result.policyDocument}</ReactMarkdown>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 print-hidden">
                    <div className="flex flex-wrap gap-4">
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
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Policy
                        </Button>
                         <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
                            {isDownloading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Word Doc
                                </>
                            )}
                        </Button>
                    </div>
                    <Button variant="secondary" onClick={onReset}>Create New Warranty</Button>
                </CardFooter>
            </Card>
        </div>
    );
}

    