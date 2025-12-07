# Shopify Orders API Documentation

This document provides the API specifications for the new "Shopify Orders" feature in the Magic Walmart Dashboard.

## Base URL
```
Development: http://localhost:8080
Production: https://magic-walmart-shiprocket-backend.onrender.com
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## API Endpoints

### 1. Sync Orders from Shopify

**Endpoint:** `POST /shopify/orders/sync`

**Description:** Syncs orders from Shopify for a specific date and stores them in the database.

**Request Body:**
```json
{
  "date": "2025-01-15"
}
```

**Request Parameters:**
| Parameter | Type   | Required | Description                        |
|-----------|--------|----------|------------------------------------|
| date      | string | Yes      | Date in YYYY-MM-DD format          |

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Orders synced successfully",
  "syncedCount": 15,
  "date": "2025-01-15"
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid date format. Use YYYY-MM-DD"
}
```

**Response (Error - 403 Forbidden):**
```json
{
  "success": false,
  "error": "Unauthorized access"
}
```

---

### 2. Get All Orders with Pagination

**Endpoint:** `GET /shopify/orders`

**Description:** Retrieves all Shopify orders from the database with pagination support.

**Query Parameters:**
| Parameter | Type    | Required | Default | Description                     |
|-----------|---------|----------|---------|---------------------------------|
| page      | integer | No       | 1       | Page number (starting from 1)   |
| limit     | integer | No       | 10      | Number of items per page        |

**Example Request:**
```
GET /shopify/orders?page=1&limit=10
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "orders": [
    {
      "orderId": "SH12345",
      "products": [
        {
          "name": "Product 1",
          "quantity": 2,
          "price": 500
        },
        {
          "name": "Product 2",
          "quantity": 1,
          "price": 300
        }
      ],
      "orderValue": 1300,
      "shippingValue": 100,
      "rtoValue": 50,
      "coa": 200,
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "totalCount": 50
}
```

**Response (Error - 403 Forbidden):**
```json
{
  "success": false,
  "error": "Unauthorized access"
}
```

---

### 3. Update Order

**Endpoint:** `PUT /shopify/orders/:orderId`

**Description:** Updates the financial details of a specific order.

**URL Parameters:**
| Parameter | Type   | Required | Description                        |
|-----------|--------|----------|------------------------------------|
| orderId   | string | Yes      | The unique order ID                |

**Request Body:**
```json
{
  "orderValue": 1500,
  "shippingValue": 120,
  "rtoValue": 60,
  "coa": 250
}
```

**Request Body Parameters:**
| Parameter     | Type   | Required | Description                              |
|---------------|--------|----------|------------------------------------------|
| orderValue    | number | Yes      | Total order value in rupees              |
| shippingValue | number | Yes      | Shipping cost in rupees                  |
| rtoValue      | number | Yes      | Return to Origin cost in rupees          |
| coa           | number | Yes      | Cost of Acquisition in rupees            |

**Example Request:**
```
PUT /shopify/orders/SH12345
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Order updated successfully",
  "order": {
    "orderId": "SH12345",
    "products": [
      {
        "name": "Product 1",
        "quantity": 2,
        "price": 500
      }
    ],
    "orderValue": 1500,
    "shippingValue": 120,
    "rtoValue": 60,
    "coa": 250,
    "updatedAt": "2025-01-15T11:00:00Z"
  }
}
```

**Response (Error - 404 Not Found):**
```json
{
  "success": false,
  "error": "Order not found"
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid order data"
}
```

**Response (Error - 403 Forbidden):**
```json
{
  "success": false,
  "error": "Unauthorized access"
}
```

---

## Database Schema Suggestion

### Shopify Orders Table

```sql
CREATE TABLE shopify_orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(255) UNIQUE NOT NULL,
  products JSONB NOT NULL,
  order_value DECIMAL(10, 2) DEFAULT 0,
  shipping_value DECIMAL(10, 2) DEFAULT 0,
  rto_value DECIMAL(10, 2) DEFAULT 0,
  coa DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_date DATE NOT NULL,
  user_id INTEGER REFERENCES users(id)
);

CREATE INDEX idx_order_id ON shopify_orders(order_id);
CREATE INDEX idx_synced_date ON shopify_orders(synced_date);
CREATE INDEX idx_user_id ON shopify_orders(user_id);
```

**Products JSON Structure:**
```json
[
  {
    "name": "Product Name",
    "quantity": 2,
    "price": 500,
    "sku": "SKU123"
  }
]
```

---

## Profit/Loss Calculation

The profit/loss is calculated on the frontend using this formula:

```
Profit/Loss = Order Value - Shipping Value - RTO Value - COA
```

This is auto-calculated and displayed in real-time when editing values.

---

## Error Codes Reference

| Status Code | Description                                      |
|-------------|--------------------------------------------------|
| 200         | Success                                          |
| 400         | Bad Request - Invalid input data                 |
| 403         | Forbidden - Invalid or expired token             |
| 404         | Not Found - Resource doesn't exist               |
| 500         | Internal Server Error                            |

---

## Notes for Backend Implementation

1. **Date Validation**: Ensure the date format is strictly YYYY-MM-DD for the sync endpoint.

2. **Pagination**: The pagination should be implemented server-side for better performance with large datasets.

3. **Duplicate Prevention**: When syncing orders, check if an order with the same `orderId` already exists for that date to prevent duplicates.

4. **Shopify Integration**: You'll need to integrate with Shopify's REST API or GraphQL API to fetch orders. Reference: https://shopify.dev/docs/api/admin-rest/2024-01/resources/order

5. **Data Validation**: Validate all numeric fields to ensure they are non-negative numbers.

6. **Timestamps**: Use ISO 8601 format for all timestamp fields (e.g., `2025-01-15T10:30:00Z`).

7. **Products Array**: Store products as a JSON/JSONB field to maintain flexibility with product attributes.

8. **User Isolation**: Ensure orders are associated with the authenticated user to maintain data privacy.

---

## Testing the APIs

### Using cURL:

**Sync Orders:**
```bash
curl -X POST http://localhost:8080/shopify/orders/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date": "2025-01-15"}'
```

**Get Orders:**
```bash
curl -X GET "http://localhost:8080/shopify/orders?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update Order:**
```bash
curl -X PUT http://localhost:8080/shopify/orders/SH12345 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderValue": 1500,
    "shippingValue": 120,
    "rtoValue": 60,
    "coa": 250
  }'
```

---

## Frontend Integration

The frontend service file is located at:
- `src/services/shopifyOrderService.js`

The main page component is located at:
- `src/pages/ShopifyOrders.js`

---

## Questions or Issues?

If you have any questions about the API specifications or need clarification, please reach out to the frontend team.
