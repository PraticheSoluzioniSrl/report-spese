// Test completo Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variabili d\'ambiente mancanti')
  console.error('URL:', supabaseUrl ? '✅ Configurato' : '❌ Mancante')
  console.error('Key:', supabaseKey ? '✅ Configurato' : '❌ Mancante')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabase() {
  try {
    console.log('🔍 Test connessione Supabase...')
    console.log('URL:', supabaseUrl)
    console.log('Key:', supabaseKey.substring(0, 20) + '...')
    
    // Test 1: Verifica utenti
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
    
    if (usersError) {
      console.error('❌ Errore utenti:', usersError)
      return
    }
    
    console.log('✅ Utenti trovati:', users.length)
    users.forEach(user => console.log(`  - ${user.username} (ID: ${user.id})`))
    
    // Test 2: Verifica categorie
    const { data: categories, error: catError } = await supabase
      .from('main_categories')
      .select('*')
    
    if (catError) {
      console.error('❌ Errore categorie:', catError)
      return
    }
    
    console.log('✅ Categorie trovate:', categories.length)
    categories.forEach(cat => console.log(`  - ${cat.name} (ID: ${cat.id})`))
    
    // Test 3: Verifica sottocategorie
    const { data: subcategories, error: subError } = await supabase
      .from('subcategories')
      .select('*')
    
    if (subError) {
      console.error('❌ Errore sottocategorie:', subError)
      return
    }
    
    console.log('✅ Sottocategorie trovate:', subcategories.length)
    subcategories.forEach(sub => console.log(`  - ${sub.name} (ID: ${sub.id}, Main: ${sub.main_category_id})`))
    
    // Test 4: Prova a creare una spesa
    const testExpense = {
      description: 'Test spesa',
      amount: 10.50,
      date: new Date().toISOString(),
      main_category_id: categories[0]?.id,
      subcategory_id: subcategories[0]?.id
    }
    
    console.log('🧪 Tentativo creazione spesa:', testExpense)
    
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert([testExpense])
      .select()
    
    if (expenseError) {
      console.error('❌ Errore creazione spesa:', expenseError)
    } else {
      console.log('✅ Spesa creata con successo:', expense)
    }
    
    console.log('\n🎉 Test completato!')
    
  } catch (error) {
    console.error('❌ Errore generale:', error)
  }
}

testSupabase()
