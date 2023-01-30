import './App.css'
import '@tremor/react/dist/esm/tremor.css'
import { HomeView } from './components/HomeView'
import { MapView } from './components/MapView'
import { DevicesView } from './components/DevicesView'
import { Routes, Route } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import ScrollToTop from './components/ScrollToTop'
import { DetailsView } from './components/DetailsView'
import { AuthProvider } from './common/AuthProvider'
import { ProtectedRoute } from './common/ProtectedRoute'
import { LoginView } from './components/LoginView'
import { UsersView } from './components/UsersView'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    document.title = 'IoT Receiver'
  })
  return (
    <div className="App flex flex-col h-screen justify-between">
      <AuthProvider>
        <Header />
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route
            path="/"
            title="Home"
            element={
              <ProtectedRoute>
                <HomeView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/devices"
            element={
              <ProtectedRoute>
                <DevicesView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/details"
            element={
              <ProtectedRoute>
                <DetailsView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersView />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <HomeView />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </AuthProvider>
    </div>
  )
}

export default App
