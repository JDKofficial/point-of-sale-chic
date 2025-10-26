// Test script untuk reset password functionality
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wwylhjkrtlebzfdlpjtg.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testResetPassword() {
  console.log('🧪 Testing Reset Password Functionality...')
  
  const testEmail = 'testuser@gmail.com'
  
  try {
    // Test 1: Send reset password email
    console.log('📧 Sending reset password email...')
    const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    
    if (error) {
      console.error('❌ Error sending reset email:', error.message)
      return false
    }
    
    console.log('✅ Reset password email sent successfully')
    console.log('📋 Data:', data)
    
    // Test 2: Verify redirect URL configuration
    console.log('🔗 Redirect URL configured:', `${window.location.origin}/reset-password`)
    
    return true
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}

// Run test if in browser environment
if (typeof window !== 'undefined') {
  testResetPassword().then(success => {
    if (success) {
      console.log('🎉 Reset password test completed successfully!')
      console.log('📝 Next steps:')
      console.log('1. Check email inbox for reset link')
      console.log('2. Click the reset link')
      console.log('3. Verify redirect to /reset-password page')
      console.log('4. Test password reset form')
    } else {
      console.log('💥 Reset password test failed!')
    }
  })
}

export { testResetPassword }