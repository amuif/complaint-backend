const axios = require('axios');

/**
 * Test script for Employee Hierarchy Admin Endpoints
 * Tests the four new admin endpoints for filtering employees by organizational hierarchy
 */

const BASE_URL = 'http://localhost:3000/api/admin';

// Test configuration
const TEST_CONFIG = {
  // Replace with actual admin credentials
  adminCredentials: {
    email: 'admin@example.com',
    password: 'admin123',
  },
  // Test parameters
  testParams: {
    sectorId: 1,
    divisionId: 1,
    departmentId: 1,
    teamId: 1,
    page: 1,
    limit: 10,
    lang: 'en',
  },
};

let authToken = null;

/**
 * Authenticate and get admin token
 */
async function authenticate() {
  try {
    console.log('🔐 Authenticating admin user...');
    const response = await axios.post(`${BASE_URL}/login`, TEST_CONFIG.adminCredentials);

    if (response.data.token) {
      authToken = response.data.token;
      console.log('✅ Authentication successful');
      return true;
    } else {
      console.log('❌ Authentication failed - no token received');
      return false;
    }
  } catch (error) {
    console.log('❌ Authentication failed:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Test employee filtering by sector
 */
async function testEmployeesBySector() {
  try {
    console.log('\n📊 Testing GET /api/admin/employees/sector/:sectorId');

    const response = await axios.get(
      `${BASE_URL}/employees/sector/${TEST_CONFIG.testParams.sectorId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        params: {
          lang: TEST_CONFIG.testParams.lang,
          page: TEST_CONFIG.testParams.page,
          limit: TEST_CONFIG.testParams.limit,
        },
      }
    );

    console.log('✅ Sector endpoint successful');
    console.log(`   Found ${response.data.employees.length} employees`);
    console.log(`   Sector: ${response.data.sector.name}`);
    console.log(
      `   Pagination: Page ${response.data.pagination.currentPage} of ${response.data.pagination.totalPages}`
    );

    if (response.data.employees.length > 0) {
      const sample = response.data.employees[0];
      console.log(`   Sample employee: ${sample.first_name} ${sample.last_name}`);
      console.log(
        `   Hierarchy: Sector=${sample.hierarchy.sector?.name}, Division=${sample.hierarchy.division?.name}`
      );
    }

    return true;
  } catch (error) {
    console.log('❌ Sector endpoint failed:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Test employee filtering by division
 */
async function testEmployeesByDivision() {
  try {
    console.log('\n📊 Testing GET /api/admin/employees/division/:divisionId');

    const response = await axios.get(
      `${BASE_URL}/employees/division/${TEST_CONFIG.testParams.divisionId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        params: {
          lang: TEST_CONFIG.testParams.lang,
          page: TEST_CONFIG.testParams.page,
          limit: TEST_CONFIG.testParams.limit,
        },
      }
    );

    console.log('✅ Division endpoint successful');
    console.log(`   Found ${response.data.employees.length} employees`);
    console.log(`   Division: ${response.data.division.name}`);
    console.log(`   Parent Sector: ${response.data.division.sector?.name}`);
    console.log(
      `   Pagination: Page ${response.data.pagination.currentPage} of ${response.data.pagination.totalPages}`
    );

    if (response.data.employees.length > 0) {
      const sample = response.data.employees[0];
      console.log(`   Sample employee: ${sample.first_name} ${sample.last_name}`);
      console.log(
        `   Hierarchy: Division=${sample.hierarchy.division?.name}, Department=${sample.hierarchy.department?.name}`
      );
    }

    return true;
  } catch (error) {
    console.log('❌ Division endpoint failed:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Test employee filtering by department
 */
async function testEmployeesByDepartment() {
  try {
    console.log('\n📊 Testing GET /api/admin/employees/department/:departmentId');

    const response = await axios.get(
      `${BASE_URL}/employees/department/${TEST_CONFIG.testParams.departmentId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        params: {
          lang: TEST_CONFIG.testParams.lang,
          page: TEST_CONFIG.testParams.page,
          limit: TEST_CONFIG.testParams.limit,
        },
      }
    );

    console.log('✅ Department endpoint successful');
    console.log(`   Found ${response.data.employees.length} employees`);
    console.log(`   Department: ${response.data.department.name}`);
    console.log(`   Parent Division: ${response.data.department.division?.name}`);
    console.log(`   Parent Sector: ${response.data.department.division?.sector?.name}`);
    console.log(
      `   Pagination: Page ${response.data.pagination.currentPage} of ${response.data.pagination.totalPages}`
    );

    if (response.data.employees.length > 0) {
      const sample = response.data.employees[0];
      console.log(`   Sample employee: ${sample.first_name} ${sample.last_name}`);
      console.log(
        `   Hierarchy: Department=${sample.hierarchy.department?.name}, Team=${sample.hierarchy.team?.name}`
      );
    }

    return true;
  } catch (error) {
    console.log('❌ Department endpoint failed:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Test employee filtering by team
 */
async function testEmployeesByTeam() {
  try {
    console.log('\n📊 Testing GET /api/admin/employees/team/:teamId');

    const response = await axios.get(
      `${BASE_URL}/employees/team/${TEST_CONFIG.testParams.teamId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        params: {
          lang: TEST_CONFIG.testParams.lang,
          page: TEST_CONFIG.testParams.page,
          limit: TEST_CONFIG.testParams.limit,
        },
      }
    );

    console.log('✅ Team endpoint successful');
    console.log(`   Found ${response.data.employees.length} employees`);
    console.log(`   Team: ${response.data.team.name}`);
    console.log(`   Parent Department: ${response.data.team.department?.name}`);
    console.log(`   Parent Division: ${response.data.team.department?.division?.name}`);
    console.log(`   Parent Sector: ${response.data.team.department?.division?.sector?.name}`);
    console.log(
      `   Pagination: Page ${response.data.pagination.currentPage} of ${response.data.pagination.totalPages}`
    );

    if (response.data.employees.length > 0) {
      const sample = response.data.employees[0];
      console.log(`   Sample employee: ${sample.first_name} ${sample.last_name}`);
      console.log(
        `   Complete Hierarchy: ${sample.hierarchy.sector?.name} → ${sample.hierarchy.division?.name} → ${sample.hierarchy.department?.name} → ${sample.hierarchy.team?.name}`
      );
    }

    return true;
  } catch (error) {
    console.log('❌ Team endpoint failed:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Test employee export with hierarchy
 */
async function testEmployeeExport() {
  try {
    console.log('\n📊 Testing GET /api/admin/employees/export (with hierarchy)');

    const response = await axios.get(`${BASE_URL}/employees/export`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: {
        format: 'csv',
        lang: TEST_CONFIG.testParams.lang,
      },
    });

    console.log('✅ Employee export successful');
    console.log(`   Response type: ${response.headers['content-type']}`);
    console.log(`   Data length: ${response.data.length} characters`);

    // Check if CSV contains hierarchy headers
    if (response.data.includes('Sector,Division,Department (Hierarchy),Team')) {
      console.log('✅ CSV export includes hierarchy columns');
    } else {
      console.log('❌ CSV export missing hierarchy columns');
    }

    return true;
  } catch (error) {
    console.log('❌ Employee export failed:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Employee Hierarchy Admin Endpoints Tests');
  console.log('='.repeat(60));

  // Authenticate first
  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log('\n❌ Cannot proceed without authentication');
    return;
  }

  // Run all tests
  const tests = [
    testEmployeesBySector,
    testEmployeesByDivision,
    testEmployeesByDepartment,
    testEmployeesByTeam,
    testEmployeeExport,
  ];

  let passedTests = 0;

  for (const test of tests) {
    const success = await test();
    if (success) passedTests++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`🎯 Test Results: ${passedTests}/${tests.length} tests passed`);

  if (passedTests === tests.length) {
    console.log('🎉 All employee hierarchy admin endpoints are working correctly!');

    console.log('\n📡 New Admin API Endpoints Summary:');
    console.log('1. GET /api/admin/employees/sector/:sectorId - Get employees by sector (Admin)');
    console.log(
      '2. GET /api/admin/employees/division/:divisionId - Get employees by division (Admin)'
    );
    console.log(
      '3. GET /api/admin/employees/department/:departmentId - Get employees by department (Admin)'
    );
    console.log('4. GET /api/admin/employees/team/:teamId - Get employees by team (Admin)');
    console.log('5. GET /api/admin/employees/export - Export employees with hierarchy (Enhanced)');

    console.log('\nQuery Parameters (all endpoints):');
    console.log('- lang: Language (en/am/af, default: en)');
    console.log('- page: Page number (default: 1)');
    console.log('- limit: Items per page (default: 50)');

    console.log('\nAuthentication:');
    console.log('- All endpoints require admin authentication');
    console.log('- Role-based filtering applies based on admin permissions');
  } else {
    console.log('❌ Some tests failed. Please check the server and database setup.');
  }
}

// Run the tests
runTests().catch(console.error);
