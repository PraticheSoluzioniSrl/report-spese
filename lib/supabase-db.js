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
      return [
        { id: 'demo-1', name: 'Alimentari', type: 'expenses' },
        { id: 'demo-2', name: 'Trasporti', type: 'expenses' },
        { id: 'demo-3', name: 'Casa', type: 'expenses' }
      ]
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
    handleError(error, 'getMainCategories')
    return []
  }
}

export async function createMainCategory(categoryData) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, simulo creazione categoria')
      return { id: 'demo-' + Date.now(), name: categoryData.name, type: categoryData.type || 'expenses' }
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
    handleError(error, 'createMainCategory')
    return { id: 'demo-' + Date.now(), name: categoryData.name, type: categoryData.type || 'expenses' }
  }
}

export async function deleteMainCategory(id) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, simulo eliminazione categoria')
      return
    }
    
    const { error } = await supabase
      .from('main_categories')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    handleError(error, 'deleteMainCategory')
  }
}

// Funzioni per Subcategory
export async function getSubcategories(mainCategoryId) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, restituisco sottocategorie demo')
      const demoSubs = {
        'demo-1': [{ id: 'sub-1', name: 'Supermercato' }, { id: 'sub-2', name: 'Ristorante' }],
        'demo-2': [{ id: 'sub-3', name: 'Benzina' }, { id: 'sub-4', name: 'Autobus' }],
        'demo-3': [{ id: 'sub-5', name: 'Affitto' }, { id: 'sub-6', name: 'Bollette' }]
      }
      return demoSubs[mainCategoryId] || []
    }
    
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('main_category_id', mainCategoryId)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    handleError(error, 'getSubcategories')
    return []
  }
}

export async function createSubcategory(subcategoryData) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, simulo creazione sottocategoria')
      return { id: 'sub-demo-' + Date.now() }
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
    handleError(error, 'createSubcategory')
    return { id: 'sub-demo-' + Date.now() }
  }
}

export async function deleteSubcategory(id) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, simulo eliminazione sottocategoria')
      return
    }
    
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    handleError(error, 'deleteSubcategory')
  }
}

// Funzioni per Expense
export async function getExpenses(month = null) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, restituisco array vuoto per getExpenses')
      return []
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
      mainCategory: expense.main_categories ? { name: expense.main_categories.name } : null,
      subcategory: expense.subcategories ? { name: expense.subcategories.name } : null
    }))
  } catch (error) {
    handleError(error, 'getExpenses')
    return []
  }
}

export async function createExpense(expenseData) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, simulo creazione spesa')
      return { id: 'expense-demo-' + Date.now() }
    }
    
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        description: expenseData.description,
        amount: expenseData.amount,
        date: expenseData.date.toISOString(),
        main_category_id: expenseData.mainCategoryId,
        subcategory_id: expenseData.subcategoryId
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleError(error, 'createExpense')
    return { id: 'expense-demo-' + Date.now() }
  }
}

export async function deleteExpense(id) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, simulo eliminazione spesa')
      return
    }
    
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    handleError(error, 'deleteExpense')
  }
}

// Funzioni per Income
export async function getIncomes(month = null) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, restituisco array vuoto per getIncomes')
      return []
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
      mainCategory: income.main_categories ? { name: income.main_categories.name } : null,
      subcategory: income.subcategories ? { name: income.subcategories.name } : null
    }))
  } catch (error) {
    handleError(error, 'getIncomes')
    return []
  }
}

export async function createIncome(incomeData) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, simulo creazione incasso')
      return { id: 'income-demo-' + Date.now() }
    }
    
    const { data, error } = await supabase
      .from('incomes')
      .insert([{
        description: incomeData.description,
        amount: incomeData.amount,
        date: incomeData.date.toISOString(),
        main_category_id: incomeData.mainCategoryId,
        subcategory_id: incomeData.subcategoryId
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleError(error, 'createIncome')
    return { id: 'income-demo-' + Date.now() }
  }
}

export async function deleteIncome(id) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, simulo eliminazione incasso')
      return
    }
    
    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    handleError(error, 'deleteIncome')
  }
}

// Funzioni per Deadline
export async function getDeadlines() {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, restituisco array vuoto per getDeadlines')
      return []
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
      paid: deadline.paid
    }))
  } catch (error) {
    handleError(error, 'getDeadlines')
    return []
  }
}

export async function createDeadline(deadlineData) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, simulo creazione scadenza')
      return { id: 'deadline-demo-' + Date.now() }
    }
    
    const { data, error } = await supabase
      .from('deadlines')
      .insert([{
        description: deadlineData.description,
        amount: deadlineData.amount,
        due_date: deadlineData.dueDate.toISOString(),
        paid: deadlineData.paid || false
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleError(error, 'createDeadline')
    return { id: 'deadline-demo-' + Date.now() }
  }
}

export async function updateDeadline(id, updates) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, simulo aggiornamento scadenza')
      return
    }
    
    const { error } = await supabase
      .from('deadlines')
      .update(updates)
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    handleError(error, 'updateDeadline')
  }
}

export async function deleteDeadline(id) {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase non configurato, simulo eliminazione scadenza')
      return
    }
    
    const { error } = await supabase
      .from('deadlines')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    handleError(error, 'deleteDeadline')
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
    
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()
    
    if (error) throw error
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
      return
    }
    
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    handleError(error, 'updateUser')
  }
}
