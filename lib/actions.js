'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { getUser, createUser, updateUser } from './supabase-db'

const SESSION_COOKIE = 'cosimo_session'

export async function loginAction (formData) {
  const password = String(formData.get('password') || '')

  try {
    // single-user app: find first user or bootstrap default
    let user = await getUser()
    if (!user) {
      const defaultHash = await bcrypt.hash('C0S1M0', 10)
      const userDoc = await createUser({ username: 'admin', passwordHash: defaultHash })
      user = { id: userDoc.id, username: 'admin', passwordHash: defaultHash }
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      redirect('/login?error=1')
    }

    cookies().set(SESSION_COOKIE, 'ok', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/'
    })
    redirect('/expenses')
  } catch (error) {
    console.error('Errore durante il login:', error)
    // Se Supabase non è configurato o c'è un errore, usa password demo
    if (password === 'C0S1M0') {
      cookies().set(SESSION_COOKIE, 'ok', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/'
      })
      redirect('/expenses')
    } else {
      redirect('/login?error=1')
    }
  }
}

export async function logoutAction () {
  cookies().delete(SESSION_COOKIE)
  redirect('/login')
}

export async function changePasswordAction (formData) {
  const current = String(formData.get('current') || '')
  const next = String(formData.get('next') || '')
  
  console.log('🔐 Cambio password richiesto')
  
  if (!next || next.length < 6) {
    console.log('❌ Password troppo debole')
    redirect('/settings?pwd=weak')
  }
  
  try {
    const user = await getUser()
    if (!user) {
      console.log('❌ Utente non trovato')
      redirect('/settings?pwd=error')
    }
    
    console.log('👤 Utente trovato:', user.username)
    
    const ok = await bcrypt.compare(current, user.passwordHash)
    if (!ok) {
      console.log('❌ Password corrente errata')
      redirect('/settings?pwd=wrong')
    }
    
    console.log('✅ Password corrente corretta, aggiorno...')
    const newHash = await bcrypt.hash(next, 10)
    await updateUser(user.id, { passwordHash: newHash })
    console.log('✅ Password aggiornata con successo')
    redirect('/settings?pwd=ok')
  } catch (error) {
    console.error('❌ Errore durante il cambio password:', error)
    redirect('/settings?pwd=error')
  }
}
