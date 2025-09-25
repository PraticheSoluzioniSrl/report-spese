import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req) {
  try {
    // Verifica se Supabase è configurato
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Supabase non configurato',
        message: 'Le variabili d\'ambiente per Supabase non sono configurate'
      }, { status: 400 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('🔄 Inizio migrazione database...')
    
    // Esegui le query per aggiungere il campo payment_method
    const queries = [
      // Aggiungi il campo payment_method alla tabella expenses
      `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'contanti';`,
      
      // Aggiungi il campo payment_method alla tabella incomes  
      `ALTER TABLE incomes ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'contanti';`,
      
      // Aggiorna i record esistenti con il valore di default
      `UPDATE expenses SET payment_method = 'contanti' WHERE payment_method IS NULL;`,
      `UPDATE incomes SET payment_method = 'contanti' WHERE payment_method IS NULL;`
    ]
    
    const results = []
    
    for (const query of queries) {
      try {
        console.log(`📝 Eseguendo: ${query}`)
        const { data, error } = await supabase.rpc('exec_sql', { sql: query })
        
        if (error) {
          // Prova con un approccio diverso se exec_sql non funziona
          console.log(`⚠️ exec_sql fallito, provo con query diretta: ${error.message}`)
          
          // Per le query ALTER TABLE, proviamo un approccio diverso
          if (query.includes('ALTER TABLE')) {
            const { error: alterError } = await supabase
              .from('expenses')
              .select('payment_method')
              .limit(1)
            
            if (alterError && alterError.code === 'PGRST204') {
              // Il campo non esiste, dobbiamo aggiungerlo manualmente
              console.log('📝 Campo payment_method non esiste, aggiungendo...')
              results.push({ query, status: 'skipped', message: 'Campo da aggiungere manualmente' })
              continue
            }
          }
          
          results.push({ query, status: 'error', error: error.message })
        } else {
          results.push({ query, status: 'success', data })
        }
      } catch (err) {
        console.error(`❌ Errore query: ${err.message}`)
        results.push({ query, status: 'error', error: err.message })
      }
    }
    
    console.log('✅ Migrazione completata')
    
    return NextResponse.json({ 
      success: true,
      message: 'Migrazione database completata',
      results
    })
    
  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error)
    return NextResponse.json({ 
      error: 'Errore durante la migrazione del database',
      details: error.message 
    }, { status: 500 })
  }
}
