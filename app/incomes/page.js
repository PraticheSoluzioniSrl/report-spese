import NavBar from '../../components/NavBar'
import { logoutAction } from '../../lib/actions'
import IncomesSection from './section'

export const dynamic = 'force-dynamic'

export default function IncomesPage () {
  return (
    <div>
      <NavBar logout={logoutAction} />
      <div className='w-full max-w-5xl mx-auto'>
        <IncomesSection />
      </div>
    </div>
  )
}




