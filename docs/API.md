# API Documentation

## Base URL

All API endpoints are prefixed with `/api`.

## Authentication

Most endpoints require authentication via NextAuth.js. Include the session cookie in requests.

---

## Authentication Endpoints

### Register User

**POST** `/api/register`

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "verificationUrl": "http://localhost:3000/verify-email?token=..."
}
```

**Status Codes:**

- `200` - Success
- `400` - User already exists or validation error
- `500` - Server error

---

### Verify Email

**POST** `/api/auth/verify-email`

Verify user email with token.

**Request Body:**

```json
{
  "token": "verification-token"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Status Codes:**

- `200` - Success
- `400` - Invalid or expired token
- `500` - Server error

**GET** `/api/auth/verify-email?token=...`

Verify email via GET request (redirects to login).

---

### Send Verification Email

**POST** `/api/auth/send-verification`

Resend verification email to authenticated user.

**Response:**

```json
{
  "success": true,
  "message": "Verification email sent",
  "verificationUrl": "http://localhost:3000/verify-email?token=..."
}
```

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `400` - Email already verified
- `500` - Server error

---

### Request Password Reset

**POST** `/api/auth/reset-password`

Request password reset email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset email sent",
  "resetUrl": "http://localhost:3000/reset-password?token=..."
}
```

### Reset Password

**POST** `/api/auth/reset-password`

Reset password with token.

**Request Body:**

```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Status Codes:**

- `200` - Success
- `400` - Invalid or expired token
- `500` - Server error

---

## Strategy Endpoints

### Get Strategies

**GET** `/api/strategies`

Get all strategies for authenticated user or public strategies.

**Query Parameters:**

- `public=true` - Get only public strategies
- `favorites=true` - Get only favorited strategies

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "strategy1",
      "name": "Momentum Strategy",
      "description": "...",
      "riskLevel": "Medium",
      "assetClass": "Stocks",
      "isPublic": true,
      "tags": ["momentum", "RSI"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Status Codes:**

- `200` - Success
- `500` - Server error

---

### Create Strategy

**POST** `/api/strategies`

Create a new trading strategy.

**Request Body:**

```json
{
  "name": "My Strategy",
  "description": "Strategy description (10-2000 chars)",
  "parameters": {
    "entry": "RSI < 30",
    "exit": "RSI > 70",
    "timeframe": "1h"
  },
  "riskLevel": "Medium",
  "assetClass": "Stocks",
  "tags": ["momentum", "RSI"],
  "backtestPerformance": "Win Rate: 68%",
  "isPublic": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "strategy1",
    "name": "My Strategy",
    ...
  }
}
```

**Status Codes:**

- `201` - Created
- `400` - Validation error
- `401` - Unauthorized
- `429` - Rate limited
- `500` - Server error

---

### Update Strategy

**PUT** `/api/strategies`

Update an existing strategy (only owner).

**Request Body:**

```json
{
  "_id": "strategy1",
  "name": "Updated Strategy Name",
  "description": "Updated description",
  ...
}
```

**Response:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Status Codes:**

- `200` - Success
- `400` - Validation error
- `401` - Unauthorized
- `403` - Not owner
- `404` - Strategy not found
- `500` - Server error

---

### Delete Strategy

**DELETE** `/api/strategies?id=strategyId`

Delete a strategy (only owner).

**Response:**

```json
{
  "success": true,
  "message": "Strategy deleted"
}
```

**Status Codes:**

- `200` - Success
- `400` - Strategy ID required
- `401` - Unauthorized
- `403` - Not owner
- `404` - Strategy not found
- `500` - Server error

---

### Generate Strategy with AI

**POST** `/api/strategies/generate`

Generate a strategy using Groq AI.

**Request Body:**

```json
{
  "prompt": "Create a momentum strategy for crypto using RSI and MACD",
  "assetClass": "Crypto",
  "riskLevel": "Medium"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "name": "AI Generated Strategy",
    "description": "...",
    "parameters": { ... },
    "riskLevel": "Medium",
    "assetClass": "Crypto",
    "tags": ["AI Generated", "momentum"]
  }
}
```

**Status Codes:**

- `200` - Success
- `400` - Validation error
- `401` - Unauthorized
- `500` - Server error or AI service unavailable

---

### Favorite Strategy

**GET** `/api/strategies/favorite?strategyId=...`

Check if strategy is favorited.

**Response:**

```json
{
  "success": true,
  "favorited": true
}
```

**POST** `/api/strategies/favorite`

Toggle favorite status.

**Request Body:**

```json
{
  "strategyId": "strategy1"
}
```

**Response:**

```json
{
  "success": true,
  "favorited": true
}
```

---

### Copy Strategy

**POST** `/api/strategies/copy`

Copy a public strategy to user's collection.

**Request Body:**

```json
{
  "strategyId": "strategy1"
}
```

**Response:**

```json
{
  "success": true,
  "data": { ... },
  "message": "Strategy copied successfully"
}
```

---

### Export Strategy

**GET** `/api/strategies/export?format=json&id=strategyId`

Export strategy as JSON or CSV.

**Query Parameters:**

- `format` - `json` or `csv`
- `id` - Strategy ID

**Response:**

- File download (JSON or CSV)

**Status Codes:**

- `200` - Success
- `400` - Invalid format
- `401` - Unauthorized
- `403` - Not authorized to export
- `404` - Strategy not found
- `500` - Server error

---

### Add Comment

**POST** `/api/strategies/comments`

Add a comment to a public strategy.

**Request Body:**

```json
{
  "strategyId": "strategy1",
  "text": "Great strategy!"
}
```

**Response:**

```json
{
  "success": true,
  "data": [ ... ],
  "message": "Comment added successfully"
}
```

---

### Get Comments

**GET** `/api/strategies/comments?strategyId=...`

Get all comments for a strategy.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "user": {
        "_id": "user1",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "text": "Great strategy!",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Delete Comment

**DELETE** `/api/strategies/comments?strategyId=...&index=0`

Delete a comment (author or strategy owner only).

**Response:**

```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

### Rate Strategy

**GET** `/api/strategies/ratings?strategyId=...`

Get rating information.

**Response:**

```json
{
  "success": true,
  "data": {
    "averageRating": 4.5,
    "totalRatings": 10,
    "userRating": 5
  }
}
```

**POST** `/api/strategies/ratings`

Add or update rating (1-5 stars).

**Request Body:**

```json
{
  "strategyId": "strategy1",
  "rating": 5
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "averageRating": 4.5,
    "totalRatings": 11,
    "userRating": 5
  }
}
```

---

## Template Endpoints

### Get Templates

**GET** `/api/strategies/templates`

Get all strategy templates.

**Response:**

```json
{
  "success": true,
  "data": [ ... ]
}
```

---

### Mark as Template

**POST** `/api/strategies/templates`

Mark a strategy as a template (owner only).

**Request Body:**

```json
{
  "strategyId": "strategy1"
}
```

**Response:**

```json
{
  "success": true,
  "data": { ... },
  "message": "Strategy marked as template"
}
```

---

### Remove Template Status

**DELETE** `/api/strategies/templates?id=strategyId`

Remove template status (owner only).

**Response:**

```json
{
  "success": true,
  "message": "Template status removed"
}
```

---

### Use Template

**POST** `/api/strategies/use-template`

Create a new strategy from a template.

**Request Body:**

```json
{
  "templateId": "template1",
  "name": "My Strategy from Template"
}
```

**Response:**

```json
{
  "success": true,
  "data": { ... },
  "message": "Strategy created from template"
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "details": { ... } // Optional, for validation errors
}
```

## Rate Limiting

Strategy creation is rate-limited to 30 requests per minute per user/IP.

## Authentication

Most endpoints require authentication. Unauthenticated requests return `401 Unauthorized`.
