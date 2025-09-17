# 🏢 OFFICE MANAGEMENT SYSTEM - API DOCUMENTATION

**Version**: 2.0.0  
**Environment**: Production Ready  
**Last Updated**: December 17, 2024

---

## 📋 **TABLE OF CONTENTS**

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Public Citizen Services](#public-citizen-services)
4. [Admin Management](#admin-management)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Security](#security)
8. [Deployment](#deployment)
9. [Examples](#examples)

---

## 🌟 **OVERVIEW**

The Office Management System provides a complete platform for:

### **For Citizens:**

- Submit complaints (text & voice)
- Track complaint status
- Rate services and staff
- Submit feedback
- View staff directory
- Access public statistics

### **For Administrators:**

- Manage all citizen submissions
- Respond to complaints and feedback
- View analytics and reports
- Manage departments and offices
- User management
- System monitoring

---

## 🔐 **AUTHENTICATION**

### **Public Endpoints**

No authentication required for citizen-facing services.

### **Admin Endpoints**

Require JWT token authentication.

```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "username": "admin",
      "role": "Admin",
      "department": "Traffic Management"
    }
  }
}
```

**Authentication Header:**

```http
Authorization: Bearer <jwt_token>
```

---

## 🚀 **PUBLIC CITIZEN SERVICES**

Base URL: `/api/`

### **System Information**

#### **Health Check**

```http
GET /api/health
```

**Response:**

```json
{
  "success": true,
  "message": "Public services are operational",
  "timestamp": "2024-12-17T10:30:00Z",
  "services": {
    "complaints": "✅ Available",
    "ratings": "✅ Available",
    "feedback": "✅ Available",
    "team_directory": "✅ Available"
  }
}
```

#### **Get Departments**

```http
GET /api/departments
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Traffic Management",
      "name_amharic": "የትራፊክ ኣስተዳደር",
      "description": "Managing traffic flow and regulations"
    }
  ]
}
```

#### **Get Offices by Department**

```http
GET /api/departments/{departmentId}/offices
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Traffic Control Center",
      "name_amharic": "የትራፊክ ቁጥጥር ማዕከል",
      "office_number": "101",
      "description": "Main traffic monitoring and control"
    }
  ]
}
```

### **Complaint Management**

#### **Submit Text Complaint**

```http
POST /api/complaints/submit
Content-Type: application/json
```

**Request Body:**

```json
{
  "complainant_name": "John Doe",
  "phone_number": "0911234567",
  "sub_city": "Bole",
  "kebele": "12",
  "complaint_description": "Traffic light malfunction at intersection",
  "department": "Traffic Management",
  "office": "Traffic Control Center",
  "desired_action": "Fix traffic light immediately"
}
```

**Validation Rules:**

- `complainant_name`: 2-100 characters
- `phone_number`: 9-15 digits, accepts +, -, spaces
- `sub_city`: 2-50 characters
- `kebele`: 1-20 characters
- `complaint_description`: Minimum 10 characters
- `department`: Required
- `office`: Required
- `desired_action`: Minimum 10 characters

**Response:**

```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "data": {
    "tracking_code": "TC-241217-ABC",
    "complaint_id": 123,
    "status": "pending"
  }
}
```

#### **Submit Voice Complaint**

```http
POST /api/complaints/submit-voice
Content-Type: multipart/form-data
```

**Form Fields:**

- `voice_file`: Audio file (mp3, wav, m4a, ogg, webm, max 10MB)
- All other fields same as text complaint
- `complaint_description`: Optional for voice complaints

**Response:**

```json
{
  "success": true,
  "message": "Voice complaint submitted successfully",
  "data": {
    "tracking_code": "TC-241217-DEF",
    "complaint_id": 124,
    "status": "pending",
    "voice_file": "voice-1703001234567-123456789.mp3"
  }
}
```

#### **Track Complaint**

```http
GET /api/complaints/track/{identifier}
```

**Parameters:**

- `identifier`: Tracking code (TC-XXXXXX-XXX) or phone number

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "tracking_code": "TC-241217-ABC",
      "complainant_name": "John Doe",
      "complaint_description": "Traffic light malfunction",
      "department": "Traffic Management",
      "office": "Traffic Control Center",
      "status": "in_progress",
      "priority": "high",
      "response_text": "We are working on fixing the traffic light",
      "created_at": "2024-12-17T10:30:00Z",
      "resolved_at": null
    }
  ]
}
```

### **Service Ratings**

#### **Submit Rating**

```http
POST /api/ratings/submit
Content-Type: application/json
```

**Request Body:**

```json
{
  "department": "Traffic Management",
  "employee_name": "Ato Kebede Alemu",
  "employee_id": 101,
  "overall_rating": 4,
  "courtesy_rating": 5,
  "timeliness_rating": 3,
  "knowledge_rating": 4,
  "additional_comments": "Very helpful staff",
  "citizen_name": "Jane Smith",
  "citizen_phone": "0922334455"
}
```

**Validation:**

- All ratings: 1-5 (integers)
- `department`: Required
- `citizen_name`, `citizen_phone`: Optional

**Response:**

```json
{
  "success": true,
  "message": "Rating submitted successfully",
  "data": {
    "rating_id": 456,
    "average_rating": "4.0"
  }
}
```

#### **Get Department Ratings**

```http
GET /api/ratings/department/{department}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "department": "Traffic Management",
    "total_ratings": 25,
    "averages": {
      "overall": "4.2",
      "courtesy": "4.1",
      "timeliness": "3.8",
      "knowledge": "4.5"
    }
  }
}
```

### **Feedback Management**

#### **Submit Feedback**

```http
POST /api/feedback/submit
Content-Type: application/json
```

**Request Body:**

```json
{
  "full_name": "Alice Johnson",
  "email": "alice@example.com",
  "phone_number": "0933445566",
  "service_type": "Vehicle Registration",
  "feedback_type": "suggestion",
  "message": "Please implement online appointment system"
}
```

**Feedback Types:**

- `complaint`: Issue or problem
- `suggestion`: Improvement idea
- `compliment`: Positive feedback

**Response:**

```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "reference_number": "FB-2024-12345",
    "feedback_id": 789,
    "status": "pending"
  }
}
```

#### **Check Feedback Status**

```http
GET /api/feedback/status/{referenceNumber}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 789,
    "reference_number": "FB-2024-12345",
    "full_name": "Alice Johnson",
    "service_type": "Vehicle Registration",
    "feedback_type": "suggestion",
    "message": "Please implement online appointment system",
    "status": "responded",
    "admin_response": "Thank you for your suggestion. We are working on it.",
    "created_at": "2024-12-17T10:30:00Z",
    "responded_at": "2024-12-17T14:20:00Z"
  }
}
```

### **Staff Directory**

#### **Get Team Members**

```http
GET /api/team?search={query}&department={dept}&limit=20&offset=0
```

**Query Parameters:**

- `search`: Search by name, position, office
- `department`: Filter by department
- `limit`: Results per page (default: 20)
- `offset`: Skip results for pagination

**Response:**

```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": 101,
        "name": "Ato Kebede Alemu",
        "position": "Director General",
        "department": "Traffic Management",
        "office_number": "101",
        "phone": "+251-11-1234567",
        "email": "kebede@authority.gov.et",
        "profile_picture": "/uploads/profile_101.jpg"
      }
    ],
    "total": 50,
    "page": 1,
    "total_pages": 3
  }
}
```

#### **Get Team Member Details**

```http
GET /api/team/{employeeId}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 101,
    "name": "Ato Kebede Alemu",
    "position": "Director General",
    "department": "Traffic Management",
    "office_number": "101",
    "phone": "+251-11-1234567",
    "email": "kebede@authority.gov.et",
    "bio": "Experienced traffic management professional",
    "specializations": "Traffic control, urban planning",
    "ratings": {
      "overall": "4.2",
      "courtesy": "4.5",
      "timeliness": "3.8",
      "knowledge": "4.7",
      "total_ratings": 23
    }
  }
}
```

### **Public Statistics**

#### **Get Statistics**

```http
GET /api/statistics
```

**Response:**

```json
{
  "success": true,
  "data": {
    "complaints": {
      "total": 1250,
      "resolved": 980,
      "resolution_rate": "78.4%"
    },
    "ratings": {
      "total": 2340,
      "average_score": "4.1"
    },
    "feedback": {
      "total": 567
    },
    "last_updated": "2024-12-17T15:30:00Z"
  }
}
```

---

## 🔧 **ADMIN MANAGEMENT**

Base URL: `/api/admin/`  
**Requires Authentication**

### **Authentication**

#### **Admin Login**

```http
POST /api/admin/login
Content-Type: application/json
```

#### **Request Password Reset**

```http
POST /api/admin/request-password-reset
Content-Type: application/json

{
  "username": "admin"
}
```

#### **Reset Password**

```http
POST /api/admin/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "new_password": "new_secure_password"
}
```

### **Public Data Management**

#### **Get Public Complaints**

```http
GET /api/admin/public/complaints?status=pending&priority=high&page=1&limit=20
```

**Query Parameters:**

- `status`: pending, in_progress, resolved, closed
- `priority`: low, medium, high, urgent
- `department`: Filter by department
- `date_from`, `date_to`: Date range
- `search`: Search in name, tracking code, phone, description
- `page`, `limit`: Pagination

**Response:**

```json
{
  "success": true,
  "data": {
    "complaints": [
      {
        "id": 123,
        "tracking_code": "TC-241217-ABC",
        "complainant_name": "John Doe",
        "phone_number": "0911234567",
        "complaint_description": "Traffic light malfunction",
        "department": "Traffic Management",
        "status": "pending",
        "priority": "high",
        "created_at": "2024-12-17T10:30:00Z",
        "resolver": {
          "id": 1,
          "username": "admin",
          "name": "Admin User"
        }
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "total_pages": 8
    }
  }
}
```

#### **Update Complaint Status**

```http
PUT /api/admin/public/complaints/{id}/status
Content-Type: application/json

{
  "status": "in_progress",
  "priority": "high",
  "internal_notes": "Dispatched repair team"
}
```

#### **Add Complaint Response**

```http
POST /api/admin/public/complaints/{id}/response
Content-Type: application/json

{
  "response_text": "We have received your complaint and are working on fixing the traffic light. Expected completion: 2 days."
}
```

#### **Get Public Ratings**

```http
GET /api/admin/public/ratings?department=Traffic&rating_from=3&page=1
```

**Response:**

```json
{
  "success": true,
  "data": {
    "ratings": [
      {
        "id": 456,
        "department": "Traffic Management",
        "overall_rating": 4,
        "courtesy_rating": 5,
        "timeliness_rating": 3,
        "knowledge_rating": 4,
        "additional_comments": "Very helpful",
        "citizen_name": "Jane Smith",
        "created_at": "2024-12-17T10:30:00Z",
        "employee": {
          "id": 101,
          "name": "Ato Kebede Alemu",
          "position": "Director"
        }
      }
    ],
    "averages": {
      "overall": "4.2",
      "courtesy": "4.1",
      "timeliness": "3.8",
      "knowledge": "4.5"
    },
    "pagination": {
      "total": 100,
      "page": 1,
      "total_pages": 5
    }
  }
}
```

#### **Get Ratings Analytics**

```http
GET /api/admin/public/ratings/analytics?department=Traffic&timeframe=30
```

**Response:**

```json
{
  "success": true,
  "data": {
    "timeframe": "30 days",
    "department_stats": {
      "Traffic Management": {
        "total_ratings": 45,
        "averages": {
          "overall": "4.2",
          "courtesy": "4.1",
          "timeliness": "3.8",
          "knowledge": "4.5"
        }
      }
    },
    "total_ratings": 150
  }
}
```

#### **Get Public Feedback**

```http
GET /api/admin/public/feedback?status=pending&feedback_type=suggestion
```

#### **Respond to Feedback**

```http
POST /api/admin/public/feedback/{id}/response
Content-Type: application/json

{
  "admin_response": "Thank you for your suggestion. We are implementing online appointments next month."
}
```

### **Dashboard Statistics**

#### **Get Dashboard Stats**

```http
GET /api/admin/public/dashboard-stats?timeframe=30
```

**Response:**

```json
{
  "success": true,
  "data": {
    "timeframe": "30 days",
    "complaints": {
      "total": 85,
      "pending": 12,
      "resolved": 67,
      "resolution_rate": "78.8%"
    },
    "ratings": {
      "total": 234,
      "average_score": "4.1"
    },
    "feedback": {
      "total": 45,
      "pending": 8
    },
    "last_updated": "2024-12-17T15:30:00Z"
  }
}
```

### **Department & Office Management**

#### **Create Department**

```http
POST /api/admin/public/departments
Content-Type: application/json

{
  "name": "Vehicle Inspection",
  "name_amharic": "የተሽከርካሪ ምርመራ",
  "description": "Vehicle technical inspection services",
  "phone": "+251-11-1234579",
  "email": "inspection@authority.gov.et"
}
```

#### **Create Office**

```http
POST /api/admin/public/offices
Content-Type: application/json

{
  "name": "Main Inspection Center",
  "name_amharic": "ዋናው ምርመራ ማዕከል",
  "office_number": "301",
  "department_id": 4,
  "description": "Main vehicle inspection facility",
  "floor": "3rd Floor",
  "location": "Building C"
}
```

---

## ❌ **ERROR HANDLING**

### **Standard Error Response**

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "type": "field",
      "value": "invalid_value",
      "msg": "Validation error message",
      "path": "field_name",
      "location": "body"
    }
  ]
}
```

### **HTTP Status Codes**

- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation Error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### **Common Errors**

#### **Validation Error (400)**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "abc",
      "msg": "Invalid phone number format",
      "path": "phone_number",
      "location": "body"
    }
  ]
}
```

#### **Authentication Error (401)**

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### **Rate Limit Error (429)**

```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

---

## 🚦 **RATE LIMITING**

### **Public Endpoints**

- **General API**: 50 requests per 15 minutes per IP
- **Submissions**: 10 submissions per hour per IP

### **Admin Endpoints**

- **Login**: 5 attempts per 15 minutes per IP
- **General Admin**: 100 requests per 15 minutes per IP

### **Headers**

Rate limit information included in response headers:

```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1703002800
```

---

## 🔒 **SECURITY**

### **Security Features**

- **Helmet.js** - Security headers
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Express-validator
- **Rate Limiting** - DDoS protection
- **CORS Configuration** - Cross-origin protection
- **File Upload Security** - Type and size validation
- **SQL Injection Protection** - Sequelize ORM
- **Password Hashing** - bcrypt

### **Content Security Policy**

```
default-src 'self';
style-src 'self' 'unsafe-inline';
script-src 'self';
img-src 'self' data: https:;
```

---

## 🚀 **DEPLOYMENT**

### **Environment Variables**

```bash
NODE_ENV=production
PORT=4000
DB_HOST=localhost
DB_NAME=office
DB_USER=office_user
DB_PASSWORD=secure_password
JWT_SECRET=your_secure_jwt_secret
ALLOWED_ORIGINS=https://yourdomain.com
```

### **Production Start**

```bash
# Install dependencies
npm install --production

# Setup database
npm run setup:complete

# Start with PM2
npm run production
```

### **Docker Deployment**

```bash
# Build image
npm run docker:build

# Start production containers
npm run docker:prod
```

### **Health Checks**

Monitor these endpoints:

- `GET /health` - Application health
- `GET /api/health` - API services health

---

## 📚 **EXAMPLES**

### **JavaScript - Submit Complaint**

```javascript
const submitComplaint = async (complaintData) => {
  try {
    const response = await fetch('/api/complaints/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(complaintData),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### **cURL - Track Complaint**

```bash
curl -X GET "https://api.yourdomain.com/api/complaints/track/TC-241217-ABC"
```

### **JavaScript - Admin Authentication**

```javascript
const adminLogin = async (credentials) => {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const result = await response.json();

  if (result.success) {
    localStorage.setItem('admin_token', result.data.token);
  }

  return result;
};

const authenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('admin_token');

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};
```

---

## 📞 **SUPPORT**

### **API Documentation**

- **Base URL**: `https://api.yourdomain.com`
- **Health Check**: `GET /health`
- **API Status**: `GET /api/health`

### **Contact**

- **Email**: api-support@yourdomain.com
- **Phone**: +251-11-1234567
- **Documentation**: https://docs.yourdomain.com

---

**🎉 Office Management System v2.0 - Production Ready!**
