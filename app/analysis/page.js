import NavBar from '../../components/NavBar'
import { logoutAction } from '../../lib/auth'
import AnalysisSection from './section'

export default function AnalysisPage () {
  return (
    <div>
      <NavBar logout={logoutAction} />
      <div className='w-full max-w-5xl mx-auto'>
        <AnalysisSection />
      </div>
    </div>
  )
}

