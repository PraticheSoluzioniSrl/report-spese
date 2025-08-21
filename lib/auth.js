import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const SESSION_COOKIE = 'cosimo_session'
const STATIC_PASSWORD = 'C0S1M0'

export function isAuthenticated () {
  const cookieStore = cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  return session?.value === 'ok'
}

export async function loginAction (formData) {
  'use server'
  const password = formData.get('password')
  if (password !== STATIC_PASSWORD) {
    redirect('/login?error=1')
  }
  cookies().set(SESSION_COOKIE, 'ok', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/'
  })
  redirect('/expenses')
}

export async function logoutAction () {
  'use server'
  cookies().delete(SESSION_COOKIE)
  redirect('/login')
}

