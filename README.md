# glass-pos-backend
Backend API for vehicle glass inventory, purchases, sales, billing, customers and stock management.

## Setup Instructions

### Step 1 — Clone
```bash
git clone <repository-url>
cd glass-pos-backend
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Create environment file
Windows:
```bash
copy .env.example .env
```
Mac/Linux:
```bash
cp .env.example .env
```
Make sure to update the `DATABASE_URL` with your correct PostgreSQL credentials.

### Step 4 — Configure PostgreSQL
Create a database named `glass_pos` in PostgreSQL. 
Example DATABASE_URL: `postgresql://postgres:password@localhost:5432/glass_pos`

### Step 5 — Generate Prisma Client
```bash
npx prisma generate
```

### Step 6 — Run migrations
For development:
```bash
npx prisma migrate dev --name init
```

### Step 7 — Seed database
```bash
npm run prisma:seed
```

### Step 8 — Start development server
```bash
npm run dev
```

### Step 9 — Production
```bash
npm start
```

### Step 10 — Prisma Studio
```bash
npx prisma studio
```
Prisma Studio can be used to inspect database records in your browser.

## API Documentation

### Health Check
- Method: GET
- URL: `/api/health`
- Response:
```json
{
  "success": true,
  "message": "API is running successfully."
}
```

### Authentication

#### Register
- Method: POST
- URL: `/api/auth/register`
- Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "STAFF"
}
```
- Response: User object and token

#### Login
- Method: POST
- URL: `/api/auth/login`
- Request body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- Response: User object and token

#### Get Current User
- Method: GET
- URL: `/api/auth/me`
- Authentication: Bearer token required
- Response: Current user object

### Users
Requires Admin/Staff authentication.

#### Get All Users
- Method: GET
- URL: `/api/users`
- Authentication: Bearer token required

#### Get User by ID
- Method: GET
- URL: `/api/users/:id`
- Authentication: Bearer token required

#### Update User
- Method: PATCH
- URL: `/api/users/:id`
- Authentication: Bearer token required (ADMIN only)

#### Delete User
- Method: DELETE
- URL: `/api/users/:id`
- Authentication: Bearer token required (ADMIN only)

## Architecture

Routes -> Middleware -> Controller -> Service -> Prisma -> PostgreSQL
- **Routes**: Define HTTP endpoints.
- **Middleware**: Intercept requests for auth, validation, etc.
- **Controller**: Handle HTTP request and response flow.
- **Service**: Contain business logic and DB calls.
- **Prisma**: ORM connecting to DB.

## Database Architecture
```text
User
```