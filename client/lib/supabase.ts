// Supabase configuration for large media storage
import { createClient } from '@supabase/supabase-js'

// Supabase configuration - Replace these with your actual values from Supabase dashboard
const supabaseUrl = 'https://YOUR_PROJECT_REF.supabase.co'
const supabaseAnonKey = 'YOUR_ANON_KEY_HERE'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test configuration
console.log('📦 Supabase client initialized for:', supabaseUrl)
