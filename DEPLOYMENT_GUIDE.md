# 🚀 Office Management System - Deployment Guide

## Quick Setup for Hosting Servers

### 1. Database Setup

1. **Create MySQL Database** on your hosting panel
2. **Copy and paste** the entire content of `database_hosting_setup.sql` into your database manager
3. **Execute** the script to create all tables and sample data

### 2. Environment Configuration

1. Copy `.env.example` to `.env`
2. Update the following variables:

```env
# Database - Update with your hosting database details
DB_HOST=your_database_host
DB_NAME=your_database_name
DB_USER=your_database_username
DB_PASSWORD=your_database_password

# Security - Generate a long random string
JWT_SECRET=your_very_long_random_secret_key

# Domain - Add your actual domain
ALLOWED_ORIGINS=https://yourdomain.com
```

### 3. File Upload Directories

Ensure these directories exist and are writable:

- `Uploads/voice_complaints/`
- `Uploads/profile_pictures/`

### 4. Start Application

```bash
npm install
npm start
```

### 5. Default Admin Access

- **URL**: `https://yourdomain.com/api/admin/login`
- **Username**: `superadmin`
- **Password**: `password123`

**⚠️ IMPORTANT**: Change the default password immediately!

### 6. API Endpoints

- **Admin Portal**: `/api/admin/`
- **Public Portal**: `/api/`
- **Health Check**: `/health`

### 7. Features Included

✅ Multi-language support (English, Amharic, Afan Oromo)  
✅ Role-based admin access control  
✅ Public citizen complaint system  
✅ Service rating and feedback system  
✅ Employee directory  
✅ File upload support

### 8. Security Features

✅ Password hashing with bcrypt  
✅ JWT token authentication  
✅ Input validation and sanitization  
✅ Rate limiting  
✅ CORS protection  
✅ SQL injection prevention

---

## Troubleshooting

**Database Connection Issues:**

- Verify database credentials in `.env`
- Check if MySQL server is running
- Ensure database user has proper privileges

**File Upload Issues:**

- Check directory permissions for `Uploads/` folder
- Verify `MAX_FILE_SIZE` in `.env`

**CORS Issues:**

- Update `ALLOWED_ORIGINS` in `.env` with your frontend domain

---

## Support

For technical support, check the API endpoints:

- Health Check: `GET /health`
- API Documentation: Available at admin dashboard

---

**System is production-ready and optimized for hosting servers!**
