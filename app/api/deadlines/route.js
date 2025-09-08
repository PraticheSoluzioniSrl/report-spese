import { NextResponse } from 'next/server'
import { getDeadlines, createDeadline } from '../../../lib/supabase-db'

export async function GET () {
  try {
    const list = await getDeadlines()
    return NextResponse.json(list)
  } catch (error) {
    console.error('Errore nel recupero delle scadenze:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function POST (req) {
  try {
    const fd = await req.formData()
    const description = String(fd.get('description') || '').trim()
    const amount = parseFloat(String(fd.get('amount') || '0'))
    const dueDate = String(fd.get('dueDate') || '')
    
    if (!description || !amount || !dueDate) {
      return NextResponse.json({ error: 'missing' }, { status: 400 })
    }
    
    const deadlineData = {
      description,
      amount,
      dueDate: new Date(dueDate),
      paid: false
    }
    await createDeadline(deadlineData)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Errore durante la creazione della scadenza:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

