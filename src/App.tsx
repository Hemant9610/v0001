import React from 'react'
import { useState } from 'react'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider, useSupabaseAuth } from "./contexts/AuthContext"
import { SupabaseAuth } from "./components/SupabaseAuth"
import { Dashboard } from "./components/Dashboard"
import Index from "./pages/Index"
import Profile from "./pages/Profile"
import NotFound from "./pages/NotFound"
import Login from "./pages/Login"
import CredentialsDisplay from "./pages/CredentialsDisplay"

const queryClient = new QueryClient()

// Main App Content Component
const AppContent: React.FC = () => {
  const { user, loading } = useSupabaseAuth()
  const [useCustomAuth, setUseCustomAuth] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    console.log('🚀 App: Login successful, setting isLoggedIn to true')
    setIsLoggedIn(true)
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If using custom auth and not logged in, show custom login
  if (useCustomAuth && !isLoggedIn) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/credentials" element={<CredentialsDisplay />} />
          <Route path="*" element={
            <div>
              <div className="fixed top-4 right-4 z-50">
                <button
                  onClick={() => setUseCustomAuth(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  Switch to Supabase Auth
                </button>
              </div>
              <Login onLogin={handleLogin} />
            </div>
          } />
        </Routes>
      </BrowserRouter>
    )
  }

  // If using custom auth and logged in, show main app
  if (useCustomAuth && isLoggedIn) {
    return (
      <BrowserRouter>
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => {
              setUseCustomAuth(false)
              setIsLoggedIn(false)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Switch to Supabase Auth
          </button>
        </div>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/credentials" element={<CredentialsDisplay />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    )
  }

  // If not authenticated with Supabase, show Supabase Auth UI
  if (!user) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setUseCustomAuth(true)}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm hover:bg-slate-700 transition"
          >
            Switch to Custom Auth
          </button>
        </div>
        <SupabaseAuth />
      </div>
    )
  }

  // If authenticated with Supabase, show Dashboard
  return (
    <div>
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setUseCustomAuth(true)}
          className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm hover:bg-slate-700 transition"
        >
          Switch to Custom Auth
        </button>
      </div>
      <Dashboard />
    </div>
  )
}

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App