/**
 * Integration Test Script
 * Tests all the key API endpoints that the frontend uses
 */

const axios = require('axios');

const API_BASE = 'http://localhost:4000/api';

async function testIntegration() {
  console.log('🚀 Starting Integration Tests...\n');

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Health Check
  try {
    totalTests++;
    console.log('1. Testing Health Endpoint...');
    const healthResponse = await axios.get('http://localhost:4000/health');
    console.log('✅ Health check passed:', healthResponse.data.status);
    passedTests++;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test 2: Departments API
  try {
    totalTests++;
    console.log('\n2. Testing Departments API...');
    const deptResponse = await axios.get(`${API_BASE}/departments`);
    const departments = deptResponse.data.data;
    console.log(`✅ Departments loaded: ${departments.length} departments found`);
    departments.forEach((dept) => {
      console.log(`   - ID: ${dept.id}, Name: ${dept.name} (${dept.name_amharic})`);
    });
    passedTests++;
  } catch (error) {
    console.log('❌ Departments API failed:', error.message);
  }

  // Test 3: Offices API (for first department)
  try {
    totalTests++;
    console.log('\n3. Testing Offices API...');
    const officeResponse = await axios.get(`${API_BASE}/departments/1/offices`);
    const offices = officeResponse.data.data;
    console.log(`✅ Offices loaded for department 1: ${offices.length} offices found`);
    offices.forEach((office) => {
      console.log(`   - Office: ${office.name} (${office.office_number})`);
    });
    passedTests++;
  } catch (error) {
    console.log('❌ Offices API failed:', error.message);
  }

  // Test 4: Employees API (for first department)
  try {
    totalTests++;
    console.log('\n4. Testing Employees API...');
    const empResponse = await axios.get(`${API_BASE}/departments/1/employees`);
    const employees = empResponse.data.data;
    console.log(`✅ Employees loaded for department 1: ${employees.length} employees found`);
    employees.forEach((emp) => {
      console.log(`   - Employee: ${emp.first_name_en} ${emp.last_name_en} - ${emp.position_en}`);
    });
    passedTests++;
  } catch (error) {
    console.log('❌ Employees API failed:', error.message);
  }

  // Test 5: Complaint Submission
  try {
    totalTests++;
    console.log('\n5. Testing Complaint Submission...');
    const complaintData = {
      complainant_name: 'Test User',
      phone_number: '+251911123456',
      sub_city: 'Bole',
      kebele: '01',
      complaint_description: 'This is a test complaint to verify the API integration.',
      department: 'Control & Awareness',
      office: 'Control & Awareness Office',
      desired_action: 'Please resolve this test issue promptly.',
    };

    const complaintResponse = await axios.post(`${API_BASE}/complaints/submit`, complaintData);
    const result = complaintResponse.data.data;
    console.log(`✅ Complaint submitted successfully!`);
    console.log(`   - Tracking Code: ${result.tracking_code}`);
    console.log(`   - Complaint ID: ${result.complaint_id}`);
    console.log(`   - Status: ${result.status}`);

    // Test 6: Complaint Tracking
    totalTests++;
    console.log('\n6. Testing Complaint Tracking...');
    const trackResponse = await axios.get(`${API_BASE}/complaints/track/${result.tracking_code}`);
    const trackData = trackResponse.data.data;
    console.log(`✅ Complaint tracking works!`);
    console.log(`   - Found ${trackData.length} complaint(s) with tracking code`);

    passedTests += 2;
  } catch (error) {
    console.log(
      '❌ Complaint submission/tracking failed:',
      error.response?.data?.message || error.message
    );
  }

  // Test 7: Rating Submission
  try {
    totalTests++;
    console.log('\n7. Testing Rating Submission...');
    const ratingData = {
      department: '1',
      overall_rating: 5,
      courtesy_rating: 4,
      timeliness_rating: 5,
      knowledge_rating: 4,
      comments: 'Test rating - excellent service!',
    };

    const ratingResponse = await axios.post(`${API_BASE}/ratings/submit`, ratingData);
    console.log(`✅ Rating submitted successfully!`);
    passedTests++;
  } catch (error) {
    console.log('❌ Rating submission failed:', error.response?.data?.message || error.message);
  }

  // Test 8: Feedback Submission
  try {
    totalTests++;
    console.log('\n8. Testing Feedback Submission...');
    const feedbackData = {
      full_name: 'Test User',
      email: 'test@example.com',
      service_type: 'General Inquiry',
      feedback_type: 'suggestion',
      message: 'This is a test feedback to verify the API integration works properly.',
    };

    const feedbackResponse = await axios.post(`${API_BASE}/feedback/submit`, feedbackData);
    const fbResult = feedbackResponse.data.data;
    console.log(`✅ Feedback submitted successfully!`);
    console.log(`   - Reference Number: ${fbResult.reference_number}`);
    passedTests++;
  } catch (error) {
    console.log('❌ Feedback submission failed:', error.response?.data?.message || error.message);
  }

  // Test 9: Team Members API
  try {
    totalTests++;
    console.log('\n9. Testing Team Members API...');
    const teamResponse = await axios.get(`${API_BASE}/team`);
    const team = teamResponse.data.data;
    console.log(`✅ Team members loaded: ${team.length} members found`);
    passedTests++;
  } catch (error) {
    console.log('❌ Team API failed:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 INTEGRATION TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Tests Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Integration is working perfectly!');
    console.log('\n📋 What you can do now:');
    console.log('1. Visit http://localhost:3000 for the citizen portal');
    console.log('2. Submit complaints, ratings, and feedback');
    console.log('3. Track complaints using the tracking codes');
    console.log('4. Access the admin panel at http://localhost:4000/api/admin');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the error messages above.');
  }

  console.log('\n🔗 API Endpoints Available:');
  console.log('• GET  /api/departments - List all departments');
  console.log('• GET  /api/departments/:id/offices - List offices by department');
  console.log('• GET  /api/departments/:id/employees - List employees by department');
  console.log('• POST /api/complaints/submit - Submit new complaint');
  console.log('• GET  /api/complaints/track/:code - Track complaint status');
  console.log('• POST /api/ratings/submit - Submit service rating');
  console.log('• POST /api/feedback/submit - Submit feedback');
  console.log('• GET  /api/team - List all team members');
  console.log('• GET  /health - System health check');
}

// Run the tests
if (require.main === module) {
  testIntegration().catch(console.error);
}

module.exports = { testIntegration };
