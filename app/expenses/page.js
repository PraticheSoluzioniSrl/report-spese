import NavBar from '../../components/NavBar'
import { logoutAction } from '../../lib/actions'
import ExpensesSection from './section'

export const dynamic = 'force-dynamic'

export default function ExpensesPage () {
  return (
    <div>
      <NavBar logout={logoutAction} />
      <div className='w-full max-w-5xl mx-auto'>
        <ExpensesSection />
      </div>
    </div>
  )
}

