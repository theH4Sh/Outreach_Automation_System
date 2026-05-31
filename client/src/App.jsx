import { Toaster } from 'react-hot-toast'
import './App.css'
import './components/CampaignStarter'
import CampaignStarter from './components/CampaignStarter'
import UploadLead from './components/UploadLead'
import CampaignManager from './components/CampaignManager'

function App() {

  return (
    <>
      <Toaster />
      <UploadLead />
      <CampaignStarter />
      <CampaignManager />
    </>
  )
}

export default App
