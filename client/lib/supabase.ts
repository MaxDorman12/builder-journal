// Supabase configuration for large media storage
import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://aqcbgkrtgoctnkicdnll.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxY2Jna3J0Z29jdG5raWNkbmxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MTA0NTcsImV4cCI6MjA2OTQ4NjQ1N30.zr8JqxQbLNzLRH6yXWf25Mo_zwnPhM0h-gKzOoQAEwg'

// Create Supabase client with minimal configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Don't persist auth session for public app
  }
})

// Test configuration
console.log('📦 Supabase client initialized for:', supabaseUrl)
