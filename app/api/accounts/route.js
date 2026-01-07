import { NextResponse } from 'next/server'
import { getAccounts, createAccount } from '../../../lib/supabase-db'
import { calculateAccountBalance } from '../../../lib/demo-storage'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const accounts = await getAccounts()
    // Calcola il saldo corrente per ogni conto (usa demo storage per il calcolo se necessario)
    const accountsWithBalance = await Promise.all(accounts.map(async account => ({
      ...account,
      currentBalance: await calculateAccountBalance(account.id)
    })))
    return NextResponse.json(accountsWithBalance)
  } catch (error) {
    console.error('Errore nel recupero dei conti:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const fd = await req.formData()
    const name = String(fd.get('name') || '').trim()
    const initialBalance = parseFloat(String(fd.get('initialBalance') || '0'))
    
    if (!name) {
      return NextResponse.json({ error: 'Il nome del conto è obbligatorio' }, { status: 400 })
    }
    
    const account = await createAccount(name, initialBalance)
    return NextResponse.json({ ok: true, account })
  } catch (error) {
    console.error('Errore nella creazione del conto:', error)
    return NextResponse.json({ 
      error: error.message || 'Errore interno del server' 
    }, { status: 500 })
  }
}




