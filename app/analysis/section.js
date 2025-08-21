'use client'
import { useEffect, useMemo, useState } from 'react'
import { Chart, ArcElement, Tooltip, Legend, Title } from 'chart.js'
import { Pie } from 'react-chartjs-2'

Chart.register(ArcElement, Tooltip, Legend, Title)

export default function AnalysisSection () {
  const [months, setMonths] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [data, setData] = useState([])

  useEffect(() => {
    fetch('/api/expenses/months').then(r => r.json()).then(ms => {
      setMonths(ms)
      if (ms.length) setSelectedMonth(ms[0])
    })
  }, [])

  useEffect(() => {
    if (!selectedMonth) { setData([]); return }
    fetch(`/api/expenses?month=${selectedMonth}`).then(r => r.json()).then(setData)
  }, [selectedMonth])

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

  return (
    <div className='w-full max-w-5xl mx-auto bg-white rounded-2xl shadow p-6'>
      <div className='flex items-center mb-4'>
        <label className='mr-2 text-sm font-medium'>Analisi per il mese di:</label>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className='px-4 py-2 border rounded-lg'>
          {months.length === 0 ? <option value=''>Nessun dato</option> : months.map(m => <option key={m} value={m}>{new Date(m + '-02').toLocaleString('it-IT', { month: 'long', year: 'numeric' })}</option>)}
        </select>
      </div>
      <div className='w-full max-w-2xl mx-auto'>
        <Pie data={chartData} options={{ plugins: { legend: { position: 'top' }, title: { display: true, text: `Ripartizione Spese per Sottocategoria - ${selectedMonth ? new Date(selectedMonth + '-02').toLocaleString('it-IT', { month: 'long', year: 'numeric' }) : 'Nessun Mese'}` } } }} />
      </div>
    </div>
  )
}

