// Test connessione Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hhvnlavfdhvsnoicalwp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhodm5sYXZmZGh2c25vaWNhbHdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MzQ4MDAsImV4cCI6MjA1MjAxMDgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseConnection() {
  try {
    console.log('🔗 Test connessione Supabase...')
    
    // Test 1: Verifica connessione
    console.log('\n1️⃣ Test connessione base...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.log('❌ Errore connessione:', error.message)
      return
    }
    
    console.log('✅ Connessione Supabase funzionante')
    
    // Test 2: Verifica tabelle
    console.log('\n2️⃣ Test tabelle...')
    
    const tables = ['users', 'main_categories', 'subcategories', 'expenses', 'incomes', 'deadlines']
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('count').limit(1)
      if (error) {
        console.log(`❌ Tabella ${table}:`, error.message)
      } else {
        console.log(`✅ Tabella ${table}: OK`)
      }
    }
    
    // Test 3: Verifica dati iniziali
    console.log('\n3️⃣ Test dati iniziali...')
    
    const { data: users } = await supabase.from('users').select('*')
    console.log(`👤 Utenti: ${users?.length || 0}`)
    
    const { data: categories } = await supabase.from('main_categories').select('*')
    console.log(`📂 Categorie: ${categories?.length || 0}`)
    
    const { data: subcategories } = await supabase.from('subcategories').select('*')
    console.log(`📁 Sottocategorie: ${subcategories?.length || 0}`)
    
    console.log('\n🎉 Test Supabase completato!')
    
  } catch (error) {
    console.error('❌ Errore nel test:', error.message)
  }
}

testSupabaseConnection()
