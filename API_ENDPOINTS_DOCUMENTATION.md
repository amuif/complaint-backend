# 🏢 Office Management System - API Documentation

## Overview

This comprehensive API documentation covers all endpoints for the Office Management System, which provides both administrative functionality and public citizen services.

### System Architecture

- **Admin Portal**: Full administrative control with role-based access
- **Public Portal**: Citizen complaints, feedback, and ratings system
- **Multi-language Support**: English, Amharic, Afan Oromo
- **Role-based Access**: SuperAdmin, SubCityAdmin, Admin

### Base URLs

- **Admin API**: `/api/admin/`
- **Public API**: `/api/`
- **Health Check**: `/health`

---

## 🔐 Authentication

### Admin Login

**POST** `/api/admin/login`

Authenticates admin users and returns JWT token.

**Request Body:**

```json
{
  "username": "superadmin",
  "password": "password123"
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
      "username": "superadmin",
      "role": "SuperAdmin",
      "first_name": "System",
      "last_name": "Administrator"
    }
  }
}
```

### Password Reset Request

**POST** `/api/admin/request-password-reset`

**Request Body:**

```json
{
  "username": "admin_username"
}
```

### Password Reset

**POST** `/api/admin/reset-password`

**Request Body:**

```json
{
  "token": "reset_token",
  "new_password": "new_password123"
}
```

---

## 👥 Admin Management

### Create Admin (SuperAdmin Only)

**POST** `/api/admin/admins`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "username": "new_admin",
  "password": "password123",
  "email": "admin@office.gov.et",
  "role": "Admin",
  "first_name": "John",
  "last_name": "Doe",
  "city": "Addis Ababa",
  "subcity": "Bole",
  "department": "Engineering Department",
  "phone": "+251-911-123456"
}
```

### Get Admin Users (SuperAdmin Only)

**GET** `/api/admin/log-admins`

**Headers:** `Authorization: Bearer <token>`

### Update Admin Profile

**PUT** `/api/admin/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "first_name": "Updated Name",
  "last_name": "Updated Surname",
  "email": "updated@office.gov.et",
  "phone": "+251-911-999999"
}
```

---

## 👷 Employee Management

### Get Employees

**GET** `/api/admin/employees`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `section`: Filter by section/subcity
- `department`: Filter by department
- `search`: Search in names and positions

**Response:**

```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": 1,
        "employee_id": "EMP001",
        "first_name_en": "Ahmed",
        "first_name_am": "አህመድ",
        "position_en": "Senior Control Officer",
        "department_en": "Control and Awareness Department",
        "section": "Bole",
        "phone": "+251-911-123456",
        "email": "ahmed.hassan@office.gov.et"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "pages": 5,
      "limit": 10
    }
  }
}
```

### Create Employee

**POST** `/api/admin/employees`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "employee_id": "EMP002",
  "first_name_en": "Sara",
  "first_name_am": "ሳራ",
  "first_name_af": "Saaraa",
  "middle_name_en": "Getachew",
  "last_name_en": "Abebe",
  "position_en": "Technical Specialist",
  "position_am": "ቴክኒካል ባለሙያ",
  "department_en": "Engineering Department",
  "section": "Arada",
  "city": "Addis Ababa",
  "subcity": "Arada",
  "email": "sara.getachew@office.gov.et",
  "phone": "+251-911-234567",
  "office_number": "B202",
  "floor_number": 2
}
```

### Update Employee

**PUT** `/api/admin/employees/:id`

**Headers:** `Authorization: Bearer <token>`

### Delete Employee

**DELETE** `/api/admin/employees/:id`

**Headers:** `Authorization: Bearer <token>`

---

## 📝 Complaint Management

### Get Complaints (Admin)

**GET** `/api/admin/complaints`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `status`: Filter by status (pending, in_progress, resolved, closed)
- `priority`: Filter by priority (low, medium, high, urgent)
- `section`: Filter by section/subcity
- `department`: Filter by department
- `search`: Search in complaint descriptions
- `page`: Page number
- `limit`: Items per page

**Response:**

```json
{
  "success": true,
  "data": {
    "complaints": [
      {
        "id": 1,
        "tracking_code": "PUB240001",
        "complainant_name": "Tigist Bekele",
        "phone_number": "+251-911-111111",
        "sub_city": "Bole",
        "department": "Control and Awareness Department",
        "complaint_description": "Long waiting time and poor service quality...",
        "status": "pending",
        "priority": "medium",
        "complaint_date": "2024-01-15",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "pages": 3,
      "limit": 10
    },
    "statistics": {
      "total": 25,
      "pending": 10,
      "in_progress": 8,
      "resolved": 7
    }
  }
}
```

### Resolve Complaint

**PUT** `/api/admin/complaints/:id/resolve`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "response_text": "Thank you for your complaint. We have addressed the staffing issues and implemented new procedures to reduce waiting times.",
  "internal_notes": "Conducted staff training and reorganized queue management system.",
  "status": "resolved"
}
```

### Get Complaint Trends

**GET** `/api/admin/complaints/trends`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "monthly_trends": [
      { "month": "2024-01", "total": 45, "resolved": 42 },
      { "month": "2024-02", "total": 52, "resolved": 48 }
    ],
    "by_department": [
      { "department": "Engineering Department", "count": 15 },
      { "department": "Control and Awareness Department", "count": 12 }
    ],
    "by_priority": [
      { "priority": "high", "count": 8 },
      { "priority": "medium", "count": 25 },
      { "priority": "low", "count": 12 }
    ]
  }
}
```

### Submit Complaint (Public)

**POST** `/api/complaints/submit`

**Request Body:**

```json
{
  "complaint_name": "John Doe",
  "phone_number": "+251-911-555555",
  "email": "john.doe@email.com",
  "sub_city": "Bole",
  "kebele": "15",
  "complaint_description": "Detailed description of the complaint...",
  "complaint_date": "2024-01-20",
  "department": "Engineering Department",
  "office": "Technical Services Office",
  "service_type": "Construction Permit",
  "desired_action": "Please expedite the permit approval process.",
  "sector_id": "1",
  "division_id": "1",
  "department_id": "1",
  "employee_id": "1"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "data": {
    "tracking_code": "PUB240025",
    "complaint_id": 25,
    "estimated_response_time": "3-5 business days"
  }
}
```

### Submit Voice Complaint (Public)

**POST** `/api/complaints/submit-voice`

**Content-Type:** `multipart/form-data`

**Form Data:**

- `complainant_name`: String
- `phone_number`: String
- `sub_city`: String
- `kebele`: String
- `department`: String
- `office`: String
- `voice_file`: Audio file (MP3, WAV, M4A)

### Track Complaint (Public)

**GET** `/api/complaints/track/:identifier`

**Parameters:**

- `identifier`: Tracking code or phone number

**Response:**

```json
{
  "success": true,
  "data": {
    "complaint": {
      "tracking_code": "PUB240001",
      "status": "in_progress",
      "complaint_date": "2024-01-15",
      "department": "Control and Awareness Department",
      "response_text": null,
      "last_updated": "2024-01-16T14:30:00Z"
    }
  }
}
```

---

## 💬 Feedback Management

### Get Feedback (Admin)

**GET** `/api/admin/feedback`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `status`: Filter by status (pending, reviewed, responded, closed)
- `type`: Filter by feedback type
- `department`: Filter by department
- `search`: Search in feedback text

### Respond to Feedback (Admin)

**PUT** `/api/admin/feedback/:id/respond`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "response_text": "Thank you for your valuable feedback. We will implement your suggestion in our next system update.",
  "status": "responded"
}
```

### Submit Feedback (Public)

**POST** `/api/feedback/submit`

**Request Body:**

```json
{
  "full_name": "John Doe",
  "phone_number": "0912345678",
  "email": "john.doe@example.com",
  "sector_id": 1,
  "department_id": 1,
  "division_id": 1,
  "team_id": 1,
  "employee_id": 1,
  "subject": "Service Feedback",
  "feedback_type": "compliment",
  "description": "The service was excellent and the staff were very helpful.",
  "subcity": "Bole",
  "service_experienced": "License Renewal",
  "overall_satisfaction": 5,
  "would_recommend": true,
  "is_anonymous": false,
  "admin_response": "Thank you for your feedback!",
  "response_date": "2023-06-15T10:30:00.000Z",
  "status": "responded"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "tracking_code": "FB240015",
    "feedback_id": 15
  }
}
```

### Check Feedback Status (Public)

**GET** `/api/feedback/status/:referenceNumber`

---

## ⭐ Rating Management

### Get Ratings (Admin)

**GET** `/api/admin/ratings`

**Headers:** `Authorization: Bearer <token>`

### Get Public Ratings (Admin)

**GET** `/api/admin/public/ratings`

**Headers:** `Authorization: Bearer <token>`

### Submit Rating (Public)

**POST** `/api/ratings/submit`

**Request Body:**

```json
{
  "full_name": "Daniel Tesfaye",
  "phone_number": "+251-911-888888",
  "overall_rating": 5,
  "courtesy": 5,
  "punctuality": 5,
  "department_id": 5,
  "division_id": 9,
  "sector_id": 10,
  "employee_id": 1,
  "knowledge": 5,
  "additional_comments": "the sevice was great and it was fast too.",
  "would_recommend": true
}
```

### Get Department Ratings (Public)

**GET** `/api/ratings/department/:department`

**Response:**

```json
{
  "success": true,
  "data": {
    "department": "Engineering Department",
    "statistics": {
      "total_ratings": 45,
      "average_rating": 4.2,
      "rating_breakdown": {
        "5": 20,
        "4": 15,
        "3": 8,
        "2": 2,
        "1": 0
      }
    },
    "recent_ratings": [
      {
        "overall_rating": 5,
        "service_type": "Technical Consultation",
        "specific_comments": "Excellent service...",
        "visit_date": "2024-01-18"
      }
    ]
  }
}
```

---

## 👥 Public Team Directory

### Get Team Members (Public)

**GET** `/api/team`

**Query Parameters:**

- `department`: Filter by department
- `section`: Filter by section/subcity
- `search`: Search in names and positions

**Response:**

```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": 1,
        "first_name_en": "Ahmed",
        "middle_name_en": "Mohammed",
        "last_name_en": "Hassan",
        "position_en": "Senior Control Officer",
        "department_en": "Control and Awareness Department",
        "office_number": "A101",
        "floor_number": 1,
        "email": "ahmed.hassan@office.gov.et",
        "phone": "+251-911-123456",
        "bio_en": "Experienced control officer with 8 years in public service",
        "years_of_service": 8,
        "profile_picture": "https://images.unsplash.com/photo-1507003211169..."
      }
    ]
  }
}
```

### Get Team Member Details (Public)

**GET** `/api/team/:employeeId`

---

## 🏢 System Information

### Get Departments (Public)

**GET** `/api/departments`

**Response:**

```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "id": 1,
        "name_en": "Control and Awareness Department",
        "name_am": "ቁጥጥርና ግንዛቤ ዘርፍ",
        "name_af": "Kutaataa fi Hubannoo Damee",
        "code": "CAD",
        "description_en": "Handles control and awareness operations...",
        "contact_email": "control@office.gov.et",
        "contact_phone": "+251-11-1234567"
      }
    ]
  }
}
```

### Get Offices by Department (Public)

**GET** `/api/departments/:departmentId/offices`

### Get Employees by Department (Public)

**GET** `/api/departments/:departmentId/employees`

### Get Subcities (Public)

**GET** `/api/subcities`

---

## 📊 Statistics and Reports

### Get Admin Statistics

**GET** `/api/admin/statistics`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "total_complaints": 156,
      "pending_complaints": 23,
      "resolved_complaints": 133,
      "total_feedback": 89,
      "total_ratings": 245,
      "average_rating": 4.2
    },
    "trends": {
      "complaints_this_month": 12,
      "complaints_last_month": 18,
      "resolution_rate": 85.3,
      "average_response_time_hours": 24
    },
    "by_department": [
      {
        "department": "Engineering Department",
        "complaints": 45,
        "feedback": 23,
        "ratings": 67,
        "avg_rating": 4.1
      }
    ],
    "recent_activity": [
      {
        "type": "complaint_resolved",
        "description": "Complaint #PUB240001 resolved",
        "timestamp": "2024-01-20T15:30:00Z"
      }
    ]
  }
}
```

### Get Statistics with Location Filter

**GET** `/api/admin/statistics-location`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `city`: Filter by city
- `subcity`: Filter by subcity
- `section`: Filter by section

### Get Location Hierarchy

**GET** `/api/admin/location-hierarchy`

**Headers:** `Authorization: Bearer <token>`

### Export Reports

**GET** `/api/admin/export-report`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `type`: Report type (complaints, feedback, ratings, employees)
- `format`: Export format (csv, excel, pdf)
- `start_date`: Start date filter
- `end_date`: End date filter
- `department`: Department filter

### Export Employees

**GET** `/api/admin/employees/export`

**Headers:** `Authorization: Bearer <token>`

### Export Complaints

**GET** `/api/admin/complaints/export`

**Headers:** `Authorization: Bearer <token>`

### Export Feedback

**GET** `/api/admin/feedback/export`

**Headers:** `Authorization: Bearer <token>`

---

## 📊 Public Statistics

### Get Public Statistics

**GET** `/api/statistics`

**Response:**

```json
{
  "success": true,
  "data": {
    "complaints": {
      "total": 156,
      "resolved": 133,
      "resolution_rate": "85.3%"
    },
    "ratings": {
      "total": 245,
      "average_score": "4.2"
    },
    "feedback": {
      "total": 89
    },
    "last_updated": "2024-01-20T12:00:00Z"
  }
}
```

---

## 🔧 System Health

### Health Check

**GET** `/health`

**Response:**

```json
{
  "status": "✅ Healthy",
  "timestamp": "2024-01-20T12:00:00Z",
  "uptime": 86400,
  "memory": {
    "used": 125,
    "total": 512
  },
  "environment": "development"
}
```

### Public API Health Check

**GET** `/api/health`

**Response:**

```json
{
  "success": true,
  "message": "Public services are operational",
  "timestamp": "2024-01-20T12:00:00Z",
  "services": {
    "complaints": "✅ Available",
    "ratings": "✅ Available",
    "feedback": "✅ Available",
    "team_directory": "✅ Available"
  }
}
```

---

## 🚨 Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error details"
  }
}
```

### Common Error Codes

- `AUTHENTICATION_REQUIRED` (401): Missing or invalid authentication
- `INSUFFICIENT_PERMISSIONS` (403): User lacks required permissions
- `RESOURCE_NOT_FOUND` (404): Requested resource not found
- `VALIDATION_ERROR` (400): Invalid input data
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_SERVER_ERROR` (500): Server error

---

## 📋 Rate Limiting

### Public Endpoints

- **General Rate Limit**: 50 requests per 15 minutes per IP
- **Submission Rate Limit**: 10 submissions per hour per IP (complaints, feedback, ratings)

### Admin Endpoints

- **Standard Rate Limit**: 100 requests per 15 minutes per authenticated user
- **No submission limits** for administrative operations

---

## 🔒 Security Features

### Authentication

- JWT tokens with configurable expiration
- Password hashing using bcrypt
- Account lockout after failed login attempts

### Input Validation

- Request body validation using express-validator
- File upload restrictions and validation
- SQL injection prevention with parameterized queries

### Security Headers

- Helmet.js for security headers
- CORS configuration for allowed origins
- Request size limits

---

## 📱 File Upload Support

### Supported File Types

- **Voice Files**: MP3, WAV, M4A (max 10MB)
- **Documents**: PDF, DOC, DOCX, JPG, PNG (max 5MB each)
- **Profile Pictures**: JPG, PNG (max 2MB)

### Upload Endpoints

- **Voice Complaints**: `POST /api/complaints/submit-voice`
- **Profile Pictures**: Included in admin/employee creation/update
- **Attachments**: Supported in complaint submissions

---

## 🌐 Multi-language Support

### Language Codes

- `en`: English
- `am`: Amharic (አማርኛ)
- `af`: Afan Oromo

### Content Fields

Most content fields support multi-language versions:

- Department names and descriptions
- Employee names and positions
- Office names
- Complaint descriptions and responses
- Feedback comments

### Example Multi-language Response

```json
{
  "name_en": "Control and Awareness Department",
  "name_am": "ቁጥጥርና ግንዛቤ ዘርፍ",
  "name_af": "Kutaataa fi Hubannoo Damee"
}
```

---

## 🚀 Getting Started

### 1. Setup Database

```bash
node scripts/system_setup.js
```

### 2. Start Server

```bash
npm run dev
```

### 3. Test Endpoints

```bash
# Health check
curl http://localhost:4000/health

# Get departments
curl http://localhost:4000/api/departments

# Admin login
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"password123"}'
```

---

## 📞 Support

For technical support or questions about the API:

- **Email**: support@office.gov.et
- **Phone**: +251-11-1234567
- **Documentation**: Check this file and inline code comments

---

**Last Updated**: January 2024  
**API Version**: 2.0.0  
**System Status**: ✅ Production Ready
