'use client'
import { useEffect, useMemo, useState } from 'react'
import { Chart, ArcElement, Tooltip, Legend, Title } from 'chart.js'
import { Pie } from 'react-chartjs-2'

Chart.register(ArcElement, Tooltip, Legend, Title)

export default function AnalysisSection () {
  const [months, setMonths] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [data, setData] = useState([])
  const [chartType, setChartType] = useState('expenses') // 'expenses' | 'incomes'

  useEffect(() => {
    fetch('/api/expenses/months').then(r => r.json()).then(ms => {
      setMonths(ms)
      if (ms.length) setSelectedMonth(ms[0])
    })
  }, [])

  useEffect(() => {
    if (!selectedMonth) { setData([]); return }
    const apiEndpoint = chartType === 'expenses' ? '/api/expenses' : '/api/incomes'
    fetch(`${apiEndpoint}?month=${selectedMonth}`).then(r => r.json()).then(setData)
  }, [selectedMonth, chartType])

  const analysis = useMemo(() => {
    const acc = {}
    for (const e of data) {
      const key = e.subcategory.name
      acc[key] = (acc[key] || 0) + Number(e.amount)
    }
    const labels = Object.keys(acc).sort()
    const values = labels.map(l => acc[l])
    return { labels, values }
  }, [data])

  const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#8b5cf6', '#14b8a6', '#6366f1', '#d946ef', '#f59e0b', '#10b981', '#0ea5e9', '#ec4899']

  const chartData = {
    labels: analysis.labels,
    datasets: [{ data: analysis.values, backgroundColor: colors }]
  }

  const chartTitle = chartType === 'expenses' ? 'Uscite' : 'Entrate'
  const totalAmount = analysis.values.reduce((sum, value) => sum + value, 0)

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
          </div>
        </div>
      </div>

      {totalAmount > 0 ? (
        <div className='w-full max-w-2xl mx-auto'>
          <div className='text-center mb-4'>
            <h3 className='text-lg font-semibold text-gray-800'>
              {chartTitle} - {selectedMonth ? new Date(selectedMonth + '-02').toLocaleString('it-IT', { month: 'long', year: 'numeric' }) : 'Nessun Mese'}
            </h3>
            <p className='text-2xl font-bold text-gray-900 mt-2'>
              € {totalAmount.toFixed(2)}
            </p>
          </div>
          <Pie 
            data={chartData} 
            options={{ 
              plugins: { 
                legend: { position: 'bottom' }, 
                title: { display: false }
              } 
            }} 
          />
        </div>
      ) : (
        <div className='text-center py-12'>
          <p className='text-gray-500 text-lg'>
            Nessun dato disponibile per {chartTitle.toLowerCase()} nel mese selezionato
          </p>
        </div>
      )}
    </div>
  )
}

