// Supabase configuration for large media storage
import { createClient } from "@supabase/supabase-js";

// Supabase configuration - YOUR project (CORRECTED URL)
const supabaseUrl = "https://vhdscuusgnhfpbicsewv.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZHNjdXVzZ25oZnBiaWNzZXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzIzMjcsImV4cCI6MjA2OTY0ODMyN30.O2b_S1_JbMRbM9Geim0XNqrd9TcIZKZM03wBJr4Q_GE";

// Create Supabase client with improved configuration for network resilience
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist auth session for public app
  },
  global: {
    headers: {
      "Content-Type": "application/json",
    },
  },
  db: {
    schema: "public",
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Test configuration
console.log("📦 Supabase client initialized for:", supabaseUrl);
