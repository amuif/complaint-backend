# 🏢 Office Management System

A comprehensive office management system with citizen portal featuring multi-language support and modern web technologies.

## 🚀 Quick Start

### For Hosting Server Deployment

1. **Database Setup**: Copy and paste `database_hosting_setup.sql` into your hosting database manager
2. **Environment**: Copy `.env.example` to `.env` and update with your database credentials
3. **Install**: `npm install`
4. **Start**: `npm start`

👉 **See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions**

## 📋 Features

### Admin Portal

- 🔐 Role-based access control (SuperAdmin, SubCityAdmin, Admin)
- 📊 Dashboard with analytics and statistics
- 👥 Employee management with multi-language profiles
- 📝 Complaint management and tracking
- 💬 Feedback and rating system
- 🏢 Department and office management

### Public Citizen Portal

- 📢 Submit complaints (text and voice)
- ⭐ Rate services and staff
- 💭 Provide feedback and suggestions
- 🔍 Track complaint status
- 👥 View public employee directory
- 🌍 Multi-language interface (English, Amharic, Afan Oromo)

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT with bcrypt
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Multer for voice complaints and images
- **Languages**: Multi-language support (EN, AM, AF)

## 📁 Project Structure

```
├── controllers/          # API route handlers
├── models/              # Database models
├── routes/              # API routes
├── middleware/          # Authentication & validation
├── services/            # Business logic
├── utils/               # Helper functions
├── scripts/             # Database setup scripts
├── Uploads/             # File upload directories
└── docs/                # API documentation
```

## 🔧 API Endpoints

### Admin API (`/api/admin/`)

- `POST /login` - Admin authentication
- `GET /statistics` - Dashboard statistics
- `GET /complaints` - Complaint management
- `GET /employees` - Employee management
- `GET /feedback` - Feedback management

### Public API (`/api/`)

- `POST /complaints/submit` - Submit complaints
- `POST /feedback/submit` - Submit feedback
- `POST /ratings/submit` - Submit ratings
- `GET /team` - Employee directory
- `GET /departments` - Department info

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Input validation and sanitization
- ✅ Rate limiting protection
- ✅ CORS configuration
- ✅ SQL injection prevention
- ✅ XSS protection with Helmet

## 🌐 Production Ready

- ✅ Optimized database indexes
- ✅ Performance monitoring
- ✅ Error handling and logging
- ✅ Docker support
- ✅ Environment-based configuration
- ✅ Production-grade security

## 📖 Documentation

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Hosting deployment guide
- [API_ENDPOINTS_DOCUMENTATION.md](API_ENDPOINTS_DOCUMENTATION.md) - Complete API documentation
- [docs/](docs/) - Additional technical documentation

## 🔐 Default Admin Credentials

- **Username**: `superadmin`
- **Password**: `password123`
- **Email**: `admin@office.gov.et`

**⚠️ Change default password immediately after first login!**

## 🐳 Docker Support

```bash
# Build and run with Docker
npm run docker:build
npm run docker:up

# View logs
npm run docker:logs

# Stop containers
npm run docker:down
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Setup database
npm run setup

# Start development server
npm run dev

# Check system health
npm run health
```

## 📊 Database Schema

The system includes 13 core tables:

- `departments`, `offices`, `employees`
- `admins`, `password_resets`
- `complaints`, `public_complaints`
- `feedbacks`, `public_feedback`
- `ratings`, `public_ratings`
- `activity_logs`, `system_settings`

## 🌍 Multi-Language Support

- **English** (Primary)
- **Amharic** (አማርኛ)
- **Afan Oromo** (Afaan Oromoo)

## 📞 Support

- Health Check: `GET /health`
- System Status: Available at admin dashboard
- Error Logs: Check application logs

---

**Production-ready office management system optimized for hosting servers!**

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
