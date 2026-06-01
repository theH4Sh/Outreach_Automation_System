import CampaignManager from '../components/CampaignManager'

const CampaignManagerPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Campaign Manager</h2>
        <p className="mt-2 text-slate-600">Review active campaigns, adjust statuses, and remove outdated flows.</p>
      </div>
      <CampaignManager />
    </div>
  )
}

export default CampaignManagerPage
