import { useState } from "react"
import useFetch from "../hooks/useFetch"
import usePost from "../hooks/usePost"

const CampaignStarter = () => {
    const { data: leads, loading: leadsLoading } = useFetch('http://localhost:4000/api/leads', 'GET')
    const { post: createCampaign, loading: submitting, error, success } = usePost('http://localhost:4000/api/campaign')
    
    const [form, setForm] = useState({ name: '', description: '', message: '', leads: [] })
    const [message, setMessage] = useState(null)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name === 'lead' ? 'leads' : name]: name === 'lead' ? (value ? [value] : []) : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage(null)

        try {
            await createCampaign(form)
            setMessage({ type: 'success', text: 'Campaign created!' })
            setForm({ name: '', description: '', message: '', leads: [] })
        } catch (err) {
            setMessage({ type: 'error', text: err })
        }
    }

    return (
        <div className="flex justify-center m-1">
            <form onSubmit={handleSubmit} className="flex flex-col text-start bg-gray-50 rounded-xl p-5 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Create Campaign</h2>
                
                {message && (
                    <div className={`px-4 py-2 rounded mb-4 ${message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-400' : 'bg-green-100 text-green-700 border border-green-400'}`}>
                        {message.text}
                    </div>
                )}

                <label className="font-semibold">Campaign Name</label>
                <input 
                    type="text" 
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="border rounded-lg p-2 my-1" 
                    placeholder="Enter campaign name"
                />

                <label className="font-semibold mt-3">Description</label>
                <textarea 
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="border rounded-lg p-2 my-1" 
                    placeholder="Enter campaign description"
                    rows="2"
                />

                <label className="font-semibold mt-3">Lead</label>
                <select 
                    name="lead"
                    value={form.leads[0] || ''}
                    onChange={handleChange}
                    required
                    className="border rounded-lg p-2 my-1"
                    disabled={leadsLoading}
                >
                    <option value="">Select a lead...</option>
                    {leads?.map(lead => (
                        <option key={lead._id} value={lead._id}>{lead.name}</option>
                    ))}
                </select>

                <label className="font-semibold mt-3">Message</label>
                <textarea 
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    className="border rounded-lg p-2 my-1" 
                    placeholder="Enter message for the campaign"
                    rows="2"
                />

                <button 
                    type="submit" 
                    disabled={submitting || leadsLoading}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded mt-4"
                >
                    {submitting ? 'Creating...' : 'Create Campaign'}
                </button>
            </form>
        </div>
    )
}

export default CampaignStarter