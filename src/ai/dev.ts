import { config } from 'dotenv';
config();

import '@/ai/flows/generate-policy-document.ts';
import '@/ai/flows/search-policies.ts';
import '@/ai/flows/send-policy-email.ts';
