// Storage temporaneo per la modalità demo
let demoExpenses = []
let demoIncomes = []
let demoCategories = [
  { id: 'demo-1', name: 'Alimentari', subcategories: [
    { id: 'sub-1', name: 'Supermercato' },
    { id: 'sub-2', name: 'Ristorante' }
  ]},
  { id: 'demo-2', name: 'Trasporti', subcategories: [
    { id: 'sub-3', name: 'Benzina' },
    { id: 'sub-4', name: 'Autobus' }
  ]},
  { id: 'demo-3', name: 'Casa', subcategories: [
    { id: 'sub-5', name: 'Affitto' },
    { id: 'sub-6', name: 'Bollette' }
  ]},
  { id: 'demo-4', name: 'Stipendio', subcategories: [
    { id: 'sub-7', name: 'Stipendio fisso' },
    { id: 'sub-8', name: 'Bonus' }
  ]},
  { id: 'demo-5', name: 'Freelance', subcategories: [
    { id: 'sub-9', name: 'Progetti web' },
    { id: 'sub-10', name: 'Consulenze' }
  ]}
]

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
    mainCategory: { name: expenseData.mainCategoryName },
    subcategory: { name: expenseData.subcategoryName }
  }
  demoExpenses.push(newExpense)
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
    mainCategory: { name: incomeData.mainCategoryName },
    subcategory: { name: incomeData.subcategoryName }
  }
  demoIncomes.push(newIncome)
  console.log('📝 Demo income creato con paymentMethod:', newIncome.paymentMethod)
  return newIncome
}

export function updateDemoExpense(expenseData) {
  const index = demoExpenses.findIndex(e => e.id === expenseData.id)
  if (index !== -1) {
    demoExpenses[index] = {
      ...demoExpenses[index],
      description: expenseData.description,
      amount: expenseData.amount,
      date: expenseData.date,
      mainCategoryId: expenseData.mainCategoryId,
      subcategoryId: expenseData.subcategoryId,
      paymentMethod: expenseData.paymentMethod || 'contanti',
      mainCategory: { name: expenseData.mainCategoryName },
      subcategory: { name: expenseData.subcategoryName }
    }
    console.log('📝 Demo expense aggiornato con paymentMethod:', demoExpenses[index].paymentMethod)
    return demoExpenses[index]
  }
  return null
}

export function updateDemoIncome(incomeData) {
  const index = demoIncomes.findIndex(i => i.id === incomeData.id)
  if (index !== -1) {
    demoIncomes[index] = {
      ...demoIncomes[index],
      description: incomeData.description,
      amount: incomeData.amount,
      date: incomeData.date,
      mainCategoryId: incomeData.mainCategoryId,
      subcategoryId: incomeData.subcategoryId,
      paymentMethod: incomeData.paymentMethod || 'contanti',
      mainCategory: { name: incomeData.mainCategoryName },
      subcategory: { name: incomeData.subcategoryName }
    }
    console.log('📝 Demo income aggiornato con paymentMethod:', demoIncomes[index].paymentMethod)
    return demoIncomes[index]
  }
  return null
}

export function getDemoCategories() {
  return demoCategories
}

export function addDemoCategory(name) {
  const newCategory = {
    id: 'cat-' + Date.now(),
    name: name,
    subcategories: []
  }
  demoCategories.push(newCategory)
  return newCategory
}

export function addDemoSubcategory(name, mainCategoryId) {
  const category = demoCategories.find(cat => cat.id === mainCategoryId)
  if (category) {
    const newSubcategory = {
      id: 'sub-' + Date.now(),
      name: name
    }
    category.subcategories.push(newSubcategory)
    return newSubcategory
  }
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
      return true
    }
  }
  return false
}

export function deleteDemoCategory(categoryId) {
  const index = demoCategories.findIndex(cat => cat.id === categoryId)
  if (index !== -1) {
    demoCategories.splice(index, 1)
    return true
  }
  return false
}