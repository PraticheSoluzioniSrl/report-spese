import { NextResponse } from 'next/server'
import { deleteIncome } from '../../../../lib/firebase-db'

export async function DELETE (_req, { params }) {
  try {
    const id = String(params.id)
    if (!id) return NextResponse.json({ ok: true })
    await deleteIncome(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Errore durante l\'eliminazione dell\'incasso:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}




