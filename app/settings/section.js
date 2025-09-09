'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { changePasswordAction } from '../../lib/actions'

export default function SettingsSection () {
  const [expenseCategories, setExpenseCategories] = useState([])
  const [incomeCategories, setIncomeCategories] = useState([])
  const [selectedExpense, setSelectedExpense] = useState('')
  const [selectedIncome, setSelectedIncome] = useState('')
  const [activeTab, setActiveTab] = useState('expenses')
  const sp = useSearchParams()

  async function loadExpenses () {
    const data = await fetch('/api/categories?type=expenses').then(r => r.json())
    setExpenseCategories(data)
    if (data.length && !selectedExpense) setSelectedExpense(data[0].name)
  }

  async function loadIncomes () {
    const data = await fetch('/api/categories?type=incomes').then(r => r.json())
    setIncomeCategories(data)
    if (data.length && !selectedIncome) setSelectedIncome(data[0].name)
  }

  async function load () {
    await loadExpenses()
    await loadIncomes()
  }

  useEffect(() => { load() }, [])

  const expenseSubcats = useMemo(() => expenseCategories.find(c => c.name === selectedExpense)?.subcategories || [], [expenseCategories, selectedExpense])
  const incomeSubcats = useMemo(() => incomeCategories.find(c => c.name === selectedIncome)?.subcategories || [], [incomeCategories, selectedIncome])

  async function addMain (e) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    await fetch('/api/categories', { method: 'POST', body: fd })
    form.reset()
    if (activeTab === 'expenses') {
      await loadExpenses()
    } else {
      await loadIncomes()
    }
  }

  async function deleteMain (name) {
    await fetch(`/api/categories/${encodeURIComponent(name)}`, { method: 'DELETE' })
    if (activeTab === 'expenses') {
      await loadExpenses()
    } else {
      await loadIncomes()
    }
  }

  async function addSub (e) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const categoryName = fd.get('mainName')
    const categories = activeTab === 'expenses' ? expenseCategories : incomeCategories
    const category = categories.find(c => c.name === categoryName)
    if (category) {
      fd.set('mainCategoryId', category.id)
      await fetch('/api/subcategories', { method: 'POST', body: fd })
      e.currentTarget.reset()
      if (activeTab === 'expenses') {
        await loadExpenses()
      } else {
        await loadIncomes()
      }
    }
  }

  async function deleteSub (mainName, subName) {
    await fetch(`/api/subcategories?main=${encodeURIComponent(mainName)}&sub=${encodeURIComponent(subName)}`, { method: 'DELETE' })
    if (activeTab === 'expenses') {
      await loadExpenses()
    } else {
      await loadIncomes()
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
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 font-medium ${activeTab === 'expenses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Categorie Spese
          </button>
          <button 
            onClick={() => setActiveTab('incomes')}
            className={`px-4 py-2 font-medium ${activeTab === 'incomes' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
          >
            Categorie Entrate
          </button>
        </div>

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
                <input name='subName' type='text' placeholder='Nuova sottocategoria' className='w-full px-4 py-2 border rounded-lg' required />
                <button className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'>Aggiungi</button>
              </div>
            </form>
            <ul className='space-y-2'>
              {(activeTab === 'expenses' ? expenseSubcats : incomeSubcats).map(s => (
                <li key={s} className='flex justify-between items-center p-2 bg-gray-100 rounded'>
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
      </div>
    </div>
  )
}

