'use client'
import { useEffect, useMemo, useState } from 'react'
import { Chart, ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import { getDefaultMonth } from '../../lib/month-utils'

// Registra i componenti di Chart.js solo se Chart è disponibile
if (typeof Chart !== 'undefined') {
  try {
    Chart.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement)
  } catch (error) {
    console.error('Errore nella registrazione di Chart.js:', error)
  }
}

export default function AnalysisSection () {
  const [months, setMonths] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [data, setData] = useState([])
  const [chartType, setChartType] = useState('expenses') // 'expenses' | 'incomes' | 'balance'
  const [filterMainCategory, setFilterMainCategory] = useState('')
  const [filterSubcategory, setFilterSubcategory] = useState('')
  const [categories, setCategories] = useState([])
  const [expensesData, setExpensesData] = useState([])
  const [incomesData, setIncomesData] = useState([])

  useEffect(() => {
    fetch('/api/expenses/months')
      .then(r => {
        if (!r.ok) throw new Error('Errore nel caricamento dei mesi')
        return r.json()
      })
      .then(ms => {
        setMonths(ms || [])
        // Usa la funzione centralizzata per determinare il mese di default
        const defaultMonth = getDefaultMonth()
        // Se il mese corrente è disponibile, selezionalo automaticamente
        if (ms && ms.includes(defaultMonth)) {
          setSelectedMonth(defaultMonth)
        } else if (ms && ms.length > 0) {
          // Altrimenti seleziona il primo mese disponibile (che dovrebbe essere il più recente)
          setSelectedMonth(ms[0])
        } else {
          // Fallback: usa il mese corrente anche se non è nella lista
          setSelectedMonth(defaultMonth)
        }
      })
      .catch(error => {
        console.error('Errore nel caricamento dei mesi:', error)
        setMonths([])
      })
    
    // Carica le categorie per i filtri
    fetch(`/api/categories?type=${chartType}`)
      .then(r => {
        if (!r.ok) throw new Error('Errore nel caricamento delle categorie')
        return r.json()
      })
      .then(setCategories)
      .catch(error => {
        console.error('Errore nel caricamento delle categorie:', error)
        setCategories([])
      })
  }, [chartType])

  useEffect(() => {
    if (!selectedMonth) { 
      setData([])
      setExpensesData([])
      setIncomesData([])
      return 
    }
    
    // Carica sempre entrate e uscite per il grafico del bilancio
    Promise.all([
      fetch(`/api/expenses?month=${selectedMonth}`).then(r => r.ok ? r.json() : []),
      fetch(`/api/incomes?month=${selectedMonth}`).then(r => r.ok ? r.json() : [])
    ])
      .then(([expenses, incomes]) => {
        setExpensesData(expenses || [])
        setIncomesData(incomes || [])
        
        // Imposta i dati in base al tipo di grafico selezionato
        if (chartType === 'expenses') {
          setData(expenses || [])
        } else if (chartType === 'incomes') {
          setData(incomes || [])
        } else {
          // Per 'balance' non impostiamo data, useremo expensesData e incomesData
          setData([])
        }
      })
      .catch(error => {
        console.error('Errore nel caricamento dei dati:', error)
        setData([])
        setExpensesData([])
        setIncomesData([])
      })
  }, [selectedMonth, chartType])

  // Filtra i dati in base ai filtri selezionati
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    return data.filter(item => {
      if (!item || !item.mainCategory || !item.subcategory) return false
      const matchesMainCategory = !filterMainCategory || item.mainCategory.name === filterMainCategory
      const matchesSubcategory = !filterSubcategory || item.subcategory.name === filterSubcategory
      return matchesMainCategory && matchesSubcategory
    })
  }, [data, filterMainCategory, filterSubcategory])

  const analysis = useMemo(() => {
    const acc = {}
    if (!filteredData || !Array.isArray(filteredData)) {
      return { labels: [], values: [] }
    }
    for (const e of filteredData) {
      if (!e || !e.subcategory || e.amount === undefined) continue
      const key = e.subcategory.name
      acc[key] = (acc[key] || 0) + Number(e.amount)
    }
    const labels = Object.keys(acc).sort()
    const values = labels.map(l => acc[l])
    return { labels, values }
  }, [filteredData])

  const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#8b5cf6', '#14b8a6', '#6366f1', '#d946ef', '#f59e0b', '#10b981', '#0ea5e9', '#ec4899']

  const chartData = useMemo(() => ({
    labels: analysis.labels || [],
    datasets: [{ 
      data: analysis.values || [], 
      backgroundColor: colors.slice(0, (analysis.labels || []).length)
    }]
  }), [analysis])

  const chartTitle = chartType === 'expenses' ? 'Uscite' : chartType === 'incomes' ? 'Entrate' : 'Bilancio Mensile'
  
  // Calcola totali per il grafico del bilancio
  const balanceData = useMemo(() => {
    const totalExpenses = expensesData.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    const totalIncomes = incomesData.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
    const difference = totalIncomes - totalExpenses
    return {
      expenses: totalExpenses,
      incomes: totalIncomes,
      difference: difference
    }
  }, [expensesData, incomesData])
  
  const totalAmount = useMemo(() => {
    if (chartType === 'balance') {
      return balanceData.difference
    }
    if (!analysis.values || !Array.isArray(analysis.values)) return 0
    return analysis.values.reduce((sum, value) => sum + (Number(value) || 0), 0)
  }, [analysis.values, chartType, balanceData])
  
  // Dati per il grafico a barre del bilancio
  const balanceChartData = useMemo(() => ({
    labels: ['Entrate', 'Uscite', 'Differenza'],
    datasets: [{
      label: 'Importo (€)',
      data: [balanceData.incomes, balanceData.expenses, balanceData.difference],
      backgroundColor: [
        '#22c55e', // Verde per entrate
        '#ef4444', // Rosso per uscite
        balanceData.difference >= 0 ? '#3b82f6' : '#f97316' // Blu se positivo, arancione se negativo
      ],
      borderColor: [
        '#16a34a',
        '#dc2626',
        balanceData.difference >= 0 ? '#2563eb' : '#ea580c'
      ],
      borderWidth: 2
    }]
  }), [balanceData])

  // Reset filtri quando cambia il tipo di grafico
  useEffect(() => {
    setFilterMainCategory('')
    setFilterSubcategory('')
  }, [chartType])

  // Prepara le sottocategorie per il filtro
  const flatSubcats = useMemo(() => {
    const map = {}
    for (const c of categories) map[c.name] = c.subcategories
    return map
  }, [categories])

  return (
    <div className='w-full max-w-5xl mx-auto bg-white rounded-2xl shadow p-6'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6'>
        <div className='flex items-center gap-4'>
          <label className='text-sm font-medium'>Analisi per il mese di:</label>
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className='px-4 py-2 border rounded-lg'>
            {months.length === 0 ? <option value=''>Nessun dato</option> : months.map(m => <option key={m} value={m}>{new Date(m + '-02').toLocaleString('it-IT', { month: 'long', year: 'numeric' })}</option>)}
          </select>
        </div>
        
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>Visualizza:</span>
          <div className='flex bg-gray-100 rounded-lg p-1'>
            <button
              onClick={() => setChartType('expenses')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                chartType === 'expenses' 
                  ? 'bg-red-500 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Uscite
            </button>
            <button
              onClick={() => setChartType('incomes')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                chartType === 'incomes' 
                  ? 'bg-green-500 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Entrate
            </button>
            <button
              onClick={() => setChartType('balance')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                chartType === 'balance' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Bilancio
            </button>
          </div>
        </div>
      </div>

      {/* Filtri - nascosti per il grafico del bilancio */}
      {chartType !== 'balance' && (
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
              <div className={`text-2xl font-bold ${chartType === 'expenses' ? 'text-red-600' : 'text-green-600'}`}>
                € {totalAmount.toFixed(2)}
              </div>
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
      )}
      
      {/* Riepilogo per il grafico del bilancio */}
      {chartType === 'balance' && (
        <div className='mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200'>
          <h3 className='text-lg font-semibold mb-3 text-gray-800'>Riepilogo Mensile</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-white p-4 rounded-lg shadow-sm'>
              <div className='text-sm text-gray-600 mb-1'>Entrate Totali</div>
              <div className='text-2xl font-bold text-green-600'>€ {balanceData.incomes.toFixed(2)}</div>
            </div>
            <div className='bg-white p-4 rounded-lg shadow-sm'>
              <div className='text-sm text-gray-600 mb-1'>Uscite Totali</div>
              <div className='text-2xl font-bold text-red-600'>€ {balanceData.expenses.toFixed(2)}</div>
            </div>
            <div className={`bg-white p-4 rounded-lg shadow-sm ${balanceData.difference >= 0 ? 'border-2 border-green-500' : 'border-2 border-red-500'}`}>
              <div className='text-sm text-gray-600 mb-1'>Differenza</div>
              <div className={`text-2xl font-bold ${balanceData.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                € {balanceData.difference.toFixed(2)}
              </div>
              {balanceData.difference >= 0 ? (
                <div className='text-xs text-green-600 mt-1'>✓ Bilancio positivo</div>
              ) : (
                <div className='text-xs text-red-600 mt-1'>⚠ Bilancio negativo</div>
              )}
            </div>
          </div>
        </div>
      )}

      {chartType === 'balance' ? (
        // Grafico del bilancio
        <div className='w-full max-w-3xl mx-auto'>
          <div className='text-center mb-4'>
            <h3 className='text-lg font-semibold text-gray-800'>
              {chartTitle} - {selectedMonth ? new Date(selectedMonth + '-02').toLocaleString('it-IT', { month: 'long', year: 'numeric' }) : 'Nessun Mese'}
            </h3>
          </div>
          {(balanceData.incomes > 0 || balanceData.expenses > 0) ? (
            <div className='bg-white p-6 rounded-lg shadow-sm'>
              <Bar 
                data={balanceChartData} 
                options={{ 
                  plugins: { 
                    legend: { display: false }, 
                    title: { display: false },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `€ ${context.parsed.y.toFixed(2)}`
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '€ ' + value.toFixed(2)
                        }
                      }
                    }
                  },
                  responsive: true,
                  maintainAspectRatio: true
                }} 
              />
            </div>
          ) : (
            <div className='text-center py-12'>
              <p className='text-gray-500 text-lg'>
                Nessun dato disponibile per il bilancio nel mese selezionato
              </p>
            </div>
          )}
        </div>
      ) : totalAmount > 0 ? (
        // Grafico a torta per entrate/uscite
        <div className='w-full max-w-2xl mx-auto'>
          <div className='text-center mb-4'>
            <h3 className='text-lg font-semibold text-gray-800'>
              {chartTitle} - {selectedMonth ? new Date(selectedMonth + '-02').toLocaleString('it-IT', { month: 'long', year: 'numeric' }) : 'Nessun Mese'}
            </h3>
            <p className='text-2xl font-bold text-gray-900 mt-2'>
              € {totalAmount.toFixed(2)}
            </p>
          </div>
          {chartData.labels.length > 0 && chartData.datasets[0].data.length > 0 ? (
            <Pie 
              data={chartData} 
              options={{ 
                plugins: { 
                  legend: { position: 'bottom' }, 
                  title: { display: false }
                },
                responsive: true,
                maintainAspectRatio: true
              }} 
            />
          ) : (
            <div className='text-center py-8 text-gray-500'>
              Nessun dato disponibile per il grafico
            </div>
          )}
        </div>
      ) : (
        <div className='text-center py-12'>
          <p className='text-gray-500 text-lg'>
            {data.length === 0 
              ? `Nessun dato disponibile per ${chartTitle.toLowerCase()} nel mese selezionato`
              : `Nessun dato corrisponde ai filtri selezionati per ${chartTitle.toLowerCase()}`
            }
          </p>
        </div>
      )}
    </div>
  )
}

