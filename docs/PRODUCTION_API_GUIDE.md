# 🏢 OFFICE MANAGEMENT SYSTEM - PRODUCTION API GUIDE

**Version**: 2.0.0 | **Status**: Production Ready | **Last Updated**: December 17, 2024

---

## 🚀 **QUICK START**

### **Base URLs**

- **Production**: `https://yourdomain.com`
- **Development**: `http://localhost:4000`

### **Core Endpoints**

- **Public Services**: `/api/`
- **Admin Dashboard**: `/api/admin/`
- **Health Check**: `/health`

---

## 🔑 **AUTHENTICATION**

### **Public Services**

✅ No authentication required

### **Admin Services**

🔐 JWT Token required

```bash
# Login
curl -X POST /api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Use token in requests
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" /api/admin/dashboard-stats
```

---

## 📝 **CITIZEN SERVICES**

### **1. COMPLAINT SYSTEM**

#### Submit Text Complaint

```bash
POST /api/complaints/submit
Content-Type: application/json

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

**✅ Response:**

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

#### Submit Voice Complaint

```bash
POST /api/complaints/submit-voice
Content-Type: multipart/form-data

# Form data with voice_file + all text complaint fields
```

#### Track Complaints

```bash
GET /api/complaints/track/TC-241217-ABC
GET /api/complaints/track/0911234567
```

### **2. SERVICE RATINGS**

#### Submit Rating

```bash
POST /api/ratings/submit
Content-Type: application/json

{
  "department": "Traffic Management",
  "employee_name": "Ato Kebede",
  "overall_rating": 4,
  "courtesy_rating": 5,
  "timeliness_rating": 3,
  "knowledge_rating": 4,
  "additional_comments": "Very helpful staff"
}
```

#### Get Department Ratings

```bash
GET /api/ratings/department/Traffic%20Management
```

### **3. FEEDBACK SYSTEM**

#### Submit Feedback

```bash
POST /api/feedback/submit
Content-Type: application/json

{
  "full_name": "Alice Johnson",
  "service_type": "Vehicle Registration",
  "feedback_type": "suggestion",
  "message": "Please implement online appointment system"
}
```

#### Check Status

```bash
GET /api/feedback/status/FB-2024-12345
```

### **4. STAFF DIRECTORY**

#### Search Staff

```bash
GET /api/team?search=kebede&department=Traffic&limit=20
```

#### Get Staff Details

```bash
GET /api/team/101
```

### **5. DEPARTMENTS & OFFICES**

```bash
GET /api/departments
GET /api/departments/1/offices
```

### **6. PUBLIC STATISTICS**

```bash
GET /api/statistics
```

---

## 🛡️ **ADMIN MANAGEMENT**

### **1. AUTHENTICATION**

#### Login

```bash
POST /api/admin/login
{
  "username": "admin",
  "password": "password"
}
```

#### Password Reset

```bash
POST /api/admin/request-password-reset
{"username": "admin"}

POST /api/admin/reset-password
{"token": "reset_token", "new_password": "new_password"}
```

### **2. COMPLAINT MANAGEMENT**

#### Get Complaints

```bash
GET /api/admin/public/complaints?status=pending&priority=high&page=1
```

#### Update Status

```bash
PUT /api/admin/public/complaints/123/status
{
  "status": "in_progress",
  "priority": "high",
  "internal_notes": "Dispatched repair team"
}
```

#### Add Response

```bash
POST /api/admin/public/complaints/123/response
{
  "response_text": "We are working on fixing the traffic light"
}
```

### **3. RATINGS MANAGEMENT**

#### Get Ratings

```bash
GET /api/admin/public/ratings?department=Traffic&rating_from=3
```

#### Analytics

```bash
GET /api/admin/public/ratings/analytics?timeframe=30
```

### **4. FEEDBACK MANAGEMENT**

#### Get Feedback

```bash
GET /api/admin/public/feedback?status=pending
```

#### Respond

```bash
POST /api/admin/public/feedback/789/response
{
  "admin_response": "Thank you for your suggestion. Implementing soon."
}
```

### **5. DASHBOARD STATISTICS**

```bash
GET /api/admin/public/dashboard-stats?timeframe=30
```

### **6. SYSTEM MANAGEMENT**

#### Create Department

```bash
POST /api/admin/public/departments
{
  "name": "Vehicle Inspection",
  "name_amharic": "የተሽከርካሪ ምርመራ",
  "description": "Vehicle inspection services"
}
```

#### Create Office

```bash
POST /api/admin/public/offices
{
  "name": "Main Inspection Center",
  "office_number": "301",
  "department_id": 4
}
```

---

## 📊 **RESPONSE FORMATS**

### **Success Response**

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {
    /* response data */
  }
}
```

### **Error Response**

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "msg": "Validation error message",
      "path": "field_name"
    }
  ]
}
```

### **Pagination**

```json
{
  "success": true,
  "data": {
    "items": [
      /* data array */
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

---

## 🚦 **RATE LIMITS**

| Endpoint Type | Limit               |
| ------------- | ------------------- |
| Public API    | 50 requests/15min   |
| Submissions   | 10 submissions/hour |
| Admin Login   | 5 attempts/15min    |
| Admin API     | 100 requests/15min  |

**Rate Limit Headers:**

```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1703002800
```

---

## ⚠️ **VALIDATION RULES**

### **Complaint Validation**

- `complainant_name`: 2-100 characters
- `phone_number`: 9-15 digits, format: +251XXXXXXXXX or 09XXXXXXXX
- `complaint_description`: Min 10 characters
- `desired_action`: Min 10 characters

### **Rating Validation**

- All ratings: Integers 1-5
- `department`: Required

### **Feedback Validation**

- `feedback_type`: "complaint", "suggestion", "compliment"
- `message`: Min 10 characters

---

## 🔒 **SECURITY FEATURES**

✅ **JWT Authentication**  
✅ **Rate Limiting**  
✅ **Input Validation**  
✅ **Security Headers (Helmet.js)**  
✅ **CORS Protection**  
✅ **File Upload Security**  
✅ **SQL Injection Protection**

---

## 🚀 **DEPLOYMENT**

### **Environment Setup**

```bash
# Copy environment file
cp env.production.example .env

# Edit with your values
nano .env
```

### **Database Setup**

```bash
npm run setup:complete
```

### **Production Start**

```bash
# With npm
npm run production

# With PM2 directly
pm2 start ecosystem.config.js --env production

# With Docker
npm run docker:prod
```

### **Health Monitoring**

```bash
# Application health
curl http://localhost:4000/health

# API services health
curl http://localhost:4000/api/health
```

---

## 📱 **CLIENT EXAMPLES**

### **JavaScript/Fetch**

```javascript
// Submit complaint
const submitComplaint = async (data) => {
  const response = await fetch('/api/complaints/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

// Admin request with auth
const getStats = async () => {
  const token = localStorage.getItem('admin_token');
  const response = await fetch('/api/admin/public/dashboard-stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
```

### **Python/Requests**

```python
import requests

# Submit complaint
data = {
    "complainant_name": "John Doe",
    "phone_number": "0911234567",
    "complaint_description": "Traffic issue",
    "department": "Traffic Management",
    "office": "Control Center",
    "desired_action": "Please fix"
}

response = requests.post('http://localhost:4000/api/complaints/submit', json=data)
result = response.json()
print(f"Tracking Code: {result['data']['tracking_code']}")
```

---

## 🆘 **TROUBLESHOOTING**

### **Common Issues**

**❌ 401 Unauthorized**

- Check JWT token is valid and included in Authorization header

**❌ 400 Validation Error**

- Review field requirements and formats
- Check required fields are provided

**❌ 429 Rate Limited**

- Wait for rate limit reset time
- Reduce request frequency

**❌ 500 Server Error**

- Check database connection
- Verify environment variables
- Check server logs

### **Debug Endpoints**

```bash
# Health check
GET /health

# API status
GET /api/health

# Get current time for troubleshooting
GET /api/statistics
```

---

## 📚 **ADDITIONAL RESOURCES**

### **Documentation Files**

- `docs/SECURITY_ASSESSMENT_REPORT.md`
- `docs/ENTERPRISE_DEPLOYMENT_GUIDE.md`
- `docs/POSTMAN_API_COLLECTION.md`

### **Setup Scripts**

- `scripts/test-citizen-api.js` - API testing
- `scripts/hash_password.js` - Admin password hashing
- `sql/setup_complete_database.sql` - Full DB setup

### **Configuration Files**

- `ecosystem.config.js` - PM2 configuration
- `docker-compose.enterprise.yml` - Production Docker setup

---

**🎉 Ready for Production! Your Office Management System is now enterprise-ready with complete citizen and admin functionality.**

**Need Help?** Check `/health` and `/api/health` endpoints for system status.
