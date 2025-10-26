# API Documentation - VibePOS

## Overview
VibePOS menggunakan Supabase sebagai backend dengan REST API dan Real-time subscriptions. Dokumentasi ini mencakup semua endpoint API yang tersedia.

## Base URL
```
https://wwylhjkrtlebzfdlpjtg.supabase.co/rest/v1
```

## Authentication
Semua API endpoint memerlukan authentication header:
```
Authorization: Bearer <access_token>
apikey: <anon_key>
```

## API Endpoints

### Authentication

#### 1. Sign Up
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 2. Sign In
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 3. Reset Password
```http
POST /auth/v1/recover
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Profiles

#### 1. Get User Profile
```http
GET /profiles?id=eq.<user_id>
```

#### 2. Update Profile
```http
PATCH /profiles?id=eq.<user_id>
Content-Type: application/json

{
  "full_name": "John Doe",
  "phone": "+6281234567890"
}
```

### Stores

#### 1. Get All Stores
```http
GET /stores
```

#### 2. Create Store
```http
POST /stores
Content-Type: application/json

{
  "name": "Toko ABC",
  "address": "Jl. Contoh No. 123",
  "phone": "+6281234567890"
}
```

#### 3. Update Store
```http
PATCH /stores?id=eq.<store_id>
Content-Type: application/json

{
  "name": "Toko ABC Updated",
  "address": "Jl. Contoh No. 456"
}
```

### Categories

#### 1. Get All Categories
```http
GET /categories?store_id=eq.<store_id>
```

#### 2. Create Category
```http
POST /categories
Content-Type: application/json

{
  "name": "Makanan",
  "store_id": "<store_id>"
}
```

### Products

#### 1. Get All Products
```http
GET /products?store_id=eq.<store_id>
```

#### 2. Get Product with Category
```http
GET /products?select=*,categories(name)&store_id=eq.<store_id>
```

#### 3. Create Product
```http
POST /products
Content-Type: application/json

{
  "name": "Nasi Goreng",
  "price": 15000,
  "stock": 100,
  "category_id": "<category_id>",
  "store_id": "<store_id>"
}
```

#### 4. Update Product
```http
PATCH /products?id=eq.<product_id>
Content-Type: application/json

{
  "name": "Nasi Goreng Special",
  "price": 18000,
  "stock": 80
}
```

#### 5. Delete Product
```http
DELETE /products?id=eq.<product_id>
```

### Customers

#### 1. Get All Customers
```http
GET /customers?store_id=eq.<store_id>
```

#### 2. Create Customer
```http
POST /customers
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+6281234567890",
  "store_id": "<store_id>"
}
```

### Transactions

#### 1. Get All Transactions
```http
GET /transactions?store_id=eq.<store_id>&order=created_at.desc
```

#### 2. Get Transaction with Items
```http
GET /transactions?select=*,transaction_items(*,products(name))&id=eq.<transaction_id>
```

#### 3. Create Transaction
```http
POST /transactions
Content-Type: application/json

{
  "customer_id": "<customer_id>",
  "total_amount": 50000,
  "payment_method": "cash",
  "store_id": "<store_id>"
}
```

### Transaction Items

#### 1. Create Transaction Item
```http
POST /transaction_items
Content-Type: application/json

{
  "transaction_id": "<transaction_id>",
  "product_id": "<product_id>",
  "quantity": 2,
  "price": 15000
}
```

## Storage API

### Upload Product Image
```http
POST /storage/v1/object/product-images/<file_name>
Content-Type: image/jpeg
Authorization: Bearer <access_token>

[Binary image data]
```

### Get Product Image URL
```http
GET /storage/v1/object/public/product-images/<file_name>
```

## Real-time Subscriptions

### Subscribe to Products Changes
```javascript
const subscription = supabase
  .channel('products-changes')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'products',
      filter: `store_id=eq.${storeId}`
    }, 
    (payload) => {
      console.log('Product changed:', payload)
    }
  )
  .subscribe()
```

### Subscribe to Transactions Changes
```javascript
const subscription = supabase
  .channel('transactions-changes')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'transactions',
      filter: `store_id=eq.${storeId}`
    }, 
    (payload) => {
      console.log('New transaction:', payload)
    }
  )
  .subscribe()
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "code": "400",
  "message": "Invalid request parameters"
}
```

#### 401 Unauthorized
```json
{
  "code": "401", 
  "message": "Invalid or expired token"
}
```

#### 403 Forbidden
```json
{
  "code": "403",
  "message": "Insufficient permissions"
}
```

#### 404 Not Found
```json
{
  "code": "404",
  "message": "Resource not found"
}
```

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per user

## Pagination
Gunakan parameter `limit` dan `offset` untuk pagination:
```http
GET /products?limit=10&offset=20
```

## Filtering
Gunakan PostgREST query syntax:
```http
GET /products?price=gte.10000&price=lte.50000
GET /products?name=ilike.*nasi*
```

## Sorting
```http
GET /products?order=created_at.desc
GET /products?order=name.asc,price.desc
```