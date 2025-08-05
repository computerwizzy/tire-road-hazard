import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // In a real app, you'd want to log this error to a service like Sentry
  // and probably show a user-friendly message.
  // For this example, we'll throw an error during development.
  if (process.env.NODE_ENV === 'development') {
    console.warn('Supabase URL and/or anonymous key are not set. Please check your .env.local file.');
  }
}


export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
