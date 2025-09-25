'use client'
import { useEffect, useMemo, useState } from 'react'
import { getDefaultMonth } from '../../lib/month-utils'

export default function IncomesSection () {
  const [months, setMonths] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [incomes, setIncomes] = useState([])
  const [categories, setCategories] = useState([])
  const [filterMainCategory, setFilterMainCategory] = useState('')
  const [filterSubcategory, setFilterSubcategory] = useState('')

  useEffect(() => {
    fetch('/api/incomes/months').then(r => r.json()).then(data => {
      setMonths(data)
      // Usa la funzione centralizzata per determinare il mese di default
      const defaultMonth = getDefaultMonth()
      if (data.includes(defaultMonth)) {
        setSelectedMonth(defaultMonth)
      } else if (data.length > 0) {
        setSelectedMonth(data[0])
      }
    })
    fetch('/api/categories?type=incomes').then(r => r.json()).then(setCategories)
  }, [])

  // Imposta la data corrente nel form quando viene caricato
  useEffect(() => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const dateInput = document.querySelector('input[name="date"]')
    if (dateInput) {
      dateInput.value = todayStr
    }
  }, [])

  useEffect(() => {
    if (!selectedMonth) { setIncomes([]); return }
    fetch(`/api/incomes?month=${selectedMonth}`).then(r => r.json()).then(setIncomes)
  }, [selectedMonth])

  const totalsByMain = useMemo(() => {
    const totals = {}
    for (const cat of categories) totals[cat.name] = 0
    for (const e of incomes) {
      totals[e.mainCategory.name] = (totals[e.mainCategory.name] || 0) + Number(e.amount)
    }
    return totals
  }, [incomes, categories])

  const grandTotal = useMemo(() => Object.values(totalsByMain).reduce((a, b) => a + b, 0), [totalsByMain])

  // Filtra le entrate in base ai filtri selezionati
  const filteredIncomes = useMemo(() => {
    return incomes.filter(income => {
      const matchesMainCategory = !filterMainCategory || income.mainCategory.name === filterMainCategory
      const matchesSubcategory = !filterSubcategory || income.subcategory.name === filterSubcategory
      return matchesMainCategory && matchesSubcategory
    })
  }, [incomes, filterMainCategory, filterSubcategory])

  // Calcola il totale delle entrate filtrate
  const filteredTotal = useMemo(() => {
    return filteredIncomes.reduce((sum, income) => sum + Number(income.amount), 0)
  }, [filteredIncomes])

  // Funzione per generare colori in base al valore (verde acceso a sbiadito)
  const getCategoryColor = (amount, maxAmount) => {
    if (amount === 0) return 'bg-gray-200 text-gray-600'
    
    const intensity = maxAmount > 0 ? amount / maxAmount : 0
    
    if (intensity >= 0.9) return 'bg-green-600 text-white'
    if (intensity >= 0.8) return 'bg-green-500 text-white'
    if (intensity >= 0.7) return 'bg-green-400 text-white'
    if (intensity >= 0.6) return 'bg-green-300 text-gray-800'
    if (intensity >= 0.5) return 'bg-green-200 text-gray-800'
    if (intensity >= 0.4) return 'bg-green-100 text-gray-800'
    if (intensity >= 0.3) return 'bg-emerald-100 text-gray-800'
    if (intensity >= 0.2) return 'bg-emerald-50 text-gray-800'
    if (intensity >= 0.1) return 'bg-gray-100 text-gray-700'
    return 'bg-gray-200 text-gray-600'
  }

  // Ordina le categorie per valore (dal più alto al più basso)
  const sortedCategories = useMemo(() => {
    const maxAmount = Math.max(...Object.values(totalsByMain))
    return categories
      .map(cat => ({
        ...cat,
        amount: totalsByMain[cat.name] || 0,
        colorClass: getCategoryColor(totalsByMain[cat.name] || 0, maxAmount)
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [categories, totalsByMain])

  async function onSubmit (e) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    await fetch('/api/incomes', { method: 'POST', body: formData })
    form.reset()
    const m = formData.get('date').toString().slice(0, 7)
    await refreshMonths(m)
  }

  async function refreshMonths (newMonth) {
    const ms = await fetch('/api/incomes/months').then(r => r.json())
    setMonths(ms)
    // Mantieni la logica del mese di default
    const defaultMonth = getDefaultMonth()
    const toUse = newMonth && ms.includes(newMonth) ? newMonth : 
                  (ms.includes(defaultMonth) ? defaultMonth : (ms[0] || ''))
    setSelectedMonth(toUse)
  }

  async function deleteIncome (id) {
    await fetch(`/api/incomes/${id}`, { method: 'DELETE' })
    setIncomes(prev => prev.filter(e => e.id !== id))
    await refreshMonths(selectedMonth)
  }

  const flatSubcats = useMemo(() => {
    const map = {}
    for (const c of categories) map[c.name] = c.subcategories
    return map
  }, [categories])

  const [selectedMain, setSelectedMain] = useState('')
  useEffect(() => {
    if (categories.length) setSelectedMain(categories[0].name)
  }, [categories])

  const subcatsForSelected = flatSubcats[selectedMain] || []

  // Funzione per esportare le entrate
  async function exportIncomes(month = null) {
    try {
      const url = month 
        ? `/api/export/incomes?month=${month}&format=csv`
        : `/api/export/incomes?format=csv`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Errore durante l\'esportazione')
      }
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = month 
        ? `entrate_${month}_${new Date().toISOString().split('T')[0]}.csv`
        : `entrate_tutte_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Errore durante l\'esportazione:', error)
      alert('Errore durante l\'esportazione delle entrate')
    }
  }

  return (
    <div className='w-full max-w-5xl mx-auto bg-white rounded-2xl shadow p-6'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center'>
          <label className='mr-2 text-sm font-medium'>Mostra entrate per il mese di:</label>
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className='px-4 py-2 border rounded-lg'>
            {months.length === 0 ? <option value=''>Nessun dato</option> : months.map(m => <option key={m} value={m}>{new Date(m + '-02').toLocaleString('it-IT', { month: 'long', year: 'numeric' })}</option>)}
          </select>
        </div>
        <div className='flex gap-2'>
          <button 
            onClick={() => exportIncomes(selectedMonth)}
            disabled={!selectedMonth}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium'
          >
            📊 Esporta Mese
          </button>
          <button 
            onClick={() => exportIncomes()}
            className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium'
          >
            📋 Esporta Tutto
          </button>
        </div>
      </div>

      {/* Entrate Totali del Mese */}
      <div className='mb-6'>
        <div className='bg-green-700 text-white rounded-xl p-5 shadow-lg text-center'>
          <h2 className='text-lg font-medium opacity-80'>Entrate Totali del Mese</h2>
          <p className='text-4xl font-bold mt-2'>€ {grandTotal.toFixed(2)}</p>
        </div>
      </div>

      <div className='mb-8 p-6 bg-gray-50 rounded-lg'>
        <h3 className='text-xl font-semibold mb-4'>Aggiungi una nuova entrata</h3>
        <form onSubmit={onSubmit} className='grid grid-cols-1 md:grid-cols-3 gap-4 items-end'>
          <div className='md:col-span-3'>
            <label className='block text-sm font-medium text-gray-600 mb-1'>Descrizione</label>
            <input name='description' type='text' placeholder='Es. Stipendio' className='w-full px-4 py-2 border rounded-lg' required />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-600 mb-1'>Importo (€)</label>
            <input name='amount' type='number' step='0.01' min='0.01' placeholder='1500.00' className='w-full px-4 py-2 border rounded-lg' required />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-600 mb-1'>Categoria</label>
            <select name='mainCategoryId' value={selectedMain} onChange={e => setSelectedMain(e.target.value)} className='w-full px-4 py-2 border rounded-lg'>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-600 mb-1'>Sottocategoria</label>
            <select name='subcategoryName' className='w-full px-4 py-2 border rounded-lg'>
              {subcatsForSelected?.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className='md:col-span-3'>
            <label className='block text-sm font-medium text-gray-600 mb-1'>Data</label>
            <input name='date' type='date' className='w-full px-4 py-2 border rounded-lg' required />
          </div>
          <button className='md:col-span-3 w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 mt-2'>Aggiungi Entrata</button>
        </form>
      </div>

      {/* Griglia delle categorie colorate */}
      <div className='mb-8'>
        <h3 className='text-xl font-semibold mb-4 border-b pb-2'>Entrate per Categoria</h3>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {sortedCategories.map(cat => (
            <div key={cat.name} className={`${cat.colorClass} rounded-xl p-4 shadow-lg text-center transition-all duration-200 hover:scale-105`}>
              <h3 className='text-sm font-medium mb-2'>{cat.name}</h3>
              <p className='text-xl font-bold'>€ {cat.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filtri */}
      <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
        <h3 className='text-lg font-semibold mb-3'>Filtri</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 items-end'>
          <div>
            <label className='block text-sm font-medium text-gray-600 mb-1'>Categoria Principale</label>
            <select 
              value={filterMainCategory} 
              onChange={e => {
                setFilterMainCategory(e.target.value)
                setFilterSubcategory('') // Reset sottocategoria quando cambia categoria principale
              }} 
              className='w-full px-3 py-2 border rounded-lg'
            >
              <option value=''>Tutte le categorie</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-600 mb-1'>Sottocategoria</label>
            <select 
              value={filterSubcategory} 
              onChange={e => setFilterSubcategory(e.target.value)} 
              className='w-full px-3 py-2 border rounded-lg'
              disabled={!filterMainCategory}
            >
              <option value=''>Tutte le sottocategorie</option>
              {filterMainCategory && flatSubcats[filterMainCategory]?.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
          <div className='text-center'>
            <div className='text-sm text-gray-600 mb-1'>Totale Filtrato</div>
            <div className='text-2xl font-bold text-green-600'>€ {filteredTotal.toFixed(2)}</div>
            {(filterMainCategory || filterSubcategory) && (
              <button 
                onClick={() => {
                  setFilterMainCategory('')
                  setFilterSubcategory('')
                }}
                className='text-xs text-blue-600 hover:text-blue-800 mt-1'
              >
                Rimuovi filtri
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className='text-xl font-semibold mb-4 border-b pb-2'>
          Dettaglio Entrate del Mese
          {(filterMainCategory || filterSubcategory) && (
            <span className='text-sm font-normal text-gray-600 ml-2'>
              (filtrate: {filteredIncomes.length} di {incomes.length})
            </span>
          )}
        </h3>
        <ul className='space-y-3'>
          {filteredIncomes.length === 0 ? (
            <li className='text-center text-gray-500 py-8'>
              {incomes.length === 0 
                ? 'Nessuna entrata registrata per questo mese.' 
                : 'Nessuna entrata corrisponde ai filtri selezionati.'
              }
            </li>
          ) : (
            [...filteredIncomes].sort((a, b) => new Date(b.date) - new Date(a.date)).map(e => (
              <li key={e.id} className='flex items-center justify-between bg-gray-50 p-3 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <span className='text-sm text-gray-500'>{new Date(e.date).toLocaleDateString('it-IT')}</span>
                  <div>
                    <p className='font-semibold'>{e.description}</p>
                    <p className='text-sm text-gray-500'>{e.mainCategory.name} {'>'} {e.subcategory.name}</p>
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <p className='font-semibold text-lg'>€ {Number(e.amount).toFixed(2)}</p>
                  <button onClick={() => deleteIncome(e.id)} className='text-gray-400 hover:text-red-500 text-2xl font-bold'>&times;</button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}




