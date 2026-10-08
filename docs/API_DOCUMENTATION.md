# Glass POS - API Documentation

**Base URL:** `http://localhost:3000/api`

**Authentication:** 
Most endpoints require a JWT token passed in the header.
`Authorization: Bearer <your_jwt_token>`

---

## 1. Authentication (`/auth`)

### Register a User
- **URL:** `POST /auth/register`
- **Auth Required:** Yes (ADMIN only)
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "STAFF" // Optional, default is STAFF. Can be ADMIN.
}
```

### Login
- **URL:** `POST /auth/login`
- **Auth Required:** No
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Forgot Password
- **URL:** `POST /auth/forgot-password`
- **Auth Required:** No
- **Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
- **URL:** `POST /auth/reset-password`
- **Auth Required:** No
- **Body:**
```json
{
  "token": "jwt_token_received_in_email",
  "newPassword": "newpassword123"
}
```

### Get Current User Profile
- **URL:** `GET /auth/me`
- **Auth Required:** Yes

---

## 2. Products (`/products`)

### Create Product
- **URL:** `POST /products`
- **Auth Required:** Yes (ADMIN only)
- **Body:**
```json
{
  "name": "Santro Front Windshield",
  "productType": "GLASS",
  "hsnCode": "70072190",
  "unit": "PCS",
  "purchasePrice": 2500.00,
  "sellingPrice": 4500.00,
  "gstRate": 28.00,
  "variantId": "uuid-of-vehicle-variant",
  "glassPosition": "FRONT_WINDSHIELD",
  "openingStock": 10,
  "minStockLevel": 5
}
```

### Get All Products / Search
- **URL:** `GET /products`
- **Auth Required:** Yes
- **Query Params:**
  - `search` (Optional): Searches across Product Name, SKU, Vehicle Brand, Vehicle Model, and Vehicle Variant.
  - **Example:** `GET /products?search=santro`

### Get Product by ID
- **URL:** `GET /products/:id`
- **Auth Required:** Yes

### Update Product
- **URL:** `PATCH /products/:id`
- **Auth Required:** Yes (ADMIN only)
- **Body:** (Any of the fields from Create Product)
```json
{
  "sellingPrice": 4800.00
}
```

---

## 3. Vehicles (`/vehicles`)

The vehicles module controls the strict 4-level hierarchy: Categories -> Brands -> Models -> Variants.

### Categories
- **GET All:** `GET /vehicles/categories`
- **Create:** `POST /vehicles/categories`
```json
{
  "name": "Passenger Car",
  "code": "PC"
}
```

### Brands
- **GET All:** `GET /vehicles/brands`
- **Create:** `POST /vehicles/brands`
```json
{
  "categoryId": "uuid-of-category",
  "name": "Hyundai",
  "code": "HYU"
}
```

### Models
- **GET All:** `GET /vehicles/models`
- **Create:** `POST /vehicles/models`
```json
{
  "brandId": "uuid-of-brand",
  "name": "Santro",
  "code": "SAN"
}
```

### Variants
- **GET All:** `GET /vehicles/variants`
- **Create:** `POST /vehicles/variants`
```json
{
  "modelId": "uuid-of-model",
  "name": "GLS 1.1",
  "code": "GLS",
  "yearFrom": 2003,
  "yearTo": 2014
}
```
