# Office Management System - Refactored

This project has been refactored from a monolithic structure to a well-organized, modular architecture and fully dockerized for easy deployment.

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
cd office-management-systemm-1

# Start with Docker Compose (includes MySQL database)
docker-compose up -d

# Access the application
# http://localhost:4000
```

### Manual Setup

```bash
# Install dependencies
npm install

# Configure database in config/database.js

# Start the refactored version
npm run start:refactored

# Or start the original version
npm start
```

## 📁 Project Structure

```
office-management-systemm-1/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── adminController.js   # Admin business logic
│   ├── complaintController.js # Complaint business logic
│   ├── employeeController.js # Employee business logic
│   ├── feedbackController.js # Feedback business logic
│   └── ratingController.js  # Rating business logic
├── middleware/
│   ├── auth.js             # Authentication & authorization
│   └── upload.js           # File upload configuration
├── models/
│   ├── Admin.js            # Admin model
│   ├── Complaint.js        # Complaint model
│   ├── Employee.js         # Employee model
│   ├── Feedback.js         # Feedback model
│   ├── Rating.js           # Rating model
│   └── index.js            # Model relationships
├── routes/
│   ├── adminRoutes.js      # Admin API routes
│   └── publicRoutes.js     # Public API routes
├── services/
│   └── databaseService.js  # Database initialization
├── utils/
│   └── helpers.js          # Utility functions
├── docker/
│   └── mysql/init/         # MySQL initialization scripts
├── Uploads/                # File uploads directory
├── index.js               # Original monolithic file (preserved)
├── index_new.js           # New refactored entry point
├── Dockerfile             # Production Docker image
├── Dockerfile.dev         # Development Docker image
├── docker-compose.yml     # Production Docker Compose
├── docker-compose.dev.yml # Development Docker Compose
├── DOCKER.md              # Comprehensive Docker guide
└── README.md              # This file
```

## 🐳 Docker Deployment

### Production Deployment

```bash
# Start all services (app + MySQL)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Development Environment

```bash
# Start with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

For detailed Docker instructions, see [DOCKER.md](DOCKER.md).

## 🔧 Available Scripts

### Node.js Scripts

```bash
npm start              # Original monolithic version
npm run start:refactored  # New refactored version
npm run dev            # Development mode (original)
npm run dev:refactored    # Development mode (refactored)
```

### Docker Scripts

```bash
# Production
docker-compose up -d
docker-compose down

# Development
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
```

## 🌟 Key Improvements

### 1. **Separation of Concerns**

- **Controllers**: Handle business logic and request/response processing
- **Models**: Define database schemas and relationships
- **Routes**: Organize API endpoints
- **Middleware**: Handle cross-cutting concerns (auth, uploads)
- **Services**: Handle complex operations (database initialization)
- **Utils**: Reusable utility functions

### 2. **Modular Architecture**

- Each component has a single responsibility
- Easy to maintain and extend
- Better code reusability
- Improved testability

### 3. **Docker Integration**

- Complete containerization with Docker
- Production and development environments
- MySQL database included
- Volume management for data persistence
- Health checks and proper networking

### 4. **Clean Code Structure**

- Consistent naming conventions
- Clear file organization
- Proper imports/exports
- Reduced code duplication

## 🌐 API Endpoints

### Public APIs (No Authentication Required)

- `GET /api/employees` - Get all employees
- `POST /api/complaints` - Submit a complaint
- `GET /api/complaints` - Get complaints by phone/tracking code
- `POST /api/ratings` - Submit employee rating
- `POST /api/feedback` - Submit feedback

### Admin APIs (Authentication Required)

- `POST /api/admin/login` - Admin login
- `GET /api/admin/employees` - Get employees (filtered by role)
- `POST /api/admin/employees` - Create employee
- `PUT /api/admin/employees/:id` - Update employee
- `DELETE /api/admin/employees/:id` - Delete employee
- `GET /api/admin/complaints` - Get complaints (filtered by role)
- `PUT /api/admin/complaints/:id/resolve` - Resolve complaint
- `GET /api/admin/feedback` - Get feedback (filtered by role)
- `GET /api/admin/statistics` - Get dashboard statistics
- `GET /api/admin/export-report` - Export reports
- `POST /api/admin/admins` - Create admin (SuperAdmin only)
- `PUT /api/admin/profile` - Update admin profile

## ✅ Features Preserved

All original functionality has been preserved:

- ✅ Multi-language support (English, Amharic, Afaan Oromo)
- ✅ Role-based access control (SuperAdmin, Admin, SubCityAdmin)
- ✅ File upload handling (voice complaints, profile pictures)
- ✅ JWT authentication
- ✅ Database relationships and constraints
- ✅ Error handling and validation
- ✅ Statistics and reporting
- ✅ Sentiment analysis for feedback

## 🗄️ Database Models

- **Admin**: System administrators with different roles
- **Employee**: Office employees with multilingual support
- **Complaint**: Customer complaints with voice file support
- **Rating**: Employee performance ratings
- **Feedback**: General feedback with sentiment analysis

## 🔐 Default Admin Account

- **Username**: `superadmin`
- **Password**: `admin123`
- **Role**: `SuperAdmin`

## 🛠️ Environment Configuration

### Docker Environment (Recommended)

Copy `docker.env.example` to `.env` and modify:

```env
DB_HOST=mysql
DB_NAME=office
DB_USER=office_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret
APP_PORT=4000
```

### Manual Setup

Configure database connection in `config/database.js` or use environment variables.

## 📋 Environment Requirements

### Docker (Recommended)

- Docker (version 20.10+)
- Docker Compose (version 2.0+)

### Manual Setup

- Node.js (version 16+)
- MySQL database (version 8.0+)
- Required npm packages (see package.json)

## 🔄 Migration Guide

To switch from the original to the refactored version:

1. **No database changes required** - All models and relationships are identical
2. **Update your startup script** - Use `index_new.js` instead of `index.js`
3. **API endpoints remain the same** - No breaking changes to the API
4. **All functionality preserved** - Every feature from the original is maintained

### For Docker Migration

1. **Easy deployment** - Just run `docker-compose up -d`
2. **Includes database** - MySQL is automatically configured
3. **Data persistence** - Volumes ensure data survives container restarts
4. **Environment management** - Configure via `.env` file

## 🚀 Production Deployment

### Using Docker (Recommended)

```bash
# 1. Configure environment
cp docker.env.example .env
# Edit .env with your production values

# 2. Deploy
docker-compose up -d

# 3. Monitor
docker-compose logs -f
```

### Security Considerations

- Change default passwords
- Use strong JWT secrets
- Configure proper network security
- Regular security updates
- Use HTTPS in production

## 📊 Monitoring and Maintenance

### Health Checks

- Application: `GET /api/employees`
- MySQL: `mysqladmin ping`

### Backup and Recovery

```bash
# Database backup
docker-compose exec mysql mysqldump -u office_user -p office_management > backup.sql

# File uploads backup
docker run --rm -v office-management-systemm-1_uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz -C /data .
```

## 🤝 Contributing

1. Use the refactored version (`index_new.js`) for new development
2. Follow the established directory structure
3. Add new features as separate modules
4. Test with both manual and Docker setups
5. Update documentation as needed

---

The refactored and dockerized version is a production-ready solution that provides excellent code organization, easy deployment, and scalability while maintaining 100% compatibility with the original system.
