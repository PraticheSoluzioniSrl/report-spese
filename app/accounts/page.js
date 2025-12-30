import NavBar from '../../components/NavBar'
import { logoutAction } from '../../lib/actions'
import AccountsSection from './section'

export const dynamic = 'force-dynamic'

export default function AccountsPage () {
  return (
    <div>
      <NavBar logout={logoutAction} />
      <div className='w-full max-w-5xl mx-auto'>
        <AccountsSection />
      </div>
    </div>
  )
}

