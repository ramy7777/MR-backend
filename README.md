# Mixed Reality Platform Backend

A robust backend system for managing Mixed Reality hardware rentals and subscriptions.

## Features

- User Account Management
- Subscription/Rental Processing
- Hardware Tracking
- Usage Analytics
- Administrative Controls
- Payment Processing
- Security Management

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- TypeScript

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values according to your environment

3. Setup database:
   - Create a PostgreSQL database
   - Update database credentials in `.env`

4. Build and run:
   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── entities/       # Database entities
├── middleware/     # Express middleware
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript types
└── utils/          # Utility functions
```

## API Documentation

API endpoints are documented using OpenAPI/Swagger. Once the server is running, visit:
- `/api-docs` for Swagger UI
- `/api-docs.json` for OpenAPI specification

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## License

MIT
