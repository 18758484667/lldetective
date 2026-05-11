import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jxibqdxorywoeypjoxtb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4aWJxZHhvcnl3b2V5cGpveHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTg0NTYsImV4cCI6MjA5Mzg3NDQ1Nn0.fJFWdwJAcyOQ1E5kNfK9rr2qQC__hp7vWZr_GQ0hVlA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
