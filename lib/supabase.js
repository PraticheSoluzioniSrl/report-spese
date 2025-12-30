import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

// Verifica se Supabase è configurato
const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co' &&
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'demo-key'
}

if (!isSupabaseConfigured()) {
  if (typeof window === 'undefined') {
    // Solo nel server
    console.warn('⚠️ Supabase non configurato. Configura le variabili d\'ambiente per usare il database.')
  }
}

// Crea sempre il client (anche con valori demo per evitare errori)
// Le funzioni in supabase-db.js gestiranno il caso in cui Supabase non è configurato
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

export { isSupabaseConfigured }
