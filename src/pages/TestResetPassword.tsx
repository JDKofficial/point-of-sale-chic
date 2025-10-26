import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { ArrowLeft, TestTube } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TestResetPassword() {
  const [email, setEmail] = useState('testuser@gmail.com')
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testResetPasswordFlow = async () => {
    setLoading(true)
    setTestResults([])
    
    try {
      addTestResult('🧪 Memulai test reset password...')
      
      // Test 1: Send reset password email
      addTestResult('📧 Mengirim email reset password...')
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `http://localhost:8081/reset-password`,
      })
      
      if (error) {
        addTestResult(`❌ Error: ${error.message}`)
        toast.error(`Error: ${error.message}`)
        return
      }
      
      addTestResult('✅ Email reset password berhasil dikirim!')
      addTestResult(`🔗 Redirect URL: ${window.location.origin}/reset-password`)
      
      toast.success('Email reset password berhasil dikirim! Cek inbox email Anda.')
      
      // Test 2: Check current session
      const { data: sessionData } = await supabase.auth.getSession()
      addTestResult(`👤 Current session: ${sessionData.session ? 'Authenticated' : 'Not authenticated'}`)
      
      // Test 3: Check project configuration
      addTestResult('⚙️ Konfigurasi project:')
      addTestResult(`   - Supabase URL: ${supabase.supabaseUrl}`)
      addTestResult(`   - Site URL: ${window.location.origin}`)
      
      addTestResult('🎉 Test reset password selesai!')
      addTestResult('📝 Langkah selanjutnya:')
      addTestResult('   1. Cek email inbox untuk link reset')
      addTestResult('   2. Klik link reset password')
      addTestResult('   3. Verifikasi redirect ke /reset-password')
      addTestResult('   4. Test form reset password')
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addTestResult(`💥 Unexpected error: ${errorMessage}`)
      toast.error(`Unexpected error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <TestTube className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Test Reset Password</CardTitle>
          <CardDescription>
            Tool untuk testing fungsi reset password end-to-end
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email untuk Test</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email yang terdaftar"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={testResetPasswordFlow} 
                disabled={loading || !email}
                className="flex-1"
              >
                {loading ? "Testing..." : "🧪 Test Reset Password"}
              </Button>
              <Button 
                onClick={clearResults} 
                variant="outline"
                disabled={testResults.length === 0}
              >
                Clear
              </Button>
            </div>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <Label>Test Results:</Label>
              <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {testResults.join('\n')}
                </pre>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Manual Testing Steps:</h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Klik "Test Reset Password" untuk mengirim email</li>
              <li>Cek inbox email untuk link reset password</li>
              <li>Klik link di email (akan redirect ke /reset-password)</li>
              <li>Isi form reset password dengan password baru</li>
              <li>Verifikasi redirect ke login setelah berhasil</li>
              <li>Test login dengan password baru</li>
            </ol>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}