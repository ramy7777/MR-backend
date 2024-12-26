# MR Platform Project Guidelines

## Project Overview
The MR Platform is a Mixed Reality Platform system consisting of a TypeScript/Node.js backend and a React TypeScript frontend.

## Project Structure
```
mr-platform/
├── client/                 # Frontend React application
│   ├── src/               # Frontend source code
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── src/                   # Backend source code
├── scripts/               # Database and utility scripts
├── deploy.ps1             # Deployment script
└── package.json          # Backend dependencies
```

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Logging**: Winston

### Frontend
- **Framework**: React
- **Language**: TypeScript
- **Environment**: Create React App

## Development Workflow

### Setting Up Development Environment

1. **Prerequisites**:
   - Node.js (Latest LTS version)
   - PostgreSQL
   - Git

2. **Initial Setup**:
   ```bash
   # Clone the repository
   git clone [repository-url]
   
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   ```

3. **Environment Configuration**:
   - Copy `.env.example` to `.env` in both root and client directories
   - Configure necessary environment variables

### Development Commands

#### Backend
```bash
# Start development server with hot reload
npm run dev

# Build the project
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

#### Frontend (in client directory)
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Code Standards

### TypeScript Guidelines
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid using `any` type
- Use proper type annotations for function parameters and return types

### API Development
- Follow RESTful principles
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Implement proper error handling
- Use middleware for authentication and validation
- Document all endpoints

### Database
- Use TypeORM entities for database models
- Write clean migrations for database changes
- Follow naming conventions for tables and columns
- Implement proper indexing strategies

### Security
- Use environment variables for sensitive data
- Implement proper authentication and authorization
- Use CORS protection
- Implement rate limiting
- Use Helmet for security headers

## Deployment

The project uses a PowerShell deployment script (`deploy.ps1`) for automated deployment. The deployment process includes:
- Building both frontend and backend
- Database migrations
- Environment configuration
- Service restart

## Dependencies Management

### Backend Dependencies
- Keep dependencies updated regularly
- Use exact versions in package.json
- Review security vulnerabilities
- Main dependencies:
  - express: Web framework
  - typeorm: Database ORM
  - pg: PostgreSQL client
  - winston: Logging
  - joi: Validation

### Frontend Dependencies
- Managed separately in client/package.json
- Core dependencies include React and related libraries
- Use consistent versioning strategy

## Testing Strategy

### Backend Testing
- Use Jest for unit tests
- Implement integration tests for API endpoints
- Test database operations
- Mock external services

### Frontend Testing
- Component testing with React Testing Library
- Integration testing of key user flows
- End-to-end testing when necessary

## Logging and Monitoring

- Use Winston for backend logging
- Implement different log levels (error, warn, info, debug)
- Log files are stored in:
  - combined.log: All logs
  - error.log: Error-level logs only

## Version Control Guidelines

- Use feature branches
- Write meaningful commit messages
- Follow conventional commits format
- Review code before merging
- Keep branches up to date with main

## Documentation

- Keep README.md updated
- Document API endpoints
- Document environment variables
- Maintain change log
- Document database schema changes

## Support and Troubleshooting

For common issues and solutions:
1. Check logs in combined.log and error.log
2. Verify environment variables
3. Check database connectivity
4. Verify node_modules installation
5. Check for port conflicts

## Contributing

1. Create a feature branch
2. Implement changes
3. Write/update tests
4. Update documentation
5. Submit pull request
