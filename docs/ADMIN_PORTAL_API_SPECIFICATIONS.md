# 🚀 **Admin Portal API Specifications - Office Management System**

**Base URL:** `http://localhost:4000`
**Target Users:** SuperAdmin, SubCityAdmin, Department Admins

---

## 🔐 **ROLE-BASED ACCESS MATRIX**

| Endpoint Category        | SuperAdmin | SubCityAdmin | Control & Awareness Admin | Engineering Admin | Support Admin     | Control Center Admin |
| ------------------------ | ---------- | ------------ | ------------------------- | ----------------- | ----------------- | -------------------- |
| **Authentication**       | ✅         | ✅           | ✅                        | ✅                | ✅                | ✅                   |
| **Admin Management**     | ✅         | ❌           | ❌                        | ❌                | ❌                | ❌                   |
| **Employee Management**  | ✅ (All)   | ✅ (SubCity) | 👁️ (Dept Only)            | 👁️ (Dept Only)    | 👁️ (Dept Only)    | 👁️ (Dept Only)       |
| **Complaint Management** | ✅ (All)   | ✅ (SubCity) | ✅ (Dept Related)         | ✅ (Dept Related) | ✅ (Dept Related) | ✅ (Dept Related)    |
| **Feedback Management**  | ✅ (All)   | ✅ (SubCity) | ✅ (Dept Related)         | ✅ (Dept Related) | ✅ (Dept Related) | ✅ (Dept Related)    |
| **Ratings Management**   | ✅ (All)   | ✅ (SubCity) | ✅ (Dept Related)         | ✅ (Dept Related) | ✅ (Dept Related) | ✅ (Dept Related)    |
| **Statistics & Reports** | ✅ (All)   | ✅ (SubCity) | ✅ (Dept Only)            | ✅ (Dept Only)    | ✅ (Dept Only)    | ✅ (Dept Only)       |

---

## 🔑 **1. AUTHENTICATION ENDPOINTS**

### 1.1 **Admin Login**

```
Method: POST
URL: /api/admin/login
Access: All Admin Roles
Content-Type: application/json

Request Body (JSON):
{
  "username": "string (required)",
  "password": "string (required)"
}

Success Response (200):
{
  "message": "Login successful",
  "token": "jwt_token_string",
  "admin": {
    "id": 1,
    "username": "superadmin",
    "role": "SuperAdmin|SubCityAdmin|Admin",
    "city": "Addis Ababa",
    "subcity": "Bole|Arada|Kirkos|Lideta|Yeka|Addis Ketema",
    "section": "backward_compatibility_field",
    "department": "Control and Awareness Department|Engineering Department|Support Administration Department|Control Center Department",
    "profile_picture": "/uploads/profile_pictures/filename.jpg"
  }
}

Error Response (401):
{
  "message": "Invalid credentials"
}

Frontend Usage:
- Store token in localStorage/sessionStorage
- Store admin object for role-based UI rendering
- Redirect based on role to appropriate dashboard
```

### 1.2 **Request Password Reset**

```
Method: POST
URL: /api/admin/request-password-reset
Access: All Admin Roles
Content-Type: application/json

Request Body (JSON):
{
  "username": "string (required)"
}

Success Response (200):
{
  "message": "Password reset request sent"
}
```

### 1.3 **Reset Password**

```
Method: POST
URL: /api/admin/reset-password
Access: All Admin Roles
Content-Type: application/json

Request Body (JSON):
{
  "username": "string (required)",
  "new_password": "string (required, min 6 chars)"
}

Success Response (200):
{
  "message": "Password reset successful"
}
```

---

## 👑 **2. ADMIN MANAGEMENT ENDPOINTS**

**Access: SuperAdmin Only**

### 2.1 **Create New Admin**

```
Method: POST
URL: /api/admin/admins
Access: SuperAdmin Only
Content-Type: multipart/form-data
Headers: Authorization: Bearer {token}

Request Body (FormData):
username: string (required, unique)
password: string (required, min 6 chars)
role: "SubCityAdmin|Admin" (required)
city: "Addis Ababa" (required for SubCityAdmin)
subcity: "Bole|Arada|Kirkos|Lideta|Yeka|Addis Ketema" (required for SubCityAdmin)
department: "Control and Awareness Department|Engineering Department|Support Administration Department|Control Center Department" (required for Admin)
profile_picture: File (optional, image file: jpg, png, gif, max 5MB)

Success Response (201):
{
  "message": "Admin created successfully",
  "admin": {
    "id": 5,
    "username": "admin_new",
    "role": "SubCityAdmin",
    "city": "Addis Ababa",
    "subcity": "Bole"
  }
}

Frontend Implementation:
- Use FormData for file upload
- Show role-specific fields (city/subcity for SubCityAdmin, department for Admin)
- Image preview before upload
- Validation: check username uniqueness
```

### 2.2 **Get Admin Logs**

```
Method: GET
URL: /api/admin/log-admins
Access: SuperAdmin Only
Headers: Authorization: Bearer {token}

Success Response (200):
{
  "admins": [
    {
      "id": 1,
      "username": "superadmin",
      "role": "SuperAdmin",
      "city": null,
      "subcity": null,
      "department": null,
      "created_at": "2024-01-01T00:00:00.000Z",
      "profile_picture": "/uploads/profile_pictures/admin1.jpg"
    }
  ]
}

Frontend Usage:
- Display in admin management table
- Show role badges with different colors
- Filter by role, city, subcity
```

### 2.3 **Update Admin Profile**

```
Method: PUT
URL: /api/admin/profile
Access: All Admin Roles (Self only)
Content-Type: multipart/form-data
Headers: Authorization: Bearer {token}

Request Body (FormData):
username: string (optional)
password: string (optional, min 6 chars)
profile_picture: File (optional, image file: jpg, png, gif, max 5MB)

Success Response (200):
{
  "message": "Profile updated successfully",
  "admin": {
    "id": 1,
    "username": "updated_username",
    "profile_picture": "/uploads/profile_pictures/new_pic.jpg"
  }
}
```

---

## 👥 **3. EMPLOYEE MANAGEMENT ENDPOINTS**

### 3.1 **Get Employees**

```
Method: GET
URL: /api/admin/employees
Access: All Admin Roles (Filtered by role)
Headers: Authorization: Bearer {token}
Query Parameters:
  - lang: "en|am|af" (optional, default: "en")
  - city: "Addis Ababa" (optional, SuperAdmin only)
  - subcity: "Bole|Arada|etc" (optional, SuperAdmin only)

Success Response (200):
[
  {
    "id": 1,
    "first_name": "John",
    "middle_name": "Michael",
    "last_name": "Smith",
    "office_number": "A101",
    "floor_number": 1,
    "position": "Senior Developer",
    "department": "Control and Awareness Department",
    "section": "Tech Support",
    "city": "Addis Ababa",
    "subcity": "Bole",
    "profile_picture": "/Uploads/profile_pictures/employee1.jpg",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]

Data Filtering by Role:
- SuperAdmin: All employees (can filter by city/subcity)
- SubCityAdmin: Only employees in their subcity
- Department Admin: Only employees in their department across all locations

Frontend Implementation:
- Employee grid/table with search and filters
- Profile picture thumbnails
- Role-based filter options (city/subcity for SuperAdmin, subcity for SubCityAdmin)
- Multi-language support for names and positions
```

### 3.2 **Create Employee**

```
Method: POST
URL: /api/admin/employees
Access: SuperAdmin, SubCityAdmin
Content-Type: multipart/form-data
Headers: Authorization: Bearer {token}

Request Body (FormData):
first_name: string (required)
middle_name: string (optional)
last_name: string (required)
office_number: string (optional, e.g., "A101")
floor_number: number (optional, e.g., 2)
position: string (optional)
department: string (required, "Control and Awareness Department|Engineering Department|Support Administration Department|Control Center Department")
section: string (optional, backward compatibility)
city: string (required, "Addis Ababa")
subcity: string (required, "Bole|Arada|Kirkos|Lideta|Yeka|Addis Ketema")
lang: "en|am|af" (optional, default: "en")
profile_picture: File (optional, image file: jpg, png, gif, max 5MB)

Role-based Restrictions:
- SuperAdmin: Can create in any city/subcity
- SubCityAdmin: Can create only in their specific subcity
- Department Admin: Cannot create employees

Success Response (201):
{
  "message": "Employee created successfully",
  "employee": {
    "id": 15,
    "first_name": "New",
    "last_name": "Employee",
    "office_number": "A201",
    "city": "Addis Ababa",
    "subcity": "Bole",
    "profile_picture": "/Uploads/profile_pictures/emp15.jpg"
  }
}

Frontend Implementation:
- Multi-step form with validation
- City/subcity dropdown (filtered by admin role)
- Department dropdown
- Image upload with preview
- Multi-language input fields (tabs for en/am/af)
```

### 3.3 **Update Employee**

```
Method: PUT
URL: /api/admin/employees/{id}
Access: SuperAdmin, SubCityAdmin (with location restrictions)
Content-Type: multipart/form-data
Headers: Authorization: Bearer {token}

Request Body (FormData): Same as Create Employee

Role-based Restrictions:
- SuperAdmin: Can edit any employee
- SubCityAdmin: Can edit employees only in their subcity
- Department Admin: Cannot edit employees

Success Response (200):
{
  "message": "Employee updated successfully",
  "employee": { /* updated employee object */ }
}

Error Response (403):
{
  "message": "Cannot edit employee from another subcity"
}
```

### 3.4 **Delete Employee**

```
Method: DELETE
URL: /api/admin/employees/{id}
Access: SuperAdmin, SubCityAdmin (with location restrictions)
Headers: Authorization: Bearer {token}

Role-based Restrictions: Same as Update Employee

Success Response (200):
{
  "message": "Employee deleted successfully"
}

Frontend Implementation:
- Confirmation dialog before deletion
- Role-based access check before showing delete button
```

---

## 📝 **4. COMPLAINT MANAGEMENT ENDPOINTS**

### 4.1 **Get Complaints (Admin View)**

```
Method: GET
URL: /api/admin/complaints
Access: All Admin Roles (Filtered by role)
Headers: Authorization: Bearer {token}
Query Parameters:
  - lang: "en|am|af" (optional, default: "en")
  - status: "pending|in_progress|resolved|closed" (optional)
  - date_from: "YYYY-MM-DD" (optional)
  - date_to: "YYYY-MM-DD" (optional)

Success Response (200):
[
  {
    "id": 1,
    "complainant_name": "John Doe",
    "phone_number": "+251911123456",
    "tracking_code": "comp-001-2024-abc123",
    "description": "Server was down for hours",
    "desired_action": "Improve backup systems",
    "status": "pending|in_progress|resolved|closed",
    "section": "Bole",
    "city": "Addis Ababa",
    "subcity": "Bole",
    "department": "Control and Awareness Department",
    "employee_id": 1,
    "voice_file": "/Uploads/voice_complaints/voice123.mp3",
    "created_at": "2024-01-01T00:00:00.000Z",
    "resolved_at": null,
    "response": null
  }
]

Data Filtering by Role:
- SuperAdmin: All complaints
- SubCityAdmin: Complaints from their subcity
- Department Admin: Complaints related to their department

Frontend Implementation:
- Complaints table with status badges
- Audio player for voice complaints
- Filter by status, date range
- Quick action buttons (resolve, respond)
```

### 4.2 **Resolve Complaint**

```
Method: PUT
URL: /api/admin/complaints/{id}/resolve
Access: All Admin Roles (with data restrictions)
Content-Type: application/json
Headers: Authorization: Bearer {token}

Request Body (JSON):
{
  "response": "string (required, min 10 chars)",
  "lang": "en|am|af" (optional, default: "en")"
}

Success Response (200):
{
  "message": "Complaint resolved successfully",
  "complaint": {
    "id": 1,
    "status": "resolved",
    "response": "Issue has been resolved...",
    "resolved_at": "2024-01-02T10:00:00.000Z"
  }
}

Frontend Implementation:
- Modal dialog with response textarea
- Character counter for response
- Confirmation before submitting
```

### 4.3 **Get Public Complaints (Admin View)**

```
Method: GET
URL: /api/admin/public/complaints
Access: All Admin Roles (Filtered by role)
Headers: Authorization: Bearer {token}
Query Parameters:
  - status: "pending|in_progress|resolved|closed" (optional)
  - date_from: "YYYY-MM-DD" (optional)
  - date_to: "YYYY-MM-DD" (optional)

Success Response (200):
[
  {
    "id": 1,
    "complainant_name": "John Doe",
    "phone_number": "+251911123456",
    "email": "john@example.com",
    "tracking_code": "PUB-COMP-001",
    "complaint_type": "service_quality",
    "subject": "Poor customer service",
    "description": "Long wait times and unhelpful staff",
    "priority": "medium",
    "status": "pending",
    "department": "Control Center Department",
    "created_at": "2024-01-01T10:00:00.000Z"
  }
]
```

### 4.4 **Resolve Public Complaint**

```
Method: PUT
URL: /api/admin/public/complaints/{id}/resolve
Access: All Admin Roles (with data restrictions)
Content-Type: application/json
Headers: Authorization: Bearer {token}

Request Body (JSON):
{
  "response": "string (required, min 10 chars)",
  "internal_notes": "string (optional)"
}

Success Response (200):
{
  "message": "Public complaint resolved successfully",
  "complaint": {
    "id": 1,
    "status": "resolved",
    "response": "Thank you for your feedback...",
    "resolved_at": "2024-01-02T15:30:00.000Z"
  }
}
```

---

## 💬 **5. FEEDBACK MANAGEMENT ENDPOINTS**

### 5.1 **Get Feedback (Admin View)**

```
Method: GET
URL: /api/admin/feedback
Access: All Admin Roles (Filtered by role)
Headers: Authorization: Bearer {token}
Query Parameters:
  - lang: "en|am|af" (optional, default: "en")
  - date_from: "YYYY-MM-DD" (optional)
  - date_to: "YYYY-MM-DD" (optional)

Success Response (200):
[
  {
    "id": 1,
    "employee_name": "John Smith",
    "employee_id": 1,
    "department": "Control and Awareness Department",
    "feedback_text": "Great service and very helpful",
    "sentiment": "positive|negative|neutral",
    "status": "pending|reviewed|responded",
    "section": "Bole",
    "city": "Addis Ababa",
    "subcity": "Bole",
    "created_at": "2024-01-01T00:00:00.000Z",
    "response": null
  }
]

Data Filtering by Role:
- SuperAdmin: All feedback
- SubCityAdmin: Feedback from their subcity
- Department Admin: Feedback related to their department employees

Frontend Implementation:
- Feedback cards with sentiment indicators
- Filter by sentiment, date range
- Quick respond functionality
```

### 5.2 **Respond to Feedback**

```
Method: PUT
URL: /api/admin/feedback/{id}/respond
Access: All Admin Roles (with data restrictions)
Content-Type: application/json
Headers: Authorization: Bearer {token}

Request Body (JSON):
{
  "response": "string (required, min 10 chars)",
  "lang": "en|am|af" (optional, default: "en")"
}

Success Response (200):
{
  "message": "Response added successfully",
  "feedback": {
    "id": 1,
    "status": "responded",
    "response": "Thank you for your feedback...",
    "responded_at": "2024-01-02T10:00:00.000Z"
  }
}
```

### 5.3 **Get Public Feedback (Admin View)**

```
Method: GET
URL: /api/admin/public/feedback
Access: All Admin Roles (Filtered by role)
Headers: Authorization: Bearer {token}

Success Response (200):
[
  {
    "id": 1,
    "citizen_name": "Jane Doe",
    "phone_number": "+251922334455",
    "department": "Engineering Department",
    "feedback_type": "suggestion",
    "feedback_text": "Please add online services",
    "tracking_code": "PUB-FB-001",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## ⭐ **6. RATINGS MANAGEMENT ENDPOINTS**

### 6.1 **Get Ratings (Admin View)**

```
Method: GET
URL: /api/admin/ratings
Access: All Admin Roles (Filtered by role)
Headers: Authorization: Bearer {token}
Query Parameters:
  - lang: "en|am|af" (optional, default: "en")
  - date_from: "YYYY-MM-DD" (optional)
  - date_to: "YYYY-MM-DD" (optional)

Success Response (200):
[
  {
    "id": 1,
    "employee_name": "John Smith",
    "employee_id": 1,
    "department": "Control and Awareness Department",
    "phone_number": "+251911123456",
    "courtesy": 5,
    "timeliness": 4,
    "knowledge": 5,
    "overall_experience": 4,
    "suggestions": "Keep up the good work",
    "section": "Bole",
    "city": "Addis Ababa",
    "subcity": "Bole",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]

Data Filtering by Role:
- SuperAdmin: All ratings
- SubCityAdmin: Ratings from their subcity
- Department Admin: Ratings for their department employees

Frontend Implementation:
- Ratings dashboard with average scores
- Star rating displays
- Charts for rating trends
- Export functionality
```

### 6.2 **Get Public Ratings (Admin View)**

```
Method: GET
URL: /api/admin/public/ratings
Access: All Admin Roles (Filtered by role)
Headers: Authorization: Bearer {token}

Success Response (200):
[
  {
    "id": 1,
    "citizen_name": "Anonymous",
    "phone_number": "+251933445566",
    "department": "Support Administration Department",
    "service_rating": 4,
    "staff_behavior": 5,
    "facility_rating": 3,
    "overall_satisfaction": 4,
    "comments": "Good service overall",
    "tracking_code": "PUB-RAT-001",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## 📊 **7. STATISTICS & REPORTS ENDPOINTS**

### 7.1 **Get Dashboard Statistics**

```
Method: GET
URL: /api/admin/statistics
Access: All Admin Roles (Filtered by role)
Headers: Authorization: Bearer {token}

Success Response (200):
{
  "employees": 45,
  "complaints": {
    "total": 128,
    "pending": 12,
    "resolved": 116
  },
  "feedback": {
    "total": 89,
    "positive": 67,
    "negative": 22
  },
  "ratings": {
    "total": 156,
    "average_rating": 4.2
  },
  "recent_activity": [
    {
      "type": "complaint",
      "message": "New complaint submitted",
      "timestamp": "2024-01-01T10:00:00.000Z"
    }
  ]
}

Data Filtering by Role:
- SuperAdmin: System-wide statistics
- SubCityAdmin: Their subcity statistics
- Department Admin: Their department statistics

Frontend Implementation:
- Dashboard cards with key metrics
- Charts and graphs for trends
- Recent activity feed
- Real-time updates
```

### 7.2 **Get Statistics with Location Filtering**

```
Method: GET
URL: /api/admin/statistics-location
Access: All Admin Roles (Filtered by role)
Headers: Authorization: Bearer {token}
Query Parameters:
  - city: "Addis Ababa" (optional, SuperAdmin only)
  - subcity: "Bole|Arada|etc" (optional, SuperAdmin only)

Success Response (200):
{
  "success": true,
  "data": {
    "employees": 25,
    "complaints": 12,
    "feedback": 18,
    "ratings": 34,
    "filters_applied": {
      "city": "Addis Ababa",
      "subcity": "Bole"
    }
  }
}

Frontend Implementation:
- Location-specific dashboard
- Filter dropdowns for SuperAdmin
- Comparative analytics between locations
```

### 7.3 **Export Report**

```
Method: GET
URL: /api/admin/export-report
Access: All Admin Roles (Filtered by role)
Headers: Authorization: Bearer {token}
Query Parameters:
  - format: "pdf|excel|csv" (optional, default: "pdf")
  - type: "employees|complaints|feedback|ratings|all" (optional, default: "all")
  - date_from: "YYYY-MM-DD" (optional)
  - date_to: "YYYY-MM-DD" (optional)

Success Response (200):
Content-Type: application/pdf or application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Binary file download

Frontend Implementation:
- Download button with format selection
- Progress indicator for large reports
- Date range picker for filtered reports
```

### 7.4 **Get Location Hierarchy**

```
Method: GET
URL: /api/admin/location-hierarchy
Access: All Admin Roles
Headers: Authorization: Bearer {token}

Success Response (200):
{
  "success": true,
  "data": {
    "locations": {
      "Addis Ababa": {
        "subcities": ["Arada", "Kirkos", "Lideta", "Bole", "Yeka", "Addis Ketema"],
        "departments": ["Control and Awareness Department", "Engineering Department", "Support Administration Department", "Control Center Department"]
      }
    },
    "admin_scope": {
      "role": "SuperAdmin",
      "city": "Addis Ababa",
      "subcity": null,
      "department": null
    }
  }
}

Frontend Implementation:
- Dynamic sidebar generation
- Role-based navigation menu
- Breadcrumb navigation
- Location filter dropdowns
```

---

## 🛠️ **8. UTILITY ENDPOINTS**

### 8.1 **Get Departments**

```
Method: GET
URL: /api/admin/departments
Access: SuperAdmin, Admin
Headers: Authorization: Bearer {token}

Success Response (200):
[
  {
    "id": 1,
    "name_en": "Control and Awareness Department",
    "name_am": "ቁጥጥርና ግንዛቤ ዘርፍ",
    "name_af": "Kutaataa fi Hubannoo Damee",
    "code": "CAD",
    "description_en": "Handles control and awareness operations"
  },
  {
    "id": 2,
    "name_en": "Engineering Department",
    "name_am": "ኢንጂነሪንግ ዘርፍ",
    "name_af": "Injiniirummaa Damee",
    "code": "ENG",
    "description_en": "Manages engineering and technical services"
  }
]

Frontend Implementation:
- Dropdown options for forms
- Department management interface
- Filter options for data views
- Multi-language support
```

---

## 🔒 **9. ERROR HANDLING & STATUS CODES**

### **Common HTTP Status Codes:**

```
200 OK - Success
201 Created - Resource created successfully
400 Bad Request - Invalid request data
401 Unauthorized - Missing or invalid token
403 Forbidden - Insufficient permissions
404 Not Found - Resource not found
422 Unprocessable Entity - Validation errors
500 Internal Server Error - Server error

Common Error Response Format:
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "field_name",
      "message": "Specific field error"
    }
  ]
}
```

### **Frontend Error Handling:**

```javascript
// Global error handler
const handleApiError = (error) => {
  if (error.status === 401) {
    // Redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
  } else if (error.status === 403) {
    // Show permission denied message
    showNotification('Access denied', 'error');
  } else if (error.status === 422) {
    // Show validation errors
    displayValidationErrors(error.data.errors);
  } else {
    // Generic error message
    showNotification('Something went wrong', 'error');
  }
};

// Role-based UI rendering
const canEditEmployee = ['SuperAdmin', 'SubCityAdmin'].includes(admin.role);

// Location-based data filtering
const getFilteredData = (data, admin) => {
  if (admin.role === 'SubCityAdmin') {
    return data.filter((item) => item.subcity === admin.subcity);
  } else if (admin.role === 'Admin') {
    return data.filter((item) => item.department === admin.department);
  }
  return data; // SuperAdmin sees all
};
```

---

## 🎨 **10. FRONTEND IMPLEMENTATION GUIDELINES**

### **Dashboard Components by Role:**

#### **SuperAdmin Dashboard:**

- System-wide statistics
- All location filters
- Admin management tools
- Global settings

#### **SubCityAdmin Dashboard:**

- Subcity-specific data
- Employee management for their subcity
- Local complaint/feedback handling
- Subcity performance metrics

#### **Department Admin Dashboard:**

- Department-specific data across all locations
- Employee performance in their department
- Department-related complaints/feedback
- Department analytics and reports

### **Common UI Patterns:**

- Role-based navigation menus
- Data tables with filtering and sorting
- Modal dialogs for forms
- File upload with progress indicators
- Real-time notifications
- Multi-language support

---

_Last Updated: December 2024_
_Target Users: Admin Portal Users_
