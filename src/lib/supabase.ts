
import { createServerClient } from '@supabase/ssr'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// This file is designed to be used in both client and server components.
// It checks if 'cookies' are available to determine the environment.
// In server components, it creates a server client.
// In client components, it creates a browser client.

let supabase: SupabaseClient | undefined

if (typeof window === 'undefined') {
  try {
    const cookieStore = cookies()
    supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
  } catch (error) {
    // This can happen during build time when cookies are not available.
    // We'll fall back to the browser client creation below.
  }
} 

if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('Supabase URL and/or anonymous key are not set for the browser. Please check your .env.local file.');
        }
    }
    supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}


export { supabase };
