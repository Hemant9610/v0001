import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export const SupabaseAuth = () => {
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
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              style: {
                button: {
                  background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                  color: 'white',
                  borderRadius: '0.75rem',
                  height: '3rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s',
                },
                input: {
                  borderRadius: '0.5rem',
                  height: '3rem',
                  fontSize: '0.875rem',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                },
                label: {
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                },
                message: {
                  fontSize: '0.875rem',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                },
                container: {
                  gap: '1rem',
                },
                divider: {
                  background: '#e2e8f0',
                  margin: '1rem 0',
                },
              },
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#f8fafc',
                    defaultButtonBackgroundHover: '#f1f5f9',
                    inputBackground: 'white',
                    inputBorder: '#e2e8f0',
                    inputBorderHover: '#cbd5e1',
                    inputBorderFocus: '#3b82f6',
                  },
                  space: {
                    spaceSmall: '4px',
                    spaceMedium: '8px',
                    spaceLarge: '16px',
                    labelBottomMargin: '8px',
                    anchorBottomMargin: '4px',
                    emailInputSpacing: '4px',
                    socialAuthSpacing: '4px',
                    buttonPadding: '10px 15px',
                    inputPadding: '10px 15px',
                  },
                  fontSizes: {
                    baseBodySize: '14px',
                    baseInputSize: '14px',
                    baseLabelSize: '14px',
                    baseButtonSize: '14px',
                  },
                  fonts: {
                    bodyFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                    buttonFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                    inputFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                    labelFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '12px',
                    buttonBorderRadius: '12px',
                    inputBorderRadius: '8px',
                  },
                },
              },
            }}
            providers={['google', 'github']}
            redirectTo={window.location.origin}
            onlyThirdPartyProviders={false}
            magicLink={false}
            showLinks={true}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email address',
                  password_label: 'Password',
                  button_label: 'Sign In',
                  loading_button_label: 'Signing in...',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: "Don't have an account? Sign up",
                },
                sign_up: {
                  email_label: 'Email address',
                  password_label: 'Create a password',
                  button_label: 'Sign Up',
                  loading_button_label: 'Signing up...',
                  social_provider_text: 'Sign up with {{provider}}',
                  link_text: 'Already have an account? Sign in',
                  confirmation_text: 'Check your email for the confirmation link',
                },
                magic_link: {
                  email_input_label: 'Email address',
                  email_input_placeholder: 'Your email address',
                  button_label: 'Send magic link',
                  loading_button_label: 'Sending magic link...',
                  link_text: 'Send a magic link email',
                  confirmation_text: 'Check your email for the magic link',
                },
                forgotten_password: {
                  email_label: 'Email address',
                  password_label: 'Your password',
                  email_input_placeholder: 'Your email address',
                  button_label: 'Send reset instructions',
                  loading_button_label: 'Sending reset instructions...',
                  link_text: 'Forgot your password?',
                  confirmation_text: 'Check your email for the password reset link',
                },
                update_password: {
                  password_label: 'New password',
                  password_input_placeholder: 'Your new password',
                  button_label: 'Update password',
                  loading_button_label: 'Updating password...',
                  confirmation_text: 'Your password has been updated',
                },
                verify_otp: {
                  email_input_label: 'Email address',
                  email_input_placeholder: 'Your email address',
                  phone_input_label: 'Phone number',
                  phone_input_placeholder: 'Your phone number',
                  token_input_label: 'Verification code',
                  token_input_placeholder: 'Your verification code',
                  button_label: 'Verify',
                  loading_button_label: 'Signing in...',
                },
              },
            }}
          />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Secure authentication powered by Supabase
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}