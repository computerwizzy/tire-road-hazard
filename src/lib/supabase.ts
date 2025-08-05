
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// This file is designed to be used in client components.
let supabase: SupabaseClient | undefined

function getSupabaseBrowserClient() {
    if (supabase) {
        return supabase;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('Supabase URL and/or anonymous key are not set for the browser. Please check your .env.local file.');
        }
        // In a real app, you might want to throw an error here or handle it gracefully.
        // For this context, we create a client that will fail, pointing to the missing env vars.
    }
    supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
    return supabase;
}


export const supabase = getSupabaseBrowserClient();
