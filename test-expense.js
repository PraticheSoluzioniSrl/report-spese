// Test specifico per la creazione di spese
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variabili d\'ambiente mancanti')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testExpenseCreation() {
  try {
    console.log('🔍 Test creazione spesa...')
    
    // Test 1: Verifica categorie
    const { data: categories, error: catError } = await supabase
      .from('main_categories')
      .select('*')
    
    if (catError) {
      console.error('❌ Errore categorie:', catError)
      return
    }
    
    console.log('✅ Categorie trovate:', categories.length)
    categories.forEach(cat => console.log(`  - ${cat.name} (ID: ${cat.id})`))
    
    // Test 2: Verifica sottocategorie
    const { data: subcategories, error: subError } = await supabase
      .from('subcategories')
      .select('*')
    
    if (subError) {
      console.error('❌ Errore sottocategorie:', subError)
      return
    }
    
    console.log('✅ Sottocategorie trovate:', subcategories.length)
    subcategories.forEach(sub => console.log(`  - ${sub.name} (ID: ${sub.id}, Main: ${sub.main_category_id})`))
    
    // Test 3: Prova a creare una spesa
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
    
  } catch (error) {
    console.error('❌ Errore generale:', error)
  }
}

testExpenseCreation()
