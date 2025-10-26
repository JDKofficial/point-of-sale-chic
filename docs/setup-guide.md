# Setup Guide - VibePOS

## Overview
Panduan lengkap untuk setup dan menjalankan aplikasi VibePOS dari awal hingga siap production.

## Prerequisites

### System Requirements
- **Node.js**: v18.0.0 atau lebih baru
- **npm**: v8.0.0 atau lebih baru (atau **bun** untuk package manager alternatif)
- **Git**: untuk version control
- **Browser**: Chrome, Firefox, Safari, atau Edge versi terbaru

### Accounts Needed
- **Supabase Account**: [supabase.com](https://supabase.com)
- **GitHub Account**: untuk deployment (opsional)
- **Vercel/Netlify Account**: untuk hosting (opsional)

## 1. Project Setup

### Clone Repository
```bash
git clone https://github.com/your-username/vibepos.git
cd vibepos
```

### Install Dependencies
```bash
# Menggunakan npm
npm install

# Atau menggunakan bun (lebih cepat)
bun install
```

### Environment Configuration
1. Copy file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

2. Edit file `.env` dan isi dengan konfigurasi Anda:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
VITE_APP_NAME=VibePOS
VITE_APP_VERSION=1.0.0

# Storage Configuration
VITE_STORAGE_BUCKET_PRODUCTS=product-images
VITE_STORAGE_BUCKET_STORES=store-logos
VITE_STORAGE_BUCKET_AVATARS=avatars
```

## 2. Supabase Setup

### Create New Project
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Klik **"New Project"**
3. Isi detail project:
   - **Name**: VibePOS
   - **Database Password**: Buat password yang kuat
   - **Region**: Pilih region terdekat
4. Tunggu project selesai dibuat (±2 menit)

### Get Project Credentials
1. Di dashboard project, buka **Settings** → **API**
2. Copy nilai berikut ke file `.env`:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### Install Supabase CLI
```bash
# Windows (PowerShell)
winget install Supabase.CLI

# macOS
brew install supabase/tap/supabase

# Linux
curl -fsSL https://supabase.com/install.sh | sh
```

### Login to Supabase
```bash
supabase login
```

### Link Project
```bash
supabase link --project-ref your-project-ref
```

## 3. Database Migration

### Run Migrations
```bash
# Apply all migrations
supabase db push

# Atau apply satu per satu
supabase migration up
```

### Verify Database
1. Buka **Supabase Dashboard** → **Table Editor**
2. Pastikan semua tabel sudah terbuat:
   - profiles
   - stores
   - categories
   - products
   - customers
   - transactions
   - transaction_items

### Setup Storage Buckets
```bash
# Create storage buckets
supabase storage create product-images --public
supabase storage create store-logos --public
supabase storage create avatars --public
```

## 4. Development Setup

### Start Development Server
```bash
# Menggunakan npm
npm run dev

# Atau menggunakan bun
bun run dev
```

Aplikasi akan berjalan di `http://localhost:8081`

### Available Scripts
```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Database
npm run db:reset     # Reset database
npm run db:seed      # Seed sample data
npm run db:migrate   # Run migrations
```

## 5. Authentication Setup

### Configure Auth Settings
1. Buka **Supabase Dashboard** → **Authentication** → **Settings**
2. **Site URL**: `http://localhost:8081` (development)
3. **Redirect URLs**: 
   - `http://localhost:8081/auth/callback`
   - `https://your-domain.com/auth/callback` (production)

### Email Templates
1. Buka **Authentication** → **Email Templates**
2. Customize template sesuai kebutuhan (lihat `email-template-setup.md`)

### Enable Providers (Opsional)
Jika ingin menggunakan OAuth:
1. **Google**: Setup Google OAuth credentials
2. **GitHub**: Setup GitHub OAuth app
3. **Facebook**: Setup Facebook app

## 6. Testing

### Run Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Manual Testing Checklist
- [ ] User registration
- [ ] User login/logout
- [ ] Password reset
- [ ] Create store
- [ ] Add products
- [ ] Add customers
- [ ] Create transaction
- [ ] View reports

## 7. Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Set environment variables di Vercel dashboard

### Deploy to Netlify
1. Build project:
```bash
npm run build
```

2. Drag & drop folder `dist` ke Netlify dashboard
3. Set environment variables di Netlify dashboard

### Update Supabase Settings
1. Update **Site URL** dengan domain production
2. Update **Redirect URLs** dengan URL production
3. Setup custom domain (opsional)

## 8. Environment Variables Reference

### Development (.env)
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key
VITE_APP_NAME=VibePOS Dev
VITE_APP_VERSION=1.0.0-dev
```

### Production (.env.production)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
VITE_APP_NAME=VibePOS
VITE_APP_VERSION=1.0.0
```

## 9. Monitoring & Analytics

### Setup Error Tracking
1. **Sentry**: untuk error monitoring
```bash
npm install @sentry/react @sentry/tracing
```

2. Configure di `main.tsx`:
```typescript
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE
})
```

### Setup Analytics
1. **Google Analytics**: untuk web analytics
2. **Mixpanel**: untuk event tracking
3. **Hotjar**: untuk user behavior

## 10. Backup & Security

### Database Backup
```bash
# Manual backup
supabase db dump > backup.sql

# Automated backup (setup di Supabase dashboard)
```

### Security Checklist
- [ ] Enable RLS pada semua tabel
- [ ] Setup proper CORS
- [ ] Use HTTPS di production
- [ ] Regular security updates
- [ ] Monitor suspicious activities

## 11. Troubleshooting

### Common Issues

#### 1. Supabase Connection Error
```
Error: Invalid API key
```
**Solution**: Periksa `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di file `.env`

#### 2. Migration Failed
```
Error: relation "profiles" already exists
```
**Solution**: Reset database dan run migration ulang:
```bash
supabase db reset
supabase db push
```

#### 3. Build Error
```
Error: Cannot resolve module
```
**Solution**: Clear cache dan install ulang:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 4. Authentication Error
```
Error: Invalid redirect URL
```
**Solution**: Periksa redirect URL di Supabase Auth settings

### Debug Mode
Enable debug mode dengan menambahkan di `.env`:
```env
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

## 12. Performance Optimization

### Code Splitting
```typescript
// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Products = lazy(() => import('./pages/Products'))
```

### Image Optimization
```typescript
// Optimize images before upload
const optimizeImage = (file: File) => {
  // Compress and resize logic
}
```

### Caching Strategy
```typescript
// Setup React Query for caching
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})
```

## 13. Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Monitor database performance
- [ ] Review error logs weekly
- [ ] Backup database weekly
- [ ] Security audit quarterly

### Update Process
```bash
# Check outdated packages
npm outdated

# Update packages
npm update

# Update major versions carefully
npm install package@latest
```

## 14. Support & Documentation

### Resources
- **Documentation**: `/docs` folder
- **API Reference**: `api-documentation.md`
- **Database Schema**: `database-design.md`
- **Email Setup**: `email-template-setup.md`

### Getting Help
- **GitHub Issues**: untuk bug reports
- **Discord/Slack**: untuk community support
- **Email**: support@vibepos.com

### Contributing
1. Fork repository
2. Create feature branch
3. Make changes
4. Write tests
5. Submit pull request

---

## Quick Start Checklist

Untuk setup cepat, ikuti checklist ini:

- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Create Supabase project
- [ ] Copy `.env.example` to `.env`
- [ ] Fill Supabase credentials in `.env`
- [ ] Run migrations (`supabase db push`)
- [ ] Start dev server (`npm run dev`)
- [ ] Open `http://localhost:8081`
- [ ] Register first user
- [ ] Create first store
- [ ] Add sample products

**Estimasi waktu setup: 15-30 menit** ⏱️

Selamat! VibePOS Anda sudah siap digunakan! 🎉