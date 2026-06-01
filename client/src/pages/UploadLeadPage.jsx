import UploadLead from '../components/UploadLead'

const UploadLeadPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Upload Leads</h2>
        <p className="mt-2 text-slate-600">Drop a CSV file and bring in new lead data instantly.</p>
      </div>
      <UploadLead />
    </div>
  )
}

export default UploadLeadPage
