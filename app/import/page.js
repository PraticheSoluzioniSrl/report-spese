import NavBar from '../../components/NavBar'
import { logoutAction } from '../../lib/actions'
import ImportSection from './section'

export default function ImportPage () {
  return (
    <div>
      <NavBar logout={logoutAction} />
      <div className='w-full max-w-5xl mx-auto'>
        <ImportSection />
      </div>
    </div>
  )
}




