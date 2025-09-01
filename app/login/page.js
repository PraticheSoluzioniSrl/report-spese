import { loginAction } from '../../lib/actions'

export const metadata = { title: 'Login' }

export default function LoginPage ({ searchParams }) {
  const error = searchParams?.error
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <form action={loginAction} className='w-full max-w-sm bg-white p-6 rounded-2xl shadow'>
        <h1 className='text-2xl font-bold mb-4 text-center'>Accedi</h1>
        {error ? <p className='text-sm text-red-600 mb-2'>Password errata</p> : null}
        <label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
        <input name='password' type='password' className='w-full border rounded-lg px-3 py-2 mb-4' placeholder='Inserisci password' required />
        <button className='w-full bg-blue-600 text-white py-2 rounded-lg'>Entra</button>
        <p className='text-xs text-gray-500 mt-3 text-center'>Suggerimento: C0S1M0</p>
      </form>
    </div>
  )
}

