// Test rapido per verificare la connessione Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Test connessione Supabase...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? 'Presente' : 'Mancante')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variabili d\'ambiente mancanti')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('📊 Testando connessione...')
    
    // Test 1: Verifica tabelle
    const { data: tables, error: tablesError } = await supabase
      .from('main_categories')
      .select('*')
      .limit(1)
    
    if (tablesError) {
      console.error('❌ Errore tabella main_categories:', tablesError)
    } else {
      console.log('✅ Tabella main_categories accessibile')
    }
    
    // Test 2: Verifica utenti
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.error('❌ Errore tabella users:', usersError)
    } else {
      console.log('✅ Tabella users accessibile')
      console.log('👤 Utenti trovati:', users.length)
    }
    
    // Test 3: Verifica spese
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .limit(1)
    
    if (expensesError) {
      console.error('❌ Errore tabella expenses:', expensesError)
    } else {
      console.log('✅ Tabella expenses accessibile')
    }
    
    console.log('🎉 Test completato!')
    
  } catch (error) {
    console.error('❌ Errore generale:', error)
  }
}

testConnection()
