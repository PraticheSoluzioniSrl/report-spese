import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const SESSION_COOKIE = 'cosimo_session'

export function isAuthenticated () {
  const cookieStore = cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  return session?.value === 'ok'
}

export async function loginAction (formData) {
  'use server'
  const password = String(formData.get('password') || '')

  // single-user app: find first user or bootstrap default
  let user = await prisma.user.findFirst()
  if (!user) {
    const defaultHash = await bcrypt.hash('C0S1M0', 10)
    user = await prisma.user.create({ data: { username: 'admin', passwordHash: defaultHash } })
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
}

export async function logoutAction () {
  'use server'
  cookies().delete(SESSION_COOKIE)
  redirect('/login')
}

export async function changePasswordAction (formData) {
  'use server'
  const current = String(formData.get('current') || '')
  const next = String(formData.get('next') || '')
  if (!next || next.length < 6) {
    redirect('/settings?pwd=weak')
  }
  const user = await prisma.user.findFirst()
  if (!user) redirect('/settings?pwd=error')
  const ok = await bcrypt.compare(current, user.passwordHash)
  if (!ok) redirect('/settings?pwd=wrong')
  const newHash = await bcrypt.hash(next, 10)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } })
  redirect('/settings?pwd=ok')
}

