# Auth Service

A lightweight, production-ready authentication service built with **Bun**, **Drizzle ORM**, and **PostgreSQL**. This service handles user registration, login, token refresh, and logout with a built-in middleware system.

## Features

- ✨ **User Registration & Login** - Secure registration with password validation and email verification
- 🔐 **JWT-based Authentication** - Access tokens and refresh tokens with configurable expiration
- 🍃 **Session Management** - Multi-device support with individual session revocation
- 📊 **Database-backed Session Storage** - Tracks user agents and IP addresses for sessions
- ⚡ **Custom Middleware System** - Composable middleware pipeline for CORS, logging, and rate limiting
- 🛡️ **Built-in Security** - Password hashing, CSRF protection, secure cookies
- 📈 **Rate Limiting** - Protect endpoints from abuse with configurable rate limits
- 🏥 **Health Monitoring** - System health endpoint with uptime and memory metrics
- 🧹 **Background Cleanup** - Automatic cleanup of expired and revoked tokens
- 🚀 **Bun Runtime** - Fast, modern JavaScript runtime with zero-config TypeScript

## Tech Stack

| Component | Technology                    |
| --------- | ----------------------------- |
| Runtime   | Bun (`latest`)                |
| Language  | TypeScript                    |
| Database  | PostgreSQL                    |
| ORM       | Drizzle ORM v0.45+            |
| Auth      | jose (JWT library)            |
| Password  | Bun's native password hashing |

## Project Structure

```
src/
├── index.ts              # Server entry point with routing
├── database/
│   ├── db.ts            # Drizzle client instance
│   ├── schema.ts        # Database models (users, refresh_tokens)
│   └── queries/         # Database queries organized by domain
│       ├── users.ts
│       └── refreshTokens.ts
├── routes/              # API endpoints
│   ├── register.ts      # User registration
│   ├── login.ts        # User login
│   ├── refresh.ts      # Token refresh
│   ├── logout.ts       # Single session logout
│   ├── logoutAll.ts    # All sessions logout
│   └── health.ts       # Health check endpoint
├── middlewares/         # Request/response pipeline
│   ├── auth.ts         # JWT verification & session validation
│   ├── compose.ts      # Middleware composer
│   ├── cors.ts         # CORS headers handling
│   ├── logger.ts       # Request/response logging
│   ├── rateLimit.ts    # Rate limiting
│   ├── error.ts        # Global error handling
│   └── types.ts        # Type definitions
└── utils/              # Helper utilities
    ├── jwt.ts          # Token generation and verification
    ├── hash.ts         # Password hashing and verification
    ├── validation.ts   # Input validation rules
    ├── cookie.ts       # Cookie serialization/parsing
    ├── json.ts         # JSON response helpers
    └── error.ts        # Custom error classes
```

## Prerequisites

- [Bun](https://bun.sh) v1.0+
- PostgreSQL 12+
- Node.js 18+ (for `node:crypto` module)

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repo-url>
   cd auth-service
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

4. **Configure database:**
   ```bash
   bun db:push
   ```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/auth_db

# JWT Secrets (generate random strings in production)
ACCESS_SECRET=your-access-token-secret-min-32-chars
REFRESH_SECRET=your-refresh-token-secret-min-32-chars

# Token Expiration (default: 15m for access, 7d for refresh)
ACCESS_EXP=15m
REFRESH_EXP=7d

# Environment
ENV=development   # or 'production'
```

### Generating Secure Secrets

Use this command to generate random secrets:

```bash
bun -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

## Getting Started

### Start the Server

```bash
bun start
```

The server will run on `http://localhost:3000` with hot reload enabled.

### Database Commands

```bash
# Push schema changes to database
bun db:push

# Generate migrations from schema changes
bun db:generate

# Run migrations
bun db:migrate

# Open Drizzle Studio (GUI for database)
bun db:studio
```

## API Documentation

### Base URL

```
http://localhost:3000
```

### Authentication

The service uses:

- **Access Token** - Short-lived JWT sent in response body
- **Refresh Token** - Long-lived JWT stored in HttpOnly cookie

Protected endpoints require a valid refresh token in the `refresh_token` cookie.

---

### 1. Health Check

```http
GET /health
```

Returns service status, uptime, and memory metrics.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2026-02-13T10:30:00.000Z",
  "uptime": "2m 45s",
  "bunVersion": "1.0.0",
  "memory": {
    "rss": "150MB",
    "heapUsed": "85MB"
  },
  "env": "development"
}
```

---

### 2. Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePass123"
}
```

**Validation Rules:**

- Email: Valid email format
- Username: At least 4 characters
- Password: At least 8 characters, 1 uppercase, 1 lowercase, 1 digit

**Success Response (201):**

```json
{
  "message": "Registred Successfully. You can login!"
}
```

**Error Responses:**

```json
// 400 - Invalid input
{ "error": "Invalid email" }

// 403 - User already exists
{ "error": "User already exists!" }
```

---

### 3. Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "usersname": "john_doe",
  "createdAt": "2026-02-13T10:00:00.000Z",
  "updatedAt": "2026-02-13T10:00:00.000Z",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response includes a `Set-Cookie` header with `refresh_token` (HttpOnly, secure).

**Error Responses:**

```json
// 400 - Invalid credentials
{ "error": "Invalid credentials!" }

// 400 - Weak password
{ "error": "Weak password - must be more than 8 characters..." }
```

---

### 4. Refresh Token

```http
POST /auth/refresh
Cookie: refresh_token=<token>
```

Generates a new access token and refresh token.

**Success Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response includes a new `Set-Cookie` header with updated `refresh_token`.

**Error Responses:**

```json
// 401 - Missing or invalid refresh token
{ "error": "You must be authenticated" }

// 401 - Token revoked or expired
{ "error": "Refresh token revoked or expired" }
```

---

### 5. Logout (Single Session)

```http
POST /auth/logout
Cookie: refresh_token=<token>
```

Revokes only the current refresh token.

**Success Response (204):**

```
No content
```

Includes `Set-Cookie` header to clear the refresh token cookie.

**Error Responses:**

```json
// 401 - Not authenticated
{ "error": "You must be authenticated" }
```

---

### 6. Logout All Sessions

```http
POST /auth/logout-all
Cookie: refresh_token=<token>
```

Revokes all refresh tokens for the authenticated user.

**Success Response (204):**

```
No content
```

**Error Responses:**

```json
// 401 - Not authenticated
{ "error": "You must be authenticated" }
```

---

## Usage Examples

### JavaScript/TypeScript

```typescript
// Register
const registerRes = await fetch("http://localhost:3000/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    username: "john_doe",
    password: "SecurePass123",
  }),
});

// Login
const loginRes = await fetch("http://localhost:3000/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "SecurePass123",
  }),
  credentials: "include", // Important: include cookies
});

const { accessToken } = await loginRes.json();

// Use access token for protected requests
const protectedRes = await fetch("http://other-service.com/api/data", {
  headers: { Authorization: `Bearer ${accessToken}` },
});

// Refresh token (automatically done via cookie)
const refreshRes = await fetch("http://localhost:3000/auth/refresh", {
  method: "POST",
  credentials: "include",
});
```

### cURL

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "username": "john_doe",
    "password": "SecurePass123"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -c cookies.txt \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'

# Refresh (uses cookies.txt)
curl -X POST http://localhost:3000/auth/refresh \
  -b cookies.txt

# Logout
curl -X POST http://localhost:3000/auth/logout \
  -b cookies.txt
```

## Database Schema

### Users Table

| Column    | Type      | Constraints      |
| --------- | --------- | ---------------- |
| id        | UUID      | PRIMARY KEY      |
| email     | VARCHAR   | UNIQUE, NOT NULL |
| username  | VARCHAR   | UNIQUE, NOT NULL |
| password  | TEXT      | NOT NULL         |
| createdAt | TIMESTAMP | DEFAULT NOW()    |
| updatedAt | TIMESTAMP | DEFAULT NOW()    |

### Refresh Tokens Table

| Column       | Type      | Constraints                  |
| ------------ | --------- | ---------------------------- |
| id           | UUID      | PRIMARY KEY                  |
| userId       | UUID      | FOREIGN KEY → users(id)      |
| refreshToken | TEXT      | NOT NULL                     |
| userAgent    | TEXT      | Optional (device tracking)   |
| ipAddress    | TEXT      | Optional (location tracking) |
| expiresAt    | TIMESTAMP | NOT NULL                     |
| revokedAt    | TIMESTAMP | NULL until revoked           |
| createdAt    | TIMESTAMP | DEFAULT NOW()                |
| updatedAt    | TIMESTAMP | DEFAULT NOW()                |

## Middleware System

The service uses a composable middleware approach:

### Available Middlewares

| Middleware  | Purpose                                  |
| ----------- | ---------------------------------------- |
| `cors`      | Handles CORS headers and preflight       |
| `logger`    | Logs all requests/responses with metrics |
| `rateLimit` | Rate limiting per IP address             |
| `isAuth`    | JWT verification & session validation    |
| `error`     | Global error handling middleware         |

### Middleware Composition

```typescript
// publicPipe: Available to all
export const publicPipe = compose(cors, logger);

// privatePipe: Requires authentication
export const privatePipe = compose(
  cors,
  logger,
  rateLimit({ windowMs: 60000, max: 100 }),
  isAuth,
);
```

The `compose` function creates a pipeline that executes middlewares in reverse order.

### Extending with Custom Middlewares

```typescript
// src/middlewares/custom.ts
import type { RouteHandler } from "./types";

export function myMiddleware(handler: RouteHandler): RouteHandler {
  return async (req, server) => {
    console.log("Before handler");
    const response = await handler(req, server);
    console.log("After handler");
    return response;
  };
}
```

Add to compose:

```typescript
export const customPipe = compose(cors, logger, myMiddleware);
```

## Extending the Service

### Adding a New Route

1. **Create route file** (`src/routes/my-route.ts`):

```typescript
import type { BunRequest } from "bun";
import { respondWithJSON } from "../utils/json";

export async function myRoute(req: BunRequest) {
  // Your logic here
  return respondWithJSON(200, { message: "Success" });
}
```

2. **Add to router** (`src/index.ts`):

```typescript
import { myRoute } from "./routes/my-route";

const server = serve({
  routes: {
    "/api/my-route": { POST: publicPipe(myRoute) },
    // ... other routes
  },
});
```

### Adding a Database Query

1. **Create query file** (`src/database/queries/myEntity.ts`):

```typescript
import { eq } from "drizzle-orm";
import { db } from "../db";
import { myTable } from "../schema";

export async function getMyEntity(id: string) {
  const [result] = await db.select().from(myTable).where(eq(myTable.id, id));
  return result;
}
```

2. **Use in route**:

```typescript
import { getMyEntity } from "../database/queries/myEntity";

export async function myRoute(req: BunRequest) {
  const entity = await getMyEntity("123");
  return respondWithJSON(200, entity);
}
```

### Adding a New Table

1. **Update schema** (`src/database/schema.ts`):

```typescript
export const myTable = pgTable("my_table", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

2. **Generate migration**:

```bash
bun db:generate  # Creates migration files
bun db:push      # Applies migrations
```

## Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /auth/register or /auth/login
       ↓
┌──────────────────┐
│  Auth Service    │
├──────────────────┤
│ ✓ Validate input │
│ ✓ Hash password  │
│ ✓ Generate JWT   │
│ ✓ Store refresh  │
└──────┬───────────┘
       │
       │ 2. Return accessToken + Set-Cookie
       ↓
┌─────────────────────────────────┐
│   Client (stores tokens)        │
│ • accessToken (memory/state)    │
│ • refresh_token (cookie)        │
└──────┬────────────────────────┬─┘
       │                        │
       │ 3. Use accessToken     │ 4. Token expires?
       │ (Authorization header) │ POST /auth/refresh
       ↓                        ↓
┌──────────────────┐       ┌─────────────────┐
│ Protected API    │       │ Token Refresh   │
│ (other service)  │       ├─────────────────┤
│                  │       │ • Validate token│
│ ✓ 200 OK         │       │ • Revoke old    │
│ ✗ 401 Expired    │       │ • Issue new     │
└──────────────────┘       └────────┬────────┘
                                    │
                                    ↓
                            New tokens issued
```

## Security Considerations

### Implemented

- ✅ Password hashing using Bun's native crypto
- ✅ HttpOnly cookies prevent XSS attacks
- ✅ Secure flag in production (HTTPS only)
- ✅ SameSite=Lax prevents CSRF
- ✅ Rate limiting on endpoints
- ✅ Token revocation support
- ✅ Expired token cleanup (daily)
- ✅ Strong password requirements

### Recommendations

1. **Use HTTPS in production** - Set `ENV=production`
2. **Rotate secrets periodically** - Update `ACCESS_SECRET` and `REFRESH_SECRET`
3. **Monitor token refresh patterns** - Detect suspicious activity via IP/User-Agent
4. **Implement account lockout** - After N failed login attempts
5. **Add 2FA** - For enhanced security
6. **Log security events** - Track failed authentications
7. **Use strong database credentials** - Restrict PostgreSQL access

## Performance Tips

1. **Database connection pooling** - Currently uses default pool (max 10)

   ```typescript
   // src/database/db.ts
   const pool = new Pool({ max: 20 }); // Adjust based on load
   ```

2. **Cache frequent queries** - Add Redis for token verification

   ```typescript
   // Pseudo-code
   const cached = await redis.get(`refresh:${tokenId}`);
   ```

3. **Rate limiting tuning** - Adjust per endpoint needs

   ```typescript
   privatePipe = compose(
     cors,
     logger,
     rateLimit({ windowMs: 60000, max: 200 }), // Increase max
   );
   ```

4. **Enable query logging in production** - Track slow queries
   ```typescript
   // drizzle.config.ts
   verbose: process.env.ENV === "development";
   ```

## Troubleshooting

| Issue                       | Solution                                         |
| --------------------------- | ------------------------------------------------ |
| `ECONNREFUSED` at Port 3000 | Check if port is in use: `lsof -i :3000`         |
| Database connection error   | Verify `DATABASE_URL` and PostgreSQL is running  |
| Invalid JWT                 | Ensure secrets in `.env` match token generation  |
| Token not in cookie         | Check `credentials: 'include'` in fetch requests |
| 429 Too Many Requests       | Rate limit configured - wait or adjust in config |
| 401 Unauthorized            | Refresh token expired or revoked - re-login      |

## Contributing

When extending the service:

1. Follow the existing code structure and patterns
2. Use TypeScript for type safety
3. Add error handling with custom error classes
4. Write queries in the `queries/` directory
5. Keep routes focused on a single resource
6. Validate input early in route handlers
7. Use the middleware composition for cross-cutting concerns

## License

MIT

## Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review route implementations for usage patterns
3. Consult [Drizzle ORM docs](https://orm.drizzle.team)
4. Check [Bun documentation](https://bun.sh/docs)
