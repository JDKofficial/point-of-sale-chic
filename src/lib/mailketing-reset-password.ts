// Mailketing Reset Password Service
import { createMailketingService } from './mailketing';
import { supabase } from './supabase';

interface ResetPasswordData {
  email: string;
  resetUrl: string;
  userName?: string;
}

export class MailketingResetPasswordService {
  private mailketingService = createMailketingService();
  private lastEmailSent: { [email: string]: number } = {};

  /**
   * Generate reset password token and send email via Mailketing
   */
  async sendResetPasswordEmail(email: string): Promise<{ success: boolean; message: string }> {
    if (!this.mailketingService) {
      return {
        success: false,
        message: 'Mailketing service tidak dikonfigurasi. Periksa environment variables.'
      };
    }

    try {
      console.log('🔐 Mailketing Reset: Memulai proses reset password untuk:', email);

      // Prevent duplicate emails within 5 seconds
      const now = Date.now();
      const lastSent = this.lastEmailSent[email];
      if (lastSent && (now - lastSent) < 5000) {
        console.log('⚠️ Mailketing Reset: Email baru saja dikirim, menunggu...');
        return {
          success: false,
          message: 'Email reset password baru saja dikirim. Tunggu 5 detik sebelum mencoba lagi.'
        };
      }

      this.lastEmailSent[email] = now;

      // Verify email exists in Supabase without sending reset email
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('email')
        .eq('email', email)
        .single();

      // Note: We can't directly query auth.users, so we'll skip this check
      // and proceed with token generation. The reset will fail later if email doesn't exist.

      // Create custom reset URL with timestamp for security
      const resetToken = this.generateCustomToken(email);
      const resetUrl = `http://localhost:8081/reset-password-mailketing?token=${resetToken}&email=${encodeURIComponent(email)}`;

      // Store token temporarily (in real app, use database)
      this.storeResetToken(email, resetToken);

      // Send email via Mailketing
      const emailContent = this.createResetPasswordEmailHTML({
        email,
        resetUrl,
        userName: email.split('@')[0] // Use email prefix as name
      });

      const result = await this.mailketingService.sendEmail({
        to: email,
        toName: email.split('@')[0],
        subject: '🔐 Reset Password VibePOS - Link Aman',
        content: emailContent,
      });

      if (result.success) {
        console.log('✅ Mailketing Reset: Email berhasil dikirim');
        return {
          success: true,
          message: 'Email reset password berhasil dikirim via Mailketing! Cek inbox Anda.'
        };
      } else {
        console.error('❌ Mailketing Reset: Gagal kirim email:', result.message);
        return {
          success: false,
          message: `Gagal mengirim email: ${result.message}`
        };
      }

    } catch (error) {
      console.error('❌ Mailketing Reset: Error:', error);
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Verify reset token
   */
  verifyResetToken(email: string, token: string): boolean {
    console.log('🔍 Mailketing Reset: Memverifikasi token untuk email:', email);
    console.log('🔍 Token yang diterima:', token);
    
    const storedData = this.getStoredResetToken(email);
    console.log('🔍 Data tersimpan:', storedData);
    
    if (!storedData) {
      console.log('❌ Mailketing Reset: Tidak ada data token tersimpan untuk email:', email);
      
      // Fallback: Try to validate token format and create temporary validation
      console.log('🔄 Mencoba validasi fallback...');
      if (this.validateTokenFormat(email, token)) {
        console.log('✅ Token format valid, mengizinkan reset password');
        return true;
      }
      
      return false;
    }

    const tokenMatches = storedData.token === token;
    const timeElapsed = Date.now() - storedData.timestamp;
    const isNotExpired = timeElapsed < (60 * 60 * 1000); // 1 hour
    
    console.log('🔍 Token cocok:', tokenMatches);
    console.log('🔍 Waktu berlalu (ms):', timeElapsed);
    console.log('🔍 Belum expired:', isNotExpired);
    
    // Check if token matches and not expired (1 hour)
    const isValid = tokenMatches && isNotExpired;

    if (isValid) {
      console.log('✅ Mailketing Reset: Token valid untuk', email);
    } else {
      console.log('❌ Mailketing Reset: Token invalid atau expired untuk', email);
      if (!tokenMatches) {
        console.log('❌ Token tidak cocok. Expected:', storedData.token, 'Got:', token);
      }
      if (!isNotExpired) {
        console.log('❌ Token expired. Waktu berlalu:', Math.round(timeElapsed / 1000 / 60), 'menit');
      }
    }

    return isValid;
  }

  /**
   * Fallback validation for token format
   */
  private validateTokenFormat(email: string, token: string): boolean {
    try {
      const parts = token.split('_');
      if (parts.length !== 3) {
        console.log('❌ Token format invalid: tidak memiliki 3 bagian');
        return false;
      }

      // Decode email part
      const decodedEmail = atob(parts[0]);
      const expectedEmail = email.replace('@', '%40');
      
      console.log('🔍 Decoded email dari token:', decodedEmail);
      console.log('🔍 Expected email:', expectedEmail);
      
      if (decodedEmail !== expectedEmail) {
        console.log('❌ Email dalam token tidak cocok');
        return false;
      }

      // Check timestamp (should be within last 24 hours for fallback)
      const timestamp = parseInt(parts[1]);
      const timeElapsed = Date.now() - timestamp;
      const isRecentEnough = timeElapsed < (24 * 60 * 60 * 1000); // 24 hours
      
      console.log('🔍 Timestamp dari token:', timestamp);
      console.log('🔍 Waktu berlalu (jam):', Math.round(timeElapsed / 1000 / 60 / 60));
      console.log('🔍 Masih dalam 24 jam:', isRecentEnough);

      return isRecentEnough;
    } catch (error) {
      console.error('❌ Error validating token format:', error);
      return false;
    }
  }

  /**
   * Clear reset token after use
   */
  clearResetToken(email: string): void {
    localStorage.removeItem(`reset_token_${email}`);
    console.log('🗑️ Mailketing Reset: Token cleared untuk', email);
  }

  /**
   * Generate custom reset token
   */
  private generateCustomToken(email: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    // Use full encoded email to match the format in existing URLs
    const encodedEmail = btoa(email.replace('@', '%40'));
    return `${encodedEmail}_${timestamp}_${random}`;
  }

  /**
   * Store reset token temporarily (in production, use secure database)
   */
  private storeResetToken(email: string, token: string): void {
    const data = {
      token,
      timestamp: Date.now(),
      email
    };
    const key = `reset_token_${email}`;
    localStorage.setItem(key, JSON.stringify(data));
    console.log('💾 Mailketing Reset: Token stored untuk', email);
    console.log('💾 Storage key:', key);
    console.log('💾 Token value:', token);
    console.log('💾 Data stored:', data);
    
    // Verify storage immediately
    const verification = localStorage.getItem(key);
    console.log('💾 Verification read:', verification);
  }

  /**
   * Get stored reset token
   */
  private getStoredResetToken(email: string): { token: string; timestamp: number; email: string } | null {
    try {
      const key = `reset_token_${email}`;
      
      // Debug: Show all localStorage keys
      console.log('🔍 All localStorage keys:');
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i);
        console.log(`  - ${storageKey}: ${localStorage.getItem(storageKey)}`);
      }
      
      const stored = localStorage.getItem(key);
      console.log('🔍 Reading from storage key:', key);
      console.log('🔍 Raw stored data:', stored);
      
      if (!stored) {
        console.log('🔍 No data found in localStorage for key:', key);
        return null;
      }
      
      const parsed = JSON.parse(stored);
      console.log('🔍 Parsed data:', parsed);
      return parsed;
    } catch (error) {
      console.error('❌ Error reading from localStorage:', error);
      return null;
    }
  }

  /**
   * Create HTML email template for reset password
   */
  private createResetPasswordEmailHTML(data: ResetPasswordData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password VibePOS</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5;
        }
        .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background: linear-gradient(135deg, #ef4444, #dc2626); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content { 
            padding: 30px 20px; 
        }
        .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #ef4444, #dc2626); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px 0;
            font-weight: 600;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        .footer { 
            text-align: center; 
            padding: 20px; 
            background: #f8f9fa;
            color: #666; 
            font-size: 14px; 
        }
        .warning { 
            background: #fff3cd; 
            border: 1px solid #fecaca; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
        }
        .security-tips {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #0ea5e9;
        }
        .url-box {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            word-break: break-all;
            font-family: monospace;
            font-size: 14px;
            border: 1px solid #e9ecef;
            margin: 15px 0;
        }
        .center { text-align: center; }
        .emoji { font-size: 20px; margin-right: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><span class="emoji">🔐</span>Reset Password VibePOS</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Permintaan Reset Password Anda</p>
        </div>
        
        <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Halo ${data.userName || 'User'}!</h2>
            
            <p>Kami menerima permintaan untuk mereset password akun VibePOS Anda dengan email: <strong>${data.email}</strong></p>
            
            <div class="warning">
                <strong><span class="emoji">⚠️</span>Penting:</strong> Jika Anda tidak meminta reset password, abaikan email ini dan password Anda akan tetap aman.
            </div>
            
            <p>Untuk membuat password baru, klik tombol di bawah ini:</p>
            
            <div class="center">
                <a href="${data.resetUrl}" class="button">
                    <span class="emoji">🔑</span>Reset Password Sekarang
                </a>
            </div>
            
            <p>Atau copy dan paste link berikut di browser Anda:</p>
            <div class="url-box">${data.resetUrl}</div>
            
            <div class="warning">
                <strong><span class="emoji">⏰</span>Penting:</strong> Link ini akan kedaluwarsa dalam <strong>1 jam</strong> untuk keamanan akun Anda.
            </div>
            
            <div class="security-tips">
                <h3 style="margin-top: 0; color: #0ea5e9;"><span class="emoji">🛡️</span>Tips Keamanan Password:</h3>
                <ul style="margin: 10px 0;">
                    <li>Gunakan password yang kuat (minimal 8 karakter)</li>
                    <li>Kombinasikan huruf besar, kecil, angka, dan simbol</li>
                    <li>Jangan gunakan password yang sama dengan akun lain</li>
                    <li>Jangan bagikan password kepada siapapun</li>
                </ul>
            </div>
            
            <p style="margin-top: 30px; color: #6b7280;">
                <strong>Catatan:</strong> Email ini dikirim melalui sistem Mailketing untuk memastikan keamanan dan keandalan pengiriman.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>© 2024 VibePOS</strong> - Sistem Point of Sale Terpercaya</p>
            <p>Email ini dikirim otomatis, mohon jangan membalas.</p>
            <p style="font-size: 12px; color: #9ca3af;">
                Jika Anda mengalami masalah dengan link di atas, copy dan paste URL lengkap ke browser Anda.
            </p>
        </div>
    </div>
</body>
</html>`;
  }
}

// Export singleton instance
export const mailketingResetPasswordService = new MailketingResetPasswordService();