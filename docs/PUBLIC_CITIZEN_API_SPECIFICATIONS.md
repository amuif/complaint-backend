# 🌐 **Public Citizen API Specifications - Office Management System**

**Base URL:** `http://localhost:4000`
**Target Users:** General Public, Citizens
**Authentication Required:** ❌ None

---

## 📋 **PUBLIC SERVICE OVERVIEW**

The public citizen portal provides access to:

- Employee directory and contact information
- Submit complaints about services or staff
- Submit voice complaints with audio recording
- Provide feedback about services
- Rate services and staff performance
- Track complaint status and responses
- Access public statistics and information

---

## 👥 **1. EMPLOYEE DIRECTORY**

### 1.1 **Get Public Employees**

```
Method: GET
URL: /api/employees
Access: Public (No Authentication)
Query Parameters:
  - lang: "en|am|af" (optional, default: "en")
  - department: "Control and Awareness Department|Engineering Department|Support Administration Department|Control Center Department" (optional)
  - subcity: "Arada|Kirkos|Lideta|Bole|Yeka|Addis Ketema" (optional)

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
    "profile_picture": "/Uploads/profile_pictures/john.jpg"
  }
]

Frontend Implementation:
- Public employee directory with search
- Filter by department and subcity
- Multi-language support
- Contact information display
- Office location and floor details
```

### 1.2 **Get Team Directory**

```
Method: GET
URL: /api/team
Access: Public (No Authentication)
Query Parameters:
  - department: "Control and Awareness Department|etc" (optional)

Success Response (200):
[
  {
    "id": 1,
    "name": "John Smith",
    "position": "Senior Developer",
    "department": "Control and Awareness Department",
    "office": "A101",
    "floor": 1,
    "subcity": "Bole",
    "profile_picture": "/Uploads/profile_pictures/john.jpg"
  }
]

Frontend Implementation:
- Team cards with photos
- Department-wise grouping
- Contact details
- Office navigation information
```

---

## 📝 **2. COMPLAINT SUBMISSION**

### 2.1 **Submit Text Complaint**

```
Method: POST
URL: /api/complaints/submit
Access: Public (No Authentication)
Content-Type: application/json

Request Body (JSON):
{
  "complainant_name": "string (required, max 100 chars)",
  "phone_number": "string (required, format: +251XXXXXXXXX)",
  "email": "string (optional, valid email)",
  "department_id": number (optional),
  "office_id": number (optional),
  "employee_id": number (optional),
  "complaint_type": "service_quality|staff_behavior|facilities|process|waiting_time|accessibility|other" (required),
  "subject": "string (required, max 200 chars)",
  "description": "string (required, max 1000 chars)",
  "desired_outcome": "string (optional, max 500 chars)",
  "priority": "low|medium|high" (optional, default: "medium")",
  "location": "string (optional, where incident occurred)",
  "incident_date": "YYYY-MM-DD" (optional),
  "witnesses": "string (optional, witness information)"
}

Success Response (201):
{
  "success": true,
  "message": "Complaint submitted successfully",
  "data": {
    "tracking_code": "COMP-2024-001",
    "reference_number": "REF-12345",
    "estimated_resolution": "3-5 business days",
    "next_steps": "You will receive updates via SMS/Email",
    "contact_info": "Call +251-11-1234567 for updates"
  }
}

Validation Rules:
- Phone number must be valid Ethiopian format
- Email must be valid format if provided
- Subject cannot be empty or contain only spaces
- Description minimum 10 characters

Frontend Implementation:
- Multi-step complaint form
- Real-time validation
- Department/employee dropdowns
- Success page with tracking info
- SMS/Email notification options
- File attachment support (future)
```

### 2.2 **Submit Voice Complaint**

```
Method: POST
URL: /api/complaints/submit-voice
Access: Public (No Authentication)
Content-Type: multipart/form-data

Request Body (FormData):
complainant_name: string (required, max 100 chars)
phone_number: string (required, format: +251XXXXXXXXX)
email: string (optional, valid email)
department_id: number (optional)
office_id: number (optional)
employee_id: number (optional)
complaint_type: "service_quality|staff_behavior|facilities|process|waiting_time|accessibility|other" (required)
subject: string (required, max 200 chars)
description: string (optional, brief text description)
priority: "low|medium|high" (optional, default: "medium")
voice_file: File (required, audio: mp3|wav|ogg|m4a, max 10MB, max 5 minutes)
language: "en|am|af" (optional, audio language for transcription)

Success Response (201):
{
  "success": true,
  "message": "Voice complaint submitted successfully",
  "data": {
    "tracking_code": "COMP-2024-002",
    "audio_duration": "2:35 minutes",
    "file_size": "3.2 MB",
    "transcription_status": "processing",
    "estimated_transcription": "10-15 minutes",
    "estimated_resolution": "3-5 business days"
  }
}

File Validation:
- Audio file formats: mp3, wav, ogg, m4a
- Maximum file size: 10MB
- Maximum duration: 5 minutes
- Minimum duration: 10 seconds

Frontend Implementation:
- Audio recording widget with waveform
- File upload with drag-and-drop
- Audio playback preview
- Duration and size validation
- Progress indicator during upload
- Recording quality settings
```

### 2.3 **Track Complaint Status**

```
Method: GET
URL: /api/complaints/track/{identifier}
Access: Public (No Authentication)
Path Parameters:
  identifier: string (tracking code, reference number, or phone number)

Success Response (200):
{
  "success": true,
  "data": [
    {
      "tracking_code": "COMP-2024-001",
      "reference_number": "REF-12345",
      "subject": "Poor service experience",
      "status": "in_progress",
      "priority": "medium",
      "submitted_date": "2024-01-01T10:00:00.000Z",
      "last_updated": "2024-01-02T14:30:00.000Z",
      "estimated_resolution": "2024-01-05T17:00:00.000Z",
      "department": "Control Center Department",
      "assigned_officer": "John Smith",
      "response": "We are investigating your complaint and will update you soon.",
      "status_history": [
        {
          "status": "submitted",
          "timestamp": "2024-01-01T10:00:00.000Z",
          "note": "Complaint received and assigned"
        },
        {
          "status": "in_progress",
          "timestamp": "2024-01-02T14:30:00.000Z",
          "note": "Investigation started"
        }
      ]
    }
  ]
}

Error Response (404):
{
  "success": false,
  "message": "No complaints found with the provided identifier"
}

Frontend Implementation:
- Complaint tracking page
- Status timeline visualization
- Auto-refresh for status updates
- Print/download complaint details
- SMS notification subscription
- Escalation options if delayed
```

---

## 💬 **3. FEEDBACK SUBMISSION**

### 3.1 **Submit General Feedback**

```
Method: POST
URL: /api/feedback/submit
Access: Public (No Authentication)
Content-Type: application/json

Request Body (JSON):
{
  "citizen_name": "string (required, max 100 chars)",
  "phone_number": "string (required, format: +251XXXXXXXXX)",
  "email": "string (optional, valid email)",
  "department": "Control and Awareness Department|Engineering Department|Support Administration Department|Control Center Department" (required),
  "office_location": "string (optional)",
  "feedback_type": "suggestion|compliment|concern|general" (required),
  "subject": "string (required, max 200 chars)",
  "feedback_text": "string (required, max 1000 chars)",
  "service_received": "string (optional, what service was used)",
  "improvement_suggestions": "string (optional, max 500 chars)",
  "contact_preference": "sms|email|none" (optional, default: "none")"
}

Success Response (201):
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "tracking_code": "FB-2024-001",
    "reference_number": "REF-FB-12345",
    "acknowledgment": "Thank you for your valuable feedback",
    "follow_up": "We may contact you for additional information"
  }
}

Frontend Implementation:
- Feedback form with categories
- Character counters
- Service type selection
- Anonymous submission option
- Success confirmation page
```

### 3.2 **Submit Employee Feedback**

```
Method: POST
URL: /api/feedback/employee
Access: Public (No Authentication)
Content-Type: application/json

Request Body (JSON):
{
  "citizen_name": "string (optional, can be anonymous)",
  "phone_number": "string (required, format: +251XXXXXXXXX)",
  "employee_id": number (required),
  "employee_name": "string (optional, for verification)",
  "department": "string (required)",
  "service_date": "YYYY-MM-DD" (optional),
  "feedback_type": "compliment|suggestion|concern" (required),
  "feedback_text": "string (required, max 1000 chars)",
  "service_quality": number (optional, 1-5 scale),
  "staff_behavior": number (optional, 1-5 scale),
  "professionalism": number (optional, 1-5 scale)",
  "anonymous": boolean (optional, default: false)
}

Success Response (201):
{
  "success": true,
  "message": "Employee feedback submitted successfully",
  "data": {
    "tracking_code": "EMP-FB-2024-001",
    "employee_name": "John Smith",
    "department": "Control and Awareness Department",
    "acknowledgment": "Your feedback has been forwarded to the employee and department"
  }
}

Frontend Implementation:
- Employee search/selection
- Rating sliders (1-5 scale)
- Anonymous feedback option
- Service date picker
- Feedback categories
```

---

## ⭐ **4. RATING & EVALUATION**

### 4.1 **Submit Service Rating**

```
Method: POST
URL: /api/ratings/submit
Access: Public (No Authentication)
Content-Type: application/json

Request Body (JSON):
{
  "citizen_name": "string (optional, can be anonymous)",
  "phone_number": "string (required, format: +251XXXXXXXXX)",
  "department": "Control and Awareness Department|Engineering Department|Support Administration Department|Control Center Department" (required),
  "service_type": "string (required, e.g., 'License Renewal', 'Document Verification')",
  "visit_date": "YYYY-MM-DD" (optional),
  "service_rating": number (required, 1-5 scale),
  "staff_behavior": number (required, 1-5 scale),
  "facility_rating": number (required, 1-5 scale),
  "waiting_time_rating": number (required, 1-5 scale),
  "overall_satisfaction": number (required, 1-5 scale),
  "accessibility_rating": number (optional, 1-5 scale),
  "digital_services_rating": number (optional, 1-5 scale),
  "comments": "string (optional, max 500 chars)",
  "recommendations": "string (optional, max 300 chars)",
  "would_recommend": boolean (optional),
  "anonymous": boolean (optional, default: false)
}

Success Response (201):
{
  "success": true,
  "message": "Rating submitted successfully",
  "data": {
    "tracking_code": "RAT-2024-001",
    "overall_rating": 4.2,
    "department": "Control and Awareness Department",
    "thank_you_message": "Thank you for helping us improve our services"
  }
}

Rating Scale:
1 = Very Poor
2 = Poor
3 = Average
4 = Good
5 = Excellent

Frontend Implementation:
- Interactive star ratings
- Rating categories with descriptions
- Visual feedback for ratings
- Comments section
- Department/service selection
- Anonymous rating option
```

### 4.2 **Submit Employee Rating**

```
Method: POST
URL: /api/ratings/employee
Access: Public (No Authentication)
Content-Type: application/json

Request Body (JSON):
{
  "citizen_name": "string (optional)",
  "phone_number": "string (required, format: +251XXXXXXXXX)",
  "employee_id": number (required),
  "employee_name": "string (optional, for verification)",
  "department": "string (required)",
  "service_date": "YYYY-MM-DD" (optional),
  "courtesy": number (required, 1-5 scale),
  "timeliness": number (required, 1-5 scale),
  "knowledge": number (required, 1-5 scale),
  "problem_solving": number (required, 1-5 scale),
  "communication": number (required, 1-5 scale),
  "overall_experience": number (required, 1-5 scale),
  "suggestions": "string (optional, max 300 chars)",
  "service_received": "string (optional)",
  "anonymous": boolean (optional, default: false)
}

Success Response (201):
{
  "success": true,
  "message": "Employee rating submitted successfully",
  "data": {
    "tracking_code": "EMP-RAT-2024-001",
    "employee_name": "John Smith",
    "overall_rating": 4.5,
    "department": "Control and Awareness Department"
  }
}

Frontend Implementation:
- Employee search with photos
- Multi-criteria rating system
- Visual rating indicators
- Service context selection
- Comments and suggestions
```

---

## 📊 **5. PUBLIC INFORMATION & STATISTICS**

### 5.1 **Get Public Statistics**

```
Method: GET
URL: /api/statistics
Access: Public (No Authentication)
Query Parameters:
  - period: "week|month|quarter|year" (optional, default: "month")
  - department: "Control and Awareness Department|etc" (optional)

Success Response (200):
{
  "success": true,
  "data": {
    "summary": {
      "total_employees": 156,
      "departments": 4,
      "subcities": 6,
      "services_offered": 25
    },
    "service_statistics": {
      "total_complaints": 89,
      "resolved_complaints": 78,
      "average_resolution_time": "2.3 days",
      "customer_satisfaction": 4.2
    },
    "department_performance": {
      "Control and Awareness Department": {
        "employees": 45,
        "avg_rating": 4.3,
        "complaints": 12,
        "resolution_rate": 92
      },
      "Engineering Department": {
        "employees": 38,
        "avg_rating": 4.1,
        "complaints": 8,
        "resolution_rate": 95
      }
    },
    "recent_improvements": [
      {
        "title": "Digital Queue System",
        "description": "Reduced waiting times by 40%",
        "implementation_date": "2024-01-01"
      }
    ]
  }
}

Frontend Implementation:
- Public dashboard with key metrics
- Department comparison charts
- Service quality indicators
- Recent improvements showcase
- Transparency metrics
```

### 5.2 **Get Department Information**

```
Method: GET
URL: /api/departments/public
Access: Public (No Authentication)
Query Parameters:
  - lang: "en|am|af" (optional, default: "en")

Success Response (200):
[
  {
    "id": 1,
    "name": "Control and Awareness Department",
    "name_am": "ቁጥጥርና ግንዛቤ ዘርፍ",
    "name_af": "Kutaataa fi Hubannoo Damee",
    "description": "Handles control and awareness operations",
    "services": [
      "Document Verification",
      "License Processing",
      "Quality Control"
    ],
    "office_hours": "Monday-Friday: 8:00 AM - 5:00 PM",
    "contact_info": {
      "phone": "+251-11-1234567",
      "email": "control@authority.gov.et"
    },
    "location": {
      "building": "Main Office Building",
      "floor": 2,
      "office_range": "A200-A250"
    }
  }
]

Frontend Implementation:
- Department cards with services
- Contact information
- Office location details
- Multi-language support
- Service hours display
```

---

## 🔍 **6. SEARCH & DISCOVERY**

### 6.1 **Search Services**

```
Method: GET
URL: /api/search/services
Access: Public (No Authentication)
Query Parameters:
  - q: "search query" (required)
  - department: "department filter" (optional)
  - type: "service|employee|information" (optional)
  - lang: "en|am|af" (optional, default: "en")

Success Response (200):
{
  "success": true,
  "results": {
    "services": [
      {
        "name": "License Renewal",
        "department": "Control and Awareness Department",
        "description": "Renew various types of licenses",
        "requirements": ["Original License", "ID Card", "Payment"],
        "processing_time": "1-2 business days",
        "cost": "50 ETB"
      }
    ],
    "employees": [
      {
        "name": "John Smith",
        "position": "Senior Officer",
        "department": "Control and Awareness Department",
        "office": "A101"
      }
    ],
    "information": [
      {
        "title": "How to Apply for License",
        "type": "guide",
        "url": "/guides/license-application"
      }
    ]
  }
}

Frontend Implementation:
- Universal search bar
- Categorized results
- Auto-suggestions
- Search filters
- Result highlighting
```

### 6.2 **Get FAQ**

```
Method: GET
URL: /api/faq
Access: Public (No Authentication)
Query Parameters:
  - category: "services|complaints|general|procedures" (optional)
  - lang: "en|am|af" (optional, default: "en")

Success Response (200):
[
  {
    "id": 1,
    "category": "services",
    "question": "How long does license processing take?",
    "answer": "Standard license processing takes 1-3 business days...",
    "helpful_count": 45,
    "last_updated": "2024-01-01T00:00:00.000Z"
  }
]

Frontend Implementation:
- FAQ accordion interface
- Search within FAQ
- Category filtering
- Helpful voting system
- Related questions
```

---

## 📱 **7. MOBILE & ACCESSIBILITY**

### 7.1 **Mobile App API Compatibility**

All public endpoints are fully compatible with mobile applications:

**Additional Headers for Mobile:**

```
User-Agent: OfficeApp/1.0 (Mobile)
X-App-Version: 1.0.0
X-Platform: ios|android
```

**Mobile-Specific Features:**

- Offline complaint drafting
- Push notifications for updates
- Location services for office finder
- Camera integration for document upload
- Voice recording for complaints
- Biometric authentication support

### 7.2 **Accessibility Features**

**Screen Reader Support:**

- All responses include descriptive text
- Form validation messages are clear
- Status updates are screen-reader friendly

**Language Support:**

- English (default)
- Amharic (am)
- Afan Oromo (af)

**Audio Content:**

- Voice complaint transcription
- Audio feedback for form completion
- Multi-language voice prompts

---

## 🔒 **8. DATA PRIVACY & SECURITY**

### 8.1 **Data Protection**

```
Personal Data Handling:
- Phone numbers are validated but not stored in plain text
- Email addresses are optional and encrypted
- Anonymous submissions are supported
- Data retention follows government guidelines

Rate Limiting:
- 10 requests per minute per IP for submissions
- 100 requests per minute per IP for queries
- Extended limits for verified mobile apps

Content Filtering:
- Automatic profanity detection
- Spam prevention algorithms
- Content moderation for public safety
```

### 8.2 **Security Measures**

```
Input Validation:
- All inputs are sanitized
- File uploads are virus-scanned
- Audio files are validated for format and content

Monitoring:
- All public submissions are logged
- Suspicious activity is flagged
- Regular security audits
```

---

## 🚨 **9. ERROR HANDLING & STATUS CODES**

### **Common HTTP Status Codes:**

```
200 OK - Success
201 Created - Resource created successfully
400 Bad Request - Invalid request data
404 Not Found - Resource not found
422 Unprocessable Entity - Validation errors
429 Too Many Requests - Rate limit exceeded
500 Internal Server Error - Server error

Common Error Response Format:
{
  "success": false,
  "message": "Error description",
  "error_code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "phone_number",
      "message": "Invalid phone number format"
    }
  ],
  "help_url": "https://help.authority.gov.et/error-codes"
}
```

### **Frontend Error Handling:**

```javascript
// Public API error handler
const handlePublicApiError = (error) => {
  if (error.status === 422) {
    // Show validation errors
    displayValidationErrors(error.data.errors);
  } else if (error.status === 429) {
    // Rate limit exceeded
    showNotification('Too many requests. Please try again later.', 'warning');
  } else if (error.status === 500) {
    // Server error
    showNotification('Service temporarily unavailable. Please try again.', 'error');
  } else {
    // Generic error
    showNotification('Something went wrong. Please try again.', 'error');
  }
};

// Form validation
const validateForm = (formData) => {
  const errors = [];

  if (!formData.phone_number.match(/^\+251[0-9]{9}$/)) {
    errors.push({
      field: 'phone_number',
      message: 'Please enter a valid Ethiopian phone number',
    });
  }

  if (formData.description.length < 10) {
    errors.push({
      field: 'description',
      message: 'Description must be at least 10 characters',
    });
  }

  return errors;
};
```

---

## 🎨 **10. FRONTEND IMPLEMENTATION GUIDELINES**

### **User Experience Principles:**

#### **Accessibility First:**

- High contrast colors for visibility
- Large clickable areas for touch devices
- Keyboard navigation support
- Screen reader compatibility
- Multiple language options

#### **Mobile Responsive:**

- Touch-friendly interface
- Optimized for small screens
- Fast loading times
- Offline capabilities where possible

#### **User-Friendly Features:**

- Progress indicators for multi-step forms
- Clear error messages with solutions
- Success confirmations with next steps
- Auto-save for long forms
- Help tooltips and guidance

### **Common UI Components:**

```javascript
// Rating component
const StarRating = ({ value, onChange, disabled = false }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={`star ${star <= value ? 'filled' : ''}`}
          onClick={() => !disabled && onChange(star)}
          disabled={disabled}
        >
          ⭐
        </button>
      ))}
    </div>
  );
};

// File upload component
const AudioUpload = ({ onFileSelect, maxSize = 10485760 }) => {
  const [recording, setRecording] = useState(false);

  return (
    <div className="audio-upload">
      <div className="recording-controls">
        <button onClick={startRecording} disabled={recording}>
          🎤 Start Recording
        </button>
        <button onClick={stopRecording} disabled={!recording}>
          ⏹️ Stop Recording
        </button>
      </div>
      <div className="file-upload">
        <input type="file" accept="audio/*" onChange={handleFileSelect} max-size={maxSize} />
      </div>
    </div>
  );
};
```

### **Performance Optimization:**

- Lazy loading for employee directory
- Image optimization for profile pictures
- API response caching where appropriate
- Progressive web app features
- Service worker for offline functionality

---

_Last Updated: December 2024_
_Target Users: General Public & Citizens_
