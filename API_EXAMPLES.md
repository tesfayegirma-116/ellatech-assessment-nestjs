# API Examples and Testing Guide

This document provides practical examples for testing all API endpoints using cURL.

## Prerequisites

Ensure the application is running:

```bash
npm run start:dev
```

Or with Docker:

```bash
docker-compose up
```

## 1. Create a User

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "name": "John Doe",
    "phone": "+1234567890"
  }'
```

**Expected Response (201 Created):**

```json
{
  "id": "bb12a2d2-b112-4491-a108-341534a5c9e9",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "createdAt": "2025-11-16T00:00:00.000Z",
  "updatedAt": "2025-11-16T00:00:00.000Z"
}
```

## 2. Get All Users

```bash
curl http://localhost:3000/users
```

**Expected Response (200 OK):**

```json
[
  {
    "id": "bb12a2d2-b112-4491-a108-341534a5c9e9",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "createdAt": "2025-11-16T00:00:00.000Z",
    "updatedAt": "2025-11-16T00:00:00.000Z"
  }
]
```

## 3. Create a Product

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Pro",
    "description": "16-inch MacBook Pro with M3 chip",
    "price": 2499.99,
    "quantity": 25,
    "status": "active"
  }'
```

**Expected Response (201 Created):**

```json
{
  "id": "bdef46cb-7913-4a3f-b1ee-ccf72458d6d8",
  "name": "MacBook Pro",
  "description": "16-inch MacBook Pro with M3 chip",
  "price": "2499.99",
  "quantity": 25,
  "status": "active",
  "createdAt": "2025-11-16T00:00:00.000Z",
  "updatedAt": "2025-11-16T00:00:00.000Z"
}
```

## 4. Get All Products

```bash
curl http://localhost:3000/products
```

**Expected Response (200 OK):**

```json
[
  {
    "id": "bdef46cb-7913-4a3f-b1ee-ccf72458d6d8",
    "name": "MacBook Pro",
    "description": "16-inch MacBook Pro with M3 chip",
    "price": "2499.99",
    "quantity": 25,
    "status": "active",
    "createdAt": "2025-11-16T00:00:00.000Z",
    "updatedAt": "2025-11-16T00:00:00.000Z"
  }
]
```

## 5. Adjust Product Quantity

Replace the UUIDs with actual values from previous requests.

```bash
curl -X PUT http://localhost:3000/products/adjust \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "bdef46cb-7913-4a3f-b1ee-ccf72458d6d8",
    "quantity": 15,
    "userId": "bb12a2d2-b112-4491-a108-341534a5c9e9",
    "notes": "New shipment received"
  }'
```

**Expected Response (200 OK):**

```json
{
  "id": "bdef46cb-7913-4a3f-b1ee-ccf72458d6d8",
  "name": "MacBook Pro",
  "description": "16-inch MacBook Pro with M3 chip",
  "price": "2499.99",
  "quantity": 40,
  "status": "active",
  "createdAt": "2025-11-16T00:00:00.000Z",
  "updatedAt": "2025-11-16T00:00:00.000Z"
}
```

## 6. Get Product Status

Replace the UUID with an actual product ID.

```bash
curl http://localhost:3000/status/bdef46cb-7913-4a3f-b1ee-ccf72458d6d8
```

**Expected Response (200 OK):**

```json
{
  "id": "bdef46cb-7913-4a3f-b1ee-ccf72458d6d8",
  "name": "MacBook Pro",
  "description": "16-inch MacBook Pro with M3 chip",
  "price": "2499.99",
  "quantity": 40,
  "status": "active",
  "createdAt": "2025-11-16T00:00:00.000Z",
  "updatedAt": "2025-11-16T00:00:00.000Z"
}
```

## 7. Get All Transactions

```bash
curl http://localhost:3000/transactions
```

**Expected Response (200 OK):**

```json
[
  {
    "id": "4a193b32-f780-4b03-9831-29098650531e",
    "type": "adjustment",
    "quantity": 15,
    "previousQuantity": 25,
    "newQuantity": 40,
    "notes": "New shipment received",
    "createdAt": "2025-11-16T00:00:00.000Z",
    "userId": "bb12a2d2-b112-4491-a108-341534a5c9e9",
    "productId": "bdef46cb-7913-4a3f-b1ee-ccf72458d6d8",
    "user": {
      "id": "bb12a2d2-b112-4491-a108-341534a5c9e9",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "createdAt": "2025-11-16T00:00:00.000Z",
      "updatedAt": "2025-11-16T00:00:00.000Z"
    },
    "product": {
      "id": "bdef46cb-7913-4a3f-b1ee-ccf72458d6d8",
      "name": "MacBook Pro",
      "description": "16-inch MacBook Pro with M3 chip",
      "price": "2499.99",
      "quantity": 40,
      "status": "active",
      "createdAt": "2025-11-16T00:00:00.000Z",
      "updatedAt": "2025-11-16T00:00:00.000Z"
    }
  }
]
```

## 8. Filter Transactions by Product

```bash
curl "http://localhost:3000/transactions?productId=bdef46cb-7913-4a3f-b1ee-ccf72458d6d8"
```

## 9. Filter Transactions by User

```bash
curl "http://localhost:3000/transactions?userId=bb12a2d2-b112-4491-a108-341534a5c9e9"
```

## Testing Validation

### Invalid Email

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "name": "Test User"
  }'
```

**Expected Response (400 Bad Request):**

```json
{
  "message": ["email must be an email"],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Missing Required Fields

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product"
  }'
```

**Expected Response (400 Bad Request):**

```json
{
  "message": [
    "price must be a number conforming to the specified constraints",
    "quantity must be a number conforming to the specified constraints"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Negative Quantity Adjustment

```bash
curl -X PUT http://localhost:3000/products/adjust \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "bdef46cb-7913-4a3f-b1ee-ccf72458d6d8",
    "quantity": -100,
    "userId": "bb12a2d2-b112-4491-a108-341534a5c9e9",
    "notes": "Testing negative adjustment"
  }'
```

**Expected Response (400 Bad Request):**

```json
{
  "message": "Adjustment would result in negative quantity",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Duplicate Email

Try creating a user with an email that already exists:

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "name": "Jane Smith"
  }'
```

**Expected Response (409 Conflict):**

```json
{
  "message": "User with this email already exists",
  "error": "Conflict",
  "statusCode": 409
}
```

## Complete Test Workflow

Run this complete workflow to test all functionality:

```bash
# 1. Create a user and save the ID
USER_RESPONSE=$(curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"workflow@test.com","name":"Workflow User","phone":"+9876543210"}')
USER_ID=$(echo $USER_RESPONSE | jq -r '.id')
echo "Created User ID: $USER_ID"

# 2. Create a product and save the ID
PRODUCT_RESPONSE=$(curl -s -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"iPhone 15","description":"Latest iPhone model","price":999.99,"quantity":100}')
PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r '.id')
echo "Created Product ID: $PRODUCT_ID"

# 3. Adjust product quantity (increase by 20)
curl -s -X PUT http://localhost:3000/products/adjust \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantity\":20,\"userId\":\"$USER_ID\",\"notes\":\"First restock\"}" | jq .

# 4. Adjust product quantity (decrease by 15)
curl -s -X PUT http://localhost:3000/products/adjust \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantity\":-15,\"userId\":\"$USER_ID\",\"notes\":\"Sale\"}" | jq .

# 5. Check product status
curl -s "http://localhost:3000/status/$PRODUCT_ID" | jq .

# 6. View all transactions
curl -s http://localhost:3000/transactions | jq .

# 7. View transactions for this product only
curl -s "http://localhost:3000/transactions?productId=$PRODUCT_ID" | jq .
```

## Using HTTPie (Alternative)

If you prefer HTTPie over cURL:

```bash
# Install HTTPie
sudo apt install httpie  # Ubuntu/Debian
brew install httpie      # macOS

# Examples
http POST localhost:3000/users email=test@example.com name="Test User"
http GET localhost:3000/products
http PUT localhost:3000/products/adjust productId=UUID quantity:=10 userId=UUID notes="Note"
```

## Using Postman

Import the following into Postman:

1. Create a new collection named "EllaTech API"
2. Set base URL variable: `{{baseUrl}}` = `http://localhost:3000`
3. Create requests for each endpoint using the examples above
4. Use Postman's environment variables to store user and product IDs
