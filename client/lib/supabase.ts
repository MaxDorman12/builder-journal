// Supabase configuration for large media storage
import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test configuration - you'll need to replace these with your actual Supabase credentials
console.log('📦 Supabase client initialized')
