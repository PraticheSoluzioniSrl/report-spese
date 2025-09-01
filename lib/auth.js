import { cookies } from 'next/headers'

const SESSION_COOKIE = 'cosimo_session'

export function isAuthenticated () {
  const cookieStore = cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  return session?.value === 'ok'
}

