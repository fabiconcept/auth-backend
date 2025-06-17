# Authentication Backend API

A secure, production-ready authentication backend built with Node.js, Express, and TypeScript. This project implements JWT (JSON Web Tokens) with refresh tokens for secure authentication.

## Features

- 🔐 JWT-based authentication with access and refresh tokens
- 🔄 Secure token refresh mechanism
- 🛡️ Protected routes with role-based access control
- 🚀 Built with TypeScript for type safety
- 🧪 Comprehensive test suite with Jest
- 🔒 Security best practices (Helmet, rate limiting, CORS)
- 🗄️ Prisma ORM with PostgreSQL database

## Prerequisites

- Node.js 18+
- PostgreSQL database
- npm

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auth-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy the example environment file and update the values:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials and JWT secrets.

4. **Database setup**
   ```bash
   # Run database migrations
   npm run db:migrate
   
   # Generate Prisma client
   npm run db:generate
   
   # (Optional) Seed initial data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   The server will be available at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### Protected Routes

- `GET /profile` - Get user profile (requires authentication)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_ACCESS_SECRET` | Secret for access tokens | - |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | - |
| `ACCESS_TOKEN_EXPIRY` | Access token expiry time | `15m` |
| `REFRESH_TOKEN_EXPIRY` | Refresh token expiry time | `7d` |
| `RATE_LIMIT_WINDOW` | Rate limit window in ms | `900000` (15 mins) |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `AUTH_RATE_LIMIT_MAX` | Max auth requests per window | `10` |

## Running Tests

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```