import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import { debugAuth } from '@/lib/debugAuth'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  
  const { signIn, user } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />
  }

  const handleDebugTest = async () => {
    setDebugInfo('Running diagnostic...')
    await debugAuth.runDiagnostic()
    
    // Test with current form values if provided
    if (email && password) {
      const result = await debugAuth.testUserLogin(email, password)
      if (result.success) {
        setDebugInfo('✅ Debug test successful! User credentials are valid.')
      } else {
        setDebugInfo(`❌ Debug test failed: ${result.error}`)
      }
    } else {
      setDebugInfo('✅ Diagnostic complete. Check browser console for details.')
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setDebugInfo('')

    // Basic validation
    if (!email.trim()) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }

    if (!password) {
      setError('Please enter your password')
      setLoading(false)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      console.log('🔐 Attempting login with:', { email: email.trim(), passwordLength: password.length })
      
      const { error } = await signIn(email, password)
      
      if (error) {
        console.error('Sign in error:', error)
        setError(error.message)
        
        // Run debug test on failure
        console.log('🔍 Running debug test due to login failure...')
        const debugResult = await debugAuth.testUserLogin(email, password)
        if (debugResult.success) {
          setDebugInfo('⚠️ Debug test passed but login failed. Check AuthContext implementation.')
        } else {
          setDebugInfo(`Debug test also failed: ${debugResult.error}`)
        }
      } else {
        console.log('✅ Login successful')
        navigate('/')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
    }
    
    setLoading(false)
  }

  const fillTestCredentials = async () => {
    const users = await debugAuth.listAllUsers()
    if (users.length > 0) {
      setEmail(users[0].email)
      setPassword('password123') // Common test password
      setDebugInfo(`Filled with: ${users[0].email}`)
    } else {
      const testUser = await debugAuth.createTestUser()
      if (testUser) {
        setEmail(testUser.email)
        setPassword(testUser.password)
        setDebugInfo(`Created and filled test user: ${testUser.email}`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-md"></div>
            </div>
          </div>
          
          <h1 className="text-4xl font-light text-slate-800 mb-2 tracking-tight">
            profeshare
          </h1>
          <p className="text-slate-600">
            Sign in to your account
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="h-12"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="h-12"
                disabled={loading}
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {debugInfo && (
              <Alert>
                <AlertDescription className="text-xs font-mono whitespace-pre-wrap">
                  {debugInfo}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2">
              <Button 
                type="submit"
                disabled={loading}
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleDebugTest}
                disabled={loading}
                className="h-12 px-3"
                title="Run Debug Test"
              >
                🔍
              </Button>
            </div>
          </form>
          
          <div className="mt-6 space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={fillTestCredentials}
              className="w-full"
              disabled={loading}
            >
              Fill Test Credentials
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-slate-500">
                Use your credentials from the v0001_auth table
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Click "🔍" to run diagnostics or check browser console
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login