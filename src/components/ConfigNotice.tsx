import { AlertTriangle, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { isSupabaseConfigured } from '@/lib/supabase'

export const ConfigNotice = () => {
  if (isSupabaseConfigured) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-b">
      <Alert className="max-w-4xl mx-auto border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800">Konfigurasi Supabase Diperlukan</AlertTitle>
        <AlertDescription className="text-orange-700 mt-2">
          <p className="mb-3">
            Aplikasi POS ini memerlukan konfigurasi Supabase untuk berfungsi dengan baik. 
            Saat ini menggunakan konfigurasi demo yang tidak dapat menyimpan data.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('/SETUP_SUPABASE.md', '_blank')}
              className="border-orange-300 text-orange-800 hover:bg-orange-100"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Panduan Setup
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://supabase.com', '_blank')}
              className="border-orange-300 text-orange-800 hover:bg-orange-100"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Buat Project Supabase
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}