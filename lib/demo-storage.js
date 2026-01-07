// Importa fs e path solo lato server (Next.js gestisce questo automaticamente nelle API routes)
import fs from 'fs'
import path from 'path'

// Path del file di persistenza (solo se fs è disponibile)
const DATA_FILE = fs ? path.join(process.cwd(), 'demo-data.json') : null

// Funzione per caricare i dati dal file
function loadData() {
  if (!fs || !DATA_FILE) {
    // fs non disponibile, usa dati di default
    return getDefaultData()
  }
  
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf-8')
      const data = JSON.parse(fileContent)
      console.log('📂 Dati caricati da demo-data.json')
      return data
    }
  } catch (error) {
    console.warn('⚠️ Errore nel caricamento dei dati:', error.message)
  }
  
  return getDefaultData()
}

// Funzione per ottenere i dati di default
function getDefaultData() {
  // Dati di default se il file non esiste
  return {
    expenses: [],
    incomes: [],
    categories: [
      { id: 'demo-1', name: 'Alimentari', type: 'expenses', subcategories: [
        { id: 'sub-1', name: 'Supermercato' },
        { id: 'sub-2', name: 'Ristorante' }
      ]},
      { id: 'demo-2', name: 'Trasporti', type: 'expenses', subcategories: [
        { id: 'sub-3', name: 'Benzina' },
        { id: 'sub-4', name: 'Autobus' }
      ]},
      { id: 'demo-3', name: 'Casa', type: 'expenses', subcategories: [
        { id: 'sub-5', name: 'Affitto' },
        { id: 'sub-6', name: 'Bollette' }
      ]},
      { id: 'demo-4', name: 'Stipendio', type: 'incomes', subcategories: [
        { id: 'sub-7', name: 'Stipendio fisso' },
        { id: 'sub-8', name: 'Bonus' }
      ]},
      { id: 'demo-5', name: 'Freelance', type: 'incomes', subcategories: [
        { id: 'sub-9', name: 'Progetti web' },
        { id: 'sub-10', name: 'Consulenze' }
      ]}
    ],
    accounts: [
      { id: 'account-1', name: 'Contanti', initialBalance: 0 },
      { id: 'account-2', name: 'Conto Corrente', initialBalance: 0 }
    ],
    deadlines: []
  }
}

// Funzione per salvare i dati sul file
function saveData() {
  if (!fs || !DATA_FILE) {
    // fs non disponibile (serverless o lato client), salta il salvataggio
    console.warn('⚠️ fs non disponibile, salto il salvataggio (normale su Vercel/serverless)')
    return
  }
  
  // Su Vercel/serverless, il filesystem è read-only, quindi non possiamo salvare
  // I dati rimangono solo in memoria per la durata della funzione
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    console.warn('⚠️ Ambiente serverless rilevato, salto il salvataggio su file')
    return
  }
  
  try {
    const data = {
      expenses: demoExpenses.map(e => {
        // Gestisci correttamente le date
        let dateValue = e.date
        if (dateValue instanceof Date) {
          dateValue = dateValue.toISOString()
        } else if (typeof dateValue === 'string') {
          // Se è già una stringa, verifica che sia valida
          try {
            new Date(dateValue)
          } catch {
            dateValue = new Date().toISOString()
          }
        } else {
          dateValue = new Date().toISOString()
        }
        
        return {
          ...e,
          date: dateValue
        }
      }),
      incomes: demoIncomes.map(i => {
        // Gestisci correttamente le date
        let dateValue = i.date
        if (dateValue instanceof Date) {
          dateValue = dateValue.toISOString()
        } else if (typeof dateValue === 'string') {
          // Se è già una stringa, verifica che sia valida
          try {
            new Date(dateValue)
          } catch {
            dateValue = new Date().toISOString()
          }
        } else {
          dateValue = new Date().toISOString()
        }
        
        return {
          ...i,
          date: dateValue
        }
      }),
      categories: demoCategories,
      accounts: demoAccounts,
      deadlines: demoDeadlines.map(d => ({
        ...d,
        dueDate: d.dueDate instanceof Date ? d.dueDate.toISOString() : d.dueDate
      }))
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
    console.log('💾 Dati salvati su demo-data.json')
  } catch (error) {
    console.error('❌ Errore nel salvataggio dei dati:', error.message)
    console.error('❌ Stack trace:', error.stack)
    // Non lanciare l'errore, solo loggarlo per non bloccare l'operazione
  }
}

// Carica i dati all'avvio
const initialData = loadData()
let demoExpenses = (initialData.expenses || []).map(e => ({
  ...e,
  date: new Date(e.date) // Converti le date da stringa a Date
}))
let demoIncomes = (initialData.incomes || []).map(i => ({
  ...i,
  date: new Date(i.date) // Converti le date da stringa a Date
}))
let demoCategories = initialData.categories || []
let demoAccounts = initialData.accounts || []
let demoDeadlines = (initialData.deadlines || []).map(d => ({
  ...d,
  dueDate: new Date(d.dueDate) // Converti le date da stringa a Date
}))

export function getDemoExpenses(month = null) {
  if (!month) return demoExpenses
  
  return demoExpenses.filter(expense => {
    const expenseMonth = expense.date.toISOString().slice(0, 7)
    return expenseMonth === month
  })
}

export function addDemoExpense(expenseData) {
  const newExpense = {
    id: 'expense-' + Date.now(),
    description: expenseData.description,
    amount: expenseData.amount,
    date: expenseData.date,
    mainCategoryId: expenseData.mainCategoryId,
    subcategoryId: expenseData.subcategoryId,
    paymentMethod: expenseData.paymentMethod || 'contanti',
    accountId: expenseData.accountId || null,
    mainCategory: { name: expenseData.mainCategoryName },
    subcategory: { name: expenseData.subcategoryName }
  }
  demoExpenses.push(newExpense)
  saveData() // Salva dopo ogni modifica
  console.log('📝 Demo expense creato con paymentMethod:', newExpense.paymentMethod)
  return newExpense
}

export function getDemoIncomes(month = null) {
  if (!month) return demoIncomes
  
  return demoIncomes.filter(income => {
    const incomeMonth = income.date.toISOString().slice(0, 7)
    return incomeMonth === month
  })
}

export function addDemoIncome(incomeData) {
  const newIncome = {
    id: 'income-' + Date.now(),
    description: incomeData.description,
    amount: incomeData.amount,
    date: incomeData.date,
    mainCategoryId: incomeData.mainCategoryId,
    subcategoryId: incomeData.subcategoryId,
    paymentMethod: incomeData.paymentMethod || 'contanti',
    accountId: incomeData.accountId || null,
    mainCategory: { name: incomeData.mainCategoryName },
    subcategory: { name: incomeData.subcategoryName }
  }
  demoIncomes.push(newIncome)
  saveData() // Salva dopo ogni modifica
  console.log('📝 Demo income creato con paymentMethod:', newIncome.paymentMethod)
  return newIncome
}

export function updateDemoExpense(expenseData) {
  console.log('🔍 updateDemoExpense chiamata con:', expenseData)
  console.log('📋 Spese disponibili:', demoExpenses.map(e => ({ id: e.id, description: e.description })))
  
  // Cerca la spesa per ID
  const index = demoExpenses.findIndex(e => String(e.id) === String(expenseData.id))
  
  if (index === -1) {
    console.error('❌ Spesa non trovata con ID:', expenseData.id)
    console.error('📋 ID disponibili:', demoExpenses.map(e => e.id))
    throw new Error(`Spesa con ID ${expenseData.id} non trovata`)
  }
  
  console.log('✅ Spesa trovata all\'indice:', index)
  
  // Normalizza la data
  let dateValue = expenseData.date
  if (!(dateValue instanceof Date)) {
    dateValue = new Date(dateValue)
    if (isNaN(dateValue.getTime())) {
      console.warn('⚠️ Data non valida, uso data corrente')
      dateValue = new Date()
    }
  }
  
  console.log('📅 Data normalizzata:', dateValue)
  
  // Aggiorna la spesa
  demoExpenses[index] = {
    ...demoExpenses[index],
    description: expenseData.description,
    amount: expenseData.amount,
    date: dateValue,
    mainCategoryId: expenseData.mainCategoryId,
    subcategoryId: expenseData.subcategoryId,
    paymentMethod: expenseData.paymentMethod || 'contanti',
    accountId: expenseData.accountId || null,
    mainCategory: { name: expenseData.mainCategoryName },
    subcategory: { name: expenseData.subcategoryName }
  }
  
  console.log('✅ Spesa aggiornata:', demoExpenses[index])
  
  // Salva (non bloccare se fallisce)
  try {
    saveData()
  } catch (saveError) {
    console.warn('⚠️ Errore nel salvataggio (ignorato):', saveError.message)
  }
  
  return demoExpenses[index]
}

export function updateDemoIncome(incomeData) {
  console.log('🔍 updateDemoIncome chiamata con:', incomeData)
  console.log('📋 Entrate disponibili:', demoIncomes.map(i => ({ id: i.id, description: i.description })))
  
  try {
    // Cerca l'entrata per ID (confronta come stringa per sicurezza)
    const index = demoIncomes.findIndex(i => String(i.id) === String(incomeData.id))
    
    if (index !== -1) {
      console.log('✅ Entrata trovata all\'indice:', index)
      
      // Gestisci correttamente la data
      let dateValue = incomeData.date
      if (!(dateValue instanceof Date)) {
        try {
          dateValue = new Date(dateValue)
          if (isNaN(dateValue.getTime())) {
            console.warn('⚠️ Data non valida, uso data corrente')
            dateValue = new Date()
          }
        } catch (error) {
          console.warn('⚠️ Errore nel parsing della data, uso data corrente:', error.message)
          dateValue = new Date()
        }
      }
      
      demoIncomes[index] = {
        ...demoIncomes[index],
        description: incomeData.description || demoIncomes[index].description,
        amount: incomeData.amount || demoIncomes[index].amount,
        date: dateValue,
        mainCategoryId: incomeData.mainCategoryId || demoIncomes[index].mainCategoryId,
        subcategoryId: incomeData.subcategoryId || demoIncomes[index].subcategoryId,
        paymentMethod: incomeData.paymentMethod || demoIncomes[index].paymentMethod || 'contanti',
        accountId: incomeData.accountId !== undefined ? incomeData.accountId : demoIncomes[index].accountId,
        mainCategory: { name: incomeData.mainCategoryName || demoIncomes[index].mainCategory?.name || 'Altro' },
        subcategory: { name: incomeData.subcategoryName || demoIncomes[index].subcategory?.name || 'Altro' }
      }
      
      // Salva dopo ogni modifica (non bloccare se fallisce)
      try {
        saveData()
      } catch (saveError) {
        console.error('❌ Errore nel salvataggio (continuo comunque):', saveError.message)
      }
      
      console.log('📝 Demo income aggiornato con successo:', demoIncomes[index])
      return demoIncomes[index]
    }
    
    console.error('❌ Entrata non trovata con ID:', incomeData.id)
    console.error('📋 ID disponibili:', demoIncomes.map(i => i.id))
    return null
  } catch (error) {
    console.error('❌ Errore in updateDemoIncome:', error.message)
    console.error('❌ Stack trace:', error.stack)
    throw error
  }
}

export function deleteDemoExpense(expenseId) {
  const index = demoExpenses.findIndex(e => e.id === expenseId)
  if (index !== -1) {
    demoExpenses.splice(index, 1)
    saveData() // Salva dopo ogni modifica
    return true
  }
  return false
}

export function deleteDemoIncome(incomeId) {
  const index = demoIncomes.findIndex(i => i.id === incomeId)
  if (index !== -1) {
    demoIncomes.splice(index, 1)
    saveData() // Salva dopo ogni modifica
    return true
  }
  return false
}

export function getDemoCategories() {
  return demoCategories
}

export function addDemoCategory(name, type = 'expenses') {
  const newCategory = {
    id: 'cat-' + Date.now(),
    name: name,
    type: type,
    subcategories: []
  }
  demoCategories.push(newCategory)
  saveData() // Salva dopo ogni modifica
  return newCategory
}

export function addDemoSubcategory(name, mainCategoryId) {
  console.log('🔍 addDemoSubcategory chiamata con:', { name, mainCategoryId })
  console.log('📋 Categorie disponibili:', demoCategories.map(c => ({ id: c.id, name: c.name })))
  
  const category = demoCategories.find(cat => cat.id === mainCategoryId)
  if (category) {
    const newSubcategory = {
      id: 'sub-' + Date.now(),
      name: name
    }
    category.subcategories.push(newSubcategory)
    saveData() // Salva dopo ogni modifica
    console.log('✅ Sottocategoria aggiunta:', newSubcategory)
    return newSubcategory
  }
  console.error('❌ Categoria non trovata con ID:', mainCategoryId)
  return null
}

export function getDemoSubcategories(mainCategoryId) {
  const category = demoCategories.find(cat => cat.id === mainCategoryId)
  return category ? category.subcategories : []
}

export function deleteDemoSubcategory(mainCategoryName, subcategoryName) {
  const category = demoCategories.find(cat => cat.name === mainCategoryName)
  if (category) {
    const index = category.subcategories.findIndex(sub => sub.name === subcategoryName)
    if (index !== -1) {
      category.subcategories.splice(index, 1)
      saveData() // Salva dopo ogni modifica
      return true
    }
  }
  return false
}

export function deleteDemoCategory(categoryId) {
  const index = demoCategories.findIndex(cat => cat.id === categoryId)
  if (index !== -1) {
    demoCategories.splice(index, 1)
    saveData() // Salva dopo ogni modifica
    return true
  }
  return false
}

// Gestione conti (accounts)
export function getDemoAccounts() {
  return demoAccounts
}

export function addDemoAccount(name, initialBalance = 0) {
  const newAccount = {
    id: 'account-' + Date.now(),
    name: name,
    initialBalance: Number(initialBalance) || 0
  }
  demoAccounts.push(newAccount)
  saveData() // Salva dopo ogni modifica
  return newAccount
}

export function updateDemoAccount(accountId, name, initialBalance) {
  const index = demoAccounts.findIndex(acc => acc.id === accountId)
  if (index !== -1) {
    demoAccounts[index] = {
      ...demoAccounts[index],
      name: name || demoAccounts[index].name,
      initialBalance: initialBalance !== undefined ? Number(initialBalance) : demoAccounts[index].initialBalance
    }
    saveData() // Salva dopo ogni modifica
    return demoAccounts[index]
  }
  return null
}

export function deleteDemoAccount(accountId) {
  const index = demoAccounts.findIndex(acc => acc.id === accountId)
  if (index !== -1) {
    demoAccounts.splice(index, 1)
    saveData() // Salva dopo ogni modifica
    return true
  }
  return false
}

// Calcola il saldo totale di un conto
export function calculateAccountBalance(accountId) {
  const account = demoAccounts.find(acc => acc.id === accountId)
  if (!account) return 0
  
  // Saldo iniziale
  let balance = account.initialBalance || 0
  
  // Aggiungi entrate associate a questo conto
  const accountIncomes = demoIncomes.filter(income => income.accountId === accountId)
  accountIncomes.forEach(income => {
    balance += Number(income.amount) || 0
  })
  
  // Sottrai spese associate a questo conto
  const accountExpenses = demoExpenses.filter(expense => expense.accountId === accountId)
  accountExpenses.forEach(expense => {
    balance -= Number(expense.amount) || 0
  })
  
  return balance
}

// Gestione scadenze (deadlines)
// Nota: demoDeadlines è già dichiarato sopra quando si caricano i dati iniziali

export function getDemoDeadlines() {
  return demoDeadlines.map(d => ({
    ...d,
    dueDate: d.dueDate instanceof Date ? d.dueDate : new Date(d.dueDate)
  }))
}

export function addDemoDeadline(deadlineData) {
  const newDeadline = {
    id: 'deadline-' + Date.now(),
    description: deadlineData.description,
    amount: deadlineData.amount,
    dueDate: deadlineData.dueDate instanceof Date ? deadlineData.dueDate : new Date(deadlineData.dueDate),
    paid: deadlineData.paid || false
  }
  demoDeadlines.push(newDeadline)
  saveData()
  return newDeadline
}

export function updateDemoDeadline(id, updates) {
  const index = demoDeadlines.findIndex(d => String(d.id) === String(id))
  if (index !== -1) {
    demoDeadlines[index] = {
      ...demoDeadlines[index],
      ...updates
    }
    saveData()
    return demoDeadlines[index]
  }
  return null
}

export function deleteDemoDeadline(id) {
  const index = demoDeadlines.findIndex(d => String(d.id) === String(id))
  if (index !== -1) {
    demoDeadlines.splice(index, 1)
    saveData()
    return true
  }
  return false
}
