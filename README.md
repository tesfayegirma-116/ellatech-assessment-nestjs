# EllaTech Assessment - NestJS Product Management API

A NestJS service with PostgreSQL and TypeORM that manages users, products, and transaction history.

## Features

- User management
- Product management with inventory tracking
- Product quantity adjustments with transaction history
- Full DTO validation
- TypeORM migrations
- Docker Compose setup
- RESTful API with proper HTTP status codes

## Tech Stack

- NestJS 11.x
- TypeORM 0.3.x
- PostgreSQL 16
- TypeScript 5.x
- Docker & Docker Compose
- class-validator for DTO validation

## Prerequisites

- Node.js 22.x or later
- npm 11.x or later
- Docker and Docker Compose

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ellatech-assessment
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Default environment variables:

```
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=ellatech_user
DB_PASSWORD=ellatech_password
DB_DATABASE=ellatech_db
PORT=3000
```

### 4. Start PostgreSQL with Docker

```bash
docker-compose up -d postgres
```

Wait a few seconds for PostgreSQL to initialize.

### 5. Run Migrations

```bash
npm run build
npm run migration:run
```

### 6. Start the Application

Development mode:

```bash
npm run start:dev
```

Production mode:

```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## Running with Docker Compose

To run both the API and database together:

```bash
docker-compose up --build
```

This will:

- Build the NestJS application
- Start PostgreSQL database
- Start the API on port 3000

## API Documentation

### Base URL

```
http://localhost:3000
```

### Endpoints

#### 1. Create User

**POST** `/users`

Creates a new user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses:**

- `409 Conflict` - User with email already exists
- `400 Bad Request` - Invalid input data

---

#### 2. Get All Users

**GET** `/users`

Retrieves all users.

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

#### 3. Create Product

**POST** `/products`

Creates a new product.

**Request Body:**

```json
{
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "quantity": 50,
  "status": "active"
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": "999.99",
  "quantity": 50,
  "status": "active",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid input data

---

#### 4. Get All Products

**GET** `/products`

Retrieves all products.

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": "999.99",
    "quantity": 50,
    "status": "active",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

#### 5. Adjust Product Quantity

**PUT** `/products/adjust`

Adjusts product quantity and creates a transaction record.

**Request Body:**

```json
{
  "productId": "uuid",
  "quantity": 10,
  "userId": "uuid",
  "notes": "Restocking inventory"
}
```

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": "999.99",
  "quantity": 60,
  "status": "active",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses:**

- `404 Not Found` - Product or user not found
- `400 Bad Request` - Adjustment would result in negative quantity
- `400 Bad Request` - Invalid input data

---

#### 6. Get Product Status

**GET** `/status/:productId`

Retrieves product details by ID.

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": "999.99",
  "quantity": 60,
  "status": "active",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses:**

- `404 Not Found` - Product not found

---

#### 7. Get Transactions

**GET** `/transactions`

Retrieves transaction history with optional filters.

**Query Parameters:**

- `productId` (optional) - Filter by product ID
- `userId` (optional) - Filter by user ID

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "type": "adjustment",
    "quantity": 10,
    "previousQuantity": 50,
    "newQuantity": 60,
    "notes": "Restocking inventory",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "userId": "uuid",
    "productId": "uuid",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "product": {
      "id": "uuid",
      "name": "Laptop",
      "price": "999.99"
    }
  }
]
```

## Testing the API

### Using cURL

Create a user:

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "phone": "+1234567890"
  }'
```

Create a product:

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "quantity": 50
  }'
```

Adjust product quantity:

```bash
curl -X PUT http://localhost:3000/products/adjust \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "<product-uuid>",
    "quantity": 10,
    "userId": "<user-uuid>",
    "notes": "Restocking"
  }'
```

Get transactions:

```bash
curl http://localhost:3000/transactions
```

## Database Migrations

### Generate a new migration

```bash
npm run migration:generate src/migrations/MigrationName
```

### Create an empty migration

```bash
npm run migration:create src/migrations/MigrationName
```

### Run migrations

```bash
npm run migration:run
```

### Revert last migration

```bash
npm run migration:revert
```

## Project Structure

```
src/
├── config/
│   └── typeorm.config.ts       # TypeORM configuration
├── dto/
│   ├── create-user.dto.ts      # User creation validation
│   ├── create-product.dto.ts   # Product creation validation
│   └── adjust-product.dto.ts   # Product adjustment validation
├── entities/
│   ├── user.entity.ts          # User entity
│   ├── product.entity.ts       # Product entity
│   └── transaction.entity.ts   # Transaction entity
├── users/
│   ├── users.module.ts         # Users module
│   ├── users.service.ts        # Users business logic
│   └── users.controller.ts     # Users endpoints
├── products/
│   ├── products.module.ts      # Products module
│   ├── products.service.ts     # Products business logic
│   └── products.controller.ts  # Products endpoints
├── transactions/
│   ├── transactions.module.ts  # Transactions module
│   ├── transactions.service.ts # Transactions business logic
│   └── transactions.controller.ts # Transactions endpoints
├── migrations/                 # Database migrations
├── app.module.ts              # Root module
└── main.ts                    # Application entry point
```

## Assumptions and Trade-offs

### Assumptions

1. **Product Quantity Adjustments**: The quantity parameter in the adjust endpoint is relative (delta), not absolute. Positive values increase quantity, negative values decrease it.

2. **User-Product Relationship**: Transactions track which user made the adjustment, but users don't "own" products. This is suitable for an inventory management system where multiple users manage shared inventory.

3. **Transaction Types**: Defined three transaction types (adjustment, sale, restock) for future extensibility, though currently only "adjustment" is used.

4. **Concurrency**: No pessimistic locking implemented. For high-concurrency scenarios, you'd want to add row-level locking to prevent race conditions during quantity adjustments.

5. **Soft Deletes**: Not implemented. All deletions would be hard deletes. For production, consider soft deletes to maintain audit trails.

### Trade-offs

1. **Synchronize vs Migrations**:
   - Used `synchronize: true` in development for rapid iteration
   - Disabled in production to use migrations
   - Trade-off: Development convenience vs production safety

2. **Eager Loading**:
   - Enabled eager loading for user and product in transactions
   - Trade-off: Fewer queries vs potential over-fetching

3. **Validation**:
   - Using class-validator with strict validation
   - Trade-off: More robust API vs more verbose DTOs

4. **Error Handling**:
   - Using NestJS built-in exception filters
   - Trade-off: Standard error format vs custom error responses

5. **Authentication**:
   - Not implemented for simplicity
   - Production systems should include JWT or OAuth2

6. **Pagination**:
   - Not implemented on list endpoints
   - For production, add pagination to /users, /products, and /transactions

7. **Logging**:
   - Basic TypeORM query logging in development
   - Production should use Winston or Pino with structured logging

8. **Testing**:
   - Test files included but not implemented
   - Production should have comprehensive unit and e2e tests

## Development

### Code Style

The project uses ESLint and Prettier for code formatting:

```bash
npm run format
npm run lint
```

### Building

```bash
npm run build
```

### Watch Mode

```bash
npm run start:dev
```

## Stopping the Application

Stop Docker containers:

```bash
docker-compose down
```

Remove volumes (data will be lost):

```bash
docker-compose down -v
```

## License

UNLICENSED
