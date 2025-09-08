import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'

// Verifica se Firebase è configurato
const isFirebaseConfigured = () => {
  return process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
}

// Funzione helper per gestire errori Firebase
const handleFirebaseError = (error, operation) => {
  if (!isFirebaseConfigured()) {
    console.error(`❌ Firebase non configurato per ${operation}. Configura le variabili d'ambiente.`)
    throw new Error('Firebase non configurato. Configura le variabili d\'ambiente.')
  }
  console.error(`❌ Errore Firebase durante ${operation}:`, error)
  throw error
}

// Funzioni per MainCategory
export async function getMainCategories() {
  try {
    if (!isFirebaseConfigured()) {
      console.warn('⚠️ Firebase non configurato, restituisco array vuoto per getMainCategories')
      return []
    }
    const categoriesRef = collection(db, 'mainCategories')
    const q = query(categoriesRef, orderBy('name', 'asc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    handleFirebaseError(error, 'getMainCategories')
  }
}

export async function createMainCategory(name) {
  try {
    if (!isFirebaseConfigured()) {
      console.warn('⚠️ Firebase non configurato, simulo creazione categoria')
      return { id: 'demo-' + Date.now() }
    }
    const categoriesRef = collection(db, 'mainCategories')
    return await addDoc(categoriesRef, {
      name,
      createdAt: serverTimestamp()
    })
  } catch (error) {
    handleFirebaseError(error, 'createMainCategory')
  }
}

export async function deleteMainCategory(id) {
  const categoryRef = doc(db, 'mainCategories', id)
  return await deleteDoc(categoryRef)
}

// Funzioni per Subcategory
export async function getSubcategories(mainCategoryId) {
  const subcategoriesRef = collection(db, 'subcategories')
  const q = query(subcategoriesRef, where('mainCategoryId', '==', mainCategoryId), orderBy('name', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

export async function createSubcategory(name, mainCategoryId) {
  const subcategoriesRef = collection(db, 'subcategories')
  return await addDoc(subcategoriesRef, {
    name,
    mainCategoryId,
    createdAt: serverTimestamp()
  })
}

export async function deleteSubcategory(id) {
  const subcategoryRef = doc(db, 'subcategories', id)
  return await deleteDoc(subcategoryRef)
}

// Funzioni per Expense
export async function getExpenses(month = null) {
  try {
    if (!isFirebaseConfigured()) {
      console.warn('⚠️ Firebase non configurato, restituisco array vuoto per getExpenses')
      return []
    }
    const expensesRef = collection(db, 'expenses')
    let q = query(expensesRef, orderBy('date', 'desc'))
    
    if (month) {
      const startDate = new Date(month + '-01')
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      q = query(expensesRef, 
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      )
    }
    
    const snapshot = await getDocs(q)
    const expenses = []
    
    for (const docSnapshot of snapshot.docs) {
      const expense = { id: docSnapshot.id, ...docSnapshot.data() }
      
      // Carica categoria principale
      if (expense.mainCategoryId) {
        const mainCategory = await getDoc(doc(db, 'mainCategories', expense.mainCategoryId))
        expense.mainCategory = { id: mainCategory.id, ...mainCategory.data() }
      }
      
      // Carica sottocategoria
      if (expense.subcategoryId) {
        const subcategory = await getDoc(doc(db, 'subcategories', expense.subcategoryId))
        expense.subcategory = { id: subcategory.id, ...subcategory.data() }
      }
      
      expenses.push(expense)
    }
    
    return expenses
  } catch (error) {
    handleFirebaseError(error, 'getExpenses')
  }
}

export async function createExpense(expenseData) {
  const expensesRef = collection(db, 'expenses')
  return await addDoc(expensesRef, {
    ...expenseData,
    createdAt: serverTimestamp()
  })
}

export async function deleteExpense(id) {
  const expenseRef = doc(db, 'expenses', id)
  return await deleteDoc(expenseRef)
}

// Funzioni per Income
export async function getIncomes(month = null) {
  try {
    if (!isFirebaseConfigured()) {
      console.warn('⚠️ Firebase non configurato, restituisco array vuoto per getIncomes')
      return []
    }
    const incomesRef = collection(db, 'incomes')
    let q = query(incomesRef, orderBy('date', 'desc'))
    
    if (month) {
      const startDate = new Date(month + '-01')
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      q = query(incomesRef, 
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      )
    }
    
    const snapshot = await getDocs(q)
    const incomes = []
    
    for (const docSnapshot of snapshot.docs) {
      const income = { id: docSnapshot.id, ...docSnapshot.data() }
      
      // Carica categoria principale
      if (income.mainCategoryId) {
        const mainCategory = await getDoc(doc(db, 'mainCategories', income.mainCategoryId))
        income.mainCategory = { id: mainCategory.id, ...mainCategory.data() }
      }
      
      // Carica sottocategoria
      if (income.subcategoryId) {
        const subcategory = await getDoc(doc(db, 'subcategories', income.subcategoryId))
        income.subcategory = { id: subcategory.id, ...subcategory.data() }
      }
      
      incomes.push(income)
    }
    
    return incomes
  } catch (error) {
    handleFirebaseError(error, 'getIncomes')
  }
}

export async function createIncome(incomeData) {
  const incomesRef = collection(db, 'incomes')
  return await addDoc(incomesRef, {
    ...incomeData,
    createdAt: serverTimestamp()
  })
}

export async function deleteIncome(id) {
  const incomeRef = doc(db, 'incomes', id)
  return await deleteDoc(incomeRef)
}

// Funzioni per Deadline
export async function getDeadlines() {
  const deadlinesRef = collection(db, 'deadlines')
  const q = query(deadlinesRef, orderBy('dueDate', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

export async function createDeadline(deadlineData) {
  const deadlinesRef = collection(db, 'deadlines')
  return await addDoc(deadlinesRef, {
    ...deadlineData,
    createdAt: serverTimestamp()
  })
}

export async function updateDeadline(id, updates) {
  const deadlineRef = doc(db, 'deadlines', id)
  return await updateDoc(deadlineRef, updates)
}

export async function deleteDeadline(id) {
  const deadlineRef = doc(db, 'deadlines', id)
  return await deleteDoc(deadlineRef)
}

// Funzioni per User
export async function getUser() {
  try {
    if (!isFirebaseConfigured()) {
      console.warn('⚠️ Firebase non configurato, restituisco utente demo')
      return {
        id: 'demo-user',
        username: 'admin',
        passwordHash: '$2a$10$demo.hash.for.testing.purposes.only'
      }
    }
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)
    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() }
  } catch (error) {
    handleFirebaseError(error, 'getUser')
  }
}

export async function createUser(userData) {
  const usersRef = collection(db, 'users')
  return await addDoc(usersRef, {
    ...userData,
    createdAt: serverTimestamp()
  })
}

export async function updateUser(id, updates) {
  const userRef = doc(db, 'users', id)
  return await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}
