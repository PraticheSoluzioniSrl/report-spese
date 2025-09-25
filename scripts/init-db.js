// Script per inizializzare il database Supabase
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variabili d\'ambiente Supabase non configurate')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function initDatabase() {
  try {
    console.log('🚀 Inizializzazione database...')
    
    // Crea utente admin se non esiste
    const { data: existingUsers } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (!existingUsers || existingUsers.length === 0) {
      console.log('👤 Creazione utente admin...')
      const passwordHash = await bcrypt.hash('C0S1M0', 10)
      
      const { data, error } = await supabase
        .from('users')                                                                   
        .insert([{
          username: 'admin',
          password_hash: passwordHash
        }])
        .select()
      
      if (error) throw error
      console.log('✅ Utente admin creato con successo')
    } else {
      console.log('✅ Utente admin già esistente')
    }
    
    // Crea alcune categorie di esempio
    const { data: existingCategories } = await supabase
      .from('main_categories')
      .select('*')
    
    if (!existingCategories || existingCategories.length === 0) {
      console.log('📁 Creazione categorie di esempio...')
      
      const { data: categories, error: catError } = await supabase
        .from('main_categories')
        .insert([
          { name: 'Alimentari' },
          { name: 'Trasporti' },
          { name: 'Casa' },
          { name: 'Salute' },
          { name: 'Svago' }
        ])
        .select()
      
      if (catError) throw catError
      
      // Crea sottocategorie
      const subcategories = [
        { name: 'Supermercato', main_category_id: categories[0].id },
        { name: 'Ristorante', main_category_id: categories[0].id },
        { name: 'Benzina', main_category_id: categories[1].id },
        { name: 'Autobus', main_category_id: categories[1].id },
        { name: 'Affitto', main_category_id: categories[2].id },
        { name: 'Bollette', main_category_id: categories[2].id },
        { name: 'Farmacia', main_category_id: categories[3].id },
        { name: 'Medico', main_category_id: categories[3].id },
        { name: 'Cinema', main_category_id: categories[4].id },
        { name: 'Sport', main_category_id: categories[4].id }
      ]
      
      const { error: subError } = await supabase
        .from('subcategories')
        .insert(subcategories)
      
      if (subError) throw subError
      console.log('✅ Categorie e sottocategorie create con successo')
    } else {
      console.log('✅ Categorie già esistenti')
    }
    
    console.log('🎉 Database inizializzato con successo!')
    console.log('🔑 Password admin: C0S1M0')
    
  } catch (error) {
    console.error('❌ Errore durante l\'inizializzazione:', error)
    process.exit(1)
  }
}

initDatabase()
