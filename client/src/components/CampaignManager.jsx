import { useState, useEffect } from "react"
import useFetch from "../hooks/useFetch"

const CampaignManager = () => {
    const { data: campaigns, loading: campaignsLoading } = useFetch('http://localhost:4000/api/campaigns', 'GET')
    const [message, setMessage] = useState(null)
    const [updatingId, setUpdatingId] = useState(null)
    const [localCampaigns, setLocalCampaigns] = useState(campaigns)

    // Sync campaigns when they load
    useEffect(() => {
        if (campaigns) setLocalCampaigns(campaigns)
    }, [campaigns])

    const handleStatusChange = async (campaignId, newStatus) => {
        setMessage(null)
        setUpdatingId(campaignId)

        try {
            const res = await fetch(`http://localhost:4000/api/campaign/${campaignId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (!res.ok) throw new Error('Failed to update status')

            const updated = await res.json()
            setLocalCampaigns(prev => prev.map(c => c._id === campaignId ? updated : c))
            setMessage({ type: 'success', text: `Campaign ${newStatus}!` })
        } catch (err) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setUpdatingId(null)
        }
    }

    const handleDeleteCampaign = async (campaignId) => {
        setMessage(null)

        if (!window.confirm('Delete this campaign? This cannot be undone.')) {
            return
        }

        setUpdatingId(campaignId)

        try {
            const res = await fetch(`http://localhost:4000/api/campaign/${campaignId}`, {
                method: 'DELETE'
            })

            if (!res.ok) throw new Error('Failed to delete campaign')

            setLocalCampaigns(prev => prev.filter(c => c._id !== campaignId))
            setMessage({ type: 'success', text: 'Campaign deleted.' })
        } catch (err) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setUpdatingId(null)
        }
    }

    return (
        <div className="p-5">
            <h2 className="text-2xl font-bold mb-5">Campaign Manager</h2>

            {message && (
                <div className={`px-4 py-2 rounded mb-4 ${message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-400' : 'bg-green-100 text-green-700 border border-green-400'}`}>
                    {message.text}
                </div>
            )}

            {campaignsLoading ? (
                <p className="text-gray-500">Loading campaigns...</p>
            ) : localCampaigns && localCampaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {localCampaigns.map(campaign => (
                        <div key={campaign._id} className="bg-white rounded-lg shadow-md p-4 border">
                            <h3 className="text-lg font-semibold mb-2">{campaign.name}</h3>
                            {campaign.description && (
                                <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                            )}
                            <div className="mb-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    campaign.status === 'active' ? 'bg-green-200 text-green-800' : 
                                    campaign.status === 'completed' ? 'bg-blue-200 text-blue-800' : 
                                    'bg-gray-200 text-gray-800'
                                }`}>
                                    {campaign.status}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">Progress: {campaign.progress}%</p>
                            <div className="flex flex-wrap gap-2">
                                {campaign.status === 'inactive' && (
                                    <button
                                        onClick={() => handleStatusChange(campaign._id, 'active')}
                                        disabled={updatingId === campaign._id}
                                        className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-3 rounded text-sm"
                                    >
                                        {updatingId === campaign._id ? 'Starting...' : 'Start'}
                                    </button>
                                )}
                                {campaign.status === 'active' && (
                                    <button
                                        onClick={() => handleStatusChange(campaign._id, 'inactive')}
                                        disabled={updatingId === campaign._id}
                                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-2 px-3 rounded text-sm"
                                    >
                                        {updatingId === campaign._id ? 'Stopping...' : 'Stop'}
                                    </button>
                                )}
                                {campaign.status === 'completed' && (
                                    <button
                                        onClick={() => handleStatusChange(campaign._id, 'active')}
                                        disabled={updatingId === campaign._id}
                                        className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-3 rounded text-sm"
                                    >
                                        {updatingId === campaign._id ? 'Restarting...' : 'Restart'}
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDeleteCampaign(campaign._id)}
                                    disabled={updatingId === campaign._id}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-semibold py-2 px-3 rounded text-sm"
                                >
                                    {updatingId === campaign._id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center py-8">No campaigns yet. Create one to get started!</p>
            )}
        </div>
    )
}

export default CampaignManager
