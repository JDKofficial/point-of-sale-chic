import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we have valid Supabase configuration
const hasValidConfig = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url' && 
  supabaseAnonKey !== 'your_supabase_anon_key'

if (!hasValidConfig) {
  console.warn('⚠️  Supabase not configured properly!')
  console.warn('Please update your .env.local file with your actual Supabase project details.')
  console.warn('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
  console.warn('See SETUP_SUPABASE.md for detailed instructions.')
}

// Create Supabase client with fallback for development
export const supabase = createClient(
  hasValidConfig ? supabaseUrl : 'https://demo.supabase.co', 
  hasValidConfig ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjQ0NjQwMCwiZXhwIjoxOTU4MDIyNDAwfQ.demo', 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Export configuration status for components to check
export const isSupabaseConfigured = hasValidConfig

// Database types (will be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      stores: {
        Row: {
          id: string
          owner_id: string
          name: string
          address: string | null
          phone: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          address?: string | null
          phone?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          address?: string | null
          phone?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          store_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          store_id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          stock: number
          image_url: string | null
          sku: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          category_id?: string | null
          name: string
          description?: string | null
          price: number
          stock: number
          image_url?: string | null
          sku?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          price?: number
          stock?: number
          image_url?: string | null
          sku?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          store_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          store_id: string
          customer_id: string | null
          transaction_number: string
          subtotal: number
          discount_amount: number
          discount_percentage: number
          tax_amount: number
          total_amount: number
          payment_method: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          customer_id?: string | null
          transaction_number?: string
          subtotal: number
          discount_amount?: number
          discount_percentage?: number
          tax_amount?: number
          total_amount: number
          payment_method?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          customer_id?: string | null
          transaction_number?: string
          subtotal?: number
          discount_amount?: number
          discount_percentage?: number
          tax_amount?: number
          total_amount?: number
          payment_method?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transaction_items: {
        Row: {
          id: string
          transaction_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price?: number
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
    }
    Views: {
      transaction_summary: {
        Row: {
          id: string
          store_id: string
          transaction_number: string
          subtotal: number
          discount_amount: number
          discount_percentage: number
          tax_amount: number
          total_amount: number
          payment_method: string
          notes: string | null
          created_at: string
          customer_name: string | null
          customer_email: string | null
          customer_phone: string | null
          total_items: number
          total_quantity: number
        }
      }
      products_with_category: {
        Row: {
          id: string
          store_id: string
          name: string
          description: string | null
          price: number
          stock: number
          image_url: string | null
          sku: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          category_name: string | null
          category_id: string | null
        }
      }
      dashboard_stats: {
        Row: {
          store_id: string
          store_name: string
          today_sales: number
          today_transactions: number
          month_sales: number
          month_transactions: number
          total_products: number
          low_stock_products: number
          total_customers: number
        }
      }
    }
    Functions: {
      get_sales_report: {
        Args: {
          store_uuid: string
          start_date?: string
          end_date?: string
        }
        Returns: {
          transaction_date: string
          total_sales: number
          total_transactions: number
          total_items: number
        }[]
      }
      get_top_products: {
        Args: {
          store_uuid: string
          limit_count?: number
          start_date?: string
          end_date?: string
        }
        Returns: {
          product_id: string
          product_name: string
          category_name: string | null
          total_quantity: number
          total_revenue: number
          current_stock: number
        }[]
      }
      get_low_stock_products: {
        Args: {
          store_uuid: string
          stock_threshold?: number
        }
        Returns: {
          product_id: string
          product_name: string
          category_name: string | null
          current_stock: number
          sku: string | null
        }[]
      }
    }
  }
}

// Helper function to get current user's store
export const getCurrentUserStore = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: store, error } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (error) {
    throw error
  }

  return store
}

// Helper function to upload file to storage
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) {
    throw error
  }

  return data
}

// Helper function to get public URL for uploaded file
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}