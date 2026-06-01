import CampaignStarter from '../components/CampaignStarter'

const CreateCampaignPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Create Campaign</h2>
        <p className="mt-2 text-slate-600">Build a campaign with message, leads, and launch settings.</p>
      </div>
      <CampaignStarter />
    </div>
  )
}

export default CreateCampaignPage
