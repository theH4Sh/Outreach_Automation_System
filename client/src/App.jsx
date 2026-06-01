import { Toaster } from 'react-hot-toast'
import './App.css'
import './components/CampaignStarter'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router'
import RootLayout from './layout/RootLayout'
import Home from './pages/Home'

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
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
