
'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import ReactMarkdown from 'react-markdown';
import { notFound } from 'next/navigation';

async function getPolicyDocument(policyNumber: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('policies')
        .select('policyDocument')
        .eq('policyNumber', policyNumber)
        .single();
    
    if (error || !data || !data.policyDocument) {
        console.error('Error fetching policy document for print:', error);
        return null;
    }

    return data.policyDocument;
}


export default async function PrintPolicyPage({ params }: { params: { policyNumber: string } }) {
    const policyDocument = await getPolicyDocument(params.policyNumber);

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
