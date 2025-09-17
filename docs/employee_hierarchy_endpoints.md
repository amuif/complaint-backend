# Employee Hierarchy API Endpoints

This document describes the four new API endpoints for retrieving employees based on their organizational hierarchy assignments.

## Overview

The office management system now supports a complete 4-level organizational hierarchy:

- **Sector** → **Division** → **Department** → **Team** → **Employee**

Each employee can be assigned to any level of this hierarchy, and the new endpoints allow filtering employees by their organizational assignments.

## API Endpoints

### 1. Get Employees by Sector

**Endpoint:** `GET /api/sectors/:sectorId/employees`

**Description:** Retrieves all employees assigned to a specific sector.

**Parameters:**

- `sectorId` (path parameter, required): The ID of the sector
- `page` (query parameter, optional): Page number for pagination (default: 1)
- `limit` (query parameter, optional): Number of items per page (default: 50)

**Example Request:**

```
GET /api/sectors/1/employees?page=1&limit=20
```

**Example Response:**

```json
{
  "success": true,
  "message": "Employees in sector: Public Administration",
  "data": [
    {
      "id": 1,
      "first_name_en": "Sarah",
      "last_name_en": "Johnson",
      "position_en": "HR Director",
      "office_number": "101",
      "section": "Central Administration",
      "city": "Addis Ababa",
      "subcity": "Bole",
      "sector_id": 1,
      "division_id": 1,
      "department_id": 1,
      "team_id": 1,
      "sector": {
        "id": 1,
        "name": "Public Administration"
      },
      "division": {
        "id": 1,
        "name": "Administrative Services"
      },
      "employeeDepartment": {
        "id": 1,
        "name": "Human Resources"
      },
      "team": {
        "id": 1,
        "name": "Recruitment Team"
      }
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  },
  "sector": {
    "id": 1,
    "name": "Public Administration"
  }
}
```

### 2. Get Employees by Division

**Endpoint:** `GET /api/divisions/:divisionId/employees`

**Description:** Retrieves all employees assigned to a specific division.

**Parameters:**

- `divisionId` (path parameter, required): The ID of the division
- `page` (query parameter, optional): Page number for pagination (default: 1)
- `limit` (query parameter, optional): Number of items per page (default: 50)

**Example Request:**

```
GET /api/divisions/2/employees?page=1&limit=10
```

**Response Format:** Similar to sector endpoint, but includes division context with parent sector information.

### 3. Get Employees by Department

**Endpoint:** `GET /api/departments/:departmentId/employees`

**Description:** Retrieves all employees assigned to a specific department.

**Parameters:**

- `departmentId` (path parameter, required): The ID of the department
- `page` (query parameter, optional): Page number for pagination (default: 1)
- `limit` (query parameter, optional): Number of items per page (default: 50)

**Example Request:**

```
GET /api/departments/3/employees
```

**Response Format:** Similar to other endpoints, but includes department context with parent division and sector information.

### 4. Get Employees by Team

**Endpoint:** `GET /api/teams/:teamId/employees`

**Description:** Retrieves all employees assigned to a specific team.

**Parameters:**

- `teamId` (path parameter, required): The ID of the team
- `page` (query parameter, optional): Page number for pagination (default: 1)
- `limit` (query parameter, optional): Number of items per page (default: 50)

**Example Request:**

```
GET /api/teams/4/employees?page=2&limit=25
```

**Response Format:** Similar to other endpoints, but includes team context with complete hierarchy chain (team → department → division → sector).

## Common Features

### Validation

- All endpoints validate that the specified organizational entity (sector/division/department/team) exists before querying employees
- Returns 404 error if the entity is not found

### Pagination

- All endpoints support pagination with `page` and `limit` query parameters
- Default page size is 50 employees
- Response includes pagination metadata (total count, current page, total pages)

### Employee Data

Each employee record includes:

- **Personal Information:** ID, names (English)
- **Position Information:** Position title, office number
- **Location Information:** Section, city, subcity
- **Hierarchy Information:** Complete organizational context with related entity details

### Error Handling

- Comprehensive error messages
- Development environment includes detailed error information
- Production environment provides user-friendly error messages

### Performance Optimization

- Database queries are optimized with proper indexing
- Only necessary fields are included in responses
- Results are ordered alphabetically by employee first name

## Testing

To test these endpoints:

1. **Setup Test Data:**

   ```bash
   node scripts/insert_sectors.js
   node scripts/insert_divisions.js
   node scripts/insert_departments_with_divisions.js
   node scripts/insert_teams.js
   node scripts/create_sample_employees_with_hierarchy.js
   ```

2. **Run Tests:**
   ```bash
   node test_employee_hierarchy_endpoints.js
   ```

## Integration Notes

- These endpoints complement the existing employee API structure
- Full backward compatibility is maintained with existing employee endpoints
- The organizational hierarchy provides additional filtering capabilities without breaking existing functionality
- All endpoints follow the same response format conventions used throughout the application

## Security

- These are public endpoints (no authentication required) as they provide general employee directory information
- Sensitive employee information (personal details, salaries, etc.) is not included in responses
- Rate limiting applies to prevent abuse

## Database Schema

The employee table includes the following hierarchy foreign keys:

- `sector_id` → references `sectors.id`
- `division_id` → references `divisions.id`
- `department_id` → references `departments.id`
- `team_id` → references `teams.id`

All foreign keys are nullable to support flexible organizational assignments and maintain backward compatibility.
