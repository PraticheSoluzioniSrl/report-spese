import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

// Verifica se Supabase è configurato
const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co'
}

if (!isSupabaseConfigured()) {
  console.warn('⚠️ Supabase non configurato. Configura le variabili d\'ambiente per usare il database.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
export { isSupabaseConfigured }
