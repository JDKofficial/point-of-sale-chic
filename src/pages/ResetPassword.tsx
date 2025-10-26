import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Eye, EyeOff, ArrowLeft, ShoppingCart, AlertCircle } from 'lucide-react'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSessionValid, setIsSessionValid] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Parse parameters from both hash fragment and query params
  const hashParams = new URLSearchParams(location.hash.substring(1))
  const queryParams = new URLSearchParams(location.search)
  
  // Try to get parameters from both sources
  const accessToken = hashParams.get('access_token')
  const refreshToken = hashParams.get('refresh_token')
  const tokenHash = queryParams.get('token_hash')
  const type = hashParams.get('type') || queryParams.get('type')

  // Debug logging
  console.log('=== RESET PASSWORD DEBUG ===')
  console.log('Full URL:', window.location.href)
  console.log('Hash:', location.hash)
  console.log('Search:', location.search)
  console.log('Hash params:', hashParams.toString())
  console.log('Query params:', queryParams.toString())
  console.log('Access Token:', accessToken ? 'Present' : 'Missing')
  console.log('Refresh Token:', refreshToken ? 'Present' : 'Missing')
  console.log('Token Hash:', tokenHash ? 'Present' : 'Missing')
  console.log('Type:', type)
  console.log('==============================')

  useEffect(() => {
    const setSession = async () => {
      setSessionLoading(true)
      setSessionError(null)

      // Check if we have the new token_hash format
      if (tokenHash && type === 'recovery') {
        console.log('Using new token_hash format')
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          })

          if (error) {
            console.error('Token verification error:', error)
            setSessionError(`Link reset password tidak valid atau sudah kedaluwarsa: ${error.message}`)
            setSessionLoading(false)
            return
          }

          if (data.session) {
            setIsSessionValid(true)
            toast.success('Link reset password valid. Silakan masukkan password baru Anda.')
          } else {
            setSessionError('Tidak dapat membuat session yang valid.')
          }
        } catch (error) {
          console.error('Unexpected error:', error)
          setSessionError('Terjadi kesalahan tidak terduga saat memproses link reset password.')
        } finally {
          setSessionLoading(false)
        }
        return
      }

      // Fallback to old access_token format
      if (accessToken && refreshToken && type === 'recovery') {
        console.log('Using old access_token format')
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            console.error('Session error:', error)
            setSessionError(`Link reset password tidak valid atau sudah kedaluwarsa: ${error.message}`)
            setSessionLoading(false)
            return
          }

          if (data.session) {
            setIsSessionValid(true)
            toast.success('Link reset password valid. Silakan masukkan password baru Anda.')
          } else {
            setSessionError('Tidak dapat membuat session yang valid.')
          }
        } catch (error) {
          console.error('Unexpected error:', error)
          setSessionError('Terjadi kesalahan tidak terduga saat memproses link reset password.')
        } finally {
          setSessionLoading(false)
        }
        return
      }

      // If neither format is valid
      setSessionError('Link reset password tidak valid. Parameter yang diperlukan tidak lengkap.')
      setSessionLoading(false)
    }

    setSession()
  }, [accessToken, refreshToken, tokenHash, type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi password
    if (!password.trim()) {
      toast.error('Password tidak boleh kosong')
      return
    }

    if (password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        console.error('Update password error:', error)
        toast.error(`Gagal mengubah password: ${error.message}`)
      } else {
        toast.success('Password berhasil diubah! Silakan login dengan password baru.')
        // Sign out user setelah reset password untuk keamanan
        await supabase.auth.signOut()
        navigate('/login')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('Terjadi kesalahan tidak terduga saat mengubah password')
    } finally {
      setLoading(false)
    }
  }

  const handleRetryWithNewLink = () => {
    navigate('/forgot-password')
  }

  // Loading state saat memproses session
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Memproses Link Reset Password
              </h2>
              <p className="text-gray-600">
                Mohon tunggu sebentar...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state jika session tidak valid
  if (sessionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Link Reset Password Tidak Valid
              </h2>
              <p className="text-gray-600 mb-6">
                {sessionError}
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={handleRetryWithNewLink}
                  className="w-full"
                >
                  Minta Link Reset Password Baru
                </Button>
                <Link 
                  to="/login" 
                  className="block text-center text-sm text-blue-600 hover:text-blue-500"
                >
                  Kembali ke Login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Jika session belum valid, tampilkan loading atau error
  if (!isSessionValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Memproses Link Reset Password
              </h2>
              <p className="text-gray-600">
                Mohon tunggu sebentar...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Masukkan password baru untuk akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password Baru</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password baru (min. 6 karakter)"
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password baru"
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Password strength indicator */}
            {password && (
              <div className="space-y-2">
                <div className="text-xs text-gray-600">
                  Kekuatan Password:
                </div>
                <div className="flex space-x-1">
                  <div className={`h-1 w-1/4 rounded ${password.length >= 6 ? 'bg-green-500' : 'bg-gray-200'}`} />
                  <div className={`h-1 w-1/4 rounded ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`} />
                  <div className={`h-1 w-1/4 rounded ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-200'}`} />
                  <div className={`h-1 w-1/4 rounded ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-200'}`} />
                </div>
                <div className="text-xs text-gray-500">
                  Gunakan minimal 6 karakter dengan kombinasi huruf dan angka
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !password || !confirmPassword}>
              {loading ? "Mengubah Password..." : "Ubah Password"}
            </Button>
          </form>
          <div className="mt-6 text-center">
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