import { Toaster } from 'react-hot-toast'
import './App.css'
import './components/CampaignStarter'
import CampaignStarter from './components/CampaignStarter'
import UploadLead from './components/UploadLead'

function App() {

  return (
    <>
      <Toaster />
      <UploadLead />
      <CampaignStarter />
    </>
  )
}

export default App
