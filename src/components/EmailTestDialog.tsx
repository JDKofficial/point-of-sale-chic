import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, XCircle, Settings } from 'lucide-react';
import { emailService } from '@/lib/email';

interface EmailTestDialogProps {
  trigger?: React.ReactNode;
}

export function EmailTestDialog({ trigger }: EmailTestDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    error?: string;
  } | null>(null);
  const [allTestResults, setAllTestResults] = useState<{
    mailketing: { success: boolean; message: string; error?: string };
  } | null>(null);
  const [testEmail, setTestEmail] = useState('');

  const handleTestConfiguration = async () => {
    setIsLoading(true);
    setTestResult(null);
    setAllTestResults(null);

    try {
      const result = await emailService.testAllEmailConfigurations();
      setAllTestResults(result);
      
      // Set main result based on Mailketing service
      if (result.mailketing.success) {
        setTestResult({
          success: true,
          message: 'Mailketing berhasil dikonfigurasi'
        });
      } else {
        setTestResult({
          success: false,
          message: 'Mailketing gagal dikonfigurasi',
          error: result.mailketing.error
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Gagal test konfigurasi email',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      setTestResult({
        success: false,
        message: 'Masukkan email untuk test',
        error: 'EMAIL_REQUIRED'
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      const testTransactionData = {
        id: 'test-' + Date.now(),
        transaction_number: 'TEST-' + Date.now(),
        customer_name: 'Test Customer',
        customer_email: testEmail,
        total_amount: 50000,
        payment_method: 'cash',
        discount_amount: 0,
        tax_amount: 5000,
        created_at: new Date().toISOString(),
        store_name: 'VibePOS Test Store',
        store_address: 'Jl. Test No. 123',
        store_phone: '081234567890',
        items: [
          {
            product_name: 'Test Product',
            quantity: 2,
            price: 22500,
            total: 45000
          }
        ]
      };

      const result = await emailService.sendReceiptEmail(testTransactionData);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Gagal mengirim test email',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Test Email
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Test Konfigurasi Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Test Configuration Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Test Konfigurasi</h3>
              <Button 
                onClick={handleTestConfiguration}
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Konfigurasi'
                )}
              </Button>
            </div>

            {/* Test Results */}
            {testResult && (
              <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                    <div className="font-medium">{testResult.message}</div>
                    {testResult.error && (
                      <div className="text-sm mt-1 opacity-80">{testResult.error}</div>
                    )}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Detailed Results */}
            {allTestResults && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700">Detail Hasil Test:</h4>
                
                {/* Mailketing Result */}
                <div className={`p-3 rounded-lg border ${
                  allTestResults.mailketing.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {allTestResults.mailketing.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div className="text-sm font-medium">Mailketing (Primary)</div>
                  </div>
                  <div className="text-xs text-gray-600">{allTestResults.mailketing.message}</div>
                  {allTestResults.mailketing.error && (
                    <div className="text-xs text-red-600">{allTestResults.mailketing.error}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Send Test Email Section */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-medium">Kirim Test Email</h3>
            
            <div className="space-y-2">
              <Label htmlFor="test-email">Email Tujuan</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleSendTestEmail}
              disabled={isLoading || !testEmail}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                'Kirim Test Email'
              )}
            </Button>
          </div>

          {/* Configuration Help */}
          <div className="space-y-3 border-t pt-6">
            <h4 className="font-medium text-sm text-gray-700">Panduan Konfigurasi:</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Mailketing (Primary):</strong> Set VITE_MAILKETING_API_TOKEN dan VITE_MAILKETING_FROM_EMAIL di file .env</li>
                <li>Lihat file <code>docs/mailketing-setup.md</code> untuk panduan setup Mailketing</li>
                <li><strong>Supabase (Fallback):</strong> Edge Function akan digunakan jika Mailketing gagal</li>
              </ul>
              <div className="mt-3 p-2 bg-blue-50 rounded text-blue-800 text-xs">
                <strong>Info:</strong> Sistem menggunakan Mailketing sebagai primary email service dengan Supabase sebagai fallback
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}