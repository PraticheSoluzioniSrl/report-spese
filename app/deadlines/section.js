'use client'
import { useEffect, useState } from 'react'

export default function DeadlinesSection () {
  const [deadlines, setDeadlines] = useState([])

  async function load () {
    const data = await fetch('/api/deadlines').then(r => r.json())
    setDeadlines(data)
  }

  useEffect(() => { load() }, [])

  async function onSubmit (e) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await fetch('/api/deadlines', { method: 'POST', body: fd })
    e.currentTarget.reset()
    load()
  }

  async function togglePaid (id, paid) {
    await fetch(`/api/deadlines/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ paid }) })
    load()
  }

  async function remove (id) {
    await fetch(`/api/deadlines/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className='w-full max-w-5xl mx-auto bg-white rounded-2xl shadow p-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div>
          <h3 className='text-xl font-semibold mb-4 border-b pb-2'>Aggiungi Scadenza</h3>
          <form onSubmit={onSubmit} className='space-y-4 p-4 bg-gray-50 rounded-lg'>
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>Descrizione</label>
              <input name='description' type='text' className='w-full px-4 py-2 border rounded-lg' placeholder='Es. Bolletta Elettrica' required />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>Importo (€)</label>
                <input name='amount' type='number' step='0.01' min='0.01' className='w-full px-4 py-2 border rounded-lg' placeholder='75.50' required />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>Data Scadenza</label>
                <input name='dueDate' type='date' className='w-full px-4 py-2 border rounded-lg' required />
              </div>
            </div>
            <button className='w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700'>Aggiungi Scadenza</button>
          </form>
        </div>
        <div>
          <h3 className='text-xl font-semibold mb-4 border-b pb-2'>Elenco Scadenze</h3>
          <ul className='space-y-3'>
            {deadlines.length === 0 ? (
              <li className='text-center text-gray-500 py-8'>Nessuna scadenza registrata.</li>
            ) : deadlines.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map(d => {
              const isOverdue = new Date(d.dueDate) < new Date() && !d.paid
              return (
                <li key={d.id} className={`deadline-item flex items-center justify-between p-3 rounded-lg ${d.paid ? 'line-through text-gray-400 bg-gray-100' : 'bg-white shadow-sm'} ${isOverdue ? 'border-l-4 border-red-500' : ''}`}>
                  <div className='flex items-center gap-3'>
                    <input type='checkbox' className='h-5 w-5 rounded border-gray-300 text-blue-600' checked={d.paid} onChange={e => togglePaid(d.id, e.target.checked)} />
                    <div>
                      <p className='font-semibold'>{d.description}</p>
                      <p className='text-sm'>{new Date(d.dueDate).toLocaleDateString('it-IT')} {isOverdue ? <span className='text-red-600 font-semibold'>(Scaduto)</span> : null}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-4'>
                    <p className='font-semibold text-lg'>€ {Number(d.amount).toFixed(2)}</p>
                    <button onClick={() => remove(d.id)} className='text-gray-400 hover:text-red-500 text-2xl font-bold'>&times;</button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

