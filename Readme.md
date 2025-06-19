# 🔐 Authentication Backend API

A secure, production-ready authentication backend built with Node.js, Express, and TypeScript. This project implements JWT (JSON Web Tokens) with refresh tokens for secure authentication.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication with access and refresh tokens
- 🔄 **Token Refresh** - Seamless token refresh mechanism with secure cookie storage
- 🛡️ **Security First** - Helmet, CORS, rate limiting, and secure cookie settings
- 🚀 **TypeScript** - Full TypeScript support for type safety and better developer experience
- 📝 **Input Validation** - Comprehensive request validation with meaningful error messages
- 🗄 **Prisma ORM** - Type-safe database queries with PostgreSQL
- ✅ **Production Ready** - Error handling, logging, and environment-based configuration
- 📊 **API Documentation** - Clear API documentation with request/response examples

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 12 or higher
- npm 9 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fabiconcept/auth-backend.git
   cd auth-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the environment variables with your configuration
   ```bash
   cp .env.example .env
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   npx prisma migrate dev --name init
   
   # Generate Prisma client
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:3000`

## 📚 API Reference

### Base URL
```
http://localhost:3000/api
```

### Authentication

#### Register a New User
```http
POST /auth/register
```

**Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "name": "John Doe",
      "createdAt": "2025-06-19T02:36:15.000Z",
      "updatedAt": "2025-06-19T02:36:15.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### User Login
```http
POST /auth/login
```

**Request Body**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "name": "John Doe"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### Refresh Access Token
```http
POST /auth/refresh
```

**Cookies**
- `refreshToken`: The refresh token stored in HTTP-only cookie

**Success Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "new-access-token-here",
      "refreshToken": "new-refresh-token-here"
    }
  }
}
```

#### Logout User
```http
POST /auth/logout
```

**Success Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

### Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "fields": {
      "fieldName": "Error message for specific field"
    },
    "requirements": {
      "minLength": 8,
      "requireUppercase": true,
      "requireNumber": true,
      "requireSpecialChar": true
    }
  }
}
```

## 🔒 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Application environment (`development`/`production`) | `development` | No |
| `DATABASE_URL` | PostgreSQL connection URL | - | Yes |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens | - | Yes |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | - | Yes |
| `ACCESS_TOKEN_EXPIRY` | Access token expiry time | `15m` | No |
| `REFRESH_TOKEN_EXPIRY` | Refresh token expiry time | `7d` | No |
| `COOKIE_DOMAIN` | Domain for setting cookies | `localhost` | No |
| `COOKIE_SECURE` | Use secure cookies | `false` in dev, `true` in prod | No |
| `RATE_LIMIT_WINDOW` | Rate limit window in ms | `900000` (15 mins) | No |
| `RATE_LIMIT_MAX` | Max requests per window | `100` | No |
| `AUTH_RATE_LIMIT_MAX` | Max auth requests per window | `50` | No |

## 🧪 Running Tests

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 🧑‍💻 Development

### Project Structure

```
src/
├── config/         # Configuration files
├── controllers/     # Route controllers
├── middlewares/     # Express middlewares
├── routes/         # API routes
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── app.ts          # Express app setup
└── server.ts       # Server entry point
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Reset the database
npx prisma migrate reset
```

## 🔐 Security

- **Rate Limiting**: Implemented to prevent brute force attacks
- **Secure Cookies**: HTTP-only, secure, same-site cookies for refresh tokens
- **Input Validation**: All user inputs are validated
- **CORS**: Configured to only allow requests from trusted origins
- **Helmet**: Security headers enabled
- **CSRF Protection**: Coming soon

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Demo Credentials

For testing purposes, you can use these demo credentials:

- **Email**: demo@example.com
- **Password**: Demo@123

Or register a new account using the registration endpoint.

## 📧 Support

For support, please open an issue in the GitHub repository.