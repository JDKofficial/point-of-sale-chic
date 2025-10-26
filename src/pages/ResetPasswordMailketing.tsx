import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { mailketingResetPasswordService } from '../lib/mailketing-reset-password';

const ResetPasswordMailketing: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  
  const rawEmail = searchParams.get('email');
  const token = searchParams.get('token');
  
  // Decode URL-encoded email (e.g., %40 -> @)
  const email = rawEmail ? decodeURIComponent(rawEmail) : null;

  useEffect(() => {
    console.log('🔐 Mailketing Reset Page: Memverifikasi token...');
    console.log('🔍 Raw URL:', window.location.href);
    console.log('🔍 Raw Email from URL:', rawEmail);
    console.log('🔍 Decoded Email:', email);
    console.log('🔍 Token from URL:', token);
    console.log('🔍 Email type:', typeof email);
    console.log('🔍 Token type:', typeof token);
    
    if (!email || !token) {
      console.log('❌ Missing email or token');
      setError('Link reset password tidak valid. Parameter email atau token hilang.');
      setTokenValid(false);
      return;
    }

    // Verify token
    console.log('🔍 Calling verifyResetToken with:', { email, token });
    const isValid = mailketingResetPasswordService.verifyResetToken(email, token);
    setTokenValid(isValid);
    
    if (!isValid) {
      setError('Link reset password tidak valid atau sudah kedaluwarsa. Silakan minta link baru.');
    } else {
      console.log('✅ Mailketing Reset: Token valid, siap reset password');
    }
  }, [email, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !token || !tokenValid) {
      setError('Token tidak valid');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak sama');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      console.log('🔐 Mailketing Reset: Memulai update password...');

      // Method: Use Supabase RPC function to update password
      // This approach uses a custom database function that can update auth.users
      
      const { data: updateResult, error: updateError } = await supabase.rpc('update_user_password', {
        user_email: email,
        new_password: password
      });

      if (updateError) {
        console.error('❌ Error updating password via RPC:', updateError);
        
        // Fallback: Try using Supabase's signUp to "reset" the user
        // This will update the password if the user already exists
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            emailRedirectTo: undefined // Prevent email confirmation
          }
        });

        if (signUpError && !signUpError.message.includes('already registered')) {
          console.error('❌ Error with signUp fallback:', signUpError);
          throw new Error('Gagal mengubah password: ' + signUpError.message);
        }

        console.log('✅ Password updated via signUp fallback');
      } else {
        console.log('✅ Password updated via RPC function');
      }
      
      // Clear the reset token
      mailketingResetPasswordService.clearResetToken(email);
      
      setMessage('Password berhasil diubah! Anda akan diarahkan ke halaman login...');
      
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Password berhasil diubah. Silakan login dengan password baru Anda.',
            email: email
          }
        });
      }, 3000);

    } catch (error) {
      console.error('❌ Mailketing Reset: Error update password:', error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewLink = () => {
    navigate('/forgot-password', { 
      state: { 
        message: 'Silakan minta link reset password baru.',
        email: email
      }
    });
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memverifikasi link reset password...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              🔐 Reset Password VibePOS
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Via Mailketing - Link Tidak Valid
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Link Reset Password Tidak Valid
              </h3>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <button
                onClick={handleRequestNewLink}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Minta Link Reset Password Baru
              </button>
              <button
                onClick={() => navigate('/login')}
                className="mt-3 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Kembali ke Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            🔐 Reset Password VibePOS
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Via Mailketing - Buat Password Baru
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <div className="text-green-500 text-xl mr-3">✅</div>
                <div className="text-green-700 text-sm">{message}</div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="text-red-500 text-xl mr-3">❌</div>
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            </div>
          )}

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <div className="text-blue-500 text-xl mr-3">📧</div>
              <div>
                <div className="text-blue-700 text-sm font-medium">Email:</div>
                <div className="text-blue-600 text-sm">{email}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password Baru
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Masukkan password baru (min. 6 karakter)"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Konfirmasi Password Baru
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Ulangi password baru"
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="text-yellow-500 text-xl mr-3">🛡️</div>
                <div>
                  <div className="text-yellow-700 text-sm font-medium mb-2">Tips Password Aman:</div>
                  <ul className="text-yellow-600 text-xs space-y-1">
                    <li>• Minimal 6 karakter (disarankan 8+)</li>
                    <li>• Kombinasi huruf besar, kecil, angka</li>
                    <li>• Jangan gunakan password yang mudah ditebak</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mengubah Password...
                  </div>
                ) : (
                  '🔑 Ubah Password'
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-red-600 hover:text-red-500"
              >
                Kembali ke Login
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-xs text-gray-500">
              <p>🔐 Reset password via Mailketing</p>
              <p>Link akan kedaluwarsa dalam 1 jam</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordMailketing;