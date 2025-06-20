import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database, Eye, EyeOff, Copy, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface DatabaseUser {
  id: number;
  email: string;
  password: string;
  student_id: string;
  created_at: string;
}

const CredentialsDisplay = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('🔍 Fetching all users from database...');
        
        const { data, error } = await supabase
          .from('v0001_auth')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('❌ Error fetching users:', error);
          setError(`Database error: ${error.message}`);
        } else {
          console.log('✅ Users fetched successfully:', data?.length || 0, 'users found');
          setUsers(data || []);
        }
      } catch (err) {
        console.error('💥 Unexpected error:', err);
        setError('Unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Database className="w-8 h-8 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading database credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span className="text-sm font-medium">Back to Login</span>
          </button>

          <Button
            onClick={() => setShowPasswords(!showPasswords)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPasswords ? 'Hide' : 'Show'} Passwords
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-slate-800 mb-2">
            Database Credentials
          </h1>
          <p className="text-slate-600">
            Valid login credentials from the authentication database
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">❌ {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Users Display */}
        {users.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Database className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No users found in the database</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-slate-600 mb-4">
              Found {users.length} user{users.length !== 1 ? 's' : ''} in the database:
            </div>

            {users.map((user, index) => (
              <Card key={user.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>User #{user.id}</span>
                    <span className="text-sm font-normal text-slate-500">
                      Student ID: {user.student_id}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Email */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                        Email
                      </label>
                      <p className="text-slate-800 font-mono">{user.email}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(user.email, index * 2)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedIndex === index * 2 ? (
                        <CheckCircle size={14} className="text-green-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </Button>
                  </div>

                  {/* Password */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                        Password
                      </label>
                      <p className="text-slate-800 font-mono">
                        {showPasswords ? user.password : '•'.repeat(user.password.length)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(user.password, index * 2 + 1)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedIndex === index * 2 + 1 ? (
                        <CheckCircle size={14} className="text-green-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </Button>
                  </div>

                  {/* Created Date */}
                  <div className="text-xs text-slate-500">
                    Created: {new Date(user.created_at).toLocaleString()}
                  </div>

                  {/* Quick Copy Both */}
                  <div className="pt-2 border-t border-slate-200">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const credentials = `Email: ${user.email}\nPassword: ${user.password}`;
                        copyToClipboard(credentials, index * 100);
                      }}
                      className="w-full text-xs"
                    >
                      {copiedIndex === index * 100 ? (
                        <>
                          <CheckCircle size={12} className="mr-1 text-green-600" />
                          Copied Both!
                        </>
                      ) : (
                        <>
                          <Copy size={12} className="mr-1" />
                          Copy Both Credentials
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Instructions */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-medium text-blue-800 mb-2">How to use:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Copy any email and password combination from above</li>
              <li>• Go back to the login page</li>
              <li>• Paste the credentials and sign in</li>
              <li>• Use the "Copy Both Credentials" button for quick copying</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CredentialsDisplay;