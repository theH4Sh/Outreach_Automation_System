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
import Integrations from './pages/Integrations'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { useSelector } from 'react-redux'

function App() {

  const auth = useSelector((state) => state.auth);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="login" element={ !auth.isAuthenticated ? <Login /> : <Navigate to='/' />} />
        <Route path="signup" element={ !auth.isAuthenticated ? <SignUp /> : <Navigate to='/' />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
      <Route path="/" element={<RootLayout />}>
        <Route index element={ auth.isAuthenticated ? <Home /> : <Navigate to='/login' />} />
        <Route path="upload" element={ auth.isAuthenticated ? <UploadLeadPage /> : <Navigate to='/' />} />
        <Route path="create-campaign" element={ auth.isAuthenticated ? <CreateCampaignPage /> : <Navigate to='/' />} />
        <Route path="scraper" element={ auth.isAuthenticated ? <LeadScraper /> : <Navigate to='/' />} />
        <Route path="integrations" element={ auth.isAuthenticated ? <Integrations /> : <Navigate to='/' />} />
        <Route path="campaigns" element={ auth.isAuthenticated ? <CampaignManagerPage /> : <Navigate to='/' />} />
        <Route path="campaigns/:id" element={ auth.isAuthenticated ? <CampaignDetailPage /> : <Navigate to='/' />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </>
    ))
  return (
    <>
      <Toaster />
      <RouterProvider router={router} />
    </>
  )
}

export default App
