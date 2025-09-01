'use client'
import { useState } from 'react'

export default function ImportSection () {
  const [type, setType] = useState('expense')
  const [created, setCreated] = useState(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit (e) {
    e.preventDefault()
    setLoading(true)
    setCreated(null)
    const fd = new FormData(e.currentTarget)
    fd.set('type', type)
    const res = await fetch('/api/import', { method: 'POST', body: fd })
    const json = await res.json()
    setCreated(json.created || 0)
    setLoading(false)
    e.currentTarget.reset()
  }

  return (
    <div className='w-full max-w-5xl mx-auto bg-white rounded-2xl shadow p-6'>
      <h3 className='text-xl font-semibold mb-4 border-b pb-2'>Importazione Massiva</h3>
      <p className='text-sm text-gray-600 mb-4'>Carica un file Excel/CSV con colonne: <strong>description</strong>, <strong>amount</strong>, <strong>date</strong>, <strong>mainCategory</strong>, <strong>subcategory</strong>. Le intestazioni italiane più comuni sono riconosciute.</p>
      <div className='mb-4'>
        <label className='mr-3'>Tipo di import:</label>
        <select value={type} onChange={e => setType(e.target.value)} className='px-4 py-2 border rounded-lg'>
          <option value='expense'>Spese</option>
          <option value='income'>Entrate</option>
        </select>
      </div>
      <form onSubmit={onSubmit} className='flex items-center gap-4'>
        <input name='file' type='file' accept='.xlsx,.xls,.csv' className='px-4 py-2 border rounded-lg' required />
        <button disabled={loading} className='bg-blue-600 text-white px-4 py-2 rounded-lg'>{loading ? 'Importo…' : 'Importa'}</button>
      </form>
      {created !== null && (
        <p className='text-sm text-gray-700 mt-3'>Import completato: {created} record creati.</p>
      )}
    </div>
  )
}




