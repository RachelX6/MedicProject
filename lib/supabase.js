import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bpictprznmmmtrlhikvv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwaWN0cHJ6bm1tbXRybGhpa3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NzAyMzksImV4cCI6MjA3NDM0NjIzOX0.G0UAyhavENUH2GcQsIFsNieG94aDVLblo0e5HjPa2FA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
