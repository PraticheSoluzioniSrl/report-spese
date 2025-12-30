'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { changePasswordAction } from '../../lib/actions'

export default function SettingsSection () {
  const [expenseCategories, setExpenseCategories] = useState([])
  const [incomeCategories, setIncomeCategories] = useState([])
  const [accounts, setAccounts] = useState([])
  const [selectedExpense, setSelectedExpense] = useState('')
  const [selectedIncome, setSelectedIncome] = useState('')
  const [editingAccount, setEditingAccount] = useState(null)
  const [activeTab, setActiveTab] = useState('expenses')
  const sp = useSearchParams()

  async function loadExpenses () {
    try {
      const response = await fetch('/api/categories?type=expenses')
      if (!response.ok) throw new Error('Errore nel caricamento delle categorie spese')
      const data = await response.json()
      setExpenseCategories(data || [])
      if (data && data.length && !selectedExpense) setSelectedExpense(data[0].name)
    } catch (error) {
      console.error('Errore nel caricamento delle categorie spese:', error)
      setExpenseCategories([])
    }
  }

  async function loadIncomes () {
    try {
      const response = await fetch('/api/categories?type=incomes')
      if (!response.ok) throw new Error('Errore nel caricamento delle categorie entrate')
      const data = await response.json()
      setIncomeCategories(data || [])
      if (data && data.length && !selectedIncome) setSelectedIncome(data[0].name)
    } catch (error) {
      console.error('Errore nel caricamento delle categorie entrate:', error)
      setIncomeCategories([])
    }
  }

  async function loadAccounts () {
    try {
      const response = await fetch('/api/accounts')
      if (!response.ok) throw new Error('Errore nel caricamento dei conti')
      const data = await response.json()
      setAccounts(data || [])
    } catch (error) {
      console.error('Errore nel caricamento dei conti:', error)
      setAccounts([])
    }
  }

  async function load () {
    await loadExpenses()
    await loadIncomes()
    await loadAccounts()
  }

  useEffect(() => { load() }, [])

  const expenseSubcats = useMemo(() => expenseCategories.find(c => c.name === selectedExpense)?.subcategories || [], [expenseCategories, selectedExpense])
  const incomeSubcats = useMemo(() => incomeCategories.find(c => c.name === selectedIncome)?.subcategories || [], [incomeCategories, selectedIncome])

  async function addMain (e) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const type = activeTab === 'expenses' ? 'expenses' : 'incomes'
    fd.set('type', type)
    try {
      const response = await fetch('/api/categories', { method: 'POST', body: fd })
      const data = await response.json()
      if (!response.ok) {
        const errorMsg = data.error || 'Errore nella creazione della categoria'
        console.error('Errore API:', errorMsg, data)
        alert(errorMsg)
        return
      }
      console.log('Categoria creata con successo:', data)
      form.reset()
      if (activeTab === 'expenses') {
        await loadExpenses()
      } else {
        await loadIncomes()
      }
    } catch (error) {
      console.error('Errore nella creazione della categoria:', error)
      alert('Errore durante la creazione della categoria: ' + error.message)
    }
  }

  async function deleteMain (name) {
    try {
      const response = await fetch(`/api/categories/${encodeURIComponent(name)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Errore nell\'eliminazione della categoria')
      if (activeTab === 'expenses') {
        await loadExpenses()
      } else {
        await loadIncomes()
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione della categoria:', error)
      alert('Errore durante l\'eliminazione della categoria')
    }
  }

  async function addSub (e) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const categoryName = fd.get('mainName')
    const categories = activeTab === 'expenses' ? expenseCategories : incomeCategories
    const category = categories.find(c => c.name === categoryName)
    if (category) {
      try {
        fd.set('mainCategoryId', category.id)
        const response = await fetch('/api/subcategories', { method: 'POST', body: fd })
        if (!response.ok) throw new Error('Errore nella creazione della sottocategoria')
        
        // Reset del form solo se esiste
        if (form) {
          form.reset()
        }
        
        if (activeTab === 'expenses') {
          await loadExpenses()
        } else {
          await loadIncomes()
        }
      } catch (error) {
        console.error('Errore nella creazione della sottocategoria:', error)
        alert('Errore durante la creazione della sottocategoria')
      }
    } else {
      alert('Errore: Categoria non trovata. Ricarica la pagina e riprova.')
    }
  }

  async function deleteSub (mainName, subName) {
    try {
      const response = await fetch(`/api/subcategories?main=${encodeURIComponent(mainName)}&sub=${encodeURIComponent(subName)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Errore nell\'eliminazione della sottocategoria')
      if (activeTab === 'expenses') {
        await loadExpenses()
      } else {
        await loadIncomes()
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione della sottocategoria:', error)
      alert('Errore durante l\'eliminazione della sottocategoria')
    }
  }

  async function addAccount (e) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    try {
      const response = await fetch('/api/accounts', { method: 'POST', body: fd })
      if (!response.ok) throw new Error('Errore nella creazione del conto')
      form.reset()
      await loadAccounts()
    } catch (error) {
      console.error('Errore nella creazione del conto:', error)
      alert('Errore durante la creazione del conto')
    }
  }

  async function updateAccount (e) {
    e.preventDefault()
    if (!editingAccount) return
    const form = e.currentTarget
    const fd = new FormData(form)
    try {
      const response = await fetch(`/api/accounts/${editingAccount.id}`, { method: 'PUT', body: fd })
      if (!response.ok) throw new Error('Errore nell\'aggiornamento del conto')
      form.reset()
      setEditingAccount(null)
      await loadAccounts()
    } catch (error) {
      console.error('Errore nell\'aggiornamento del conto:', error)
      alert('Errore durante l\'aggiornamento del conto')
    }
  }

  async function deleteAccount (id) {
    if (!confirm('Sei sicuro di voler eliminare questo conto?')) return
    try {
      const response = await fetch(`/api/accounts/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Errore nell\'eliminazione del conto')
      await loadAccounts()
    } catch (error) {
      console.error('Errore nell\'eliminazione del conto:', error)
      alert('Errore durante l\'eliminazione del conto')
    }
  }

  return (
    <div className='w-full max-w-5xl mx-auto bg-white rounded-2xl shadow p-6'>
      <h3 className='text-xl font-semibold mb-4 border-b pb-2'>Impostazioni</h3>
      
      {/* Cambio Password */}
      <div className='mb-8 p-4 bg-gray-50 rounded-lg'>
        <h4 className='font-semibold mb-2'>Cambio Password</h4>
        <form action={changePasswordAction} className='grid grid-cols-1 md:grid-cols-3 gap-4 items-end'>
          <div>
            <label className='block text-sm font-medium text-gray-600 mb-1'>Password attuale</label>
            <input name='current' type='password' className='w-full px-4 py-2 border rounded-lg' required />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-600 mb-1'>Nuova password</label>
            <input name='next' type='password' className='w-full px-4 py-2 border rounded-lg' required />
          </div>
          <button className='bg-blue-600 text-white px-4 py-2 rounded-lg'>Aggiorna</button>
        </form>
        {sp.get('pwd') === 'ok' && <p className='text-green-700 text-sm mt-2'>Password aggiornata con successo.</p>}
        {sp.get('pwd') === 'wrong' && <p className='text-red-600 text-sm mt-2'>Password attuale errata.</p>}
        {sp.get('pwd') === 'weak' && <p className='text-red-600 text-sm mt-2'>La nuova password deve avere almeno 6 caratteri.</p>}
        {sp.get('pwd') === 'error' && <p className='text-red-600 text-sm mt-2'>Errore aggiornamento password.</p>}
      </div>

      {/* Gestione Categorie */}
      <div className='mb-6'>
        <h4 className='font-semibold mb-4'>Gestione Categorie</h4>
        
        {/* Tab Navigation */}
        <div className='flex mb-4 border-b'>
          <button 
            onClick={() => { setActiveTab('expenses'); setEditingAccount(null) }}
            className={`px-4 py-2 font-medium ${activeTab === 'expenses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Categorie Spese
          </button>
          <button 
            onClick={() => { setActiveTab('incomes'); setEditingAccount(null) }}
            className={`px-4 py-2 font-medium ${activeTab === 'incomes' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
          >
            Categorie Entrate
          </button>
          <button 
            onClick={() => { setActiveTab('accounts'); setEditingAccount(null) }}
            className={`px-4 py-2 font-medium ${activeTab === 'accounts' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
          >
            Conti
          </button>
        </div>

        {activeTab === 'accounts' ? (
          <div>
            <h5 className='font-semibold mb-4'>Gestione Conti</h5>
            <form onSubmit={editingAccount ? updateAccount : addAccount} className='space-y-4 mb-6 p-4 bg-gray-50 rounded-lg'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Nome Conto</label>
                  <input 
                    name='name' 
                    type='text' 
                    placeholder='Es. Contanti, Conto Corrente' 
                    className='w-full px-4 py-2 border rounded-lg' 
                    required 
                    defaultValue={editingAccount?.name || ''}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Saldo Iniziale (€)</label>
                  <input 
                    name='initialBalance' 
                    type='number' 
                    step='0.01' 
                    placeholder='0.00' 
                    className='w-full px-4 py-2 border rounded-lg' 
                    required 
                    defaultValue={editingAccount?.initialBalance || '0'}
                  />
                </div>
                <div className='flex items-end gap-2'>
                  <button type='submit' className='flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700'>
                    {editingAccount ? 'Aggiorna' : 'Aggiungi'}
                  </button>
                  {editingAccount && (
                    <button 
                      type='button' 
                      onClick={() => setEditingAccount(null)} 
                      className='bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600'
                    >
                      Annulla
                    </button>
                  )}
                </div>
              </div>
            </form>
            <ul className='space-y-2'>
              {accounts.map(account => (
                <li key={account.id} className='flex justify-between items-center p-3 bg-gray-100 rounded-lg'>
                  <div>
                    <span className='font-semibold'>{account.name}</span>
                    <span className='text-sm text-gray-600 ml-2'>
                      Saldo iniziale: € {account.initialBalance?.toFixed(2) || '0.00'}
                    </span>
                    <span className='text-sm text-gray-600 ml-2'>
                      Saldo attuale: € {account.currentBalance?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className='flex gap-2'>
                    <button 
                      onClick={() => setEditingAccount(account)} 
                      className='text-blue-500 hover:text-blue-700 text-sm font-medium px-2 py-1 border border-blue-500 rounded hover:bg-blue-50'
                    >
                      Modifica
                    </button>
                    <button 
                      onClick={() => deleteAccount(account.id)} 
                      className='text-red-500 hover:text-red-700 text-xl font-bold'
                    >
                      &times;
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div>
              <h5 className='font-semibold mb-2'>Categorie Principali</h5>
              <form onSubmit={addMain} className='flex gap-2 mb-4'>
                <input name='name' type='text' placeholder='Nuova categoria' className='w-full px-4 py-2 border rounded-lg' required />
                <button className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'>Aggiungi</button>
              </form>
              <ul className='space-y-2'>
                {(activeTab === 'expenses' ? expenseCategories : incomeCategories).map(c => (
                  <li key={c.name} className='flex justify-between items-center p-2 bg-gray-100 rounded'>
                    <span>{c.name}</span>
                    <button onClick={() => deleteMain(c.name)} className='text-red-500 hover:text-red-700 text-xl font-bold'>&times;</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className='font-semibold mb-2'>Sottocategorie</h5>
              <form onSubmit={addSub} className='space-y-2 mb-4'>
                <select 
                  name='mainName' 
                  value={activeTab === 'expenses' ? selectedExpense : selectedIncome} 
                  onChange={e => activeTab === 'expenses' ? setSelectedExpense(e.target.value) : setSelectedIncome(e.target.value)} 
                  className='w-full px-4 py-2 border rounded-lg'
                >
                  {(activeTab === 'expenses' ? expenseCategories : incomeCategories).map(c => 
                    <option key={c.name} value={c.name}>{c.name}</option>
                  )}
                </select>
                <div className='flex gap-2'>
                  <input name='name' type='text' placeholder='Nuova sottocategoria' className='w-full px-4 py-2 border rounded-lg' required />
                  <button className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'>Aggiungi</button>
                </div>
              </form>
              <ul className='space-y-2'>
                {(activeTab === 'expenses' ? expenseSubcats : incomeSubcats).map((s, index) => (
                  <li key={`${s}-${index}`} className='flex justify-between items-center p-2 bg-gray-100 rounded'>
                    <span>{s}</span>
                    <button 
                      onClick={() => deleteSub(activeTab === 'expenses' ? selectedExpense : selectedIncome, s)} 
                      className='text-red-500 hover:text-red-700 text-xl font-bold'
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

