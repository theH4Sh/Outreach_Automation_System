import { Toaster } from 'react-hot-toast'
import './App.css'
import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router'
import RootLayout from './layout/RootLayout'
import Home from './pages/Home'
import UploadLeadPage from './pages/UploadLeadPage'
import CreateCampaignPage from './pages/CreateCampaignPage'
import CampaignManagerPage from './pages/CampaignManagerPage'
import CampaignDetailPage from './pages/CampaignDetailPage'
import LeadScraper from './pages/LeadScraper'

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="upload" element={<UploadLeadPage />} />
        <Route path="create-campaign" element={<CreateCampaignPage />} />
        <Route path="scraper" element={<LeadScraper />} />
        <Route path="campaigns" element={<CampaignManagerPage />} />
        <Route path="campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    ))
  return (
    <>
      <Toaster />
      <RouterProvider router={router} />
    </>
  )
}

export default App
