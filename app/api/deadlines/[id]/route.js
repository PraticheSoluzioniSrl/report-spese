import { NextResponse } from 'next/server'
import { updateDeadline, deleteDeadline } from '../../../../lib/supabase-db'

export async function PATCH (req, { params }) {
  try {
    const id = String(params.id)
    const body = await req.json()
    await updateDeadline(id, { paid: Boolean(body.paid) })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Errore durante l\'aggiornamento della scadenza:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function DELETE (_req, { params }) {
  try {
    const id = String(params.id)
    await deleteDeadline(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Errore durante l\'eliminazione della scadenza:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

