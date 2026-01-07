import { supabase, isSupabaseConfigured } from './supabase'

// Funzione helper per gestire errori
const handleError = (error, operation) => {
  if (!isSupabaseConfigured()) {
    console.warn(`⚠️ Supabase non configurato per ${operation}`)
    return null
  }
  console.error(`❌ Errore Supabase durante ${operation}:`, error)
  throw error
}

// Funzioni per MainCategory
export async function getMainCategories() {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, restituisco categorie demo')
      const { getDemoCategories } = await import('./demo-storage.js')
      const demoCats = getDemoCategories()
      // Assicurati che tutte le categorie demo abbiano il tipo
      return demoCats.map(cat => {
        if (cat.type) return cat
        // Logica di fallback basata sul nome
        const expenseCategories = ['Alimentari', 'Trasporti', 'Casa', 'Salute', 'Svago', 'Altro']
        const incomeCategories = ['Stipendio', 'Freelance', 'Investimenti', 'Vendite', 'Rimborsi', 'Altri Ricavi']
        if (expenseCategories.includes(cat.name)) {
          return { ...cat, type: 'expenses' }
        } else if (incomeCategories.includes(cat.name)) {
          return { ...cat, type: 'incomes' }
        }
        return { ...cat, type: 'expenses' } // default
      })
    }
    
    const { data, error } = await supabase
      .from('main_categories')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    
    // Aggiungi il tipo basato sul nome se il campo type non esiste
    return (data || []).map(cat => {
      if (cat.type) return cat
      
      // Logica di fallback basata sul nome
      const expenseCategories = ['Alimentari', 'Trasporti', 'Casa', 'Salute', 'Svago', 'Altro']
      const incomeCategories = ['Stipendio', 'Freelance', 'Investimenti', 'Vendite', 'Rimborsi', 'Altri Ricavi']
      
      if (expenseCategories.includes(cat.name)) {
        return { ...cat, type: 'expenses' }
      } else if (incomeCategories.includes(cat.name)) {
        return { ...cat, type: 'incomes' }
      } else {
        return { ...cat, type: 'expenses' } // default
      }
    })
  } catch (error) {
    console.error('Errore in getMainCategories, uso demo storage:', error)
    // Se c'è un errore, usa demo storage come fallback
    try {
      const { getDemoCategories } = await import('./demo-storage.js')
      const demoCats = getDemoCategories()
      return demoCats.map(cat => {
        if (cat.type) return cat
        const expenseCategories = ['Alimentari', 'Trasporti', 'Casa', 'Salute', 'Svago', 'Altro']
        const incomeCategories = ['Stipendio', 'Freelance', 'Investimenti', 'Vendite', 'Rimborsi', 'Altri Ricavi']
        if (expenseCategories.includes(cat.name)) {
          return { ...cat, type: 'expenses' }
        } else if (incomeCategories.includes(cat.name)) {
          return { ...cat, type: 'incomes' }
        }
        return { ...cat, type: 'expenses' }
      })
    } catch (demoError) {
      console.error('Errore anche nel demo storage:', demoError)
      return []
    }
  }
}

export async function createMainCategory(categoryData) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, uso demo storage per categoria')
      const { addDemoCategory } = await import('./demo-storage.js')
      return addDemoCategory(categoryData.name, categoryData.type || 'expenses')
    }
    
    // Prova prima con il campo type
    let insertData = { name: categoryData.name }
    if (categoryData.type) {
      insertData.type = categoryData.type
    }
    
    const { data, error } = await supabase
      .from('main_categories')
      .insert([insertData])
      .select()
      .single()
    
    if (error) {
      // Se fallisce per il campo type, prova senza
      if (error.message.includes('type')) {
        const { data: data2, error: error2 } = await supabase
          .from('main_categories')
          .insert([{ name: categoryData.name }])
          .select()
          .single()
        
        if (error2) throw error2
        
        // Aggiungi il tipo basato sul nome
        const expenseCategories = ['Alimentari', 'Trasporti', 'Casa', 'Salute', 'Svago', 'Altro']
        const incomeCategories = ['Stipendio', 'Freelance', 'Investimenti', 'Vendite', 'Rimborsi', 'Altri Ricavi']
        
        let type = 'expenses' // default
        if (expenseCategories.includes(categoryData.name)) {
          type = 'expenses'
        } else if (incomeCategories.includes(categoryData.name)) {
          type = 'incomes'
        } else if (categoryData.type) {
          type = categoryData.type
        }
        
        return { ...data2, type }
      }
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Errore in createMainCategory, uso demo storage come fallback:', error)
    // Se c'è un errore, usa sempre demo storage come fallback
    const { addDemoCategory } = await import('./demo-storage.js')
    const demoCategory = addDemoCategory(categoryData.name, categoryData.type || 'expenses')
    console.log('Categoria demo creata con successo:', demoCategory)
    return demoCategory
  }
}

export async function deleteMainCategory(id) {
  try {
    if (!isSupabaseConfigured()) {
      const { deleteDemoCategory } = await import('./demo-storage.js')
      return deleteDemoCategory(id)
    }
    
    // Converti l'ID in numero se è una stringa numerica
    const categoryId = isNaN(Number(id)) ? id : Number(id)
    
    const { error } = await supabase
      .from('main_categories')
      .delete()
      .eq('id', categoryId)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('❌ Errore in deleteMainCategory:', error)
    throw error
  }
}

// Funzioni per Subcategory
export async function getSubcategories(mainCategoryId) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, restituisco sottocategorie demo')
      const { getDemoSubcategories } = await import('./demo-storage.js')
      return getDemoSubcategories(mainCategoryId) || []
    }
    
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('main_category_id', mainCategoryId)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Errore in getSubcategories, uso demo storage:', error)
    // Se c'è un errore, usa demo storage come fallback
    try {
      const { getDemoSubcategories } = await import('./demo-storage.js')
      return getDemoSubcategories(mainCategoryId) || []
    } catch (demoError) {
      console.error('Errore anche nel demo storage:', demoError)
      return []
    }
  }
}

export async function createSubcategory(subcategoryData) {
  console.log('🔧 createSubcategory chiamata con:', subcategoryData)
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, uso demo storage per sottocategoria')
      const { addDemoSubcategory } = await import('./demo-storage.js')
      const demoSub = addDemoSubcategory(subcategoryData.name, subcategoryData.mainCategoryId)
      if (!demoSub) {
        console.error('❌ addDemoSubcategory ha restituito null - categoria non trovata:', subcategoryData.mainCategoryId)
        // Prova a vedere tutte le categorie disponibili
        const { getDemoCategories } = await import('./demo-storage.js')
        const allCats = getDemoCategories()
        console.log('📋 Tutte le categorie demo disponibili:', allCats.map(c => ({ id: c.id, name: c.name })))
      }
      return demoSub
    }
    
    const { data, error } = await supabase
      .from('subcategories')
      .insert([{ 
        name: subcategoryData.name, 
        main_category_id: subcategoryData.mainCategoryId 
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('❌ Errore in createSubcategory, uso demo storage come fallback:', error)
    // Se c'è un errore, usa sempre demo storage come fallback
    const { addDemoSubcategory } = await import('./demo-storage.js')
    const demoSub = addDemoSubcategory(subcategoryData.name, subcategoryData.mainCategoryId)
    if (!demoSub) {
      console.error('❌ addDemoSubcategory ha restituito null anche nel fallback')
      // Prova a vedere tutte le categorie disponibili
      const { getDemoCategories } = await import('./demo-storage.js')
      const allCats = getDemoCategories()
      console.log('📋 Tutte le categorie demo disponibili nel fallback:', allCats.map(c => ({ id: c.id, name: c.name })))
    }
    return demoSub
  }
}

export async function deleteSubcategory(params) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, uso demo storage per eliminazione sottocategoria')
      const { deleteDemoSubcategory } = await import('./demo-storage.js')
      return deleteDemoSubcategory(params.mainCategoryName, params.subcategoryName)
    }
    
    // Se params è un ID (per compatibilità)
    if (typeof params === 'string' || typeof params === 'number') {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', params)
      
      if (error) throw error
      return
    }
    
    // Se params è un oggetto con mainCategoryName e subcategoryName
    // Prima trova l'ID della categoria principale
    const { data: mainCategory } = await supabase
      .from('main_categories')
      .select('id')
      .eq('name', params.mainCategoryName)
      .single()
    
    if (!mainCategory) {
      throw new Error(`Categoria principale "${params.mainCategoryName}" non trovata`)
    }
    
    // Poi cancella la sottocategoria
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('name', params.subcategoryName)
      .eq('main_category_id', mainCategory.id)
    
    if (error) throw error
  } catch (error) {
    handleError(error, 'deleteSubcategory')
    const { deleteDemoSubcategory } = await import('./demo-storage.js')
    return deleteDemoSubcategory(params.mainCategoryName, params.subcategoryName)
  }
}

// Funzioni per Expense
export async function getExpenses(month = null) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, uso demo storage per getExpenses')
      const { getDemoExpenses } = await import('./demo-storage.js')
      return getDemoExpenses(month)
    }
    
    let query = supabase
      .from('expenses')
      .select(`
        *,
        main_categories(name),
        subcategories(name)
      `)
      .order('date', { ascending: false })
    
    if (month) {
      const startDate = new Date(month + '-01')
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      query = query
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    // Trasforma i dati per compatibilità
    return (data || []).map(expense => ({
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      date: new Date(expense.date),
      mainCategoryId: expense.main_category_id,
      subcategoryId: expense.subcategory_id,
      paymentMethod: expense.payment_method || expense.paymentMethod || 'contanti',
      mainCategory: expense.main_categories ? { name: expense.main_categories.name } : null,
      subcategory: expense.subcategories ? { name: expense.subcategories.name } : null
    }))
  } catch (error) {
    console.error('Errore in getExpenses, uso demo storage come fallback:', error)
    const { getDemoExpenses } = await import('./demo-storage.js')
    return getDemoExpenses(month)
  }
}

export async function createExpense(expenseData) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, uso demo storage per creare spesa')
      const { addDemoExpense } = await import('./demo-storage.js')
      // Assicurati che expenseData abbia mainCategoryName e subcategoryName
      if (!expenseData.mainCategoryName || !expenseData.subcategoryName) {
        console.error('⚠️ createExpense: mainCategoryName o subcategoryName mancanti', expenseData)
        // Prova a recuperare i nomi dalle categorie usando le funzioni già importate
        const mainCategories = await getMainCategories()
        const main = mainCategories.find(cat => cat.id === expenseData.mainCategoryId)
        if (main) {
          expenseData.mainCategoryName = main.name
          const subcategories = await getSubcategories(main.id)
          const sub = subcategories.find(sub => sub.id === expenseData.subcategoryId)
          if (sub) {
            expenseData.subcategoryName = sub.name
          }
        }
      }
      return addDemoExpense(expenseData)
    }
    
    // Prepara i dati per l'inserimento, escludendo payment_method se non esiste
    const insertData = {
      description: expenseData.description,
      amount: expenseData.amount,
      date: expenseData.date.toISOString(),
      main_category_id: expenseData.mainCategoryId,
      subcategory_id: expenseData.subcategoryId
    }
    
    // Aggiungi payment_method solo se il campo esiste nel database
    // Per ora, proviamo sempre ad aggiungere il campo
    console.log('🔍 createExpense - expenseData.paymentMethod ricevuto:', expenseData.paymentMethod)
    insertData.payment_method = expenseData.paymentMethod || 'contanti'
    console.log('🔍 createExpense - insertData.payment_method impostato:', insertData.payment_method)
    
    const { data, error } = await supabase
      .from('expenses')
      .insert([insertData])
      .select()
      .single()
    
    if (error) {
      // Se l'errore è dovuto al campo payment_method mancante, riprova senza
      if (error.message && error.message.includes('payment_method')) {
        console.log('⚠️ Campo payment_method non trovato, riprovo senza...')
        console.log('📝 Valore payment_method originale:', expenseData.paymentMethod)
        console.log('🔍 createExpense - expenseData completo:', JSON.stringify(expenseData, null, 2))
        
        // Rimuovi il campo payment_method e riprova
        const retryData = { ...insertData }
        delete retryData.payment_method
        
        const { data: retryDataResult, error: retryError } = await supabase
          .from('expenses')
          .insert([retryData])
          .select()
          .single()
        
        if (retryError) throw retryError
        
        // Aggiungi il paymentMethod al risultato per compatibilità
        return {
          ...retryDataResult,
          paymentMethod: expenseData.paymentMethod || 'contanti'
        }
      }
      throw error
    }
    return data
  } catch (error) {
    console.error('Errore in createExpense, uso demo storage come fallback:', error)
    const { addDemoExpense } = await import('./demo-storage.js')
    // Prova a recuperare i nomi dalle categorie se mancanti
    if (!expenseData.mainCategoryName || !expenseData.subcategoryName) {
      const mainCategories = await getMainCategories()
      const main = mainCategories.find(cat => cat.id === expenseData.mainCategoryId)
      if (main) {
        expenseData.mainCategoryName = main.name
        const subcategories = await getSubcategories(main.id)
        const sub = subcategories.find(sub => sub.id === expenseData.subcategoryId)
        if (sub) {
          expenseData.subcategoryName = sub.name
        }
      }
    }
    return addDemoExpense(expenseData)
  }
}

export async function updateExpense(expenseData) {
  try {
    // Se Supabase non è configurato, usa demo storage
    if (!isSupabaseConfigured()) {
      const { updateDemoExpense } = await import('./demo-storage')
      const result = updateDemoExpense(expenseData)
      if (!result) {
        throw new Error(`Spesa con ID ${expenseData.id} non trovata`)
      }
      return result
    }
    
    // Modalità Supabase
    const updateData = {
      description: expenseData.description,
      amount: expenseData.amount,
      date: expenseData.date instanceof Date ? expenseData.date.toISOString() : new Date(expenseData.date).toISOString(),
      main_category_id: expenseData.mainCategoryId,
      subcategory_id: expenseData.subcategoryId
    }
    
    if (expenseData.paymentMethod) {
      updateData.payment_method = expenseData.paymentMethod
    }
    
    if (expenseData.accountId) {
      updateData.account_id = expenseData.accountId
    }
    
    const { data, error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', expenseData.id)
      .select()
      .single()
    
    if (error) throw error
    
    if (!data) {
      throw new Error(`Spesa con ID ${expenseData.id} non trovata`)
    }
    
    return {
      ...data,
      paymentMethod: data.payment_method || expenseData.paymentMethod || 'contanti',
      accountId: data.account_id || expenseData.accountId || null,
      mainCategory: { name: expenseData.mainCategoryName },
      subcategory: { name: expenseData.subcategoryName }
    }
  } catch (error) {
    console.error('❌ Errore in updateExpense:', error)
    throw error
  }
}

export async function deleteExpense(id) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, uso demo storage per eliminare spesa')
      const { deleteDemoExpense } = await import('./demo-storage.js')
      const deleted = deleteDemoExpense(id)
      if (!deleted) {
        console.warn('⚠️ Spesa non trovata nel demo storage:', id)
      }
      return
    }
    
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    console.error('Errore in deleteExpense, uso demo storage come fallback:', error)
    const { deleteDemoExpense } = await import('./demo-storage.js')
    deleteDemoExpense(id)
  }
}

// Funzioni per Income
export async function getIncomes(month = null) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, uso demo storage per getIncomes')
      const { getDemoIncomes } = await import('./demo-storage.js')
      return getDemoIncomes(month)
    }
    
    let query = supabase
      .from('incomes')
      .select(`
        *,
        main_categories(name),
        subcategories(name)
      `)
      .order('date', { ascending: false })
    
    if (month) {
      const startDate = new Date(month + '-01')
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      query = query
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    // Trasforma i dati per compatibilità
    return (data || []).map(income => ({
      id: income.id,
      description: income.description,
      amount: income.amount,
      date: new Date(income.date),
      mainCategoryId: income.main_category_id,
      subcategoryId: income.subcategory_id,
      paymentMethod: income.payment_method || income.paymentMethod || 'contanti',
      mainCategory: income.main_categories ? { name: income.main_categories.name } : null,
      subcategory: income.subcategories ? { name: income.subcategories.name } : null
    }))
  } catch (error) {
    console.error('Errore in getIncomes, uso demo storage come fallback:', error)
    const { getDemoIncomes } = await import('./demo-storage.js')
    return getDemoIncomes(month)
  }
}

export async function createIncome(incomeData) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, uso demo storage per creare incasso')
      const { addDemoIncome } = await import('./demo-storage.js')
      // Assicurati che incomeData abbia mainCategoryName e subcategoryName
      if (!incomeData.mainCategoryName || !incomeData.subcategoryName) {
        console.error('⚠️ createIncome: mainCategoryName o subcategoryName mancanti', incomeData)
        // Prova a recuperare i nomi dalle categorie usando le funzioni già importate
        const mainCategories = await getMainCategories()
        const main = mainCategories.find(cat => cat.id === incomeData.mainCategoryId)
        if (main) {
          incomeData.mainCategoryName = main.name
          const subcategories = await getSubcategories(main.id)
          const sub = subcategories.find(sub => sub.id === incomeData.subcategoryId)
          if (sub) {
            incomeData.subcategoryName = sub.name
          }
        }
      }
      return addDemoIncome(incomeData)
    }
    
    // Prepara i dati per l'inserimento, escludendo payment_method se non esiste
    const insertData = {
      description: incomeData.description,
      amount: incomeData.amount,
      date: incomeData.date.toISOString(),
      main_category_id: incomeData.mainCategoryId,
      subcategory_id: incomeData.subcategoryId
    }
    
    // Aggiungi payment_method solo se il campo esiste nel database
    // Per ora, proviamo sempre ad aggiungere il campo
    insertData.payment_method = incomeData.paymentMethod || 'contanti'
    
    const { data, error } = await supabase
      .from('incomes')
      .insert([insertData])
      .select()
      .single()
    
    if (error) {
      // Se l'errore è dovuto al campo payment_method mancante, riprova senza
      if (error.message && error.message.includes('payment_method')) {
        console.log('⚠️ Campo payment_method non trovato, riprovo senza...')
        console.log('📝 Valore payment_method originale:', incomeData.paymentMethod)
        
        // Rimuovi il campo payment_method e riprova
        const retryData = { ...insertData }
        delete retryData.payment_method
        
        const { data: retryDataResult, error: retryError } = await supabase
          .from('incomes')
          .insert([retryData])
          .select()
          .single()
        
        if (retryError) throw retryError
        
        // Aggiungi il paymentMethod al risultato per compatibilità
        return {
          ...retryDataResult,
          paymentMethod: incomeData.paymentMethod || 'contanti'
        }
      }
      throw error
    }
    return data
  } catch (error) {
    console.error('Errore in createIncome, uso demo storage come fallback:', error)
    const { addDemoIncome } = await import('./demo-storage.js')
    // Prova a recuperare i nomi dalle categorie se mancanti
    if (!incomeData.mainCategoryName || !incomeData.subcategoryName) {
      const mainCategories = await getMainCategories()
      const main = mainCategories.find(cat => cat.id === incomeData.mainCategoryId)
      if (main) {
        incomeData.mainCategoryName = main.name
        const subcategories = await getSubcategories(main.id)
        const sub = subcategories.find(sub => sub.id === incomeData.subcategoryId)
        if (sub) {
          incomeData.subcategoryName = sub.name
        }
      }
    }
    return addDemoIncome(incomeData)
  }
}

export async function updateIncome(incomeData) {
  console.log('🔧 updateIncome chiamata con:', incomeData)
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, uso demo storage per aggiornamento entrata')
      const { updateDemoIncome } = await import('./demo-storage')
      const result = updateDemoIncome(incomeData)
      if (!result) {
        console.error('❌ updateDemoIncome ha restituito null per ID:', incomeData.id)
        throw new Error(`Entrata con ID ${incomeData.id} non trovata nel demo storage`)
      }
      return result
    }
    
    // Prepara i dati per l'aggiornamento
    const updateData = {
      description: incomeData.description,
      amount: incomeData.amount,
      date: incomeData.date.toISOString(),
      main_category_id: incomeData.mainCategoryId,
      subcategory_id: incomeData.subcategoryId
    }
    
    // Aggiungi payment_method se esiste
    if (incomeData.paymentMethod) {
      updateData.payment_method = incomeData.paymentMethod
    }
    
    // Aggiungi account_id se esiste
    if (incomeData.accountId) {
      updateData.account_id = incomeData.accountId
    }
    
    const { data, error } = await supabase
      .from('incomes')
      .update(updateData)
      .eq('id', incomeData.id)
      .select()
      .single()
    
    if (error) {
      // Se l'errore è dovuto al campo payment_method mancante, riprova senza
      if (error.message && error.message.includes('payment_method')) {
        console.log('⚠️ Campo payment_method non trovato durante update, riprovo senza...')
        delete updateData.payment_method
        
        const { data: retryData, error: retryError } = await supabase
          .from('incomes')
          .update(updateData)
          .eq('id', incomeData.id)
          .select()
          .single()
        
        if (retryError) throw retryError
        
        // Aggiungi il paymentMethod al risultato per compatibilità
        return {
          ...retryData,
          paymentMethod: incomeData.paymentMethod || 'contanti'
        }
      }
      throw error
    }
    
    return {
      ...data,
      paymentMethod: data.payment_method || incomeData.paymentMethod || 'contanti'
    }
  } catch (error) {
    handleError(error, 'updateIncome')
    return { id: incomeData.id, ...incomeData }
  }
}

export async function deleteIncome(id) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, uso demo storage per eliminare incasso')
      const { deleteDemoIncome } = await import('./demo-storage.js')
      const deleted = deleteDemoIncome(id)
      if (!deleted) {
        console.warn('⚠️ Incasso non trovato nel demo storage:', id)
      }
      return
    }
    
    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    console.error('Errore in deleteIncome, uso demo storage come fallback:', error)
    const { deleteDemoIncome } = await import('./demo-storage.js')
    deleteDemoIncome(id)
  }
}

// Funzioni per Deadline
export async function getDeadlines() {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, uso demo storage per getDeadlines')
      const { getDemoDeadlines } = await import('./demo-storage.js')
      return getDemoDeadlines()
    }
    
    const { data, error } = await supabase
      .from('deadlines')
      .select('*')
      .order('due_date', { ascending: true })
    
    if (error) throw error
    return (data || []).map(deadline => ({
      id: deadline.id,
      description: deadline.description,
      amount: deadline.amount,
      dueDate: new Date(deadline.due_date),
      paid: deadline.is_paid
    }))
  } catch (error) {
    console.error('❌ Errore in getDeadlines, uso demo storage come fallback:', error)
    const { getDemoDeadlines } = await import('./demo-storage.js')
    return getDemoDeadlines()
  }
}

export async function createDeadline(deadlineData) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, uso demo storage per creare scadenza')
      const { addDemoDeadline } = await import('./demo-storage.js')
      return addDemoDeadline(deadlineData)
    }
    
    const { data, error } = await supabase
      .from('deadlines')
      .insert([{
        description: deadlineData.description,
        amount: deadlineData.amount,
        due_date: deadlineData.dueDate.toISOString(),
        is_paid: deadlineData.paid || false
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('❌ Errore in createDeadline, uso demo storage come fallback:', error)
    const { addDemoDeadline } = await import('./demo-storage.js')
    return addDemoDeadline(deadlineData)
  }
}

export async function updateDeadline(id, updates) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, uso demo storage per aggiornare scadenza')
      const { updateDemoDeadline } = await import('./demo-storage.js')
      return updateDemoDeadline(id, updates)
    }
    
    // Converti l'ID in numero se è una stringa numerica
    const deadlineId = isNaN(Number(id)) ? id : Number(id)
    
    console.log('🔧 updateDeadline chiamata con:', { deadlineId, updates })
    
    const { data, error } = await supabase
      .from('deadlines')
      .update(updates)
      .eq('id', deadlineId)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Errore Supabase in updateDeadline:', error)
      throw error
    }
    
    if (!data) {
      console.error('❌ Scadenza non trovata con ID:', deadlineId)
      throw new Error(`Scadenza con ID ${deadlineId} non trovata`)
    }
    
    console.log('✅ Scadenza aggiornata con successo:', data)
    return data
  } catch (error) {
    console.error('❌ Errore in updateDeadline, uso demo storage come fallback:', error)
    const { updateDemoDeadline } = await import('./demo-storage.js')
    return updateDemoDeadline(id, updates)
  }
}

export async function deleteDeadline(id) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, uso demo storage per eliminare scadenza')
      const { deleteDemoDeadline } = await import('./demo-storage.js')
      return deleteDemoDeadline(id)
    }
    
    const { error } = await supabase
      .from('deadlines')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    console.error('❌ Errore in deleteDeadline, uso demo storage come fallback:', error)
    const { deleteDemoDeadline } = await import('./demo-storage.js')
    return deleteDemoDeadline(id)
  }
}

// Funzioni per User (semplificate - senza autenticazione)
export async function getUser() {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, restituisco utente demo')
      return {
        id: 'demo-user',
        username: 'admin',
        passwordHash: '$2a$10$demo.hash.for.testing.purposes.only'
      }
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    
    // Mappa password_hash a passwordHash per compatibilità
    if (data) {
      return {
        ...data,
        passwordHash: data.password_hash || data.passwordHash
      }
    }
    
    return data
  } catch (error) {
    handleError(error, 'getUser')
    return null
  }
}

export async function createUser(userData) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, simulo creazione utente')
      return { id: 'demo-user' }
    }
    
    // Converti passwordHash in password_hash per il database
    const dbUserData = {
      username: userData.username,
      password_hash: userData.passwordHash || userData.password_hash
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert([dbUserData])
      .select()
      .single()
    
    if (error) throw error
    
    // Mappa password_hash a passwordHash per compatibilità
    if (data) {
      return {
        ...data,
        passwordHash: data.password_hash || data.passwordHash
      }
    }
    
    return data
  } catch (error) {
    handleError(error, 'createUser')
    return { id: 'demo-user' }
  }
}

export async function updateUser(id, updates) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, simulo aggiornamento utente')
      throw new Error('Supabase non configurato - impossibile aggiornare password')
    }
    
    // Converti passwordHash in password_hash per il database
    const dbUpdates = {}
    if (updates.passwordHash) {
      dbUpdates.password_hash = updates.passwordHash
    }
    if (updates.username) {
      dbUpdates.username = updates.username
    }
    
    if (Object.keys(dbUpdates).length === 0) {
      throw new Error('Nessun dato da aggiornare')
    }
    
    // Converti l'ID in numero se è una stringa numerica
    const userId = isNaN(Number(id)) ? id : Number(id)
    
    console.log('🔧 updateUser chiamata con:', { userId, updates, dbUpdates })
    
    const { data, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Errore Supabase in updateUser:', error)
      console.error('❌ Dettagli errore:', JSON.stringify(error, null, 2))
      throw error
    }
    
    if (!data) {
      console.error('❌ Utente non trovato con ID:', userId)
      throw new Error(`Utente con ID ${userId} non trovato`)
    }
    
    console.log('✅ Utente aggiornato con successo:', { id: data.id, username: data.username })
    
    // Mappa password_hash a passwordHash per compatibilità
    return {
      ...data,
      passwordHash: data.password_hash || data.passwordHash
    }
  } catch (error) {
    console.error('❌ Errore in updateUser:', error)
    throw error
  }
}

// Funzioni per Accounts
export async function getAccounts() {
  try {
    if (!isSupabaseConfigured()) {
      const { getDemoAccounts } = await import('./demo-storage.js')
      return getDemoAccounts()
    }
    
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return (data || []).map(account => ({
      id: account.id,
      name: account.name,
      initialBalance: Number(account.initial_balance) || 0
    }))
  } catch (error) {
    console.error('Errore in getAccounts, uso demo storage come fallback:', error)
    const { getDemoAccounts } = await import('./demo-storage.js')
    return getDemoAccounts()
  }
}

export async function createAccount(name, initialBalance = 0) {
  try {
    if (!isSupabaseConfigured()) {
      const { addDemoAccount } = await import('./demo-storage.js')
      return addDemoAccount(name, initialBalance)
    }
    
    const { data, error } = await supabase
      .from('accounts')
      .insert([{
        name: name,
        initial_balance: Number(initialBalance) || 0
      }])
      .select()
      .single()
    
    if (error) throw error
    return {
      id: data.id,
      name: data.name,
      initialBalance: Number(data.initial_balance) || 0
    }
  } catch (error) {
    console.error('Errore in createAccount, uso demo storage come fallback:', error)
    const { addDemoAccount } = await import('./demo-storage.js')
    return addDemoAccount(name, initialBalance)
  }
}

export async function updateAccount(id, name, initialBalance) {
  try {
    if (!isSupabaseConfigured()) {
      const { updateDemoAccount } = await import('./demo-storage.js')
      return updateDemoAccount(id, name, initialBalance)
    }
    
    // Converti l'ID in numero se è una stringa numerica
    const accountId = isNaN(Number(id)) ? id : Number(id)
    
    const updateData = {}
    if (name !== undefined && name !== null) {
      updateData.name = String(name).trim()
    }
    if (initialBalance !== undefined && initialBalance !== null) {
      updateData.initial_balance = Number(initialBalance) || 0
    }
    
    if (Object.keys(updateData).length === 0) {
      throw new Error('Nessun dato da aggiornare')
    }
    
    console.log('🔧 updateAccount chiamata con:', { accountId, updateData })
    
    const { data, error } = await supabase
      .from('accounts')
      .update(updateData)
      .eq('id', accountId)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Errore Supabase in updateAccount:', error)
      throw error
    }
    
    if (!data) {
      console.error('❌ Conto non trovato con ID:', accountId)
      throw new Error(`Conto con ID ${accountId} non trovato`)
    }
    
    console.log('✅ Conto aggiornato con successo:', data)
    
    return {
      id: data.id,
      name: data.name,
      initialBalance: Number(data.initial_balance) || 0
    }
  } catch (error) {
    console.error('❌ Errore in updateAccount:', error)
    throw error
  }
}

export async function deleteAccount(id) {
  try {
    if (!isSupabaseConfigured()) {
      const { deleteDemoAccount } = await import('./demo-storage.js')
      return deleteDemoAccount(id)
    }
    
    // Converti l'ID in numero se è una stringa numerica
    const accountId = isNaN(Number(id)) ? id : Number(id)
    
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Errore in deleteAccount:', error)
    throw error
  }
}

// Calcola il saldo di un conto usando Supabase
export async function calculateAccountBalance(accountId) {
  try {
    if (!isSupabaseConfigured()) {
      const { calculateAccountBalance: demoCalc } = await import('./demo-storage.js')
      return demoCalc(accountId)
    }
    
    // Converti l'ID in numero se è una stringa numerica
    const accId = isNaN(Number(accountId)) ? accountId : Number(accountId)
    
    // Ottieni il conto
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('initial_balance')
      .eq('id', accId)
      .single()
    
    if (accountError) {
      console.warn('⚠️ Conto non trovato per calcolo saldo:', accId)
      return 0
    }
    
    let balance = Number(account.initial_balance) || 0
    
    // Somma le entrate associate a questo conto
    const { data: incomes, error: incomesError } = await supabase
      .from('incomes')
      .select('amount')
      .eq('account_id', accId)
    
    if (!incomesError && incomes) {
      incomes.forEach(income => {
        balance += Number(income.amount) || 0
      })
    }
    
    // Sottrai le spese associate a questo conto
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('amount')
      .eq('account_id', accId)
    
    if (!expensesError && expenses) {
      expenses.forEach(expense => {
        balance -= Number(expense.amount) || 0
      })
    }
    
    return balance
  } catch (error) {
    console.error('Errore in calculateAccountBalance:', error)
    return 0
  }
}
