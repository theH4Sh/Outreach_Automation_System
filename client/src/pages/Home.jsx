import CampaignManager from "../components/CampaignManager"
import CampaignStarter from "../components/CampaignStarter"
import UploadLead from "../components/UploadLead"

const Home = () => {
  return (
    <div className="home">
        <UploadLead />
        <CampaignStarter />
        <CampaignManager />
    </div>
  )
}

export default Home