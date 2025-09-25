import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ckcgvufkhtkfpderjicl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrY2d2dWZraHRrZnBkZXJqaWNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwMjQ2NDEsImV4cCI6MjA1MzYwMDY0MX0.6aOBaoOTLHSjrFSC3LURuEk2FQGMzpFeHw60Hg1v0yo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
