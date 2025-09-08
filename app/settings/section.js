'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { changePasswordAction } from '../../lib/actions'

export default function SettingsSection () {
  const [categories, setCategories] = useState([])
  const [selected, setSelected] = useState('')
  const sp = useSearchParams()

  async function load () {
    const data = await fetch('/api/categories').then(r => r.json())
    setCategories(data)
    if (data.length && !selected) setSelected(data[0].name)
  }

  useEffect(() => { load() }, [])

  const subcats = useMemo(() => categories.find(c => c.name === selected)?.subcategories || [], [categories, selected])

  async function addMain (e) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    await fetch('/api/categories', { method: 'POST', body: fd })
    form.reset()
    load()
  }

  async function deleteMain (name) {
    await fetch(`/api/categories/${encodeURIComponent(name)}`, { method: 'DELETE' })
    load()
  }

  async function addSub (e) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await fetch('/api/subcategories', { method: 'POST', body: fd })
    e.currentTarget.reset()
    load()
  }

  async function deleteSub (mainName, subName) {
    await fetch(`/api/subcategories?main=${encodeURIComponent(mainName)}&sub=${encodeURIComponent(subName)}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className='w-full max-w-5xl mx-auto bg-white rounded-2xl shadow p-6'>
      <h3 className='text-xl font-semibold mb-4 border-b pb-2'>Gestione Categorie</h3>
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
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div>
          <h4 className='font-semibold mb-2'>Categorie Principali</h4>
          <form onSubmit={addMain} className='flex gap-2 mb-4'>
            <input name='name' type='text' placeholder='Nuova categoria' className='w-full px-4 py-2 border rounded-lg' required />
            <button className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'>Aggiungi</button>
          </form>
          <ul className='space-y-2'>
            {categories.map(c => (
              <li key={c.name} className='flex justify-between items-center p-2 bg-gray-100 rounded'>
                <span>{c.name}</span>
                <button onClick={() => deleteMain(c.name)} className='text-red-500 hover:text-red-700 text-xl font-bold'>&times;</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className='font-semibold mb-2'>Sottocategorie</h4>
          <form onSubmit={addSub} className='space-y-2 mb-4'>
            <select name='mainName' value={selected} onChange={e => setSelected(e.target.value)} className='w-full px-4 py-2 border rounded-lg'>
              {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <div className='flex gap-2'>
              <input name='subName' type='text' placeholder='Nuova sottocategoria' className='w-full px-4 py-2 border rounded-lg' required />
              <button className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'>Aggiungi</button>
            </div>
          </form>
          <ul className='space-y-2'>
            {subcats.map(s => (
              <li key={s} className='flex justify-between items-center p-2 bg-gray-100 rounded'>
                <span>{s}</span>
                <button onClick={() => deleteSub(selected, s)} className='text-red-500 hover:text-red-700 text-xl font-bold'>&times;</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

