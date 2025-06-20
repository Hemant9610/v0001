import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    console.log('🔐 Submitting login form with:', { email, password: '***' })
    const success = await login(email, password);
    console.log('📊 Login result:', success)
    
    if (success) {
      console.log('✅ Login successful, showing success message')
      setShowSuccess(true);
      setTimeout(() => {
        console.log('🚀 Calling onLogin callback')
        onLogin();
      }, 1500); // Show success message for 1.5 seconds
    }
  };

  // Clear error when user starts typing
  useEffect(() => {
    if (error && (email || password)) {
      clearError();
    }
  }, [email, password, error, clearError]);

  // If already authenticated, trigger onLogin
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Already authenticated, calling onLogin')
      onLogin();
    }
  }, [isAuthenticated, onLogin]);

  // Clear success message when user starts typing again
  useEffect(() => {
    if (showSuccess && (email || password)) {
      setShowSuccess(false);
    }
  }, [email, password, showSuccess]);

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
          {/* Success Message */}
          {showSuccess && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Access granted! Welcome back. Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && !showSuccess && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={isLoading || showSuccess}
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
                disabled={isLoading || showSuccess}
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 mt-6"
              disabled={isLoading || !email || !password || showSuccess}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying credentials...
                </>
              ) : showSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Access Granted!
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Use your registered email and password to continue
            </p>
            <div className="mt-3 p-3 bg-slate-50 rounded-lg border">
              <p className="text-xs text-slate-600 font-medium mb-1">Authentication Status:</p>
              <div className="text-xs text-slate-500 space-y-1">
                <div>• Email verification: Real-time check</div>
                <div>• Password validation: Secure comparison</div>
                <div>• Profile loading: Automatic on success</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;