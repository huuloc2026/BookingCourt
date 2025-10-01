# NestJS Boilerplate

A robust, production-ready NestJS boilerplate with authentication, authorization, and PostgreSQL integration.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - OAuth2 integration (Google, GitHub, LinkedIn)
  - Role-based access control (RBAC)
  - Refresh token mechanism
  - Password hashing with bcrypt

- **Database**
  - PostgreSQL with Prisma ORM
  - Database migrations
  - Seeding scripts

- **Security**
  - Helmet for security headers
  - CORS configuration
  - Rate limiting with @nestjs/throttler
  - Input validation with class-validator
  - Global exception filters

- **API Documentation**
  - Swagger/OpenAPI integration
  - Interactive API documentation

- **Development Tools**
  - ESLint + Prettier configuration
  - TypeScript support
  - Hot reload for development
  - Docker support

- **Testing & CI/CD**
  - Jest testing framework
  - GitHub Actions CI/CD pipeline
  - Automated testing and linting

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone github.com/huuloc2026/nestjs-standard-boilerplate
   cd nestjs-boilerplate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nestjs-boilerplate_db
   JWT_SECRET=your_jwt_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   
   # OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   # ... other OAuth credentials
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the application**
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

## 🐳 Docker Setup

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services Available

- **API**: http://localhost:3000
- **Database**: PostgreSQL on port 5432
- **Adminer**: http://localhost:8080 (Database management)

## 📚 API Documentation

Once the application is running, you can access:

- **Swagger UI**: http://localhost:8888/api/docs
- **Health Check**: http://localhost:8888/api/health

## 🔐 Authentication

### Register a new user
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### OAuth Login
- Google: GET /api/auth/google
- GitHub: GET /api/auth/github
- LinkedIn: GET /api/auth/linkedin

## 🛡️ Authorization

The application uses role-based access control with three roles:

- **USER**: Default role for regular users
- **MODERATOR**: Extended permissions for content moderation
- **ADMIN**: Full system access

### Using Role Guards

```typescript
@Get('admin-only')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
async adminEndpoint() {
  // Only admins can access this endpoint
}
```

## 🗄️ Database Schema

The application uses Prisma with PostgreSQL. Key models include:

- **User**: User account information
- **RefreshToken**: JWT refresh token storage

### Running Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 🚀 Deployment

### Environment Variables

Ensure the following environment variables are set in production:

```env
NODE_ENV=production
DATABASE_URL=your_production_db_url
JWT_SECRET=your_strong_jwt_secret
JWT_REFRESH_SECRET=your_strong_refresh_secret
```

### Build for Production

```bash
npm run build
npm run start:prod
```

## 📝 Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run start:prod` - Start production server
- `npm run build` - Build the application
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## 🏗️ Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── guards/          # Auth guards
│   ├── strategies/      # Passport strategies
│   └── ...
├── user/                # User management module
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators
│   ├── filters/         # Exception filters
│   ├── guards/          # Authorization guards
│   └── interceptors/    # Request/response interceptors
├── config/              # Configuration files
└── main.ts             # Application entry point
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔧 Troubleshooting

### Common Issues

1. **Database connection errors**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Verify database exists

2. **JWT errors**
   - Check JWT_SECRET is set
   - Ensure tokens haven't expired

3. **OAuth issues**
   - Verify OAuth credentials are correct
   - Check callback URLs match your setup

### Support

For issues and questions, please open an issue on the GitHub repository.
