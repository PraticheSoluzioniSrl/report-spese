'use client'
import { useEffect, useState } from 'react'

export default function DeadlinesSection () {
  const [deadlines, setDeadlines] = useState([])

  async function load () {
    try {
      const response = await fetch('/api/deadlines')
      if (!response.ok) throw new Error('Errore nel caricamento delle scadenze')
      const data = await response.json()
      setDeadlines(data || [])
    } catch (error) {
      console.error('Errore nel caricamento delle scadenze:', error)
      setDeadlines([])
    }
  }

  useEffect(() => { load() }, [])

  async function onSubmit (e) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    try {
      const response = await fetch('/api/deadlines', { method: 'POST', body: fd })
      if (!response.ok) throw new Error('Errore nella creazione della scadenza')
      form.reset()
      load()
    } catch (error) {
      console.error('Errore nella creazione della scadenza:', error)
      alert('Errore durante la creazione della scadenza')
    }
  }

  async function togglePaid (id, newPaidValue) {
    try {
      const response = await fetch(`/api/deadlines/${id}`, { 
        method: 'PATCH', 
        headers: { 'content-type': 'application/json' }, 
        body: JSON.stringify({ paid: newPaidValue })
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Errore nell\'aggiornamento della scadenza')
      }
      await load() // Ricarica le scadenze dopo l'aggiornamento
    } catch (error) {
      console.error('Errore nell\'aggiornamento della scadenza:', error)
      alert('Errore durante l\'aggiornamento della scadenza: ' + error.message)
    }
  }

  async function remove (id) {
    try {
      const response = await fetch(`/api/deadlines/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Errore nell\'eliminazione della scadenza')
      load()
    } catch (error) {
      console.error('Errore nell\'eliminazione della scadenza:', error)
      alert('Errore durante l\'eliminazione della scadenza')
    }
  }

  function addToCalendar (d) {
    const text = encodeURIComponent(d.description)
    const ymd = String(d.dueDate).slice(0, 10).replace(/-/g, '')
    const details = encodeURIComponent(`Importo: € ${Number(d.amount).toFixed(2)}`)
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${ymd}/${ymd}&details=${details}`
    window.open(url, '_blank', 'noopener,noreferrer')
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
            ) : deadlines.sort((a, b) => {
              // Ordina: prima quelle non pagate (scadute o prossime), poi quelle pagate
              const aPaid = Boolean(a.paid)
              const bPaid = Boolean(b.paid)
              
              // Se una è pagata e l'altra no, quella non pagata viene prima
              if (aPaid && !bPaid) return 1
              if (!aPaid && bPaid) return -1
              
              // Se entrambe hanno lo stesso stato (pagate o non pagate), ordina per data
              return new Date(a.dueDate) - new Date(b.dueDate)
            }).map(d => {
              const paid = Boolean(d.paid) // Assicurati che paid sia sempre un booleano
              const isOverdue = new Date(d.dueDate) < new Date() && !paid
              return (
                <li key={d.id} className={`deadline-item flex items-center justify-between p-3 rounded-lg ${paid ? 'line-through text-gray-400 bg-gray-100' : 'bg-white shadow-sm'} ${isOverdue ? 'border-l-4 border-red-500' : ''}`}>
                  <div className='flex items-center gap-3'>
                    <input 
                      type='checkbox' 
                      className='h-5 w-5 rounded border-gray-300 text-blue-600 cursor-pointer' 
                      checked={paid} 
                      onChange={e => togglePaid(d.id, e.target.checked)} 
                    />
                    <div>
                      <p className='font-semibold'>{d.description}</p>
                      <p className='text-sm'>{new Date(d.dueDate).toLocaleDateString('it-IT')} {isOverdue ? <span className='text-red-600 font-semibold'>(Scaduto)</span> : null}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-4'>
                    <p className='font-semibold text-lg'>€ {Number(d.amount).toFixed(2)}</p>
                    <button onClick={() => addToCalendar(d)} className='text-gray-400 hover:text-blue-500' title='Aggiungi a Google Calendar'>
                      <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                      </svg>
                    </button>
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

