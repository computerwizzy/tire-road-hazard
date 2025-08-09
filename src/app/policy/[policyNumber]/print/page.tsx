
'use server';

import ReactMarkdown from 'react-markdown';
import { notFound } from 'next/navigation';
import { handleGetPolicyByNumber } from '@/app/actions';
import rehypeRaw from 'rehype-raw';

export default async function PrintPolicyPage({ params }: { params: { policyNumber: string } }) {
    const policyResult = await handleGetPolicyByNumber(params.policyNumber);

    if (!policyResult.success || !policyResult.data) {
        return notFound();
    }
    
    const policyDocument = policyResult.data.policyDocument;

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
                        font-family: 'PT Sans', sans-serif;
                        line-height: 1.5;
                        color: #374151;
                    }
                    .prose {
                        max-width: none;
                        width: 100%;
                        margin: auto;
                    }
                    .prose table {
                        width: 100%;
                        border-collapse: collapse;
                        table-layout: fixed;
                    }
                    .prose th, .prose td {
                        border: 1px solid #e5e7eb;
                        padding: 0.75rem;
                        vertical-align: top;
                        word-wrap: break-word;
                    }
                    .prose th {
                        background-color: #f3f4f6;
                        font-weight: 600;
                    }
                     .prose h1, .prose h2, .prose h3 {
                        font-family: 'Space Grotesk', sans-serif;
                        font-weight: 700;
                        color: #111827;
                    }
                    .prose h1 {
                        text-align: center;
                    }
                    .prose hr {
                        border-top: 2px solid #e5e7eb;
                        margin-top: 1.5rem;
                        margin-bottom: 1.5rem;
                    }
                    .prose strong {
                        color: #111827;
                    }
                `}</style>
            </head>
            <body>
                <div className="prose">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{policyDocument}</ReactMarkdown>
                </div>
            </body>
        </html>
    );
}
