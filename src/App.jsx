

import MfData from './components/MfData'
import { Route, Routes } from 'react-router-dom'
import SelectedScheme from './components/SelectedScheme'

function App() {

  return (
    <>
    <Routes>

      <Route path='/' element={<MfData/>}/>
      <Route path="/scheme/:schemeCode" element={<SelectedScheme/>}/>
    </Routes>
    {/* < MfData/> */}
      </>
       
  )
}

export default App
